export const getLevelNumber = (level) => String(level || '').match(/\d+/)?.[0] || '';

export const getCourseLevelNumber = (code) => String(code || '').match(/^[A-Za-z]+\s*(\d)\d{2}\b/)?.[1] || '';

export const isCourseLevelMatch = (course, level) => {
  if (!course) return false;
  if (course.carryover) return true;
  if (course.level && String(course.level).trim()) return true;
  if (!course.code) return true;
  return true;
};