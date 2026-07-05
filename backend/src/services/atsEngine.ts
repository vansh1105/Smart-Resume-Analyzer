export interface AtsScoreResult {
  atsScore: number;
  sectionBreakdown: {
    completeness: number;
    contactInfo: number;
    skills: number;
    projects: number;
    experience: number;
    education: number;
    formatting: number;
    keywordDensity: number;
    actionVerbs: number;
    grammar: number;
  };
  suggestions: string[];
}

const ACTION_VERBS = [
  'led', 'developed', 'managed', 'designed', 'created', 'built', 'implemented',
  'optimized', 'engineered', 'spearheaded', 'facilitated', 'collaborated',
  'delivered', 'achieved', 'accelerated', 'formulated', 'executed', 'constructed',
  'deployed', 'monitored', 'architected', 'automated', 'streamlined', 'maximized',
  'established', 'launched', 'improved', 'increased', 'reduced', 'saved'
];

const INDUSTRY_KEYWORDS = [
  'javascript', 'typescript', 'react', 'node', 'express', 'mongodb', 'sql', 'python',
  'java', 'c++', 'aws', 'docker', 'git', 'ci/cd', 'agile', 'scrum', 'kubernetes',
  'rest api', 'graphql', 'html', 'css', 'redux', 'next.js', 'vue', 'angular',
  'postgres', 'mysql', 'nosql', 'firebase', 'gcp', 'azure', 'devops', 'linux',
  'testing', 'jest', 'cypress', 'machine learning', 'data structures', 'algorithms',
  'system design', 'microservices', 'typescript', 'analytics', 'backend', 'frontend'
];

