import unittest

from motion_analysis import (
    calculate_angle,
    count_adaptive_reps,
    exercise_family,
    update_rep_state,
)


class MotionAnalysisTests(unittest.TestCase):
    def test_calculate_right_angle(self):
        self.assertAlmostEqual(calculate_angle([1, 0], [0, 0], [0, 1]), 90.0)

    def test_known_variations_map_to_specific_rules(self):
        self.assertEqual(exercise_family('Incline bench press'), 'bench_press')
        self.assertEqual(exercise_family('Dumbbell Romanian Deadlift'), 'deadlift')
        self.assertEqual(exercise_family('Arnold press'), 'shoulder_press')

    def test_unknown_variation_uses_adaptive_mode(self):
        self.assertEqual(exercise_family('cable lateral raise'), 'adaptive')

    def test_bench_press_counts_full_rep(self):
        stage, reps = update_rep_state('bench_press', 170, None, 0)
        stage, reps = update_rep_state('bench_press', 85, stage, reps)
        stage, reps = update_rep_state('bench_press', 165, stage, reps)
        self.assertEqual(stage, 'up')
        self.assertEqual(reps, 1)

    def test_shoulder_press_counts_from_rack_to_lockout(self):
        stage, reps = update_rep_state('shoulder_press', 90, None, 0)
        stage, reps = update_rep_state('shoulder_press', 165, stage, reps)
        self.assertEqual(stage, 'up')
        self.assertEqual(reps, 1)

    def test_adaptive_counter_counts_two_cycles(self):
        reps, movement_range = count_adaptive_reps(
            [160, 145, 110, 80, 78, 105, 145, 165, 145, 105, 76, 105, 145, 166]
        )
        self.assertEqual(reps, 2)
        self.assertGreaterEqual(movement_range, 40)


if __name__ == '__main__':
    unittest.main()
