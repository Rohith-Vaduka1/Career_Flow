const ACTION_VERBS = [
  'built', 'developed', 'architected', 'designed', 'implemented', 'deployed',
  'engineered', 'optimized', 'scaled', 'managed', 'led', 'spearheaded',
  'created', 'orchestrated', 'automated', 'integrated', 'refactored', 'reduced',
  'improved', 'increased', 'delivered', 'collaborated', 'analyzed', 'established'
];

const COMMON_TECH_KEYWORDS = [
  'javascript', 'typescript', 'python', 'react', 'node', 'express', 'mongodb',
  'postgresql', 'sql', 'docker', 'kubernetes', 'aws', 'gcp', 'azure', 'git',
  'ci/cd', 'rest api', 'graphql', 'html', 'css', 'tailwind', 'microservices',
  'agile', 'scrum', 'testing', 'jest', 'linux', 'data structures', 'algorithms'
];

export const analyzeResumeATS = (rawText = '', targetRole = 'Software Engineer') => {
  if (!rawText || rawText.trim().length < 50) {
    return {
      score: 30,
      breakdown: { keywords: 20, formatting: 40, experienceImpact: 20, sectionCompleteness: 40 },
      strengths: ['Resume text provided.'],
      weaknesses: ['Resume length is too short to generate a comprehensive ATS evaluation.'],
      missingKeywords: ['Experience details', 'Key technical skills', 'Project outcomes'],
      recommendations: ['Provide a full resume text including Work Experience, Technical Skills, and Education.']
    };
  }

  const textLower = rawText.toLowerCase();

  // 1. Section Completeness Check (25 pts)
  const sections = {
    summary: /summary|objective|about me|profile/i.test(rawText),
    experience: /experience|work history|employment|career/i.test(rawText),
    skills: /skills|technologies|proficiencies|tech stack/i.test(rawText),
    education: /education|degree|university|college|b\.tech|b\.s|b\.e|m\.s/i.test(rawText),
    projects: /projects|portfolio|open source/i.test(rawText)
  };
  const sectionCount = Object.values(sections).filter(Boolean).length;
  const sectionCompletenessScore = Math.round((sectionCount / 5) * 25);

  // 2. Action Verbs Usage (25 pts)
  let verbCount = 0;
  ACTION_VERBS.forEach(verb => {
    if (textLower.includes(verb)) verbCount++;
  });
  const verbScore = Math.min(Math.round((verbCount / 8) * 25), 25);

  // 3. Quantifiable Metrics (25 pts)
  // Look for numbers followed by %, X, k, +, etc. or metric indicators
  const metricMatches = rawText.match(/\b\d+(\.\d+)?(%|x|k|\+|ms|s|gb|tb|m)\b|\b\d{2,}\b/gi) || [];
  const metricScore = Math.min(Math.round((metricMatches.length / 5) * 25), 25);

  // 4. Keyword & Skill Coverage (25 pts)
  const foundKeywords = [];
  const missingKeywords = [];
  COMMON_TECH_KEYWORDS.forEach(kw => {
    if (textLower.includes(kw)) {
      foundKeywords.push(kw);
    } else {
      missingKeywords.push(kw);
    }
  });
  const keywordScore = Math.min(Math.round((foundKeywords.length / 10) * 25), 25);

  const totalScore = Math.min(sectionCompletenessScore + verbScore + metricScore + keywordScore, 100);

  // Generate Strengths
  const strengths = [];
  if (sectionCount >= 4) strengths.push('Excellent structure containing all standard ATS sections.');
  if (verbCount >= 6) strengths.push(`Strong action verbs usage (${verbCount} distinct impact verbs identified).`);
  if (metricMatches.length >= 4) strengths.push(`Great quantifiable achievements (${metricMatches.length} metrics found).`);
  if (foundKeywords.length >= 8) strengths.push(`High industry skill keyword density (${foundKeywords.length} core keywords).`);
  if (strengths.length === 0) strengths.push('Clear chronological structure with readable sections.');

  // Generate Weaknesses
  const weaknesses = [];
  if (sectionCount < 4) {
    const missingSecs = Object.keys(sections).filter(s => !sections[s]);
    weaknesses.push(`Missing standard section headers: ${missingSecs.join(', ')}.`);
  }
  if (verbCount < 5) weaknesses.push('Few strong action verbs; bullet points may appear passive.');
  if (metricMatches.length < 3) weaknesses.push('Lacks quantifiable metrics (e.g. "improved latency by 35%", "scaled to 100k users").');
  if (foundKeywords.length < 6) weaknesses.push('Low technical keyword density compared to ATS industry baselines.');

  // Recommendations
  const recommendations = [];
  if (metricMatches.length < 4) recommendations.push('Add measurable outcomes (e.g., % performance increase, team size, revenue impact).');
  if (verbCount < 6) recommendations.push('Start each experience bullet point with strong action verbs (e.g., Architected, Spearheaded, Optimized).');
  if (!sections.summary) recommendations.push('Add a concise 3-4 sentence professional summary highlighting your core expertise and target role.');
  recommendations.push(`Tailor keywords specifically for ${targetRole} positions to bypass automated filters.`);

  return {
    score: totalScore,
    breakdown: {
      sectionCompleteness: sectionCompletenessScore,
      actionVerbs: verbScore,
      quantifiableMetrics: metricScore,
      keywords: keywordScore
    },
    strengths,
    weaknesses,
    missingKeywords: missingKeywords.slice(0, 8),
    recommendations
  };
};

export const matchResumeWithJob = (resumeText = '', job) => {
  if (!job) return { matchScore: 0, missingKeywords: [], recommendations: [] };

  const resumeLower = resumeText.toLowerCase();
  const jobSkills = job.skills || [];
  const matched = [];
  const missing = [];

  jobSkills.forEach(skill => {
    if (resumeLower.includes(skill.toLowerCase())) {
      matched.push(skill);
    } else {
      missing.push(skill);
    }
  });

  const matchScore = jobSkills.length > 0 
    ? Math.round((matched.length / jobSkills.length) * 100)
    : 80;

  return {
    matchScore,
    matchedSkills: matched,
    missingSkills: missing,
    recommendations: missing.length > 0
      ? [`Consider highlighting experience with: ${missing.slice(0, 4).join(', ')} in your project descriptions.`]
      : ['Your resume already aligns strongly with the primary requirements for this role.']
  };
};
