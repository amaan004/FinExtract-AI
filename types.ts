export enum TransactionCategory {
  EXPENSE = 'Expense',
  DEPOSIT = 'Deposit',
  TRANSFER = 'Transfer',
  CHARGE = 'Charge',
  OTHER = 'Other'
}

export interface ExtractedData {
  date: string;
  amount: number;
  currency: string;
  description: string;
  vendorName: string;
  invoiceNumber: string;
  category: TransactionCategory;
  confidenceScore: number; // 0-100 derived from AI analysis
}

export type ProcessingStatus = 'idle' | 'processing' | 'success' | 'error';

export interface DocumentFile {
  id: string;
  file: File;
  previewUrl: string | null;
  status: ProcessingStatus;
  data?: ExtractedData;
  errorMessage?: string;
}

export interface DashboardStats {
  totalProcessed: number;
  totalAmount: number;
  categoryBreakdown: { name: string; value: number }[];
}