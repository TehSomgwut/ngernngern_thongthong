import type {
  CreateTransactionInput,
  Transaction,
  TransactionSummary,
  UpdateTransactionInput,
} from '../entities/transaction'

export interface TransactionRepository {
  findAll(): Promise<Transaction[]>
  findById(id: string): Promise<Transaction | null>
  create(input: CreateTransactionInput): Promise<Transaction>
  update(id: string, input: UpdateTransactionInput): Promise<Transaction | null>
  delete(id: string): Promise<boolean>
  getSummary(): Promise<TransactionSummary>
}
