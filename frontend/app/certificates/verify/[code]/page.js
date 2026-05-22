'use client';
import { useEffect, useRef, useState } from 'react';
import { useParams } from 'next/navigation';
import { certificateAPI } from '@/lib/api';
import Loader from '@/components/Loader';
import { FiAward, FiCheckCircle, FiDownload } from 'react-icons/fi';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';

export default function VerifyCertificatePage() {
  const { code } = useParams();
  const certRef = useRef(null);
  const [cert, setCert] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState(false);

  useEffect(() => {
    if (!code) return;
    certificateAPI.verify(code)
      .then(res => setCert(res.data))
      .catch(() => setError('Certificate not found'))
      .finally(() => setLoading(false));
  }, [code]);

  const handleDownload = async () => {
    if (!certRef.current) return;
    setDownloading(true);
    try {
      const canvas = await html2canvas(certRef.current, {
        scale: 2,
        useCORS: true,
        backgroundColor: '#ffffff',
        onclone: (doc) => {
          const root = doc.querySelector('[data-cert-root]');
          if (!root) return;
          root.querySelectorAll('*').forEach(el => {
            const cs = el.ownerDocument ? getComputedStyle(el) : null;
            if (!cs) return;
            const checkAndFix = (jsProp, cssProp) => {
              const val = cs.getPropertyValue(cssProp);
              if (val && val.includes('oklab')) {
                el.style.setProperty(cssProp, jsProp === 'color' ? '#ffffff' : 'transparent');
              }
            };
            checkAndFix('color', 'color');
            checkAndFix('backgroundColor', 'background-color');
            checkAndFix('borderColor', 'border-top-color');
            checkAndFix('borderColor', 'border-right-color');
            checkAndFix('borderColor', 'border-bottom-color');
            checkAndFix('borderColor', 'border-left-color');
          });
        },
      });
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({ orientation: 'landscape', unit: 'px', format: [canvas.width / 2, canvas.height / 2] });
      pdf.addImage(imgData, 'PNG', 0, 0, canvas.width / 2, canvas.height / 2);
      pdf.save(`certificate-${code}.pdf`);
    } catch (err) {
      console.error('PDF generation failed', err);
    } finally {
      setDownloading(false);
    }
  };

  if (loading) return <Loader text="Verifying certificate..." />;

  if (error) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center px-4" style={{ backgroundColor: '#F5F7FA' }}>
        <div className="bg-white rounded-2xl p-8 text-center max-w-md w-full" style={{ boxShadow: 'rgba(100,100,111,0.1) 0px 4px 15px 0px', border: '1px solid #EEF0F6' }}>
          <div className="w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center" style={{ backgroundColor: 'rgba(238,54,140,0.1)' }}>
            <FiAward size={28} style={{ color: '#EE368C' }} />
          </div>
          <h3 className="text-lg font-bold heading-font mb-2" style={{ color: '#260944' }}>Certificate Not Found</h3>
          <p className="text-sm" style={{ color: '#A9A9C8' }}>The certificate code "{code}" is invalid or has been removed.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-8" style={{ backgroundColor: '#F5F7FA' }}>
      <div className="w-full max-w-2xl">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ backgroundColor: 'rgba(0,182,155,0.1)' }}>
              <FiCheckCircle size={20} style={{ color: '#00B69B' }} />
            </div>
            <h3 className="text-lg font-bold heading-font" style={{ color: '#260944' }}>Verified Certificate</h3>
          </div>
          <button
            onClick={handleDownload}
            disabled={downloading}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white transition"
            style={{ backgroundColor: '#757FEF' }}
            onMouseOver={e => e.currentTarget.style.backgroundColor = '#5a64d8'}
            onMouseOut={e => e.currentTarget.style.backgroundColor = '#757FEF'}
          >
            <FiDownload size={16} />
            {downloading ? 'Generating...' : 'Download PDF'}
          </button>
        </div>

        <div ref={certRef} data-cert-root className="bg-white rounded-2xl overflow-hidden" style={{ boxShadow: 'rgba(100,100,111,0.1) 0px 4px 25px 0px', border: '1px solid #EEF0F6' }}>
          <div className="p-8 sm:p-12 text-center" style={{ background: 'linear-gradient(135deg, #757FEF 0%, #8676ff 100%)' }}>
            <FiAward size={48} className="mx-auto mb-4" style={{ color: 'rgba(255,255,255,0.8)' }} />
            <h2 className="text-2xl sm:text-3xl font-bold mb-2 heading-font" style={{ color: '#ffffff' }}>Certificate of Completion</h2>
            <p className="text-sm" style={{ color: 'rgba(255,255,255,0.7)' }}>This certifies that</p>
          </div>

          <div className="p-8 sm:p-12 text-center">
            <h3 className="text-2xl font-bold mb-2 heading-font" style={{ color: '#260944' }}>{cert.student_name}</h3>
            <p className="text-sm mb-6" style={{ color: '#A9A9C8' }}>has successfully completed the course</p>
            <h4 className="text-xl font-bold mb-6 heading-font" style={{ color: '#757FEF' }}>{cert.course_title}</h4>

            <div className="flex items-center justify-center gap-8 flex-wrap mb-6">
              <div className="text-center">
                <p className="text-xs" style={{ color: '#A9A9C8' }}>Duration</p>
                <p className="text-sm font-semibold" style={{ color: '#260944' }}>{cert.duration || 'Self-paced'}</p>
              </div>
              <div className="text-center">
                <p className="text-xs" style={{ color: '#A9A9C8' }}>Instructor</p>
                <p className="text-sm font-semibold" style={{ color: '#260944' }}>{cert.instructor_name}</p>
              </div>
              <div className="text-center">
                <p className="text-xs" style={{ color: '#A9A9C8' }}>Issued</p>
                <p className="text-sm font-semibold" style={{ color: '#260944' }}>
                  {new Date(cert.issued_at).toLocaleDateString()}
                </p>
              </div>
            </div>

            <div className="inline-block px-4 py-2 rounded-xl text-xs font-mono" style={{ backgroundColor: '#F5F7FA', color: '#A9A9C8', border: '1px solid #EEF0F6' }}>
              {cert.certificate_code}
            </div>
          </div>
        </div>

        <div className="text-center mt-6">
          <p className="text-xs" style={{ color: '#A9A9C8' }}>
            This certificate is digitally verified. Share the link to confirm authenticity.
          </p>
        </div>
      </div>
    </div>
  );
}
