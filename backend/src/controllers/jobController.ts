import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { Resume } from '../models/Resume';
import { JobDescription } from '../models/JobDescription';
import { matchJobDescriptionWithAi } from '../services/geminiService';
import mongoose from 'mongoose';

export const matchJobDescription = async (req: AuthRequest, res: Response) => {
  try {
    const { resumeId, jobTitle, descriptionText } = req.body;
    if (!req.user) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    if (!resumeId || !jobTitle || !descriptionText) {
      return res.status(400).json({ message: 'Please provide resumeId, jobTitle and descriptionText' });
    }

    if (!mongoose.Types.ObjectId.isValid(resumeId)) {
      return res.status(400).json({ message: 'Invalid resume ID' });
    }

    const resume = await Resume.findOne({ _id: resumeId, userId: req.user.id });
    if (!resume) {
      return res.status(404).json({ message: 'Resume not found' });
    }

    // Call AI matcher service
    const analysisResults = await matchJobDescriptionWithAi(resume.parsedDetails, descriptionText);

    // Save job description and analysis
    const jobDescription = await JobDescription.create({
      userId: req.user.id,
      resumeId,
      jobTitle,
      descriptionText,
      analysisResults
    });

    res.status(201).json({
      message: 'Job description analyzed successfully',
      jobDescription
    });
  } catch (error) {
    console.error('Match job description error:', error);
    res.status(500).json({ message: 'Server error analyzing job description' });
  }
};

export const getJobMatchHistory = async (req: AuthRequest, res: Response) => {
  try {
    const { resumeId } = req.params;
    if (!req.user) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    if (!mongoose.Types.ObjectId.isValid(resumeId)) {
      return res.status(400).json({ message: 'Invalid resume ID' });
    }

    const history = await JobDescription.find({
      userId: req.user.id,
      resumeId
    }).sort({ createdAt: -1 });

    res.status(200).json(history);
  } catch (error) {
    console.error('Get job match history error:', error);
    res.status(500).json({ message: 'Server error retrieving job match history' });
  }
};

export const deleteJobMatch = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    if (!req.user) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'Invalid job match ID' });
    }

    const deleted = await JobDescription.findOneAndDelete({
      _id: id,
      userId: req.user.id
    });

    if (!deleted) {
      return res.status(404).json({ message: 'Job match entry not found' });
    }

    res.status(200).json({ message: 'Job match entry deleted successfully' });
  } catch (error) {
    console.error('Delete job match error:', error);
    res.status(500).json({ message: 'Server error deleting job match entry' });
  }
};
