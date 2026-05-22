export function getCourseImage(course) {
  const filename = course.title.replace(/[\/\\:*?"<>|]/g, '').trim();
  return `/course_images/${filename}.png`;
}

import { BASE_URL } from './api';

export function getCourseImageFallback(course) {
  if (course.thumbnail) return `${BASE_URL}${course.thumbnail}`;
  return null;
}
