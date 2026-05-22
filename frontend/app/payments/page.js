'use client';
import { useEffect, useState } from 'react';
import { paymentAPI } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';

export default function PaymentsPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [payments, setPayments] = useState([]);

  useEffect(() => {
    if (!user) { router.push('/login'); return; }
    paymentAPI.getHistory().then(res => setPayments(res.data)).catch(() => {});
  }, [user, router]);

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Payment History</h1>
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Course</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {payments.map((p) => (
              <tr key={p.id}>
                <td className="px-6 py-4 text-sm text-gray-900">{p.course_title}</td>
                <td className="px-6 py-4 text-sm text-gray-700">${p.amount}</td>
                <td className="px-6 py-4">
                  <span className={`px-2 py-1 rounded text-xs ${p.payment_status === 'completed' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                    {p.payment_status}
                  </span>
                </td>
                <td className="px-6 py-4 text-sm text-gray-500">{new Date(p.created_at).toLocaleDateString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {payments.length === 0 && <p className="text-center text-gray-500 py-8">No payments yet.</p>}
      </div>
    </div>
  );
}