export const calculateAtsScore = (rawText: string, parsedDetails: any): AtsScoreResult => {
  const textLower = rawText.toLowerCase();
  const suggestions: string[] = [];
  
  // 1. Contact Info (Out of 100)
  let contactScore = 0;
  const contactsChecked = {
    email: !!parsedDetails.email || /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/.test(rawText),
    phone: !!parsedDetails.phone || /\b\d{3}[-.]?\d{3}[-.]?\d{4}\b/.test(rawText) || /\+\d{1,3}\s?\d{1,15}/.test(rawText),
    linkedin: !!parsedDetails.linkedin || textLower.includes('linkedin.com'),
    github: !!parsedDetails.github || textLower.includes('github.com'),
    portfolio: !!parsedDetails.portfolio || textLower.includes('portfolio') || textLower.includes('personal website') || textLower.includes('website')
  };

  if (contactsChecked.email) contactScore += 20;
  else suggestions.push('Add an email address so recruiters can contact you.');

  if (contactsChecked.phone) contactScore += 20;
  else suggestions.push('Include a contact phone number on your resume.');

  if (contactsChecked.linkedin) contactScore += 20;
  else suggestions.push('Add your LinkedIn profile link to showcase professional connections.');

  if (contactsChecked.github) contactScore += 20;
  else suggestions.push('Link your GitHub profile to showcase code samples and project contributions.');

  if (contactsChecked.portfolio) contactScore += 20;
  else suggestions.push('Include a link to your personal portfolio or website if available.');

  // 2. Completeness (Out of 100)
  let completenessScore = 0;
  const sections = {
    contact: (contactsChecked.email || contactsChecked.phone),
    skills: (parsedDetails.skills && parsedDetails.skills.length > 0) || textLower.includes('skills'),
    projects: (parsedDetails.projects && parsedDetails.projects.length > 0) || textLower.includes('projects'),
    experience: (parsedDetails.experience && parsedDetails.experience.length > 0) || textLower.includes('experience') || textLower.includes('work history'),
    education: (parsedDetails.education && parsedDetails.education.length > 0) || textLower.includes('education')
  };

  if (sections.contact) completenessScore += 20;
  if (sections.skills) completenessScore += 20;
  else suggestions.push('Include a dedicated Skills section to list your core competencies.');

  if (sections.projects) completenessScore += 20;
  else suggestions.push('Add a Projects section demonstrating practical application of your skills.');

  if (sections.experience) completenessScore += 20;
  else suggestions.push('Incorporate professional work experience or internship history.');

  if (sections.education) completenessScore += 20;
  else suggestions.push('Add your educational credentials (degrees, schools, graduation dates).');

  // 3. Skills (Out of 100)
  let skillsScore = 0;
  const skillsCount = parsedDetails.skills ? parsedDetails.skills.length : 0;
  if (skillsCount >= 15) {
    skillsScore = 100;
  } else if (skillsCount >= 8) {
    skillsScore = 85;
  } else if (skillsCount >= 4) {
    skillsScore = 60;
    suggestions.push('Expand your skills section; aim to list at least 8 key technical and professional skills.');
  } else {
    skillsScore = 30;
    suggestions.push('Your skills list is very brief. Add relevant programming languages, tools, frameworks, and soft skills.');
  }

  // 4. Projects (Out of 100)
  let projectsScore = 0;
  const projectList = parsedDetails.projects || [];
  const projectCount = projectList.length;
  if (projectCount >= 3) {
    projectsScore = 100;
  } else if (projectCount === 2) {
    projectsScore = 80;
    suggestions.push('Consider adding one more project to showcase a broader range of abilities.');
  } else if (projectCount === 1) {
    projectsScore = 50;
    suggestions.push('You only have one project listed. Try adding 1-2 more hands-on projects.');
  } else {
    projectsScore = 10;
    suggestions.push('Add personal or professional projects to show recruiters what you have built.');
  }

  // Verify project description richness
  let shortProjects = false;
  projectList.forEach((proj: any) => {
    if (proj.description && proj.description.length < 50) {
      shortProjects = true;
    }
  });
  if (shortProjects) {
    projectsScore = Math.max(10, projectsScore - 20);
    suggestions.push('Elaborate on your project descriptions. Explain what you built, the technologies used, and the impact.');
  }

  // 5. Experience (Out of 100)
  let experienceScore = 0;
  const experienceList = parsedDetails.experience || [];
  const expCount = experienceList.length;
  if (expCount >= 2) {
    experienceScore = 100;
  } else if (expCount === 1) {
    experienceScore = 80;
  } else {
    experienceScore = 40; // Entry level / student
    suggestions.push('If you lack formal experience, focus on academic projects, hackathons, or freelance work in a Work/Project history section.');
  }

  // Verify description highlights
  let missingExpDetails = false;
  experienceList.forEach((exp: any) => {
    if (!exp.description && (!exp.highlights || exp.highlights.length === 0)) {
      missingExpDetails = true;
    }
  });
  if (missingExpDetails) {
    experienceScore = Math.max(10, experienceScore - 30);
    suggestions.push('Add descriptive bullet points to your experience detailing your responsibilities and achievements.');
  }

  // 6. Education (Out of 100)
  let educationScore = 0;
  const eduList = parsedDetails.education || [];
  if (eduList.length > 0) {
    educationScore = 100;
    let hasGpaOrDate = false;
    eduList.forEach((edu: any) => {
      if (edu.gpa || edu.startYear || edu.endYear) {
        hasGpaOrDate = true;
      }
    });
    if (!hasGpaOrDate) {
      educationScore = 80;
      suggestions.push('Include graduation years or dates in your education entries for chronological clarity.');
    }
  } else {
    educationScore = 30;
    suggestions.push('Add details of your education, degrees, or certifications.');
  }

  // 7. Formatting (Out of 100)
  let formattingScore = 100;
  // Look for very long lines as indicator of poor formatting
  const lines = rawText.split('\n').map(l => l.trim()).filter(Boolean);
  const veryLongLines = lines.filter(l => l.length > 130);
  if (veryLongLines.length > 5) {
    formattingScore -= 20;
    suggestions.push('Some lines are very long. Keep bullet points concise and easy for recruiters and ATS parsers to scan.');
  }
  // Check total word count (good resume is usually between 300 and 800 words)
  const wordCount = rawText.split(/\s+/).filter(Boolean).length;
  if (wordCount < 150) {
    formattingScore -= 30;
    suggestions.push('Your resume is extremely short. Add more detailed descriptions of your experiences, skills, and projects.');
  } else if (wordCount > 1000) {
    formattingScore -= 15;
    suggestions.push('Your resume exceeds 1000 words. Try to trim down wordy sentences to keep it to 1-2 pages.');
  }

  // 8. Keyword Density (Out of 100)
  let matchingKeywordsCount = 0;
  const foundKeywords: string[] = [];
  INDUSTRY_KEYWORDS.forEach(kw => {
    if (textLower.includes(kw)) {
      matchingKeywordsCount++;
      foundKeywords.push(kw);
    }
  });
  // Score density: if they have 12+ industry keywords, score 100.
  let keywordScore = Math.min(100, Math.round((matchingKeywordsCount / 12) * 100));
  if (keywordScore < 50) {
    suggestions.push('Incorporate more industry-relevant technical keywords (e.g., specific languages, development methodologies, cloud providers).');
  }

  // 9. Action Verbs (Out of 100)
  let actionVerbsFound = 0;
  ACTION_VERBS.forEach(verb => {
    // regex pattern matching word boundaries
    const regex = new RegExp(`\\b${verb}\\b`, 'i');
    if (regex.test(rawText)) {
      actionVerbsFound++;
    }
  });
  let actionVerbsScore = Math.min(100, Math.round((actionVerbsFound / 8) * 100));
  if (actionVerbsScore < 60) {
    suggestions.push('Use stronger action verbs (e.g., engineered, optimized, spearheaded) to start your experience bullet points.');
  }

  // 10. Grammar & Formatting Heuristics (Out of 100)
  let grammarScore = 90;
  // Basic spelling checks for typical placeholders
  if (textLower.includes('[insert ') || textLower.includes('insert name') || textLower.includes('lorem ipsum')) {
    grammarScore -= 40;
    suggestions.push('Remove placeholder text or brackets from your resume.');
  }
  // Check double spaces
  if (/\s{3,}/.test(rawText)) {
    grammarScore -= 10;
    suggestions.push('Correct inconsistent spacing or double/triple spaces.');
  }

  // Calculate Overall ATS Score (Weighted Average)
  // Weights:
  // Completeness: 15%
  // Contact Info: 10%
  // Skills: 15%
  // Projects: 15%
  // Experience: 15%
  // Education: 10%
  // Formatting: 5%
  // Keyword Density: 5%
  // Action Verbs: 5%
  // Grammar: 5%
  const weightedScore = Math.round(
    completenessScore * 0.15 +
    contactScore * 0.10 +
    skillsScore * 0.15 +
    projectsScore * 0.15 +
    experienceScore * 0.15 +
    educationScore * 0.10 +
    formattingScore * 0.05 +
    keywordScore * 0.05 +
    actionVerbsScore * 0.05 +
    grammarScore * 0.05
  );

  return {
    atsScore: Math.max(0, Math.min(100, weightedScore)),
    sectionBreakdown: {
      completeness: completenessScore,
      contactInfo: contactScore,
      skills: skillsScore,
      projects: projectsScore,
      experience: experienceScore,
      education: educationScore,
      formatting: formattingScore,
      keywordDensity: keywordScore,
      actionVerbs: actionVerbsScore,
      grammar: grammarScore
    },
    suggestions: suggestions.slice(0, 8) // Limit suggestions to the top 8
  };
};
