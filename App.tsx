import React, { useState, useCallback, useRef } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { DocumentFile, ExtractedData } from './types';
import { extractDocumentData } from './services/geminiService';
import Dashboard from './components/Dashboard';
import DocumentList from './components/DocumentList';
import { UploadIcon, DownloadIcon } from './components/Icons';

const App: React.FC = () => {
  const [documents, setDocuments] = useState<DocumentFile[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Helper to trigger file processing
  const processFile = async (docId: string, file: File) => {
    try {
      setDocuments(prev => prev.map(d => d.id === docId ? { ...d, status: 'processing' } : d));
      
      const data: ExtractedData = await extractDocumentData(file);
      
      setDocuments(prev => prev.map(d => 
        d.id === docId ? { ...d, status: 'success', data } : d
      ));
    } catch (error) {
      console.error(error);
      setDocuments(prev => prev.map(d => 
        d.id === docId ? { ...d, status: 'error', errorMessage: 'Extraction failed' } : d
      ));
    }
  };

  const handleFiles = useCallback((files: FileList | null) => {
    if (!files) return;

    const newDocs: DocumentFile[] = Array.from(files).map(file => {
      const id = uuidv4();
      
      // Create preview for images
      let previewUrl = null;
      if (file.type.startsWith('image/')) {
        previewUrl = URL.createObjectURL(file);
      } else if (file.type === 'application/pdf') {
         // Placeholder for PDF
         previewUrl = null; 
      }

      return {
        id,
        file,
        previewUrl,
        status: 'idle'
      };
    });

    setDocuments(prev => [...newDocs, ...prev]);

    // Trigger processing immediately
    newDocs.forEach(doc => processFile(doc.id, doc.file));
  }, []);

  const onDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const onDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    handleFiles(e.dataTransfer.files);
  };

  const handleRemove = (id: string) => {
    setDocuments(prev => prev.filter(d => d.id !== id));
  };

  const handleExport = () => {
    const headers = ['Date', 'Vendor', 'Invoice #', 'Description', 'Category', 'Amount', 'Currency', 'Confidence'];
    const rows = documents
      .filter(d => d.status === 'success' && d.data)
      .map(d => {
        const data = d.data!;
        return [
          data.date,
          `"${data.vendorName.replace(/"/g, '""')}"`,
          `"${data.invoiceNumber.replace(/"/g, '""')}"`,
          `"${data.description.replace(/"/g, '""')}"`,
          data.category,
          data.amount,
          data.currency,
          data.confidenceScore
        ].join(',');
      });

    const csvContent = [headers.join(','), ...rows].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', 'extracted_financial_data.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 pb-20">
      {/* Navbar */}
      <nav className="bg-white border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <div className="flex-shrink-0 flex items-center text-primary-600">
                <svg className="w-8 h-8 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <span className="font-bold text-xl tracking-tight text-slate-900">FinExtract AI</span>
              </div>
            </div>
            <div className="flex items-center">
               <button 
                onClick={handleExport}
                disabled={documents.filter(d => d.status === 'success').length === 0}
                className="inline-flex items-center px-4 py-2 border border-slate-300 shadow-sm text-sm font-medium rounded-lg text-slate-700 bg-white hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
               >
                 <DownloadIcon className="mr-2 h-4 w-4" />
                 Export CSV
               </button>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8 text-center sm:text-left">
          <h1 className="text-3xl font-bold text-slate-900">Financial Document Extraction</h1>
          <p className="mt-2 text-lg text-slate-600">
            Automatically extract data from receipts, invoices, and bank statements using Gemini AI.
          </p>
        </div>

        {/* Dashboard */}
        <Dashboard documents={documents} />

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Upload Area */}
          <div className="lg:col-span-1">
            <div 
              className={`
                sticky top-24
                border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all duration-200
                flex flex-col items-center justify-center min-h-[300px]
                ${isDragging 
                  ? 'border-primary-500 bg-primary-50' 
                  : 'border-slate-300 hover:border-primary-400 hover:bg-slate-50 bg-white'}
              `}
              onDragOver={onDragOver}
              onDragLeave={onDragLeave}
              onDrop={onDrop}
              onClick={() => fileInputRef.current?.click()}
            >
              <input 
                type="file" 
                ref={fileInputRef} 
                className="hidden" 
                multiple 
                accept="image/*,application/pdf"
                onChange={(e) => handleFiles(e.target.files)}
              />
              <div className="bg-primary-100 p-4 rounded-full mb-4">
                <UploadIcon className="h-8 w-8 text-primary-600" />
              </div>
              <h3 className="text-lg font-medium text-slate-900 mb-1">Upload Documents</h3>
              <p className="text-sm text-slate-500 mb-6">
                Drag & drop files here, or click to browse.
              </p>
              <p className="text-xs text-slate-400 uppercase tracking-wide font-semibold">
                Supports PDF, JPG, PNG
              </p>
            </div>
          </div>

          {/* Results List */}
          <div className="lg:col-span-3">
             <div className="bg-white rounded-xl shadow-sm border border-slate-200 flex flex-col min-h-[600px]">
               <div className="px-6 py-4 border-b border-slate-200 flex justify-between items-center bg-slate-50 rounded-t-xl">
                 <h2 className="text-lg font-semibold text-slate-800">Recent Extractions</h2>
                 <span className="text-sm text-slate-500">{documents.length} documents</span>
               </div>
               <div className="p-0">
                 <DocumentList documents={documents} onRemove={handleRemove} />
               </div>
             </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default App;