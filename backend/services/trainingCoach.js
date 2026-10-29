function recommendExercise(workout, analysis) {
  if (!workout) return { action: 'baseline', reason: 'Log this exercise to establish a starting point.' };
  const weight = Number(workout.weight) || 0;
  const reps = Number(workout.reps) || 0;
  const visible = analysis && Number(analysis.detectionConfidence) >= 70 && Number(analysis.reps) > 0 && !analysis.issues?.includes('no_person_detected');
  if (analysis && !visible) return { action: 'repeat', weight, reps, reason: 'The video was not clear enough to guide progression. Repeat your baseline and record a clearer set.' };
  if (workout.feel === 'hard' || workout.feel === 'very_hard' || (visible && (analysis.score < 80 || analysis.issues?.length))) {
    return { action: 'repeat', weight, reps, reason: 'Keep the same load and reps while you work on effort and technique.', cue: visible ? analysis.feedback : null };
  }
  if (workout.feel === 'easy' && visible && analysis.score >= 80) return { action: 'add_rep', weight, reps: Math.min(reps + 1, 200), reason: 'You reported an easy effort and the linked video had clear visibility with no flagged issues. Try one more rep at the same load.' };
  return { action: 'repeat', weight, reps, reason: 'Repeat your last load and reps. Add an effort rating and a clear form review before progressing.' };
}

module.exports = { recommendExercise };
