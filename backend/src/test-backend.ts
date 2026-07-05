import dotenv from 'dotenv';
import mongoose from 'mongoose';
import { calculateAtsScore } from './services/atsEngine';
import { parseResumeWithAi, analyzeResumeWithAi, matchJobDescriptionWithAi } from './services/geminiService';
import { User } from './models/User';
import { Resume } from './models/Resume';
import { ResumeAnalysis } from './models/ResumeAnalysis';
import { JobDescription } from './models/JobDescription';

dotenv.config();

const SAMPLE_RESUME_TEXT = `
JANE DOE
jane.doe@example.com | +1 (555) 019-2834 | github.com/username | linkedin.com/in/username

SUMMARY
Detail-oriented Software Developer with 2+ years of hands-on experience building web applications using React and Node.js.

SKILLS
Programming Languages: JavaScript, TypeScript, Python, SQL, HTML, CSS
Frameworks & Libraries: React, Node.js, Express, Tailwind CSS, Bootstrap
Tools & Databases: Git, MongoDB, PostgreSQL, Docker, AWS

EXPERIENCE
InnovateTech Solutions - Software Developer Intern
June 2024 - August 2024 | New York, NY
- Collaborated on developing web apps using MERN stack and improved overall rendering performance.
- Engineered full-stack features using React and Express, decreasing API latency by 15%.
- Wrote automated Jest unit tests to raise overall test coverage from 60% to 85%.

EDUCATION
State University - Bachelor of Science in Computer Science
Graduation: May 2025 | GPA: 3.8/4.0

PROJECTS
E-Commerce Analytics Engine
- A platform analyzing e-commerce transactions using React, Express, and Recharts charts.
- Implemented a background calculation worker that reduced loading times for dashboards by 40%.
`;

const SAMPLE_JD = `
We are looking for a Junior Full Stack Developer to join our agile engineering team.
Requirements:
- Strong knowledge of React, Node.js, and Express.
- Experience with TypeScript, MongoDB, and SQL.
- Familiarity with Docker and AWS Certified or experienced.
- Passion for writing clean, readable code and unit testing.
`;

