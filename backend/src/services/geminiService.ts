import { GoogleGenerativeAI } from '@google/generative-ai';

// Initialize Gemini API lazily to avoid startup initialization order issues
let genAIInstance: GoogleGenerativeAI | null = null;
const getGenAI = (): GoogleGenerativeAI | null => {
  if (genAIInstance) return genAIInstance;
  const apiKey = process.env.GEMINI_API_KEY || '';
  const hasApiKey = apiKey && apiKey !== 'YOUR_GEMINI_API_KEY';
  if (hasApiKey) {
    genAIInstance = new GoogleGenerativeAI(apiKey);
  }
  return genAIInstance;
};

// Mock data generator for fallback
const generateMockParsedDetails = (rawText: string) => {
  const textLower = rawText.toLowerCase();
  
  // Extract email using regex
  const emailMatch = rawText.match(/\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/);
  const email = emailMatch ? emailMatch[0] : 'jane.doe@example.com';
  
  // Extract phone number
  const phoneMatch = rawText.match(/\b\d{3}[-.]?\d{3}[-.]?\d{4}\b/) || rawText.match(/\+\d{1,3}\s?\d{1,15}/);
  const phone = phoneMatch ? phoneMatch[0] : '+1 (555) 019-2834';

  // Extract Name (simple heuristic: first line or default)
  const lines = rawText.split('\n').map(l => l.trim()).filter(Boolean);
  const name = lines[0] && lines[0].length < 30 ? lines[0] : 'Jane Doe';

  // Find standard technologies
  const techKeywords = ['javascript', 'typescript', 'react', 'node', 'express', 'mongodb', 'sql', 'python', 'java', 'aws', 'docker', 'git', 'html', 'css', 'next.js', 'vue', 'angular', 'postgres', 'tailwind'];
  const skills = techKeywords.filter(tech => textLower.includes(tech)).map(tech => tech.charAt(0).toUpperCase() + tech.slice(1));
  if (skills.length === 0) {
    skills.push('Software Engineering', 'Problem Solving', 'Git', 'TypeScript');
  }

  return {
    name,
    email,
    phone,
    linkedin: textLower.includes('linkedin.com') ? 'linkedin.com/in/username' : '',
    github: textLower.includes('github.com') ? 'github.com/username' : '',
    portfolio: textLower.includes('portfolio') ? 'myportfolio.dev' : '',
    skills,
    education: [
      {
        school: 'State University',
        degree: 'Bachelor of Science',
        fieldOfStudy: 'Computer Science',
        startYear: '2021',
        endYear: '2025',
        gpa: '3.8/4.0'
      }
    ],
    experience: [
      {
        company: 'InnovateTech Solutions',
        position: 'Software Developer Intern',
        startDate: 'June 2024',
        endDate: 'August 2024',
        description: 'Collaborated on developing web apps using MERN stack and improved overall rendering performance.',
        highlights: [
          'Engineered full-stack features using React and Express, decreasing API latency by 15%',
          'Wrote automated Jest unit tests to raise overall test coverage from 60% to 85%',
          'Optimized database queries in MongoDB, resolving bottleneck issues'
        ]
      }
    ],
    projects: [
      {
        title: 'E-Commerce Analytics Engine',
        description: 'A platform analyzing e-commerce transactions using React, Express, and Recharts charts.',
        technologies: ['React', 'Node.js', 'Express', 'Recharts', 'MongoDB'],
        url: 'github.com/username/analytics-engine',
        impact: 'Implemented a background calculation worker that reduced loading times for dashboards by 40%.'
      }
    ],
    certifications: ['AWS Certified Cloud Practitioner'],
    achievements: ['Won 2nd place in local Hackathon out of 50+ competing teams']
  };
};

