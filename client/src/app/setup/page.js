'use client';

import React, { useContext, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { AuthContext } from '../../AuthContext';
import api from '../../api';
import useDocumentMetadata from '../../hooks/useDocumentMetadata';
import ProtectedRoute from '../../components/ProtectedRoute';

const goalOptions = [
  { label: 'Build Muscle', value: 'Build Muscle' },
  { label: 'Cut Fat', value: 'Cut Fat' },
  { label: 'Improve Endurance', value: 'Improve Endurance' },
  { label: 'General Fitness', value: 'General Fitness' }
];

const activityOptions = [
  { label: 'Sedentary', value: 'sedentary' },
  { label: 'Light', value: 'light' },
  { label: 'Moderate', value: 'moderate' },
  { label: 'High', value: 'high' },
  { label: 'Athlete', value: 'athlete' }
];

function SetupContent() {
  const { user, setUser } = useContext(AuthContext);
  const router = useRouter();
  useDocumentMetadata({
    title: 'Personalize Your Goals',
    description: 'Set your fitness goals, log your body metrics, and personalize your daily calorie and protein targets.'
  });
  const [form, setForm] = useState({
    goal: user?.goal || 'Build Muscle',
    weightKg: user?.weight || '',
    heightCm: user?.height || '',
    ageYears: user?.age || '',
    activityLevel: user?.activityLevel || 'moderate'
  });
  const [msg, setMsg] = useState('');
  const [saving, setSaving] = useState(false);
  const [step, setStep] = useState(1);
  const [profileSaved, setProfileSaved] = useState(false);
  const [preferences, setPreferences] = useState({ experience_level: 'beginner', days_per_week: 3, equipment_available: 'full_gym' });

  function onChange(e) {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
  }

  async function saveProfile() {
    if (!user) return;
    setSaving(true);
    try {
      const payload = {
        goal: form.goal,
        weightKg: form.weightKg ? Number(form.weightKg) : null,
        heightCm: form.heightCm ? Number(form.heightCm) : null,
        ageYears: form.ageYears ? Number(form.ageYears) : null,
        activityLevel: form.activityLevel
      };
      const res = await api.put('/auth/profile', payload);
      const updated = res.data || {};
      setUser({ ...user, ...updated, token: user.token });
      setProfileSaved(true);
      setStep(2);
      setMsg('');
    } catch (err) {
      setMsg(err.response?.data?.error || err.message || 'Profile update failed');
    } finally {
      setSaving(false);
    }
  }

  async function buildFirstWeek(event) {
    event.preventDefault();
    if (saving) return;
    setSaving(true);
    setMsg('');
    try {
      await api.post('/ai/workout-plan', { ...preferences, days_per_week: Number(preferences.days_per_week) });
      router.push('/ai-workout');
    } catch (err) {
      setMsg(err.response?.data?.error || 'Your profile is saved. Plan generation failed; try again or continue to the dashboard.');
    } finally {
      setSaving(false);
    }
  }

  if (!user) {
    return (
      <div className="mt-6 page page-shell max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="card-soft p-5">
          <div className="tag muted">Sign in required</div>
          <h1 className="text-3xl mt-2 font-bold text-gray-900">Set your goals</h1>
          <p className="mt-2 muted">Create an account to save calorie, protein, and training targets.</p>
          <div className="mt-4">
            <Link id="btn-setup-signin" href="/auth" className="btn-primary">Sign in</Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mt-6 space-y-6 page page-shell max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <section className="card p-6">
        <p className="eyebrow">Your first week · Step {step} of 2</p>
        <h1 className="text-3xl mt-2">{step === 1 ? 'Start with your goal.' : 'Make room for training.'}</h1>
        <p className="mt-2 muted">{step === 1 ? 'Choose a direction. Body measurements are optional and help estimate nutrition targets.' : 'Choose a schedule you can repeat. We’ll save a plan you can open straight from your dashboard.'}</p>

        {step === 1 ? <form onSubmit={event => { event.preventDefault(); saveProfile(); }}>

        <div className="mt-4 grid sm:grid-cols-2 gap-4">
          <div>
            <label htmlFor="setup-goal" className="text-sm muted">Goal</label>
            <select id="setup-goal" name="goal" value={form.goal} onChange={onChange} className="input mt-1">
              {goalOptions.map(opt => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="setup-activity-level" className="text-sm muted">Activity level</label>
            <select id="setup-activity-level" name="activityLevel" value={form.activityLevel} onChange={onChange} className="input mt-1">
              {activityOptions.map(opt => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="setup-weight-kg" className="text-sm muted">Weight (kg, optional)</label>
            <input id="setup-weight-kg" name="weightKg" type="number" min="1" max="500" step="0.1" value={form.weightKg} onChange={onChange} className="input mt-1" />
          </div>
          <div>
            <label htmlFor="setup-height-cm" className="text-sm muted">Height (cm, optional)</label>
            <input id="setup-height-cm" name="heightCm" type="number" min="0" step="0.1" value={form.heightCm} onChange={onChange} className="input mt-1" />
          </div>
          <div>
            <label htmlFor="setup-age-years" className="text-sm muted">Age (years, optional)</label>
            <input id="setup-age-years" name="ageYears" type="number" min="0" step="1" value={form.ageYears} onChange={onChange} className="input mt-1" />
          </div>
        </div>

        <div className="mt-5 flex flex-wrap gap-3 items-center">
          <button id="btn-setup-save" type="submit" className="btn-core-primary" disabled={saving}>
            {saving ? 'Saving...' : 'Save goal & continue →'}
          </button>
          <Link id="btn-setup-skip" href="/" className="btn-core-secondary !text-gray-800 dark:!text-white">Skip for now</Link>
        </div>
        </form> : <form onSubmit={buildFirstWeek} className="setup-training-form">
          <label>Training experience<select className="input" value={preferences.experience_level} onChange={event => setPreferences({ ...preferences, experience_level: event.target.value })}><option value="beginner">Beginner — building a routine</option><option value="intermediate">Intermediate — training regularly</option><option value="advanced">Advanced — experienced lifter</option></select></label>
          <label>Days per week<input className="input" type="number" required min="1" max="7" value={preferences.days_per_week} onChange={event => setPreferences({ ...preferences, days_per_week: event.target.value })} /></label>
          <label>Available equipment<select className="input" value={preferences.equipment_available} onChange={event => setPreferences({ ...preferences, equipment_available: event.target.value })}><option value="full_gym">Full gym</option><option value="dumbbells_only">Dumbbells only</option><option value="bodyweight">Bodyweight / no equipment</option><option value="resistance_bands">Resistance bands</option></select></label>
          {profileSaved && <p className="muted">Goal saved: {form.goal}. Your plan will use these training preferences.</p>}
          <div className="flex flex-wrap gap-3"><button type="button" className="btn-core-secondary" disabled={saving} onClick={() => setStep(1)}>Back</button><button type="submit" className="btn-core-primary" disabled={saving}>{saving ? 'Building your week…' : 'Build my first week →'}</button><Link href="/" className="btn-core-secondary">Plan later</Link></div>
        </form>}
        {msg && <p role="alert" className="mt-4 text-red-400">{msg}</p>}
      </section>

      <section className="card-soft p-5">
        <div className="tag muted">What you get</div>
        <div className="mt-2 grid sm:grid-cols-3 gap-3 text-sm">
          <div>
            <div className="font-semibold">Calorie target</div>
            <div className="muted">Daily energy number based on your activity and goal.</div>
          </div>
          <div>
            <div className="font-semibold">Protein goal</div>
            <div className="muted">Optimized to support muscle gain or fat loss.</div>
          </div>
          <div>
            <div className="font-semibold">Training summaries</div>
            <div className="muted">Progress view auto-updates once your profile is set.</div>
          </div>
        </div>
      </section>
    </div>
  );
}

export default function Setup() {
  return <ProtectedRoute><SetupContent /></ProtectedRoute>;
}
