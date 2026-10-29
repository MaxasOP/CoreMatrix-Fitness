'use client';

import Link from 'next/link';

export default function NutritionBrief({ user, meals = [], workouts = [] }) {
  const today = new Date().toLocaleDateString('en-CA');
  const isToday = item => {
    const date = new Date(item.log_date || item.date);
    return !Number.isNaN(date.getTime()) && date.toLocaleDateString('en-CA') === today;
  };
  const todaysMeals = meals.filter(isToday);
  const calories = todaysMeals.reduce((sum, item) => sum + (Number(item.calories) || 0), 0);
  const protein = todaysMeals.reduce((sum, item) => sum + (Number(item.protein) || 0), 0);
  const proteinGoal = Number(user?.proteinGoal) || 0;
  const calorieGoal = Number(user?.calorieGoal) || 0;
  const trained = workouts.some(isToday);
  return <section className="nutrition-brief" aria-labelledby="nutrition-brief-title">
    <div><p className="eyebrow">{trained ? 'Training day · recovery' : 'Today’s nutrition'}</p><h2 id="nutrition-brief-title">{trained ? 'Give the work its fuel.' : 'Keep your daily targets in view.'}</h2><p>{trained ? 'You logged training today. Check the meals you’ve recorded against your daily targets.' : 'Training and rest days both count. Your saved daily targets stay consistent until you update your profile.'}</p></div>
    <dl><div><dt>Protein remaining</dt><dd>{proteinGoal ? `${Math.max(0, proteinGoal - protein)}g` : 'Set a target'}</dd><small>{protein}g logged{proteinGoal ? ` / ${proteinGoal}g` : ''}</small></div><div><dt>Energy remaining</dt><dd>{calorieGoal ? `${Math.max(0, calorieGoal - calories)} kcal` : 'Set a target'}</dd><small>{calories} kcal logged{calorieGoal ? ` / ${calorieGoal}` : ''}</small></div></dl>
    <p>Targets are estimates from your saved profile. Log portions accurately; totals reflect recorded meals only.</p><div className="flex flex-wrap gap-3"><Link href="/fuel" className="plan-day-action">Open meal log →</Link><Link href="/setup" className="plan-day-action">Update targets →</Link></div>
  </section>;
}
