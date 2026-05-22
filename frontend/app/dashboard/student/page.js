'use client';
import { useEffect, useState } from 'react';
import { dashboardAPI } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import Link from 'next/link';
import Loader from '@/components/Loader';

export default function StudentDashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    dashboardAPI.getStudent().then(res => setStats(res.data)).catch(() => {}).finally(() => setLoading(false));
  }, []);

  if (loading) return <Loader text="Loading dashboard..." />;

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-2">Student Dashboard</h1>
      <p className="text-gray-500 mb-8">Welcome back, {user?.name}!</p>

      <div className="grid md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 rounded-xl border border-gray-200">
          <p className="text-3xl font-bold text-indigo-600">{stats?.total_enrolled || 0}</p>
          <p className="text-gray-500">Enrolled Courses</p>
        </div>
        <div className="bg-white p-6 rounded-xl border border-gray-200">
          <p className="text-3xl font-bold text-green-600">{stats?.completed_courses || 0}</p>
          <p className="text-gray-500">Completed</p>
        </div>
        <div className="bg-white p-6 rounded-xl border border-gray-200">
          <p className="text-3xl font-bold text-purple-600">{stats?.total_certificates || 0}</p>
          <p className="text-gray-500">Certificates</p>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        <div className="bg-white p-6 rounded-xl border border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Links</h2>
          <div className="space-y-2">
            <Link href="/my-courses" className="block text-indigo-600 hover:underline">My Courses</Link>
            <Link href="/courses" className="block text-indigo-600 hover:underline">Browse Courses</Link>
            <Link href="/certificates" className="block text-indigo-600 hover:underline">My Certificates</Link>
          </div>
        </div>
        <div className="bg-white p-6 rounded-xl border border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h2>
          {stats?.recent_activity?.length > 0 ? (
            <div className="space-y-3">
              {stats.recent_activity.slice(0, 5).map((a, i) => (
                <div key={i} className="text-sm text-gray-600">
                  Completed "{a.lesson_title}" in {a.course_title}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-sm">No recent activity</p>
          )}
        </div>
      </div>
    </div>
  );
}