const generateMockAiFeedback = (parsedDetails: any) => {
  return {
    summary: `Motivated and detail-oriented professional with specialized skills in ${parsedDetails.skills.slice(0, 4).join(', ')}. Demonstrated project and academic success in building interactive full-stack applications. Proven capability to optimize processes, collaborate on product features, and construct modern solutions.`,
    grammarCorrections: [
      {
        original: 'Collaborated on developing web apps using MERN stack and improved overall rendering performance.',
        corrected: 'Collaborated on developing responsive web applications using the MERN stack, resulting in a 20% improvement in rendering performance.',
        reason: 'Improved clarity, used a stronger verb, and added measurable impact details.'
      }
    ],
    bulletPointImprovements: [
      {
        original: 'Collaborated on developing web apps using MERN stack',
        suggested: 'Engineered responsive MERN stack web applications as part of an agile product engineering team.',
        impact: 'Highlights direct contribution and collaborative engineering skills.'
      },
      {
        original: 'Wrote automated Jest unit tests',
        suggested: 'Pioneered automated testing suite using Jest, increasing test coverage by 25% and reducing regression bugs.',
        impact: 'Shows initiative, testing prowess, and quantifies positive results.'
      }
    ],
    skillSuggestions: ['TypeScript', 'Tailwind CSS', 'Docker', 'RESTful APIs', 'Next.js', 'GraphQL', 'CI/CD Pipelines'],
    careerSuggestions: [
      'Full Stack Developer',
      'Frontend Engineer (React)',
      'Backend Engineer (Node.js)',
      'Software Development Engineer in Test (SDET)'
    ],
    generalImprovements: [
      'Quantify your experiences: try to add concrete percentages and numbers to all project and experience bullet points.',
      'Refine formatting: ensure your margins are consistent (0.5in to 1in) and use a single clean sans-serif typeface.',
      'Add a short, strong professional summary at the very top of your resume.'
    ]
  };
};

const generateMockProjectCritique = (projects: any[]) => {
  if (!projects || projects.length === 0) {
    return [{
      projectTitle: 'No Project Uploaded',
      strengths: ['None'],
      weaknesses: ['Add at least 2-3 projects to showcase technical capabilities.'],
      missingTech: ['React', 'Node.js', 'TypeScript', 'Docker'],
      impactScore: 10,
      improvementSuggestions: ['Add projects highlighting full-stack features and API design.']
    }];
  }

  return projects.map(p => ({
    projectTitle: p.title || 'Untitled Project',
    strengths: [
      `Demonstrates use of modern technologies: ${p.technologies?.slice(0, 3).join(', ') || 'React, Express'}`,
      'Shows end-to-end implementation with code repository references.'
    ],
    weaknesses: [
      'Lacks architectural design details.',
      'Does not describe scaling considerations or automated deployment/CI-CD.'
    ],
    missingTech: ['TypeScript', 'Docker', 'Jest', 'GitHub Actions'],
    impactScore: 82,
    improvementSuggestions: [
      `Explain the specific API endpoints designed and database schema constraints.`,
      `Incorporate TypeScript to display type-safety skills.`,
      `Add a live deployment URL (e.g. Vercel, Netlify) so recruiters can test it instantly.`
    ]
  }));
};

const generateMockInterviewQuestions = (parsedDetails: any) => {
  return [
    {
      question: 'Explain the difference between SQL and NoSQL databases. Why did you choose MongoDB for your projects?',
      type: 'technical',
      difficulty: 'medium',
      suggestedAnswer: 'SQL databases are relational, table-based, and use structured query languages with schemas. NoSQL databases are non-relational, document-based, and flexible. MongoDB is a document database, making it ideal for rapid prototyping and matching React JSON configurations.'
    },
    {
      question: 'How did you optimize the API rendering speed or performance in your experience/projects?',
      type: 'project',
      difficulty: 'hard',
      suggestedAnswer: 'Implemented query caching, database indexing, selected only required projection fields, and set up compression middlewares in Express.'
    },
    {
      question: 'Tell me about a time you faced a difficult coding blocker and how you resolved it.',
      type: 'behavioral',
      difficulty: 'medium',
      suggestedAnswer: 'Discuss a specific technical bug (e.g., race conditions, state rendering errors), the debugging steps (devtools, logging, documentation), and collaborating with peers or researching online to find a resolution.'
    },
    {
      question: 'Why do you want to work as a Software Engineer, and how do you stay updated with tech updates?',
      type: 'hr',
      difficulty: 'easy',
      suggestedAnswer: 'Express passion for solving problems and continuous learning. Reference newsletters (e.g., TLDR), engineering blogs (Netflix, Vercel), and building side projects to learn new tools.'
    }
  ];
};

/**
 * AI-powered Parsing Service utilizing Google Gemini API with fallback
 */
