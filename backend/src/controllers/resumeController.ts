import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { Resume } from '../models/Resume';
import { ResumeAnalysis } from '../models/ResumeAnalysis';
import { parseResumeFile } from '../services/parserService';
import { calculateAtsScore } from '../services/atsEngine';
import { parseResumeWithAi, analyzeResumeWithAi } from '../services/geminiService';
import mongoose from 'mongoose';

export const uploadResume = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }
    if (!req.user) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const userId = req.user.id;
    const { originalname, mimetype, size, buffer } = req.file;

    // 1. Parse File to raw text
    let rawText = '';
    try {
      rawText = await parseResumeFile(buffer, mimetype);
    } catch (parseErr) {
      return res.status(400).json({
        message: 'Failed to extract text from file',
        error: parseErr instanceof Error ? parseErr.message : String(parseErr)
      });
    }

    if (!rawText || rawText.trim().length === 0) {
      return res.status(400).json({ message: 'Extracted text is empty. The file may be corrupt or scanned.' });
    }

    // 2. AI Parsing - Extract structure
    let parsedDetails;
    try {
      parsedDetails = await parseResumeWithAi(rawText);
    } catch (aiParseErr) {
      console.error('AI Parsing Error:', aiParseErr);
      // Fallback details if Gemini parse crashes
      parsedDetails = {
        name: originalname.replace(/\.[^/.]+$/, ""),
        skills: [],
        education: [],
        experience: [],
        projects: []
      };
    }

    // 3. Save Resume Document
    const resume = await Resume.create({
      userId,
      filename: `${Date.now()}-${originalname}`,
      originalName: originalname,
      mimeType: mimetype,
      size,
      rawText,
      status: 'parsed',
      parsedDetails
    });

    // 4. Calculate ATS Score
    const { atsScore, sectionBreakdown, suggestions } = calculateAtsScore(rawText, parsedDetails);

    // 5. AI Critique / Suggestions / Interview prep
    let aiFeedback, projectCritique, interviewQuestions;
    try {
      const aiAnalysis = await analyzeResumeWithAi(rawText, parsedDetails);
      aiFeedback = aiAnalysis.aiFeedback;
      projectCritique = aiAnalysis.projectCritique;
      interviewQuestions = aiAnalysis.interviewQuestions;
    } catch (aiAnalysisErr) {
      console.error('AI Analysis Error:', aiAnalysisErr);
      aiFeedback = {
        summary: 'Resume parsed successfully. Complete the AI configuration to unlock full suggestions.',
        grammarCorrections: [],
        bulletPointImprovements: [],
        skillSuggestions: [],
        careerSuggestions: [],
        generalImprovements: []
      };
      projectCritique = [];
      interviewQuestions = [];
    }

    // 6. Save Resume Analysis
    const resumeAnalysis = await ResumeAnalysis.create({
      resumeId: resume._id,
      userId,
      atsScore,
      sectionBreakdown,
      suggestions,
      aiFeedback,
      projectCritique,
      interviewQuestions
    });

    res.status(201).json({
      message: 'Resume analyzed successfully',
      resume,
      analysis: resumeAnalysis
    });
  } catch (error) {
    console.error('Upload resume error:', error);
    res.status(500).json({ message: 'Server error uploading and parsing resume' });
  }
};

export const getResumeHistory = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    // Fetch resumes with basic metadata
    const resumes = await Resume.find({ userId: req.user.id })
      .select('originalName mimeType size status createdAt')
      .sort({ createdAt: -1 });

    // Join with their scores
    const history = await Promise.all(
      resumes.map(async (resume) => {
        const analysis = await ResumeAnalysis.findOne({ resumeId: resume._id }).select('atsScore');
        return {
          id: resume._id,
          originalName: resume.originalName,
          mimeType: resume.mimeType,
          size: resume.size,
          status: resume.status,
          createdAt: resume.createdAt,
          atsScore: analysis ? analysis.atsScore : null
        };
      })
    );

    res.status(200).json(history);
  } catch (error) {
    console.error('Get history error:', error);
    res.status(500).json({ message: 'Server error retrieving history' });
  }
};

export const getResumeDetails = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    if (!req.user) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'Invalid resume ID' });
    }

    const resume = await Resume.findOne({ _id: id, userId: req.user.id });
    if (!resume) {
      return res.status(404).json({ message: 'Resume not found' });
    }

    const analysis = await ResumeAnalysis.findOne({ resumeId: id });
    if (!analysis) {
      return res.status(404).json({ message: 'Analysis not found for this resume' });
    }

    res.status(200).json({
      resume,
      analysis
    });
  } catch (error) {
    console.error('Get resume details error:', error);
    res.status(500).json({ message: 'Server error retrieving resume details' });
  }
};

export const deleteResume = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    if (!req.user) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'Invalid resume ID' });
    }

    // Delete Resume
    const resume = await Resume.findOneAndDelete({ _id: id, userId: req.user.id });
    if (!resume) {
      return res.status(404).json({ message: 'Resume not found' });
    }

    // Delete related Analysis
    await ResumeAnalysis.findOneAndDelete({ resumeId: id });

    res.status(200).json({ message: 'Resume and analysis deleted successfully' });
  } catch (error) {
    console.error('Delete resume error:', error);
    res.status(500).json({ message: 'Server error deleting resume' });
  }
};

export const reanalyzeResume = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    if (!req.user) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'Invalid resume ID' });
    }

    const resume = await Resume.findOne({ _id: id, userId: req.user.id });
    if (!resume) {
      return res.status(404).json({ message: 'Resume not found' });
    }

    // 1. AI Parsing - Extract structure again
    const parsedDetails = await parseResumeWithAi(resume.rawText);

    // Update resume details
    resume.parsedDetails = parsedDetails;
    resume.status = 'parsed';
    await resume.save();

    // 2. Calculate ATS Score
    const { atsScore, sectionBreakdown, suggestions } = calculateAtsScore(resume.rawText, parsedDetails);

    // 3. AI Critique / Suggestions / Interview prep
    const aiAnalysis = await analyzeResumeWithAi(resume.rawText, parsedDetails);

    // Update or Create analysis
    let analysis = await ResumeAnalysis.findOne({ resumeId: id });
    if (analysis) {
      analysis.atsScore = atsScore;
      analysis.sectionBreakdown = sectionBreakdown;
      analysis.suggestions = suggestions;
      analysis.aiFeedback = aiAnalysis.aiFeedback;
      analysis.projectCritique = aiAnalysis.projectCritique;
      analysis.interviewQuestions = aiAnalysis.interviewQuestions;
      await analysis.save();
    } else {
      analysis = await ResumeAnalysis.create({
        resumeId: id,
        userId: req.user.id,
        atsScore,
        sectionBreakdown,
        suggestions,
        aiFeedback: aiAnalysis.aiFeedback,
        projectCritique: aiAnalysis.projectCritique,
        interviewQuestions: aiAnalysis.interviewQuestions
      });
    }

    res.status(200).json({
      message: 'Resume re-analyzed successfully',
      resume,
      analysis
    });
  } catch (error) {
    console.error('Reanalyze resume error:', error);
    res.status(500).json({ message: 'Server error re-analyzing resume' });
  }
};
