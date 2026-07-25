import type {
  CreateTransactionInput,
  Transaction,
  TransactionSummary,
  UpdateTransactionInput,
} from '../../domain/entities/transaction'
import type { TransactionRepository } from '../../domain/repositories/transaction-repository'

export class MemoryTransactionRepository implements TransactionRepository {
  private readonly transactions = new Map<string, Transaction>()

  async findAll(): Promise<Transaction[]> {
    return [...this.transactions.values()].sort(
      (a, b) => b.date.localeCompare(a.date) || b.createdAt.localeCompare(a.createdAt),
    )
  }

  async findById(id: string): Promise<Transaction | null> {
    return this.transactions.get(id) ?? null
  }

  async create(input: CreateTransactionInput): Promise<Transaction> {
    const transaction: Transaction = {
      id: crypto.randomUUID(),
      type: input.type,
      amount: input.amount,
      category: input.category,
      description: input.description ?? '',
      date: input.date,
      createdAt: new Date().toISOString(),
    }
    this.transactions.set(transaction.id, transaction)
    return transaction
  }

  async update(id: string, input: UpdateTransactionInput): Promise<Transaction | null> {
    const existing = this.transactions.get(id)
    if (!existing) return null
    const updated: Transaction = {
      ...existing,
      type: input.type ?? existing.type,
      amount: input.amount ?? existing.amount,
      category: input.category ?? existing.category,
      description: input.description ?? existing.description,
      date: input.date ?? existing.date,
    }
    this.transactions.set(id, updated)
    return updated
  }

  async delete(id: string): Promise<boolean> {
    return this.transactions.delete(id)
  }

  async getSummary(): Promise<TransactionSummary> {
    const all = [...this.transactions.values()]
    const totalIncome = all.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0)
    const totalExpense = all.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0)
    return {
      totalIncome,
      totalExpense,
      balance: totalIncome - totalExpense,
      transactionCount: all.length,
    }
  }
}
