
import React, { useState, useCallback } from 'react';
import { extractTextFromImage, generateExpenseJson } from './services/geminiService';
import { saveToNotion } from './services/notionService';
import type { ExpenseData, ProcessedReceipt } from './types';
import { NotionCredentials } from './components/NotionCredentials';
import { ImageUploader } from './components/ImageUploader';
import { ResultsDashboard } from './components/ResultsDashboard';
import { LogoIcon, SparklesIcon } from './components/icons';

/**
 * Main application component.
 * Manages the entire workflow from uploading receipts to saving data in Notion.
 */
export default function App(): React.ReactElement {
  const [notionApiKey, setNotionApiKey] = useState<string>('');
  const [notionDbId, setNotionDbId] = useState<string>('');
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [processedReceipts, setProcessedReceipts] = useState<ProcessedReceipt[]>([]);

  /**
   * Main handler to process all uploaded receipts.
   * This function orchestrates the calls to Gemini for OCR and data structuring,
   * and then to the Notion API for saving the data.
   */
  const handleProcessReceipts = useCallback(async () => {
    if (imageFiles.length === 0 || !notionApiKey || !notionDbId) {
      alert('Please upload images and provide Notion credentials.');
      return;
    }

    setIsProcessing(true);
    setProcessedReceipts([]); // Clear previous results

    const results: ProcessedReceipt[] = [];

    for (const file of imageFiles) {
      const imagePreview = URL.createObjectURL(file);
      let currentStatus = 'Processing OCR...';
      let currentData: ExpenseData | null = null;
      let error: string | null = null;
      let notionStatus: 'pending' | 'success' | 'failed' = 'pending';

      const initialResult: ProcessedReceipt = {
        id: file.name + Date.now(),
        imagePreview,
        status: currentStatus,
        data: null,
        notionStatus: 'pending',
        error: null,
      };
      
      // Use a function to update the UI with intermediate progress
      const updateResult = (update: Partial<ProcessedReceipt>) => {
        const index = results.findIndex(r => r.id === initialResult.id);
        if (index !== -1) {
          results[index] = { ...results[index], ...update };
          setProcessedReceipts([...results]);
        }
      };

      results.push(initialResult);
      setProcessedReceipts([...results]);
      
      try {
        // Step 1: Extract text from image using Gemini
        const ocrText = await extractTextFromImage(file);
        if (!ocrText) {
          throw new Error('Could not extract any text. The image might be unclear.');
        }
        
        currentStatus = 'Structuring data...';
        updateResult({ status: currentStatus });

        // Step 2: Convert OCR text into structured JSON using Gemini
        const expenseData = await generateExpenseJson(ocrText);
        currentData = expenseData;
        currentStatus = 'Data extracted';
        updateResult({ status: currentStatus, data: currentData });

        // Step 3: Save the structured data to Notion
        currentStatus = 'Saving to Notion...';
        updateResult({ status: currentStatus });

        await saveToNotion(expenseData, notionApiKey, notionDbId);
        notionStatus = 'success';
        currentStatus = 'Saved successfully!';
        updateResult({ status: currentStatus, notionStatus: 'success' });

      } catch (e: any) {
        error = e.message || 'An unknown error occurred.';
        notionStatus = 'failed';
        updateResult({ status: 'Failed', error, notionStatus });
      }
    }

    setIsProcessing(false);
  }, [imageFiles, notionApiKey, notionDbId]);

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-800">
      <main className="container mx-auto max-w-4xl p-4 md:p-8">
        <header className="text-center mb-10">
          <div className="flex justify-center items-center gap-3">
            <LogoIcon />
            <h1 className="text-4xl font-bold text-slate-900">Receipt Parser Pro</h1>
          </div>
          <p className="text-slate-600 mt-2">
            Upload your receipts, and let AI organize and save your expenses to Notion.
          </p>
        </header>

        <div className="space-y-8">
          {/* Step 1: Notion Credentials */}
          <NotionCredentials
            notionApiKey={notionApiKey}
            setNotionApiKey={setNotionApiKey}
            notionDbId={notionDbId}
            setNotionDbId={setNotionDbId}
          />
          
          {/* Step 2: Image Upload */}
          <ImageUploader onFilesSelected={setImageFiles} disabled={isProcessing} />

          {/* Step 3: Process Button */}
          <div className="text-center">
            <button
              onClick={handleProcessReceipts}
              disabled={isProcessing || imageFiles.length === 0 || !notionApiKey || !notionDbId}
              className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-indigo-600 text-white font-semibold rounded-lg shadow-lg hover:bg-indigo-700 disabled:bg-slate-400 disabled:cursor-not-allowed transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              {isProcessing ? (
                <>
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Processing...
                </>
              ) : (
                <>
                  <SparklesIcon />
                  Process Receipts
                </>
              )}
            </button>
          </div>
          
          {/* Step 4: Results */}
          {processedReceipts.length > 0 && (
             <ResultsDashboard processedReceipts={processedReceipts} />
          )}
        </div>

        <footer className="text-center mt-12 text-sm text-slate-500">
            <p>Powered by Gemini and Notion</p>
        </footer>
      </main>
    </div>
  );
}
