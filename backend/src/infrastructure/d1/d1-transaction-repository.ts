import type {
  CreateTransactionInput,
  Transaction,
  TransactionSummary,
  UpdateTransactionInput,
} from '../../domain/entities/transaction'
import type { TransactionRepository } from '../../domain/repositories/transaction-repository'

interface TransactionRow {
  id: string
  type: string
  amount: number
  category: string
  description: string
  date: string
  created_at: string
}

function toTransaction(row: TransactionRow): Transaction {
  return {
    id: row.id,
    type: row.type as Transaction['type'],
    amount: row.amount,
    category: row.category,
    description: row.description,
    date: row.date,
    createdAt: row.created_at,
  }
}

export class D1TransactionRepository implements TransactionRepository {
  constructor(private readonly db: D1Database) {}

  async findAll(): Promise<Transaction[]> {
    const { results } = await this.db
      .prepare('SELECT id, type, amount, category, description, date, created_at FROM transactions ORDER BY date DESC, created_at DESC')
      .all<TransactionRow>()
    return results.map(toTransaction)
  }

  async findById(id: string): Promise<Transaction | null> {
    const row = await this.db
      .prepare('SELECT id, type, amount, category, description, date, created_at FROM transactions WHERE id = ?')
      .bind(id)
      .first<TransactionRow>()
    return row ? toTransaction(row) : null
  }

  async create(input: CreateTransactionInput): Promise<Transaction> {
    const id = crypto.randomUUID()
    const createdAt = new Date().toISOString()
    await this.db
      .prepare('INSERT INTO transactions (id, type, amount, category, description, date, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)')
      .bind(id, input.type, input.amount, input.category, input.description ?? '', input.date, createdAt)
      .run()
    return { id, type: input.type, amount: input.amount, category: input.category, description: input.description ?? '', date: input.date, createdAt }
  }

  async update(id: string, input: UpdateTransactionInput): Promise<Transaction | null> {
    const existing = await this.findById(id)
    if (!existing) return null

    const type = input.type ?? existing.type
    const amount = input.amount ?? existing.amount
    const category = input.category ?? existing.category
    const description = input.description ?? existing.description
    const date = input.date ?? existing.date

    await this.db
      .prepare('UPDATE transactions SET type = ?, amount = ?, category = ?, description = ?, date = ? WHERE id = ?')
      .bind(type, amount, category, description, date, id)
      .run()
    return { ...existing, type, amount, category, description, date }
  }

  async delete(id: string): Promise<boolean> {
    const result = await this.db.prepare('DELETE FROM transactions WHERE id = ?').bind(id).run()
    return result.meta.changes > 0
  }

  async getSummary(): Promise<TransactionSummary> {
    const row = await this.db
      .prepare(`
        SELECT
          COALESCE(SUM(CASE WHEN type = 'income' THEN amount ELSE 0 END), 0) as totalIncome,
          COALESCE(SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END), 0) as totalExpense,
          COUNT(*) as transactionCount
        FROM transactions
      `)
      .first<{ totalIncome: number; totalExpense: number; transactionCount: number }>()

    return {
      totalIncome: row?.totalIncome ?? 0,
      totalExpense: row?.totalExpense ?? 0,
      balance: (row?.totalIncome ?? 0) - (row?.totalExpense ?? 0),
      transactionCount: row?.transactionCount ?? 0,
    }
  }
}