const runVerification = async () => {
  console.log('🧪 Starting ResumePilot Integration & Logic Verification...');
  
  let databaseOnline = false;
  // 1. Test database connection
  const mongoUri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/resumepilot';
  console.log(`Connecting to MongoDB at: ${mongoUri}`);
  try {
    // Try to connect with a short 2-second timeout so we don't stall the verification
    await mongoose.connect(mongoUri, { serverSelectionTimeoutMS: 2000 });
    console.log('✅ Connected to MongoDB successfully.');
    databaseOnline = true;
  } catch (err) {
    console.log('⚠️ MongoDB is offline. Verification will proceed in offline-mode checking calculations & AI logic.');
  }

  try {
    let testUser: any = null;
    let resumeDoc: any = null;
    let analysisDoc: any = null;
    let jdDoc: any = null;

    if (databaseOnline) {
      // Clean up any existing test entities
      await User.deleteMany({ email: 'test_verifier@example.com' });

      // 2. Test User Schema creation
      console.log('\n--- Testing User Creation ---');
      testUser = await User.create({
        username: 'test_verifier',
        email: 'test_verifier@example.com',
        password: 'hashed_password_placeholder'
      });
      console.log(`✅ Test User created with ID: ${testUser._id}`);
    }

    // 3. Test Custom ATS Score Engine
    console.log('\n--- Testing Custom Rule-Based ATS Engine ---');
    // Prepare fake parsedDetails to feed score engine
    const parsedMock = {
      name: 'Jane Doe',
      email: 'jane.doe@example.com',
      phone: '+1 (555) 019-2834',
      linkedin: 'linkedin.com/in/username',
      github: 'github.com/username',
      portfolio: '',
      skills: ['JavaScript', 'TypeScript', 'React', 'Node.js', 'Express', 'MongoDB', 'Docker', 'AWS'],
      projects: [{
        title: 'E-Commerce Analytics Engine',
        description: 'A platform analyzing e-commerce transactions using React, Express, and Recharts charts.',
        technologies: ['React', 'Node.js', 'Express', 'Recharts', 'MongoDB']
      }],
      experience: [{
        company: 'InnovateTech Solutions',
        position: 'Software Developer Intern',
        highlights: ['Engineered full-stack features using React and Express, decreasing API latency by 15%']
      }],
      education: [{
        school: 'State University',
        degree: 'Bachelor of Science',
        fieldOfStudy: 'Computer Science',
        gpa: '3.8/4.0'
      }]
    };

    const atsResults = calculateAtsScore(SAMPLE_RESUME_TEXT, parsedMock);
    console.log(`✅ Calculated ATS Score: ${atsResults.atsScore}/100`);
    console.log('Section Breakdown:', atsResults.sectionBreakdown);
    console.log('Suggestions Count:', atsResults.suggestions.length);

    // 4. Test Gemini Parser Logic (Extract Details)
    console.log('\n--- Testing Gemini AI Extraction Parser ---');
    const aiParsedDetails = await parseResumeWithAi(SAMPLE_RESUME_TEXT);
    console.log('✅ Gemini Extracted Details Name:', aiParsedDetails.name);
    console.log('Skills Parsed:', aiParsedDetails.skills?.length);

    // 5. Test Gemini Suggestions, critiques, and interview prep
    console.log('\n--- Testing Gemini AI Critique & Questions Generation ---');
    const aiAnalysis = await analyzeResumeWithAi(SAMPLE_RESUME_TEXT, aiParsedDetails);
    console.log('✅ AI Profile Summary:', aiAnalysis.aiFeedback?.summary?.substring(0, 100) + '...');
    console.log('Interview Prep Questions Count:', aiAnalysis.interviewQuestions?.length);

    if (databaseOnline && testUser) {
      resumeDoc = await Resume.create({
        userId: testUser._id,
        filename: 'sample_resume.txt',
        originalName: 'Jane_Doe_Resume.pdf',
        mimeType: 'application/pdf',
        size: 15420,
        rawText: SAMPLE_RESUME_TEXT,
        status: 'parsed',
        parsedDetails: aiParsedDetails
      });

      analysisDoc = await ResumeAnalysis.create({
        resumeId: resumeDoc._id,
        userId: testUser._id,
        atsScore: atsResults.atsScore,
        sectionBreakdown: atsResults.sectionBreakdown,
        suggestions: atsResults.suggestions,
        aiFeedback: aiAnalysis.aiFeedback,
        projectCritique: aiAnalysis.projectCritique,
        interviewQuestions: aiAnalysis.interviewQuestions
      });
      console.log(`✅ Saved Resume & ResumeAnalysis documents.`);
    }

    // 6. Test Job Matching Heuristics
    console.log('\n--- Testing Job Matching Analytics ---');
    const matchAnalysis = await matchJobDescriptionWithAi(aiParsedDetails, SAMPLE_JD);
    console.log(`✅ Job Match Score: ${matchAnalysis.matchPercentage}%`);
    console.log('Matching Skills:', matchAnalysis.matchingSkills);
    console.log('Missing Skills:', matchAnalysis.missingSkills);

    if (databaseOnline && testUser && resumeDoc) {
      jdDoc = await JobDescription.create({
        userId: testUser._id,
        resumeId: resumeDoc._id,
        jobTitle: 'Junior Full Stack Developer',
        descriptionText: SAMPLE_JD,
        analysisResults: matchAnalysis
      });
      console.log(`✅ Saved JobDescription matching record.`);
    }

    if (databaseOnline && testUser) {
      // Clean up
      console.log('\n--- Cleaning up Test Records ---');
      await User.findByIdAndDelete(testUser._id);
      if (resumeDoc) await Resume.findByIdAndDelete(resumeDoc._id);
      if (analysisDoc) await ResumeAnalysis.findByIdAndDelete(analysisDoc._id);
      if (jdDoc) await JobDescription.findByIdAndDelete(jdDoc._id);
      console.log('✅ Cleaned up database entries successfully.');
    }
    
  } catch (err) {
    console.error('❌ Exception occurred during integration verification:', err);
  } finally {
    if (databaseOnline) {
      await mongoose.disconnect();
    }
    console.log('\n🏁 Verification run completed.');
    process.exit(0);
  }
};

runVerification();
