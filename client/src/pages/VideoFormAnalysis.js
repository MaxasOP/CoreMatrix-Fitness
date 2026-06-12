import React, { useState } from 'react';
import api from '../api';
import useDocumentMetadata from '../hooks/useDocumentMetadata';

const VideoFormAnalysis = () => {
  useDocumentMetadata({
    title: 'AI Video Form Analysis',
    description: 'Upload videos of your exercises to receive instant AI feedback on your lifting form, posture, and safety.'
  });

  const [file, setFile] = useState(null);
  const [exercise, setExercise] = useState('squat');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  const onFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const onAnalyze = async () => {
    if (!file) {
      alert("Please select a video file first.");
      return;
    }

    setLoading(true);
    setResult(null);

    const formData = new FormData();
    formData.append("video", file);
    formData.append("exercise_name", exercise);

    try {
      const response = await api.post(
        `/video/analyze`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        }
      );

      setResult(response.data);
    } catch (error) {
      console.error("Error analyzing video:", error);
      const data = error.response?.data;
      const python = data?.pythonServiceError;
      const pythonDetail = python
        ? `\nPython service: ${python.status || 'unknown status'} ${python.code || ''}\nURL: ${python.pythonServiceUrl || 'unknown'}\n${python.message ? `Message: ${python.message}` : ''}\n${python.responseData ? `Response: ${typeof python.responseData === 'string' ? python.responseData : JSON.stringify(python.responseData)}` : ''}`
        : '';
      alert(data?.error ? `${data.error}${pythonDetail}` : "Error analyzing video. Make sure the AI service is running.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="max-w-2xl mx-auto bg-white rounded-2xl shadow-xl p-6 md:p-10">
        <h1 className="text-3xl font-bold text-gray-900 mb-6 text-center">Form AI Analyzer</h1>
        
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Select Exercise</label>
            <select 
              id="analysis-exercise-select"
              value={exercise} 
              onChange={(e) => setExercise(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 outline-none transition-all"
            >
              <option value="squat">Squat</option>
              <option value="deadlift">Deadlift</option>
              <option value="bench_press">Bench Press</option>
              <option value="pushup">Pushup</option>
              <option value="shoulder_press">Shoulder Press</option>
            </select>
          </div>

          <div className="border-2 border-dashed border-gray-300 rounded-2xl p-8 text-center hover:border-orange-500 transition-colors bg-gray-50 group">
            <input 
              type="file" 
              accept="video/*" 
              onChange={onFileChange} 
              className="hidden" 
              id="video-upload" 
            />
            <label htmlFor="video-upload" className="cursor-pointer block w-full">
              <div className="text-5xl mb-4 group-hover:scale-110 transition-transform">📹</div>
              <p className="text-gray-600 font-semibold text-lg">
                {file ? file.name : "Click to upload your workout video"}
              </p>
              <p className="text-sm text-gray-400 mt-2 font-medium">MP4, MOV, AVI up to 100MB</p>
            </label>
          </div>

          <button
            id="btn-analysis-submit"
            onClick={onAnalyze}
            disabled={loading || !file}
            className={`w-full py-4 rounded-xl font-bold text-white transition-all shadow-lg text-lg ${
              loading || !file 
              ? "bg-gray-400 cursor-not-allowed" 
              : "bg-orange-600 hover:bg-orange-700 active:scale-95 hover:shadow-orange-500/20"
            }`}
          >
            {loading ? (
              <div className="flex items-center justify-center gap-2">
                <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Analyzing Form...
              </div>
            ) : "Analyze Form"}
          </button>
        </div>

        {result && (
          <div className="mt-10 p-6 bg-orange-50 rounded-2xl border border-orange-200 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900 capitalize">{result.analysis.exercise} Results</h2>
              <div className="flex flex-col items-end">
                <span className="text-xs text-gray-400 uppercase font-bold mb-1">Form Score</span>
                <div className="bg-orange-600 text-white px-5 py-1.5 rounded-full text-xl font-black shadow-md">
                  {result.analysis.score}/100
                </div>
              </div>
            </div>
            
            <div className="mb-6 bg-white p-5 rounded-2xl shadow-sm border border-orange-100">
              <p className="text-sm font-bold text-orange-600 uppercase tracking-widest mb-2">Coaching Feedback</p>
              <p className="text-gray-700 leading-relaxed italic text-lg">
                "{result.analysis.feedback}"
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 text-center">
                <p className="text-xs text-gray-400 uppercase font-bold tracking-wider mb-1">Repetitions</p>
                <p className="text-3xl font-black text-gray-900">{result.analysis.reps}</p>
              </div>
              <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 text-center">
                <p className="text-xs text-gray-400 uppercase font-bold tracking-wider mb-1">Issues Found</p>
                <p className="text-3xl font-black text-red-600">{result.analysis.issues?.length || 0}</p>
              </div>
            </div>

            {result.analysis.issues?.length > 0 && (
              <div className="mt-8">
                <p className="text-sm font-bold text-gray-500 uppercase tracking-widest mb-3">Improvement Areas</p>
                <div className="flex flex-wrap gap-3">
                  {result.analysis.issues.map((issue, idx) => (
                    <span key={idx} className="bg-red-50 text-red-600 border border-red-100 px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-2">
                      <span className="h-2 w-2 bg-red-600 rounded-full"></span>
                      {issue.replace(/_/g, ' ')}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
      <div className="mt-8 text-center text-gray-400 text-sm max-w-md mx-auto">
        <p>Videos are processed securely and deleted immediately after analysis. We only save your performance metrics.</p>
      </div>
    </div>
  );
};

export default VideoFormAnalysis;
