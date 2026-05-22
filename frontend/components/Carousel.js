'use client';
import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { FiArrowRight, FiChevronLeft, FiChevronRight } from 'react-icons/fi';
import { useAuth } from '@/context/AuthContext';

const slides = [
  {
    title: 'Learn Without Limits',
    subtitle: 'Access world-class courses, track your progress, and earn certificates — all from one platform.',
    image: '/images/piWqh.jpg',
    cta: { label: 'Browse Courses', href: '/courses' },
    secondary: { label: 'Get Started', href: '/register', authRequired: true },
  },
  {
    title: 'Expert-Led Courses',
    subtitle: 'Learn from industry professionals with years of real-world experience.',
    image: '/images/sNLeI.jpg',
    cta: { label: 'Browse Courses', href: '/courses' },
  },
  {
    title: 'Earn Certificates',
    subtitle: 'Get certified and showcase your achievements to employers.',
    image: '/images/XUuB1.jpg',
    cta: { label: 'Browse Courses', href: '/courses' },
  },
];

export default function Carousel() {
  const { user } = useAuth();
  const [current, setCurrent] = useState(0);

  const next = useCallback(() => setCurrent(p => (p + 1) % slides.length), []);
  const prev = useCallback(() => setCurrent(p => (p - 1 + slides.length) % slides.length), []);

  useEffect(() => {
    const timer = setInterval(next, 5000);
    return () => clearInterval(timer);
  }, [next]);

  const slide = slides[current];

  return (
    <section className="relative overflow-hidden h-[500px]">
      <div className="absolute inset-0">
        <img src={slide.image} alt="" className="w-full h-full object-cover" />
        <div className="absolute inset-0" style={{ background: 'linear-gradient(to right, rgba(0,0,0,0.7), rgba(0,0,0,0.4))' }} />
      </div>
      <div className="max-w-7xl mx-auto px-4 text-center relative h-full flex flex-col items-center justify-center">
        <h1 className="text-4xl md:text-5xl font-bold text-white mb-4 heading-font transition-all duration-500">{slide.title}</h1>
        <p className="text-lg md:text-xl mb-8 max-w-2xl mx-auto transition-all duration-500" style={{ color: 'rgba(255,255,255,0.85)' }}>
          {slide.subtitle}
        </p>
        <div className="flex justify-center gap-4">
          <Link href={slide.cta.href} className="inline-flex items-center gap-2 bg-white px-7 py-3 rounded-xl font-semibold no-underline transition hover:shadow-lg" style={{ color: '#757FEF' }}>
            {slide.cta.label} <FiArrowRight size={18} />
          </Link>
          {slide.secondary && (!slide.secondary.authRequired || !user) && (
            <Link href={slide.secondary.href} className="inline-flex items-center gap-2 px-7 py-3 rounded-xl font-semibold no-underline transition" style={{ border: '2px solid rgba(255,255,255,0.3)', color: 'white' }}>
              {slide.secondary.label}
            </Link>
          )}
        </div>

        <div className="absolute left-4 top-1/2 -translate-y-1/2">
          <button onClick={prev} className="p-2 rounded-full bg-white/20 hover:bg-white/30 transition cursor-pointer" style={{ color: 'white' }}>
            <FiChevronLeft size={24} />
          </button>
        </div>
        <div className="absolute right-4 top-1/2 -translate-y-1/2">
          <button onClick={next} className="p-2 rounded-full bg-white/20 hover:bg-white/30 transition cursor-pointer" style={{ color: 'white' }}>
            <FiChevronRight size={24} />
          </button>
        </div>

        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2">
          {slides.map((_, i) => (
            <button key={i} onClick={() => setCurrent(i)} className={`w-2.5 h-2.5 rounded-full transition cursor-pointer ${i === current ? 'bg-white' : 'bg-white/40'}`} />
          ))}
        </div>
      </div>
    </section>
  );
}
