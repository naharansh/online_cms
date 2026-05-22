'use client';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { FiBookOpen, FiGrid, FiPlus, FiBarChart2, FiLogOut, FiUser } from 'react-icons/fi';

export default function Navbar() {
  const { user, logout } = useAuth();

  return (
    <nav className="bg-white shadow-sm sticky top-0 z-50" style={{ borderBottom: '1px solid #EEF0F6' }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link href="/" className="flex items-center gap-2 no-underline">
              <img src="/logo/Copilot_20260522_120202-removebg-preview (1).png" alt="LMS" className="h-10 w-auto" />
            </Link>
            <div className="hidden sm:flex sm:ml-8 sm:space-x-1">
              <Link href="/courses" className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium no-underline transition" style={{ color: '#5B5B98' }}>
                <FiBookOpen size={15} /> Courses
              </Link>
              {user && user.role === 'student' && (
                <Link href="/my-courses" className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium no-underline transition" style={{ color: '#5B5B98' }}>
                  <FiGrid size={15} /> My Learning
                </Link>
              )}
              {user && (user.role === 'instructor' || user.role === 'admin') && (
                <Link href="/courses/create" className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium no-underline transition" style={{ color: '#5B5B98' }}>
                  <FiPlus size={15} /> Create Course
                </Link>
              )}
              {user && (user.role === 'instructor' || user.role === 'admin') && (
                <Link href="/dashboard/instructor/performance" className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium no-underline transition" style={{ color: '#5B5B98' }}>
                  <FiBarChart2 size={15} /> Performance
                </Link>
              )}
            </div>
          </div>
          <div className="flex items-center gap-3">
            {user ? (
              <>
                <Link href="/dashboard" className="px-3 py-2 rounded-lg text-sm font-medium no-underline transition" style={{ color: '#5B5B98' }}>
                  Dashboard
                </Link>
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg" style={{ backgroundColor: '#F5F7FA' }}>
                  <div className="w-7 h-7 rounded-full flex items-center justify-center text-white text-xs font-medium" style={{ background: 'linear-gradient(135deg, #757FEF 0%, #8676ff 100%)' }}>
                    {user.name?.charAt(0)?.toUpperCase()}
                  </div>
                  <span className="text-sm font-medium" style={{ color: '#260944' }}>{user.name}</span>
                  <span className="text-xs px-2 py-0.5 rounded-full font-medium" style={{
                    backgroundColor: user.role === 'admin' ? 'rgba(117, 127, 239, 0.1)' : user.role === 'instructor' ? 'rgba(0, 182, 155, 0.1)' : 'rgba(45, 182, 245, 0.1)',
                    color: user.role === 'admin' ? '#757FEF' : user.role === 'instructor' ? '#00B69B' : '#2DB6F5'
                  }}>{user.role}</span>
                </div>
                <button
                  onClick={logout}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition no-underline"
                  style={{ color: '#EE368C', backgroundColor: 'rgba(238, 54, 140, 0.08)' }}
                >
                  <FiLogOut size={15} /> Logout
                </button>
              </>
            ) : (
              <>
                <Link href="/login" className="px-4 py-2 rounded-lg text-sm font-medium no-underline transition" style={{ color: '#5B5B98' }}>
                  Login
                </Link>
                <Link href="/register" className="px-5 py-2 rounded-lg text-sm font-semibold text-white no-underline transition hover:opacity-90" style={{ backgroundColor: '#757FEF' }}>
                  Sign Up
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
