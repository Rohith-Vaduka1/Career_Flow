// Normalize skill names to handle common tech synonyms
const normalizeSkill = (skill) => {
  if (!skill) return '';
  const s = skill.toLowerCase().trim();
  const aliasMap = {
    'js': 'javascript',
    'ts': 'typescript',
    'react': 'react.js',
    'reactjs': 'react.js',
    'node': 'node.js',
    'nodejs': 'node.js',
    'vue': 'vue.js',
    'vuejs': 'vue.js',
    'k8s': 'kubernetes',
    'mongo': 'mongodb',
    'postgres': 'postgresql',
    'pg': 'postgresql',
    'golang': 'go',
    'aws': 'amazon web services',
    'gcp': 'google cloud platform',
    'azure': 'microsoft azure',
    'ml': 'machine learning',
    'ai': 'artificial intelligence',
    'nlp': 'natural language processing',
    'cv': 'computer vision',
    'ci/cd': 'cicd',
    'rest': 'restful api',
    'rest api': 'restful api'
  };
  return aliasMap[s] || s;
};

export const calculateSkillMatch = (userSkills = [], jobSkills = []) => {
  if (!jobSkills || jobSkills.length === 0) {
    return {
      matchPercentage: 100,
      matchedSkills: [],
      missingSkills: [],
      userSkillsCount: userSkills.length,
      jobSkillsCount: 0,
      rating: 'No specific skills required'
    };
  }

  // Extract skill names if userSkills are objects or strings
  const normalizedUserSkills = new Set(
    userSkills.map(s => {
      const name = typeof s === 'string' ? s : (s?.name || '');
      return normalizeSkill(name);
    }).filter(Boolean)
  );

  const matchedSkills = [];
  const missingSkills = [];

  jobSkills.forEach(jobSkill => {
    const normalizedJobSkill = normalizeSkill(jobSkill);
    if (normalizedUserSkills.has(normalizedJobSkill)) {
      matchedSkills.push(jobSkill);
    } else {
      // Check partial substring match (e.g., "React Native" matches "React")
      let partialMatch = false;
      for (const uSkill of normalizedUserSkills) {
        if (normalizedJobSkill.includes(uSkill) || uSkill.includes(normalizedJobSkill)) {
          matchedSkills.push(jobSkill);
          partialMatch = true;
          break;
        }
      }
      if (!partialMatch) {
        missingSkills.push(jobSkill);
      }
    }
  });

  const matchPercentage = Math.round((matchedSkills.length / jobSkills.length) * 100);

  let rating = 'Learning Opportunity';
  if (matchPercentage >= 80) rating = 'High Match - Strongly Recommended';
  else if (matchPercentage >= 60) rating = 'Good Match - Minor Gaps';
  else if (matchPercentage >= 40) rating = 'Moderate Match - Worth Applying';

  return {
    matchPercentage,
    matchedSkills,
    missingSkills,
    userSkillsCount: userSkills.length,
    jobSkillsCount: jobSkills.length,
    rating
  };
};
