'use client';
import { useEffect, useState } from 'react';
import { certificateAPI } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';

export default function CertificatesPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [certificates, setCertificates] = useState([]);

  useEffect(() => {
    if (!user) { router.push('/login'); return; }
    certificateAPI.getMyCertificates().then(res => setCertificates(res.data)).catch(() => {});
  }, [user, router]);

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">My Certificates</h1>
      <div className="grid md:grid-cols-3 gap-6">
        {certificates.map((cert) => (
          <div key={cert.id} className="bg-white border-2 border-gray-200 rounded-xl p-6 text-center hover:shadow-md transition">
            <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
              </svg>
            </div>
            <h3 className="font-semibold text-gray-900 mb-1">{cert.course_title}</h3>
            <p className="text-sm text-gray-500 mb-1">Issued to {user?.name}</p>
            <p className="text-xs text-gray-400 mb-4">Code: {cert.certificate_code}</p>
            <a href={cert.certificate_url} target="_blank"
              className="inline-block bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-indigo-700">
              View Certificate
            </a>
          </div>
        ))}
      </div>
      {certificates.length === 0 && (
        <div className="text-center py-20">
          <p className="text-gray-500">Complete a course to earn your certificate!</p>
        </div>
      )}
    </div>
  );
}
