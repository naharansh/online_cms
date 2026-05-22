'use client';
import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { assignmentAPI } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import toast from 'react-hot-toast';

export default function AssignmentsPage() {
  const { courseId } = useParams();
  const { user } = useAuth();
  const router = useRouter();
  const [assignments, setAssignments] = useState([]);
  const [selectedFiles, setSelectedFiles] = useState({});
  const [submissionTexts, setSubmissionTexts] = useState({});
  const [submitting, setSubmitting] = useState(null);

  useEffect(() => {
    if (!user) { router.push('/login'); return; }
    assignmentAPI.getByCourse(courseId).then(res => setAssignments(res.data)).catch(() => {});
  }, [courseId, user, router]);

  const handleSubmit = async (assignmentId) => {
    const file = selectedFiles[assignmentId];
    const text = submissionTexts[assignmentId] || '';
    if (!file && !text.trim()) { toast.error('Please select a file or enter submission text'); return; }
    const formData = new FormData();
    if (file) formData.append('file', file);
    if (text.trim()) formData.append('submission_text', text);
    setSubmitting(assignmentId);
    try {
      await assignmentAPI.submit(assignmentId, formData);
      toast.success('Assignment submitted!');
      setSelectedFiles(prev => ({ ...prev, [assignmentId]: null }));
      const res = await assignmentAPI.getByCourse(courseId);
      setAssignments(res.data);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Submission failed');
    } finally {
      setSubmitting(null);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Assignments</h1>
      <div className="space-y-6">
        {assignments.map((a) => (
          <div key={a.id} className="bg-white border border-gray-200 rounded-xl p-6">
            <h3 className="font-semibold text-gray-900 text-lg mb-2">{a.title}</h3>
            <p className="text-gray-600 mb-3">{a.description}</p>
            <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
              <span>Deadline: {a.deadline ? new Date(a.deadline).toLocaleDateString() : 'No deadline'}</span>
              <span>Max Score: {a.max_score}</span>
            </div>
            {user?.role === 'student' && (
              a.submission_id ? (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <p className="text-green-700 font-medium">Submitted</p>
                  {a.my_score !== null ? (
                    <p className="text-green-600 text-sm mt-1">Score: {a.my_score}/{a.max_score} | Feedback: {a.my_feedback || 'Pending'}</p>
                  ) : (
                    <p className="text-yellow-600 text-sm mt-1">Awaiting grade</p>
                  )}
                </div>
              ) : (
                <div className="space-y-3">
                  <textarea
                    value={submissionTexts[a.id] || ''}
                    onChange={e => setSubmissionTexts(prev => ({ ...prev, [a.id]: e.target.value }))}
                    rows={3}
                    placeholder="Write your submission (optional)"
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none resize-none"
                  />
                  <div className="flex items-center gap-3">
                    <input type="file" onChange={(e) => setSelectedFiles(prev => ({ ...prev, [a.id]: e.target.files[0] }))} className="text-sm" />
                    <button onClick={() => handleSubmit(a.id)} disabled={submitting === a.id}
                      className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-indigo-700 disabled:opacity-50">
                      {submitting === a.id ? 'Submitting...' : 'Submit'}
                    </button>
                  </div>
                </div>
              )
            )}
          </div>
        ))}
      </div>
      {assignments.length === 0 && <p className="text-center text-gray-500 py-12">No assignments yet.</p>}
    </div>
  );
}