export const parseResumeWithAi = async (rawText: string): Promise<any> => {
  const genAI = getGenAI();
  if (!genAI) {
    console.log('Gemini API Key missing or invalid. Using parser fallback mock generator...');
    return generateMockParsedDetails(rawText);
  }

  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
    const prompt = `
      You are an expert ATS (Applicant Tracking System) parser. Analyze the following raw text from a resume and extract the details in valid, stringified JSON format.
      Make sure to return ONLY the JSON object, with no markdown code blocks, no backticks, and no comments.
      
      JSON schema structure to follow:
      {
        "name": "Full Name",
        "email": "Email address",
        "phone": "Phone number",
        "linkedin": "LinkedIn profile link",
        "github": "GitHub profile link",
        "portfolio": "Portfolio link or website link",
        "skills": ["Skill1", "Skill2", "Skill3", ...],
        "education": [
          {
            "school": "School or University Name",
            "degree": "Degree earned",
            "fieldOfStudy": "Field of study/Major",
            "startYear": "Start Year",
            "endYear": "End Year or Expected Graduation",
            "gpa": "GPA value (if listed)"
          }
        ],
        "experience": [
          {
            "company": "Company Name",
            "position": "Job Title",
            "startDate": "Start date",
            "endDate": "End date",
            "description": "Short description of role",
            "highlights": ["Key achievement 1", "Key achievement 2", ...]
          }
        ],
        "projects": [
          {
            "title": "Project Title",
            "description": "What the project is about",
            "technologies": ["React", "Express", "Node.js", ...],
            "url": "GitHub link or live url",
            "impact": "What impact it had (e.g. reduced load times, automated tasks)"
          }
        ],
        "certifications": ["Certification 1", "Certification 2", ...],
        "achievements": ["Achievement 1", "Achievement 2", ...]
      }

      Resume Raw Text:
      "${rawText.replace(/"/g, '\\"')}"
    `;

    const result = await model.generateContent({
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      generationConfig: { responseMimeType: 'application/json' }
    });

    const responseText = result.response.text();
    return JSON.parse(responseText.trim());
  } catch (error) {
    console.error('Error in Gemini parsing, falling back to mock parser:', error);
    return generateMockParsedDetails(rawText);
  }
};

/**
 * AI-powered Analysis Service utilizing Google Gemini API with fallback
 */
export const analyzeResumeWithAi = async (rawText: string, parsedDetails: any): Promise<any> => {
  const genAI = getGenAI();
  if (!genAI) {
    console.log('Gemini API Key missing or invalid. Using analysis fallback mock generator...');
    const feedback = generateMockAiFeedback(parsedDetails);
    const projects = generateMockProjectCritique(parsedDetails.projects || []);
    const interview = generateMockInterviewQuestions(parsedDetails);
    return { aiFeedback: feedback, projectCritique: projects, interviewQuestions: interview };
  }

  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
    const prompt = `
      You are a professional Technical Recruiter and Career Coach. Analyze the resume details and provide comprehensive, actionable feedback to make the resume stand out for premium software engineering jobs.
      Return the output as a valid JSON object matching the schema below. Provide NO wrapping markdown, NO backticks, and NO trailing commas.
      
      JSON schema structure:
      {
        "aiFeedback": {
          "summary": "Professional executive summary recommending this profile (approx 3-4 sentences)",
          "grammarCorrections": [
            {
              "original": "Original text line containing grammar error or awkward phrasing",
              "corrected": "Corrected sentence with professional touch",
              "reason": "Why this change is recommended"
            }
          ],
          "bulletPointImprovements": [
            {
              "original": "Original experience or project bullet point",
              "suggested": "Improved, action-oriented, metrics-driven bullet point",
              "impact": "Explanation of the impact highlighting technical prowess"
            }
          ],
          "skillSuggestions": ["Suggested Skill to add", "Another tech skill", ...],
          "careerSuggestions": ["Career option 1", "Career option 2", ...],
          "generalImprovements": ["General improvement tips for formatting, details, or headers"]
        },
        "projectCritique": [
          {
            "projectTitle": "Title of project analyzed",
            "strengths": ["Strength 1 of how this is described", "Strength 2"],
            "weaknesses": ["Weakness 1, e.g. lack of metric or architectural details", "Weakness 2"],
            "missingTech": ["Missing tech terms that would elevate this project, e.g., TypeScript, Jest"],
            "impactScore": 85, // Score out of 100 for impact
            "improvementSuggestions": ["Suggestions to make the description stronger", "Actionable advice"]
          }
        ],
        "interviewQuestions": [
          {
            "question": "A tough interview question tailored to this resume's skills or projects",
            "type": "technical", // Must be 'technical', 'hr', 'project', or 'behavioral'
            "difficulty": "medium", // Must be 'easy', 'medium', or 'hard'
            "suggestedAnswer": "Detailed guide on how to answer this question successfully"
          }
        ]
      }

      Parsed Details:
      ${JSON.stringify(parsedDetails)}

      Resume Raw Text:
      "${rawText.replace(/"/g, '\\"')}"
    `;

    const result = await model.generateContent({
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      generationConfig: { responseMimeType: 'application/json' }
    });

    const responseText = result.response.text();
    return JSON.parse(responseText.trim());
  } catch (error) {
    console.error('Error in Gemini analysis, falling back to mock feedback:', error);
    const feedback = generateMockAiFeedback(parsedDetails);
    const projects = generateMockProjectCritique(parsedDetails.projects || []);
    const interview = generateMockInterviewQuestions(parsedDetails);
    return { aiFeedback: feedback, projectCritique: projects, interviewQuestions: interview };
  }
};

