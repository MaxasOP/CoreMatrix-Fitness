// Dashboard Component
import React, { useState, useEffect } from 'react';
import axios from 'axios';

const Dashboard = () => {
  const [user, setUser] = useState(null);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUserData();
  }, []);

  const fetchUserData = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${process.env.REACT_APP_API_URL}/auth/me`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setUser(response.data);
      setStats({
        healthScore: response.data?.health_scores?.overall_health_score || 0,
        streak: response.data?.current_workout_streak || 0,
        totalWorkouts: response.data?.workouts_count || 0,
        mealsLogged: response.data?.meals_count || 0
      });
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="p-8 text-center">Loading...</div>;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl font-bold text-gray-900">Welcome, {user?.name}! 💪</h1>
        <p className="text-gray-600 mt-2">Let's crush your fitness goals</p>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mt-8 mb-8">
          <StatCard label="Health Score" value={stats?.healthScore} icon="❤️" />
          <StatCard label="Streak" value={stats?.streak} icon="🔥" />
          <StatCard label="Workouts" value={stats?.totalWorkouts} icon="💪" />
          <StatCard label="Meals" value={stats?.mealsLogged} icon="🥗" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <ActionCard icon="💪" title="Log Workout" desc="Track exercise" link="/workout/new" />
          <ActionCard icon="🥗" title="Log Meal" desc="Track nutrition" link="/meal/new" />
          <ActionCard icon="📊" title="AI Meal Plan" desc="Get personalized plan" link="/ai/mealplan" />
          <ActionCard icon="💊" title="Supplements" desc="Smart recommendations" link="/supplements" />
          <ActionCard icon="🏆" title="Leaderboards" desc="View rankings" link="/leaderboards" />
          <ActionCard icon="🎯" title="Challenges" desc="Join competitions" link="/challenges" />
        </div>
      </div>
    </div>
  );
};

const StatCard = ({ label, value, icon }) => (
  <div className="bg-white rounded-lg shadow-lg p-6">
    <p className="text-gray-600 text-sm">{label}</p>
    <p className="text-3xl font-bold text-blue-600 mt-2">{value}</p>
    <span className="text-3xl">{icon}</span>
  </div>
);

const ActionCard = ({ icon, title, desc, link }) => (
  <a href={link} className="bg-white rounded-lg shadow-lg p-6 hover:shadow-xl transition">
    <div className="text-4xl mb-4">{icon}</div>
    <h3 className="text-xl font-bold text-gray-900 mb-2">{title}</h3>
    <p className="text-gray-600">{desc}</p>
  </a>
);

export default Dashboard;
