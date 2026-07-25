import type {
  CreateTransactionInput,
  Transaction,
  TransactionSummary,
  UpdateTransactionInput,
} from '../domain/entities/transaction'
import { NotFoundError, ValidationError } from '../domain/errors'
import type { TransactionRepository } from '../domain/repositories/transaction-repository'

const VALID_CATEGORIES = [
  'food', 'transport', 'utilities', 'housing', 'salary',
  'freelance', 'shopping', 'entertainment', 'health', 'education',
  'savings', 'other',
]

export class TransactionService {
  constructor(
    private readonly transactionRepository: TransactionRepository,
  ) {}

  async listTransactions(): Promise<Transaction[]> {
    return this.transactionRepository.findAll()
  }

  async getTransaction(id: string): Promise<Transaction> {
    const transaction = await this.transactionRepository.findById(id)
    if (!transaction) throw new NotFoundError('Transaction')
    return transaction
  }

  async createTransaction(input: CreateTransactionInput): Promise<Transaction> {
    this.validate(input)
    return this.transactionRepository.create({
      type: input.type,
      amount: input.amount,
      category: input.category,
      description: input.description ?? '',
      date: input.date,
    })
  }

  async updateTransaction(id: string, input: UpdateTransactionInput): Promise<Transaction> {
    if (input.amount !== undefined || input.type !== undefined || input.category !== undefined) {
      const existing = await this.transactionRepository.findById(id)
      if (!existing) throw new NotFoundError('Transaction')
      this.validate({
        type: input.type ?? existing.type,
        amount: input.amount ?? existing.amount,
        category: input.category ?? existing.category,
        date: input.date ?? existing.date,
      })
    }

    const updated = await this.transactionRepository.update(id, input)
    if (!updated) throw new NotFoundError('Transaction')
    return updated
  }

  async deleteTransaction(id: string): Promise<void> {
    const deleted = await this.transactionRepository.delete(id)
    if (!deleted) throw new NotFoundError('Transaction')
  }

  async getSummary(): Promise<TransactionSummary> {
    return this.transactionRepository.getSummary()
  }

  private validate(input: { type: string; amount: number; category: string; date: string }): void {
    if (!['income', 'expense'].includes(input.type)) {
      throw new ValidationError('type must be "income" or "expense"')
    }
    if (typeof input.amount !== 'number' || input.amount <= 0) {
      throw new ValidationError('amount must be a positive number')
    }
    if (!input.category?.trim()) {
      throw new ValidationError('category is required')
    }
    if (!input.date || !/^\d{4}-\d{2}-\d{2}$/.test(input.date)) {
      throw new ValidationError('date must be in YYYY-MM-DD format')
    }
  }
}
