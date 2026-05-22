'use client';
import { useState } from 'react';
import { FiX, FiUserPlus } from 'react-icons/fi';
import { authAPI } from '@/lib/api';
import toast from 'react-hot-toast';

export default function AddInstructorModal({ onClose, onSuccess }) {
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name.trim() || !form.email.trim() || !form.password.trim()) {
      toast.error('All fields are required');
      return;
    }
    setSubmitting(true);
    try {
      await authAPI.createUser({ ...form, role: 'instructor' });
      toast.success('Instructor created successfully!');
      onSuccess();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create instructor');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-md overflow-hidden" style={{ boxShadow: '0 20px 60px rgba(0,0,0,0.2)' }}>
        <div className="relative p-6" style={{ background: 'linear-gradient(135deg, #757FEF 0%, #8676ff 100%)' }}>
          <button onClick={onClose} className="absolute top-4 right-4 p-1 rounded-full bg-white/20 hover:bg-white/30 transition cursor-pointer" style={{ color: 'white' }}>
            <FiX size={20} />
          </button>
          <h3 className="text-xl font-bold text-white mb-1">Add Instructor</h3>
          <p className="text-sm text-white/80">Create a new instructor account</p>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="text-sm font-medium mb-1 block" style={{ color: '#260944' }}>Full Name</label>
            <input
              value={form.name} onChange={e => setForm({ ...form, name: e.target.value })}
              placeholder="John Doe"
              className="w-full px-4 py-3 rounded-xl outline-none text-sm transition-all focus:ring-2"
              style={{ border: '1px solid #EEF0F6', backgroundColor: '#F5F7FA', '--tw-ring-color': '#757FEF' }}
            />
          </div>
          <div>
            <label className="text-sm font-medium mb-1 block" style={{ color: '#260944' }}>Email</label>
            <input
              type="email"
              value={form.email} onChange={e => setForm({ ...form, email: e.target.value })}
              placeholder="instructor@example.com"
              className="w-full px-4 py-3 rounded-xl outline-none text-sm transition-all focus:ring-2"
              style={{ border: '1px solid #EEF0F6', backgroundColor: '#F5F7FA', '--tw-ring-color': '#757FEF' }}
            />
          </div>
          <div>
            <label className="text-sm font-medium mb-1 block" style={{ color: '#260944' }}>Password</label>
            <input
              type="password"
              value={form.password} onChange={e => setForm({ ...form, password: e.target.value })}
              placeholder="Enter password"
              className="w-full px-4 py-3 rounded-xl outline-none text-sm transition-all focus:ring-2"
              style={{ border: '1px solid #EEF0F6', backgroundColor: '#F5F7FA', '--tw-ring-color': '#757FEF' }}
            />
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="flex items-center justify-center gap-2 w-full py-3 rounded-xl text-white font-semibold text-sm transition-all hover:shadow-lg hover:-translate-y-0.5 cursor-pointer disabled:opacity-60 disabled:transform-none"
            style={{ backgroundColor: '#757FEF' }}
          >
            <FiUserPlus size={16} /> {submitting ? 'Creating...' : 'Add Instructor'}
          </button>
        </form>
      </div>
    </div>
  );
}
