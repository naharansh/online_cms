'use client';
import { useState } from 'react';
import { FiX, FiLock, FiCreditCard, FiCheck } from 'react-icons/fi';

export default function PaymentModal({ course, onClose, onSuccess }) {
  const [step, setStep] = useState('form');
  const [form, setForm] = useState({ cardNumber: '4242 4242 4242 4242', expiry: '12/28', cvv: '123', name: 'Test User' });
  const [errors, setErrors] = useState({});

  function validate() {
    const errs = {};
    if (!form.name.trim()) errs.name = 'Required';
    if (!/^\d{16}$/.test(form.cardNumber.replace(/\s/g, ''))) errs.cardNumber = 'Invalid card number';
    if (!/^\d{2}\/\d{2}$/.test(form.expiry)) errs.expiry = 'MM/YY';
    if (!/^\d{3,4}$/.test(form.cvv)) errs.cvv = 'Invalid CVV';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  }

  function handleSubmit(e) {
    e.preventDefault();
    if (!validate()) return;
    setStep('processing');
    setTimeout(() => {
      setStep('success');
      setTimeout(() => onSuccess(), 1500);
    }, 2000);
  }

  function formatCardNumber(value) {
    const digits = value.replace(/\D/g, '').slice(0, 16);
    return digits.replace(/(\d{4})(?=\d)/g, '$1 ');
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-md overflow-hidden" style={{ boxShadow: '0 20px 60px rgba(0,0,0,0.2)' }}>
        {step === 'form' && (
          <>
            <div className="relative p-6" style={{ background: 'linear-gradient(135deg, #757FEF 0%, #8676ff 100%)' }}>
              <button onClick={onClose} className="absolute top-4 right-4 p-1 rounded-full bg-white/20 hover:bg-white/30 transition cursor-pointer" style={{ color: 'white' }}>
                <FiX size={20} />
              </button>
              <h3 className="text-xl font-bold text-white mb-1">Complete Payment</h3>
              <p className="text-sm text-white/80">{course.title}</p>
              <p className="text-3xl font-bold text-white mt-3">${course.price}</p>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="text-sm font-medium mb-1 block" style={{ color: '#260944' }}>Cardholder Name</label>
                <input
                  value={form.name} onChange={e => setForm({ ...form, name: e.target.value })}
                  placeholder="John Doe"
                  className="w-full px-4 py-3 rounded-xl outline-none text-sm transition"
                  style={{ border: `1px solid ${errors.name ? '#EE368C' : '#EEF0F6'}`, backgroundColor: '#F5F7FA' }}
                />
                {errors.name && <p className="text-xs mt-1" style={{ color: '#EE368C' }}>{errors.name}</p>}
              </div>

              <div>
                <label className="text-sm font-medium mb-1 block" style={{ color: '#260944' }}>Card Number</label>
                <div className="relative">
                  <FiCreditCard className="absolute left-3 top-1/2 -translate-y-1/2" size={18} style={{ color: '#A9A9C8' }} />
                  <input
                    value={form.cardNumber} onChange={e => setForm({ ...form, cardNumber: formatCardNumber(e.target.value) })}
                    placeholder="1234 5678 9012 3456"
                    className="w-full pl-10 pr-4 py-3 rounded-xl outline-none text-sm transition"
                    style={{ border: `1px solid ${errors.cardNumber ? '#EE368C' : '#EEF0F6'}`, backgroundColor: '#F5F7FA' }}
                  />
                </div>
                {errors.cardNumber && <p className="text-xs mt-1" style={{ color: '#EE368C' }}>{errors.cardNumber}</p>}
              </div>

              <div className="flex gap-4">
                <div className="flex-1">
                  <label className="text-sm font-medium mb-1 block" style={{ color: '#260944' }}>Expiry</label>
                  <input
                    value={form.expiry} onChange={e => {
                      let v = e.target.value.replace(/\D/g, '').slice(0, 4);
                      if (v.length >= 2) v = v.slice(0, 2) + '/' + v.slice(2);
                      setForm({ ...form, expiry: v });
                    }}
                    placeholder="MM/YY"
                    className="w-full px-4 py-3 rounded-xl outline-none text-sm transition"
                    style={{ border: `1px solid ${errors.expiry ? '#EE368C' : '#EEF0F6'}`, backgroundColor: '#F5F7FA' }}
                  />
                  {errors.expiry && <p className="text-xs mt-1" style={{ color: '#EE368C' }}>{errors.expiry}</p>}
                </div>
                <div className="flex-1">
                  <label className="text-sm font-medium mb-1 block" style={{ color: '#260944' }}>CVV</label>
                  <input
                    value={form.cvv} onChange={e => setForm({ ...form, cvv: e.target.value.replace(/\D/g, '').slice(0, 4) })}
                    placeholder="123"
                    className="w-full px-4 py-3 rounded-xl outline-none text-sm transition"
                    style={{ border: `1px solid ${errors.cvv ? '#EE368C' : '#EEF0F6'}`, backgroundColor: '#F5F7FA' }}
                  />
                  {errors.cvv && <p className="text-xs mt-1" style={{ color: '#EE368C' }}>{errors.cvv}</p>}
                </div>
              </div>

              <button
                type="submit"
                className="flex items-center justify-center gap-2 w-full py-3 rounded-xl text-white font-semibold text-sm transition hover:opacity-90 cursor-pointer"
                style={{ backgroundColor: '#757FEF' }}
              >
                <FiLock size={16} /> Pay ${course.price}
              </button>
            </form>
          </>
        )}

        {step === 'processing' && (
          <div className="p-16 text-center">
            <div className="w-16 h-16 mx-auto mb-6 rounded-full flex items-center justify-center" style={{ backgroundColor: 'rgba(117, 127, 239, 0.1)' }}>
              <div className="w-8 h-8 border-4 border-transparent rounded-full animate-spin" style={{ borderTopColor: '#757FEF', borderRightColor: '#757FEF' }} />
            </div>
            <h3 className="text-lg font-bold mb-2" style={{ color: '#260944' }}>Processing Payment...</h3>
            <p className="text-sm" style={{ color: '#A9A9C8' }}>Please wait while we process your payment.</p>
          </div>
        )}

        {step === 'success' && (
          <div className="p-16 text-center">
            <div className="w-16 h-16 mx-auto mb-6 rounded-full flex items-center justify-center" style={{ backgroundColor: 'rgba(0, 182, 155, 0.1)' }}>
              <FiCheck size={32} style={{ color: '#00B69B' }} />
            </div>
            <h3 className="text-lg font-bold mb-2" style={{ color: '#260944' }}>Payment Successful!</h3>
            <p className="text-sm" style={{ color: '#A9A9C8' }}>Redirecting to your course...</p>
          </div>
        )}
      </div>
    </div>
  );
}
