'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import api from '../../api';
import useDocumentMetadata from '../../hooks/useDocumentMetadata';
import ProtectedRoute from '../../components/ProtectedRoute';
import Link from 'next/link';

const MAX_VIDEO_BYTES = 40 * 1024 * 1024;
const VIDEO_TYPES = new Set(['video/mp4', 'video/quicktime', 'video/x-msvideo', 'video/webm']);

const EXERCISE_SUGGESTIONS = [
  'Back squat',
  'Goblet squat',
  'Romanian deadlift',
  'Incline bench press',
  'Push-up',
  'Arnold press',
  'Cable lateral raise',
  'Walking lunge',
];

function formatBytes(bytes) {
  if (!bytes) return '0 MB';
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}

function readableLabel(value) {
  if (!value) return 'Not available';
  return value.replaceAll('_', ' ').replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function VideoFormAnalysisContent() {
  useDocumentMetadata({
    title: 'Video Form Analysis',
    description: 'Upload a working set to review visible movement range and repetition consistency.'
  });

  const fileInputRef = useRef(null);
  const [file, setFile] = useState(null);
  const [exercise, setExercise] = useState('Back squat');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState(null);
  const [linkedWorkout, setLinkedWorkout] = useState(null);

  const previewUrl = useMemo(() => file ? URL.createObjectURL(file) : '', [file]);

  useEffect(() => () => {
    if (previewUrl) URL.revokeObjectURL(previewUrl);
  }, [previewUrl]);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const workoutId = params.get('workout');
    const name = params.get('name');
    if (name) setExercise(name);
    if (workoutId) {
      setLinkedWorkout({ workoutId });
    }
  }, []);

  const selectFile = (selectedFile) => {
    setError('');
    setResult(null);
    if (!selectedFile) return;
    if (!VIDEO_TYPES.has(selectedFile.type)) {
      setFile(null);
      setError('Use an MP4, MOV, AVI, or WebM video.');
      return;
    }
    if (selectedFile.size > MAX_VIDEO_BYTES) {
      setFile(null);
      setError('This video is over 40 MB. Trim it to one working set (about 15–30 seconds) and try again.');
      return;
    }
    setFile(selectedFile);
  };

  const onAnalyze = async () => {
    const cleanExercise = exercise.trim();
    if (!cleanExercise) {
      setError('Name the exercise or variation first.');
      return;
    }
    if (!file) {
      setError('Choose a workout video first.');
      return;
    }

    setLoading(true);
    setError('');
    setResult(null);

    const formData = new FormData();
    formData.append('video', file);
    formData.append('exercise_name', cleanExercise);
    if (linkedWorkout?.workoutId) formData.append('workout_id', linkedWorkout.workoutId);

    try {
      const response = await api.post('/video/analyze', formData);
      setResult(response.data);
    } catch (requestError) {
      const data = requestError.response?.data;
      const serviceDetail = data?.pythonServiceError?.responseData?.detail;
      setError(serviceDetail || data?.error || data?.message || 'The clip could not be analyzed. Try a shorter video with a clear side view.');
    } finally {
      setLoading(false);
    }
  };

  const analysis = result?.analysis;
  const isAdaptive = analysis?.analysisMode === 'adaptive';

  return (
    <main className="analysis-page">
      <header className="analysis-intro">
        <p className="analysis-kicker">Movement review</p>
        <h1>Put one working set under the lens.</h1>
        <p>Record from the side with your full body visible. DumbbellDore follows the main working joint, counts complete repetitions, and flags visible range issues.</p>
        {linkedWorkout ? <p className="analysis-linked-note">Linked to the exercise you just logged. The result will appear with that session.</p> : null}
      </header>

      <section className="analysis-workspace" aria-labelledby="analysis-input-title">
        <div className="analysis-controls">
          <div className="analysis-step-heading">
            <span>01</span>
            <div>
              <h2 id="analysis-input-title">Identify the movement</h2>
              <p>Type any exercise or variation. Common lifts use specific rules; unfamiliar movements use adaptive joint tracking.</p>
            </div>
          </div>

          <label className="analysis-field" htmlFor="analysis-exercise">
            <span>Exercise or variation</span>
            <input
              id="analysis-exercise"
              list="exercise-suggestions"
              value={exercise}
              maxLength={80}
              onChange={(event) => setExercise(event.target.value)}
              placeholder="e.g. Bulgarian split squat"
              autoComplete="off"
            />
            <datalist id="exercise-suggestions">
              {EXERCISE_SUGGESTIONS.map((name) => <option key={name} value={name} />)}
            </datalist>
          </label>

          <div className="analysis-step-heading analysis-step-heading--second">
            <span>02</span>
            <div>
              <h2>Add the set</h2>
              <p>Keep the clip short. Avoid mirrors, cuts, and people crossing the frame.</p>
            </div>
          </div>

          <input
            ref={fileInputRef}
            id="video-upload"
            type="file"
            accept="video/mp4,video/quicktime,video/x-msvideo,video/webm"
            onChange={(event) => selectFile(event.target.files?.[0])}
            className="sr-only"
          />

          <button
            type="button"
            className="analysis-file-button"
            onClick={() => fileInputRef.current?.click()}
          >
            <span>{file ? 'Replace video' : 'Choose video'}</span>
            <b>MP4 · MOV · AVI · WEBM / 40 MB max</b>
          </button>

          {file ? (
            <div className="analysis-file-meta" aria-live="polite">
              <span>{file.name}</span>
              <span>{formatBytes(file.size)}</span>
            </div>
          ) : null}

          {error ? <p className="analysis-error" role="alert">{error}</p> : null}

          <button
            id="btn-analysis-submit"
            type="button"
            onClick={onAnalyze}
            disabled={loading || !file || !exercise.trim()}
            className="analysis-submit"
          >
            <span>{loading ? 'Reading movement' : 'Analyze set'}</span>
            <span aria-hidden="true">{loading ? '•••' : '↗'}</span>
          </button>

          {loading ? (
            <div className="analysis-loading" role="status">
              <span />
              <p>Tracking joints frame by frame. Longer clips take more time.</p>
            </div>
          ) : null}
        </div>

        <div className="analysis-preview" aria-label="Video framing preview">
          {previewUrl ? (
            <video src={previewUrl} controls playsInline preload="metadata" />
          ) : (
            <div className="analysis-framing-guide">
              <svg viewBox="0 0 260 360" role="img" aria-label="Side-view body framing guide">
                <rect x="20" y="20" width="220" height="320" rx="2" />
                <circle cx="130" cy="78" r="24" />
                <path d="M130 103v92m0-65-54 47m54-47 58 42m-58 23-42 94m42-94 51 92" />
                <path d="M30 55V30h25M205 30h25v25M30 305v25h25M205 330h25v-25" />
              </svg>
              <p>Side view<br />head to feet<br />steady camera</p>
            </div>
          )}
        </div>
      </section>

      {analysis ? (
        <section className="analysis-results" aria-labelledby="analysis-results-title">
          <div className="analysis-result-lead">
            <div>
              <p className="analysis-kicker">Review complete</p>
              <h2 id="analysis-results-title">{readableLabel(analysis.exercise)}</h2>
              <p>{analysis.feedback}</p>
            </div>
            <div className="analysis-score" aria-label={`Movement score ${analysis.score} out of 100`}>
              <strong>{analysis.score}</strong><span>/100</span>
            </div>
          </div>

          {isAdaptive ? (
            <p className="analysis-mode-note">Adaptive review tracked the {readableLabel(analysis.dominantJoint).toLowerCase()} because this variation does not have a lift-specific rule set yet.</p>
          ) : null}

          <dl className="analysis-data-row">
            <div><dt>Complete reps</dt><dd>{analysis.reps ?? 0}</dd></div>
            <div><dt>Pose visibility</dt><dd>{analysis.detectionConfidence ?? 0}%</dd></div>
            <div><dt>Frames read</dt><dd>{analysis.framesAnalyzed ?? 0}</dd></div>
            <div><dt>Tracking</dt><dd>{isAdaptive ? 'Adaptive' : 'Lift-specific'}</dd></div>
          </dl>

          <div className="analysis-findings">
            <div>
              <h3>Visible findings</h3>
              {analysis.issues?.length ? (
                <ul>{analysis.issues.map((issue) => <li key={issue}>{readableLabel(issue)}</li>)}</ul>
              ) : <p>No range issues detected in the visible frames.</p>}
            </div>
            <div>
              <h3>Next-set cues</h3>
              <p>{result.feedback?.cues?.join(' ') || 'Repeat the same camera angle and keep the tempo controlled.'}</p>
            </div>
          </div>
          <div className="session-finish"><p>Your review is saved. Next-session guidance combines this linked review with your reported effort; low-visibility clips won’t trigger progression.</p><Link href="/progress" className="btn-core-primary">See next-session guidance →</Link><Link href="/forge" className="plan-day-action">Return to workout log</Link></div>
        </section>
      ) : null}

      <p className="analysis-privacy">The uploaded clip is deleted after processing. Results—not the video—are saved to your account. Movement review is coaching feedback, not medical advice.</p>
    </main>
  );
}

export default function VideoFormAnalysis() {
  return <ProtectedRoute><VideoFormAnalysisContent /></ProtectedRoute>;
}
