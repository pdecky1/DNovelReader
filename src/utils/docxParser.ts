import mammoth from 'mammoth';

export interface DocxParseResult {
  content: string;
  error?: string;
}

export const parseDocxFile = async (file: File): Promise<DocxParseResult> => {
  try {
    const arrayBuffer = await file.arrayBuffer();
    const result = await mammoth.extractRawText({ arrayBuffer });
    
    return {
      content: result.value,
      error: result.messages.length > 0 ? result.messages[0].message : undefined
    };
  } catch (error) {
    console.error('Error parsing DOCX file:', error);
    return {
      content: '',
      error: error instanceof Error ? error.message : 'Failed to parse DOCX file'
    };
  }
};

export const parseBatchDocxFiles = async (files: File[]): Promise<DocxParseResult[]> => {
  try {
    const results = await Promise.all(
      files.map(async (file) => {
        try {
          return await parseDocxFile(file);
        } catch (error) {
          return {
            content: '',
            error: `Error processing ${file.name}: ${error instanceof Error ? error.message : 'Unknown error'}`
          };
        }
      })
    );
    return results;
  } catch (error) {
    console.error('Error processing batch files:', error);
    throw error;
  }
};