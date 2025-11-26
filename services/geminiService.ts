import { GoogleGenAI, Type } from "@google/genai";
import { ExtractedData, TransactionCategory } from "../types";

// Initialize Gemini Client
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const fileToGenerativePart = async (file: File): Promise<{ inlineData: { data: string; mimeType: string } }> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64Data = reader.result as string;
      // Remove data URL prefix (e.g., "data:image/jpeg;base64,")
      const base64Content = base64Data.split(',')[1];
      resolve({
        inlineData: {
          data: base64Content,
          mimeType: file.type,
        },
      });
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};

export const extractDocumentData = async (file: File): Promise<ExtractedData> => {
  try {
    const documentPart = await fileToGenerativePart(file);

    const prompt = `
      Analyze this financial document (receipt, invoice, bank statement, etc.). 
      Extract the following fields accurately:
      - Date of transaction (YYYY-MM-DD format)
      - Total Amount (numeric)
      - Currency (USD, EUR, etc.)
      - Description (brief summary of items or service)
      - Vendor Name (merchant or sender)
      - Invoice Number (if applicable, otherwise "N/A")
      - Category (Classify into: Expense, Deposit, Transfer, Charge, Other)
      - Confidence Score (0-100 based on legibility and clarity)

      If a field is missing, make a reasonable guess or use default values (e.g., today's date if missing, 0 amount if unclear).
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: {
        parts: [
          documentPart,
          { text: prompt }
        ]
      },
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            date: { type: Type.STRING },
            amount: { type: Type.NUMBER },
            currency: { type: Type.STRING },
            description: { type: Type.STRING },
            vendorName: { type: Type.STRING },
            invoiceNumber: { type: Type.STRING },
            category: { 
              type: Type.STRING, 
              enum: [
                TransactionCategory.EXPENSE,
                TransactionCategory.DEPOSIT,
                TransactionCategory.TRANSFER,
                TransactionCategory.CHARGE,
                TransactionCategory.OTHER
              ] 
            },
            confidenceScore: { type: Type.NUMBER }
          },
          required: ["date", "amount", "description", "vendorName", "category"]
        }
      }
    });

    const text = response.text;
    if (!text) throw new Error("No data returned from Gemini");

    const data = JSON.parse(text) as ExtractedData;
    return data;

  } catch (error) {
    console.error("Extraction error:", error);
    throw error;
  }
};