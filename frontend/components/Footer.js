'use client';
import Link from 'next/link';
import { FiMail, FiMapPin, FiPhone } from 'react-icons/fi';

export default function Footer() {
  return (
    <footer style={{ background: '#1a1a2e', color: '#a9a9c8' }}>
      <div className="max-w-7xl mx-auto px-4 py-12 grid md:grid-cols-4 gap-8">
        <div>
          <div className="flex items-center gap-2 mb-4">
            <img src="/logo/Copilot_20260522_120202-removebg-preview (1).png" alt="LMS" className="h-10 w-auto" />
          </div>
          <p className="text-sm leading-relaxed">
            Empowering learners worldwide with expert-led courses and industry-recognized certificates.
          </p>
        </div>

        <div>
          <h4 className="font-semibold text-white mb-4 heading-font">Quick Links</h4>
          <div className="flex flex-col gap-2 text-sm">
            <Link href="/courses" className="hover:text-white transition no-underline" style={{ color: '#a9a9c8' }}>Browse Courses</Link>
            <Link href="/dashboard" className="hover:text-white transition no-underline" style={{ color: '#a9a9c8' }}>Dashboard</Link>
            <Link href="/certificates" className="hover:text-white transition no-underline" style={{ color: '#a9a9c8' }}>Certificates</Link>
          </div>
        </div>

        <div>
          <h4 className="font-semibold text-white mb-4 heading-font">Support</h4>
          <div className="flex flex-col gap-2 text-sm">
            <Link href="/" className="hover:text-white transition no-underline" style={{ color: '#a9a9c8' }}>Help Center</Link>
            <Link href="/" className="hover:text-white transition no-underline" style={{ color: '#a9a9c8' }}>Terms of Service</Link>
            <Link href="/" className="hover:text-white transition no-underline" style={{ color: '#a9a9c8' }}>Privacy Policy</Link>
          </div>
        </div>

        <div>
          <h4 className="font-semibold text-white mb-4 heading-font">Contact</h4>
          <div className="flex flex-col gap-3 text-sm">
            <span className="flex items-center gap-2"><FiMail size={14} /> support@lms.com</span>
            <span className="flex items-center gap-2"><FiPhone size={14} /> +1 (555) 123-4567</span>
            <span className="flex items-center gap-2"><FiMapPin size={14} /> San Francisco, CA</span>
          </div>
        </div>
      </div>

      <div className="border-t border-white/10 py-6">
        <p className="text-center text-xs" style={{ color: '#6b6b8a' }}>
          &copy; {new Date().getFullYear()} LMS. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
