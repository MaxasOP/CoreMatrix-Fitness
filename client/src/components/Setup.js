import React, { useContext, useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../AuthContext';
import api from '../api';

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

export default function Setup() {
  const { user, setUser } = useContext(AuthContext);
  const navigate = useNavigate();
  const [form, setForm] = useState({
    goal: user?.goal || 'Build Muscle',
    weightKg: user?.weight || '',
    heightCm: user?.height || '',
    ageYears: user?.age || '',
    activityLevel: user?.activityLevel || 'moderate'
  });
  const [msg, setMsg] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!user) return;
    setForm({
      goal: user.goal || 'Build Muscle',
      weightKg: user.weight || '',
      heightCm: user.height || '',
      ageYears: user.age || '',
      activityLevel: user.activityLevel || 'moderate'
    });
  }, [user]);

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
      setMsg('Goals updated. Your plan is ready.');
      navigate('/progress');
    } catch (err) {
      setMsg(err.response?.data?.error || err.message || 'Profile update failed');
    } finally {
      setSaving(false);
    }
  }

  if (!user) {
    return (
      <div className="mt-6 page">
        <div className="card-soft p-5">
          <div className="tag muted">Sign in required</div>
          <h2 className="text-3xl mt-2">Set your goals</h2>
          <p className="mt-2 muted">Create an account to unlock personalized calories, protein targets, and training plans.</p>
          <div className="mt-4">
            <Link to="/auth" className="btn-primary">Sign in</Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mt-6 space-y-6 page">
      <section className="card p-6">
        <div className="tag muted">Setup</div>
        <h1 className="text-3xl mt-2">Personalize your goals</h1>
        <p className="mt-2 muted">We calculate daily calories and protein based on your metrics and activity level.</p>

        <div className="mt-4 grid sm:grid-cols-2 gap-4">
          <div>
            <label className="text-sm muted">Goal</label>
            <select name="goal" value={form.goal} onChange={onChange} className="input mt-1">
              {goalOptions.map(opt => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-sm muted">Activity level</label>
            <select name="activityLevel" value={form.activityLevel} onChange={onChange} className="input mt-1">
              {activityOptions.map(opt => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-sm muted">Weight (kg)</label>
            <input name="weightKg" type="number" min="0" step="0.1" value={form.weightKg} onChange={onChange} className="input mt-1" />
          </div>
          <div>
            <label className="text-sm muted">Height (cm)</label>
            <input name="heightCm" type="number" min="0" step="0.1" value={form.heightCm} onChange={onChange} className="input mt-1" />
          </div>
          <div>
            <label className="text-sm muted">Age (years)</label>
            <input name="ageYears" type="number" min="0" step="1" value={form.ageYears} onChange={onChange} className="input mt-1" />
          </div>
        </div>

        <div className="mt-5 flex flex-wrap gap-3 items-center">
          <button onClick={saveProfile} className="btn-primary" disabled={saving}>
            {saving ? 'Saving...' : 'Save & continue'}
          </button>
          <Link to="/" className="btn-secondary">Skip for now</Link>
          {msg && <span className="text-sm" style={{ color: msg.toLowerCase().includes('failed') ? '#b91c1c' : '#15803d' }}>{msg}</span>}
        </div>
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
            <div className="font-semibold">Smarter insights</div>
            <div className="muted">Progress view auto-updates once your profile is set.</div>
          </div>
        </div>
      </section>
    </div>
  );
}
