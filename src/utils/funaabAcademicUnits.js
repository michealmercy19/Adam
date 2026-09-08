export const funaabAcademicUnits = [
  {
    code: 'COLAMRUD',
    college: 'College of Agricultural Management and Rural Development',
    units: ['Agricultural Administration', 'Agricultural Economics and Farm Management', 'Agricultural Extension and Rural Development'],
  },
  {
    code: 'COLANIM',
    college: 'College of Animal Science and Livestock Production',
    units: ['Animal Breeding and Genetics', 'Animal Nutrition', 'Animal Physiology', 'Animal Production and Health', 'Pasture and Range Management'],
  },
  {
    code: 'COLBIOS',
    college: 'College of Biosciences',
    units: ['Biochemistry', 'Biotechnology', 'Microbiology', 'Public Health', 'Pure and Applied Botany', 'Pure and Applied Zoology', 'Science Laboratory Technology (SLT)'],
  },
  {
    code: 'COLCOMPS',
    college: 'College of Computing Sciences',
    units: ['Computer Science', 'Cyber Security', 'Data Science', 'Information and Communication Technology (ICT)', 'Information Systems', 'Information Technology', 'Software Engineering'],
  },
  {
    code: 'COLENG',
    college: 'College of Engineering',
    units: ['Agricultural Engineering', 'Civil Engineering', 'Electrical and Electronics Engineering', 'Mechanical Engineering', 'Mechatronic Engineering'],
  },
  {
    code: 'COLERM',
    college: 'College of Environmental Resources Management',
    units: ['Aquaculture and Fisheries Management', 'Climate Science and Agricultural Meteorology', 'Environmental Management and Toxicology', 'Forest Resource Management', 'Geology', 'Hydrology and Water Resources Management', 'Water Resources Management and Agro-Meteorology', 'Wildlife and Eco-tourism Management', 'Water, Sanitation and Hygiene (WASH)'],
  },
  {
    code: 'COLFHEC',
    college: 'College of Food Science and Human Ecology',
    units: ['Clothing & Textile Design', 'Food Science and Technology', 'Home Science and Management', 'Hospitality and Tourism', 'Nutrition and Dietetics'],
  },
  {
    code: 'COLPLANT',
    college: 'College of Plant Science and Crop Production',
    units: ['Crop Protection', 'Horticulture', 'Plant Breeding and Seed Technology', 'Plant Physiology and Crop Production', 'Soil Science and Land Management'],
  },
  {
    code: 'COLPHYS',
    college: 'College of Physical Sciences',
    units: ['Chemistry', 'Geophysics', 'Industrial Chemistry', 'Mathematics', 'Physics', 'Statistics'],
  },
  {
    code: 'COLVET',
    college: 'College of Veterinary Medicine',
    units: ['Veterinary Medicine'],
  },
  {
    code: 'COLENDS',
    college: 'College of Entrepreneurial and Development Studies',
    units: ['Accounting', 'Banking and Finance', 'Business Administration', 'Cooperative Studies', 'Development Studies', 'Economics', 'Entrepreneurial Studies', 'Library and Information Science'],
  },
];

const AGRICULTURE_KEYWORDS = [
  'agricultural',
  'animal',
  'crop',
  'farm',
  'fisheries',
  'forest',
  'hydrology',
  'pasture',
  'plant',
  'soil',
  'water resources',
  'wildlife',
  'aquaculture',
  'climate science',
  'environmental management',
  'rural development',
];

export const normalizeDepartmentName = (name = '') => String(name).replace(/[()]/g, '').replace(/\s+/g, ' ').trim().toLowerCase();

export const getProgramDurationYears = (departmentName = '') => {
  const normalized = normalizeDepartmentName(departmentName);

  if (!normalized) return 4;
  if (normalized.includes('veterinary')) return 6;
  if (AGRICULTURE_KEYWORDS.some((keyword) => normalized.includes(keyword))) return 5;

  return 4;
};

export const buildAcademicLevelOptions = (departmentName = '') => {
  const durationYears = getProgramDurationYears(departmentName);
  return Array.from({ length: durationYears }, (_, index) => `${(index + 1) * 100} Level`);
};

export const funaabDepartments = funaabAcademicUnits.flatMap(({ code, college, units }) => units.map((name) => ({ code, college, name })));

export const findFunaabDepartment = (name) => funaabDepartments.find((department) => normalizeDepartmentName(department.name) === normalizeDepartmentName(name));
