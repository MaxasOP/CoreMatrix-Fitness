const { recommendExercise } = require('../services/trainingCoach');

describe('next-session guidance', () => {
  const workout = { weight: 40, reps: 8, feel: 'easy' };
  const analysis = { detectionConfidence: 95, reps: 8, score: 90, issues: [] };
  test('requires both easy effort and clear form before adding one rep', () => {
    expect(recommendExercise(workout, analysis)).toMatchObject({ action: 'add_rep', weight: 40, reps: 9 });
    expect(recommendExercise(workout, null).action).toBe('repeat');
    expect(recommendExercise({ ...workout, feel: 'moderate' }, analysis).action).toBe('repeat');
  });
  test('does not progress on poor visibility, no detected reps, or a flagged issue', () => {
    expect(recommendExercise(workout, { ...analysis, detectionConfidence: 30 }).action).toBe('repeat');
    expect(recommendExercise(workout, { ...analysis, reps: 0 }).action).toBe('repeat');
    expect(recommendExercise(workout, { ...analysis, issues: ['range_issue'] }).action).toBe('repeat');
    expect(recommendExercise({ ...workout, feel: 'very_hard' }, analysis).action).toBe('repeat');
  });
});
