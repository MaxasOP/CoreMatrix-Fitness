import os
import cv2
import numpy as np
import mediapipe as mp
from fastapi import FastAPI, UploadFile, File, Form
from pydantic import BaseModel
import tempfile
import shutil

app = FastAPI()

# Robust access to MediaPipe solutions
mp_pose = mp.solutions.pose
pose = mp_pose.Pose(
    static_image_mode=False, 
    min_detection_confidence=0.5, 
    min_tracking_confidence=0.5
)

def calculate_angle(a, b, c):
    a = np.array(a)
    b = np.array(b)
    c = np.array(c)
    
    radians = np.arctan2(c[1]-b[1], c[0]-b[0]) - np.arctan2(a[1]-b[1], a[0]-b[0])
    angle = np.abs(radians*180.0/np.pi)
    
    if angle > 180.0:
        angle = 360-angle
        
    return angle

@app.post("/analyze")
async def analyze_video(video: UploadFile = File(...), exercise_name: str = Form("squat")):
    with tempfile.NamedTemporaryFile(delete=False, suffix=".mp4") as temp_video:
        shutil.copyfileobj(video.file, temp_video)
        temp_path = temp_video.name

    try:
        cap = cv2.VideoCapture(temp_path)
        
        rep_count = 0
        stage = None
        issues = []
        angles = []
        
        frame_count = 0
        while cap.isOpened():
            ret, frame = cap.read()
            if not ret:
                break
            
            frame_count += 1
            if frame_count % 3 != 0:
                continue

            image = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
            image.flags.writeable = False
            results = pose.process(image)
            
            if results.pose_landmarks:
                landmarks = results.pose_landmarks.landmark
                
                if exercise_name == "squat":
                    hip = [landmarks[mp_pose.PoseLandmark.LEFT_HIP.value].x, landmarks[mp_pose.PoseLandmark.LEFT_HIP.value].y]
                    knee = [landmarks[mp_pose.PoseLandmark.LEFT_KNEE.value].x, landmarks[mp_pose.PoseLandmark.LEFT_KNEE.value].y]
                    ankle = [landmarks[mp_pose.PoseLandmark.LEFT_ANKLE.value].x, landmarks[mp_pose.PoseLandmark.LEFT_ANKLE.value].y]
                    
                    angle = calculate_angle(hip, knee, ankle)
                    angles.append(angle)
                    
                    if angle > 160: stage = "up"
                    if angle < 100 and stage == 'up':
                        stage = "down"
                        rep_count += 1
                        
                    if angle < 70:
                        if "too_deep_risk" not in issues: issues.append("too_deep_risk")

                elif exercise_name == "pushup":
                    shoulder = [landmarks[mp_pose.PoseLandmark.LEFT_SHOULDER.value].x, landmarks[mp_pose.PoseLandmark.LEFT_SHOULDER.value].y]
                    elbow = [landmarks[mp_pose.PoseLandmark.LEFT_ELBOW.value].x, landmarks[mp_pose.PoseLandmark.LEFT_ELBOW.value].y]
                    wrist = [landmarks[mp_pose.PoseLandmark.LEFT_WRIST.value].x, landmarks[mp_pose.PoseLandmark.LEFT_WRIST.value].y]
                    
                    angle = calculate_angle(shoulder, elbow, wrist)
                    angles.append(angle)
                    
                    if angle > 160: stage = "up"
                    if angle < 90 and stage == 'up':
                        stage = "down"
                        rep_count += 1

                elif exercise_name == "deadlift":
                    shoulder = [landmarks[mp_pose.PoseLandmark.LEFT_SHOULDER.value].x, landmarks[mp_pose.PoseLandmark.LEFT_SHOULDER.value].y]
                    hip = [landmarks[mp_pose.PoseLandmark.LEFT_HIP.value].x, landmarks[mp_pose.PoseLandmark.LEFT_HIP.value].y]
                    knee = [landmarks[mp_pose.PoseLandmark.LEFT_KNEE.value].x, landmarks[mp_pose.PoseLandmark.LEFT_KNEE.value].y]
                    
                    back_angle = calculate_angle(shoulder, hip, knee)
                    angles.append(back_angle)
                    
                    if back_angle < 130: stage = "down"
                    if back_angle > 160 and stage == 'down':
                        stage = "up"
                        rep_count += 1
                
                else:
                    # Generic rep counter for other exercises based on movement of joints
                    # Just to ensure we capture SOME movement
                    nose = [landmarks[mp_pose.PoseLandmark.NOSE.value].x, landmarks[mp_pose.PoseLandmark.NOSE.value].y]
                    angles.append(nose[1]) # Just track vertical movement of nose as a proxy


        cap.release()
        
        # If no landmarks detected across the whole video
        if not angles:
            return {
                "exercise": exercise_name,
                "form_issues": ["no_person_detected"],
                "rep_count": 0,
                "form_score": 0,
                "recommendations": ["Ensure your full body is visible in the frame", "Use a side-view for better analysis"]
            }

        form_score = 70 + (min(rep_count, 10) * 3) # Basic score starting point
        if len(issues) > 0:
            form_score -= 10 * len(issues)
        
        recommendations = []
        if exercise_name == "squat":
            recommendations = ["Keep your chest up", "Maintain a neutral spine"]
            if rep_count > 0:
                avg_angle = sum(angles) / len(angles)
                if avg_angle > 110:
                    issues.append("shallow_depth")
                    recommendations.append("Try to squat deeper (thighs parallel to floor)")
        
        elif exercise_name == "pushup":
            recommendations = ["Keep your core tight", "Don't let your hips sag"]
            if rep_count > 0:
                avg_angle = sum(angles) / len(angles)
                if avg_angle > 120:
                    issues.append("limited_range_of_motion")
                    recommendations.append("Lower your chest closer to the ground")
        
        elif exercise_name == "deadlift":
            recommendations = ["Keep the bar close to your shins", "Don't round your lower back"]
            if any(a < 140 for a in angles):
                # This is a very basic check for back rounding if angle gets too acute
                pass

        if not recommendations:
            recommendations = ["Focus on controlled movements", "Ensure proper breathing"]

        return {
            "exercise": exercise_name,
            "form_issues": issues,
            "rep_count": rep_count,
            "form_score": max(0, min(100, form_score)),
            "recommendations": recommendations
        }

    finally:
        if os.path.exists(temp_path):
            os.remove(temp_path)

@app.get("/health")
async def health():
    return {"status": "ok"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=5000)
