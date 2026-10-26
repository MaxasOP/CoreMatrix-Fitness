import os
import shutil
import tempfile

import cv2
import mediapipe as mp
from fastapi import FastAPI, File, Form, HTTPException, UploadFile
from motion_analysis import (
    calculate_angle,
    count_adaptive_reps,
    exercise_family,
    normalize_exercise_name,
    update_rep_state,
)


app = FastAPI(title="CoreMatrix Form Analysis", version="0.3.0")

mp_pose = mp.solutions.pose
pose = mp_pose.Pose(
    static_image_mode=False,
    model_complexity=1,
    min_detection_confidence=0.5,
    min_tracking_confidence=0.5,
)

JOINT_CHAINS = {
    "elbow": ("SHOULDER", "ELBOW", "WRIST"),
    "knee": ("HIP", "KNEE", "ANKLE"),
    "hip": ("SHOULDER", "HIP", "KNEE"),
}


def _point(landmarks, landmark):
    item = landmarks[landmark.value]
    return [item.x, item.y]


def _best_side_angle(landmarks, joint_names):
    candidates = []
    for side in ("LEFT", "RIGHT"):
        joints = [getattr(mp_pose.PoseLandmark, f"{side}_{name}") for name in joint_names]
        visibility = sum(landmarks[joint.value].visibility for joint in joints) / len(joints)
        if visibility >= 0.45:
            angle = calculate_angle(*[_point(landmarks, joint) for joint in joints])
            candidates.append((visibility, angle))
    return max(candidates, default=(0, None), key=lambda item: item[0])[1]


def _frame_angles(landmarks):
    return {
        name: _best_side_angle(landmarks, chain)
        for name, chain in JOINT_CHAINS.items()
    }


def _specific_joint(family):
    if family == "squat":
        return "knee"
    if family == "deadlift":
        return "hip"
    return "elbow"


def _movement_summary(family, angle_series):
    if family != "adaptive":
        joint = _specific_joint(family)
        values = angle_series[joint]
        stage = None
        reps = 0
        for index, value in enumerate(values):
            window = values[max(0, index - 2):index + 1]
            smoothed = sum(window) / len(window)
            stage, reps = update_rep_state(family, smoothed, stage, reps)
        movement_range = (max(values) - min(values)) if values else 0
        return joint, reps, movement_range

    candidates = []
    for joint, values in angle_series.items():
        reps, movement_range = count_adaptive_reps(values)
        candidates.append((movement_range, reps, joint))
    movement_range, reps, joint = max(candidates, default=(0, 0, "unknown"))
    return joint, reps, movement_range


def _build_feedback(family, angles, rep_count, detection_ratio, movement_range):
    issues = []
    recommendations = []
    if detection_ratio < 0.55:
        issues.append("body_partially_out_of_frame")
        recommendations.append("Keep your full working side visible throughout the set")
    if rep_count == 0:
        issues.append("no_complete_repetitions")
        recommendations.append("Record at least one complete repetition from start to finish")
    if movement_range < 24:
        issues.append("limited_visible_range")
        recommendations.append("Use a side view with the working joint unobstructed")

    if angles:
        minimum, maximum = min(angles), max(angles)
        if family == "squat" and minimum > 115:
            issues.append("shallow_depth")
            recommendations.append("Lower until the knee angle passes roughly 110 degrees")
        elif family in {"pushup", "bench_press"} and minimum > 105:
            issues.append("limited_elbow_flexion")
            recommendations.append("Use a fuller controlled lowering range")
        elif family == "deadlift" and maximum < 160:
            issues.append("incomplete_lockout")
            recommendations.append("Finish tall with hips and knees extended")
        elif family == "shoulder_press" and maximum < 150:
            issues.append("incomplete_overhead_extension")
            recommendations.append("Finish each rep with the arm extended overhead")

    if not recommendations:
        recommendations.append("Keep the same camera angle and controlled tempo")

    score = 48 + min(rep_count, 8) * 4 + min(movement_range, 80) * 0.25
    score += detection_ratio * 14
    score -= len(issues) * 7
    return list(dict.fromkeys(issues)), list(dict.fromkeys(recommendations)), max(0, min(100, round(score)))


@app.post("/analyze")
async def analyze_video(video: UploadFile = File(...), exercise_name: str = Form(...)):
    try:
        display_name = normalize_exercise_name(exercise_name)
    except ValueError as error:
        raise HTTPException(status_code=400, detail=str(error)) from error

    family = exercise_family(display_name)
    suffix = os.path.splitext(video.filename or "")[1].lower() or ".mp4"
    with tempfile.NamedTemporaryFile(delete=False, suffix=suffix) as temp_video:
        shutil.copyfileobj(video.file, temp_video)
        temp_path = temp_video.name

    try:
        cap = cv2.VideoCapture(temp_path)
        if not cap.isOpened():
            raise HTTPException(status_code=422, detail="The uploaded file is not a readable video")

        frame_count = 0
        sampled_frames = 0
        landmark_frames = 0
        angle_series = {joint: [] for joint in JOINT_CHAINS}

        while cap.isOpened():
            ok, frame = cap.read()
            if not ok:
                break
            frame_count += 1
            if frame_count % 2:
                continue

            sampled_frames += 1
            image = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
            image.flags.writeable = False
            results = pose.process(image)
            if not results.pose_landmarks:
                continue

            angles = _frame_angles(results.pose_landmarks.landmark)
            visible_angles = {name: value for name, value in angles.items() if value is not None}
            if not visible_angles:
                continue
            landmark_frames += 1
            for joint, value in visible_angles.items():
                angle_series[joint].append(value)

        if sampled_frames == 0:
            raise HTTPException(status_code=422, detail="The uploaded video contains no readable frames")
        if landmark_frames == 0:
            return {
                "exercise": display_name,
                "analysis_mode": family,
                "dominant_joint": None,
                "form_issues": ["no_person_detected"],
                "rep_count": 0,
                "form_score": 0,
                "recommendations": ["Place the camera far enough away to show your full working side"],
                "frames_analyzed": sampled_frames,
                "detection_confidence": 0,
            }

        dominant_joint, rep_count, movement_range = _movement_summary(family, angle_series)
        dominant_angles = angle_series.get(dominant_joint, [])
        detection_ratio = landmark_frames / sampled_frames
        issues, recommendations, form_score = _build_feedback(
            family, dominant_angles, rep_count, detection_ratio, movement_range
        )
        return {
            "exercise": display_name,
            "analysis_mode": family,
            "dominant_joint": dominant_joint,
            "form_issues": issues,
            "rep_count": rep_count,
            "form_score": form_score,
            "recommendations": recommendations,
            "frames_analyzed": sampled_frames,
            "detection_confidence": round(detection_ratio * 100),
        }
    finally:
        if "cap" in locals():
            cap.release()
        if os.path.exists(temp_path):
            os.remove(temp_path)


@app.get("/health")
async def health():
    return {"status": "ok", "service": "form-analysis", "mode": "adaptive"}


if __name__ == "__main__":
    import uvicorn

    uvicorn.run(app, host="0.0.0.0", port=5000)
