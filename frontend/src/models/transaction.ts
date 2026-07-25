export type TransactionType = 'income' | 'expense'

export interface Transaction {
  id: string
  type: TransactionType
  amount: number
  category: string
  description: string
  date: string
  createdAt: string
}

export interface CreateTransactionBody {
  type: TransactionType
  amount: number
  category: string
  description?: string
  date: string
}

export interface UpdateTransactionBody {
  type?: TransactionType
  amount?: number
  category?: string
  description?: string
  date?: string
}

export interface TransactionSummary {
  totalIncome: number
  totalExpense: number
  balance: number
  transactionCount: number
}

export interface TransactionListResponse {
  data: Transaction[]
}

export interface TransactionResponse {
  data: Transaction
}

export interface TransactionSummaryResponse {
  data: TransactionSummary
}
