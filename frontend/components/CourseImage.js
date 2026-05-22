'use client';
import { useState } from 'react';
import { BASE_URL } from '@/lib/api';

export default function CourseImage({ course, className }) {
  const [src, setSrc] = useState(getLocalImage(course));
  const [showFallback, setShowFallback] = useState(false);

  function getLocalImage(c) {
    const filename = c.title.replace(/[\/\\:*?"<>|]/g, '').trim();
    return `/course_images/${filename}.png`;
  }

  if (showFallback) {
    return (
      <div className={`flex items-center justify-center ${className}`} style={{ background: 'linear-gradient(135deg, #757FEF 0%, #8676ff 100%)' }}>
        <span className="text-white text-4xl font-bold">{course.title?.[0]}</span>
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={course.title}
      className={className}
      onError={() => {
        if (course.thumbnail) {
          setSrc(`${BASE_URL}${course.thumbnail}`);
        } else {
          setShowFallback(true);
        }
      }}
    />
  );
}
