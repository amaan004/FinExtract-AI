import React from 'react';
import { DocumentFile, TransactionCategory } from '../types';
import { CheckCircleIcon, ExclamationCircleIcon, Spinner, FileIcon, TrashIcon } from './Icons';

interface DocumentListProps {
  documents: DocumentFile[];
  onRemove: (id: string) => void;
}

const StatusBadge: React.FC<{ status: string }> = ({ status }) => {
  switch (status) {
    case 'processing':
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
          <Spinner className="w-3 h-3 mr-1" />
          Processing
        </span>
      );
    case 'success':
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
          <CheckCircleIcon className="w-3 h-3 mr-1" />
          Success
        </span>
      );
    case 'error':
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
          <ExclamationCircleIcon className="w-3 h-3 mr-1" />
          Failed
        </span>
      );
    default:
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
          Pending
        </span>
      );
  }
};

const CategoryBadge: React.FC<{ category?: TransactionCategory }> = ({ category }) => {
  if (!category) return <span className="text-gray-400">-</span>;
  
  const colors: Record<string, string> = {
    [TransactionCategory.EXPENSE]: 'bg-orange-100 text-orange-800',
    [TransactionCategory.DEPOSIT]: 'bg-green-100 text-green-800',
    [TransactionCategory.TRANSFER]: 'bg-blue-100 text-blue-800',
    [TransactionCategory.CHARGE]: 'bg-red-100 text-red-800',
    [TransactionCategory.OTHER]: 'bg-gray-100 text-gray-800',
  };

  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${colors[category] || colors['Other']}`}>
      {category}
    </span>
  );
};

const DocumentList: React.FC<DocumentListProps> = ({ documents, onRemove }) => {
  if (documents.length === 0) {
    return (
      <div className="text-center py-12 bg-white rounded-xl border border-dashed border-slate-300">
        <FileIcon className="mx-auto h-12 w-12 text-slate-300" />
        <p className="mt-2 text-sm text-slate-500">No documents uploaded yet.</p>
      </div>
    );
  }

  return (
    <div className="bg-white shadow-sm border border-slate-200 rounded-xl overflow-hidden">
      <div className="overflow-x-auto custom-scrollbar">
        <table className="min-w-full divide-y divide-slate-200">
          <thead className="bg-slate-50">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Document</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Date</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Vendor</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Category</th>
              <th scope="col" className="px-6 py-3 text-right text-xs font-semibold text-slate-500 uppercase tracking-wider">Amount</th>
              <th scope="col" className="px-6 py-3 text-center text-xs font-semibold text-slate-500 uppercase tracking-wider">Status</th>
              <th scope="col" className="px-6 py-3 text-center text-xs font-semibold text-slate-500 uppercase tracking-wider">Action</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-slate-200">
            {documents.map((doc) => (
              <tr key={doc.id} className="hover:bg-slate-50 transition-colors">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 h-10 w-10 bg-slate-100 rounded-lg flex items-center justify-center">
                      {doc.previewUrl ? (
                        <img src={doc.previewUrl} alt="Preview" className="h-10 w-10 object-cover rounded-lg" />
                      ) : (
                        <FileIcon className="h-5 w-5 text-slate-400" />
                      )}
                    </div>
                    <div className="ml-4">
                      <div className="text-sm font-medium text-slate-900 truncate max-w-[150px]" title={doc.file.name}>{doc.file.name}</div>
                      <div className="text-xs text-slate-500">{(doc.file.size / 1024).toFixed(1)} KB</div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">
                  {doc.data?.date || '-'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">
                   <div className="truncate max-w-[120px]" title={doc.data?.vendorName}>
                    {doc.data?.vendorName || '-'}
                   </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <CategoryBadge category={doc.data?.category} />
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-right font-medium text-slate-900">
                  {doc.data ? `${doc.data.currency} ${doc.data.amount.toFixed(2)}` : '-'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-center">
                  <StatusBadge status={doc.status} />
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-medium">
                  <button 
                    onClick={() => onRemove(doc.id)} 
                    className="text-slate-400 hover:text-red-500 transition-colors p-1 rounded-full hover:bg-red-50"
                  >
                    <TrashIcon />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default DocumentList;