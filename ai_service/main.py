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
                    
                    if angle > 160:
                        stage = "up"
                    if angle < 90 and stage == 'up':
                        stage = "down"
                        rep_count += 1
                        
                    if angle < 70:
                        if "too_deep_risk" not in issues: issues.append("too_deep_risk")

        cap.release()
        
        form_score = 85
        if len(issues) > 0:
            form_score -= 15 * len(issues)
        
        recommendations = [
            "Keep your chest up during the movement",
            "Maintain a neutral spine"
        ]
        
        if exercise_name == "squat" and rep_count > 0:
            avg_angle = sum(angles) / len(angles) if angles else 0
            if avg_angle > 100:
                issues.append("shallow_depth")
                recommendations.append("Try to go deeper to at least 90 degrees")

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
