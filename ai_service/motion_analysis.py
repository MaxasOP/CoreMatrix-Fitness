import math
import re


EXERCISE_FAMILIES = {
    "squat": ("squat", "front squat", "back squat", "goblet squat", "split squat"),
    "deadlift": ("deadlift", "rdl", "romanian deadlift", "sumo deadlift", "good morning"),
    "pushup": ("pushup", "push up", "press up", "dip"),
    "bench_press": ("bench press", "chest press", "floor press"),
    "shoulder_press": ("shoulder press", "overhead press", "military press", "arnold press"),
}


def calculate_angle(a, b, c):
    radians = math.atan2(c[1] - b[1], c[0] - b[0]) - math.atan2(
        a[1] - b[1], a[0] - b[0]
    )
    angle = abs(math.degrees(radians))
    return 360 - angle if angle > 180 else angle


def normalize_exercise_name(value):
    cleaned = re.sub(r"[^a-z0-9]+", " ", (value or "").lower()).strip()
    if not cleaned:
        raise ValueError("Exercise name is required")
    return cleaned[:80]


def exercise_family(exercise_name):
    name = normalize_exercise_name(exercise_name)
    for family, aliases in EXERCISE_FAMILIES.items():
        if any(alias in name for alias in aliases):
            return family
    return "adaptive"


def update_rep_state(exercise, measurement, stage, rep_count):
    if exercise == "squat":
        low, high = 110, 155
    elif exercise in {"pushup", "bench_press"}:
        low, high = 100, 155
    elif exercise == "deadlift":
        low, high = 145, 165
    elif exercise == "shoulder_press":
        low, high = 100, 155
    else:
        return stage, rep_count

    if exercise in {"deadlift", "shoulder_press"}:
        if measurement < low:
            stage = "down"
        elif measurement > high and stage == "down":
            stage = "up"
            rep_count += 1
    else:
        if measurement > high:
            if stage == "down":
                rep_count += 1
            stage = "up"
        elif measurement < low and stage == "up":
            stage = "down"
    return stage, rep_count


def _percentile(values, fraction):
    ordered = sorted(values)
    position = (len(ordered) - 1) * fraction
    lower = math.floor(position)
    upper = math.ceil(position)
    if lower == upper:
        return float(ordered[lower])
    weight = position - lower
    return ordered[lower] * (1 - weight) + ordered[upper] * weight


def count_adaptive_reps(values):
    if len(values) < 8:
        return 0, 0
    low = _percentile(values, 0.25)
    high = _percentile(values, 0.75)
    movement_range = high - low
    if movement_range < 18:
        return 0, movement_range

    stage = None
    reps = 0
    for value in values:
        if value <= low:
            stage = "low"
        elif value >= high and stage == "low":
            stage = "high"
            reps += 1
    return reps, movement_range
