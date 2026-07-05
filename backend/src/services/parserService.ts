import pdfParse from 'pdf-parse';
import mammoth from 'mammoth';

/**
 * Extracts raw text content from PDF and DOCX buffers
 */
export const parseResumeFile = async (buffer: Buffer, mimeType: string): Promise<string> => {
  try {
    if (mimeType === 'application/pdf') {
      const data = await pdfParse(buffer);
      return data.text || '';
    } else if (
      mimeType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
      mimeType === 'application/msword'
    ) {
      const result = await mammoth.extractRawText({ buffer });
      return result.value || '';
    } else if (mimeType.startsWith('text/')) {
      return buffer.toString('utf-8');
    } else {
      throw new Error(`Unsupported file type: ${mimeType}`);
    }
  } catch (error) {
    console.error('Error parsing resume file:', error);
    throw new Error(`Failed to parse file: ${error instanceof Error ? error.message : 'Unknown parsing error'}`);
  }
};
