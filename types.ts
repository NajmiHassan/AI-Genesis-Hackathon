
/**
 * Represents a single item on an expense receipt.
 */
export interface ExpenseItem {
  item: string;
  quantity: number;
  price: number;
}

/**
 * Represents the fully structured data extracted from a receipt.
 */
export interface ExpenseData {
  merchant: string;
  date: string;
  total: number;
  items: ExpenseItem[];
}

/**
 * Represents the state of a single uploaded receipt throughout the processing workflow.
 */
export interface ProcessedReceipt {
  id: string; // Unique identifier for the receipt job
  imagePreview: string; // URL for the image preview
  status: string; // User-facing status message
  data: ExpenseData | null; // The structured data, once extracted
  notionStatus: 'pending' | 'success' | 'failed'; // Status of the Notion API call
  error: string | null; // Any error message encountered
}
