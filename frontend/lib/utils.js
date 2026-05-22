export function getCourseImage(course) {
  const filename = course.title.replace(/[\/\\:*?"<>|]/g, '').trim();
  return `/course_images/${filename}.png`;
}

export function getCourseImageFallback(course) {
  if (course.thumbnail) return `http://localhost:5000${course.thumbnail}`;
  return null;
}