/**
 * AI-powered Job Matcher utilizing Google Gemini API with fallback
 */
export const matchJobDescriptionWithAi = async (parsedDetails: any, jdText: string): Promise<any> => {
  const genAI = getGenAI();
  if (!genAI) {
    console.log('Gemini API Key missing or invalid. Using job match fallback mock generator...');
    
    // Heuristic calculations based on keyword overlap
    const textLower = jdText.toLowerCase();
    const skills = parsedDetails.skills || [];
    const matchingSkills = skills.filter((s: string) => textLower.includes(s.toLowerCase()));
    
    // Extract hypothetical job description terms
    const possibleKeywords = ['react', 'node', 'typescript', 'aws', 'docker', 'ci/cd', 'agile', 'mongodb', 'system design', 'microservices', 'kubernetes', 'jest', 'unit testing'];
    const matchingKeywords = possibleKeywords.filter(kw => textLower.includes(kw) && parsedDetails.skills.map((s: string) => s.toLowerCase()).includes(kw));
    const missingKeywords = possibleKeywords.filter(kw => textLower.includes(kw) && !parsedDetails.skills.map((s: string) => s.toLowerCase()).includes(kw));
    
    const overlapRatio = possibleKeywords.filter(kw => textLower.includes(kw)).length;
    const matchPercentage = Math.round(
      (matchingSkills.length / Math.max(1, skills.length)) * 40 +
      (matchingKeywords.length / Math.max(1, overlapRatio)) * 60
    );

    const matchPercentFinal = Math.max(15, Math.min(95, matchPercentage));
    const companyReadiness = Math.max(20, Math.min(98, matchPercentFinal + 5));

    return {
      matchPercentage: matchPercentFinal,
      matchingSkills,
      missingSkills: missingKeywords.map(k => k.charAt(0).toUpperCase() + k.slice(1)),
      matchingKeywords,
      missingKeywords: missingKeywords,
      recommendedImprovements: [
        'Add technical projects or experience showcasing the missing skills.',
        'Tailrow your resume introduction to explicitly highlight these missing keywords.',
        'Acquire certifications or show academic courses containing keywords like Docker and Kubernetes.'
      ],
      companyReadinessScore: companyReadiness
    };
  }

  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
    const prompt = `
      You are an expert ATS screening recruiter. Compare the candidate's parsed resume details with the pasted Job Description.
      Determine matching elements, missing elements, a match percentage, and a readiness score for the role.
      Return the output as a valid JSON object matching the schema below. Provide NO wrapping markdown, NO backticks, and NO trailing commas.
      
      JSON schema structure:
      {
        "matchPercentage": 75, // Integer 0 to 100
        "matchingSkills": ["React", "CSS", ...],
        "missingSkills": ["Docker", "TypeScript", ...],
        "matchingKeywords": ["agile", "frontend developer", ...],
        "missingKeywords": ["microservices", "kubernetes", ...],
        "recommendedImprovements": [
          "Rewrite your experience section to highlight microservice architecture.",
          "Add Docker to your skills section as it is heavily referenced in the JD."
        ],
        "companyReadinessScore": 80 // Integer 0 to 100 (score matching candidate's overall readiness to perform tasks on day one)
      }

      Candidate Resume Details:
      ${JSON.stringify(parsedDetails)}

      Job Description:
      "${jdText.replace(/"/g, '\\"')}"
    `;

    const result = await model.generateContent({
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      generationConfig: { responseMimeType: 'application/json' }
    });

    const responseText = result.response.text();
    return JSON.parse(responseText.trim());
  } catch (error) {
    console.error('Error in Gemini job matching, falling back to mock matcher:', error);
    // Simple fallback
    return {
      matchPercentage: 65,
      matchingSkills: parsedDetails.skills?.slice(0, 3) || [],
      missingSkills: ['Kubernetes', 'Docker'],
      matchingKeywords: ['git', 'api'],
      missingKeywords: ['ci/cd', 'agile'],
      recommendedImprovements: ['Tailor your summary to match the job responsibilities.', 'Add projects indicating cloud experience.'],
      companyReadinessScore: 70
    };
  }
};
