'use client';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function DashboardRedirect() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    } else if (user) {
      router.push(`/dashboard/${user.role}`);
    }
  }, [user, loading, router]);

  return <div className="text-center py-20 text-gray-500">Redirecting...</div>;
}
