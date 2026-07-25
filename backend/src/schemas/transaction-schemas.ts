import z from 'zod'

export const transactionSchema = z.object({
  id: z.string(),
  type: z.enum(['income', 'expense']),
  amount: z.number().positive(),
  category: z.string(),
  description: z.string(),
  date: z.string(),
  createdAt: z.string(),
})

export const createTransactionSchema = z.object({
  type: z.enum(['income', 'expense']),
  amount: z.number().positive(),
  category: z.string().min(1),
  description: z.string().optional(),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'date must be YYYY-MM-DD'),
})

export const updateTransactionSchema = createTransactionSchema.partial()

export const idParamSchema = z.object({
  id: z.string().min(1),
})

export const transactionResponseSchema = z.object({ data: transactionSchema })
export const transactionListResponseSchema = z.object({ data: z.array(transactionSchema) })

export const transactionSummarySchema = z.object({
  data: z.object({
    totalIncome: z.number(),
    totalExpense: z.number(),
    balance: z.number(),
    transactionCount: z.number(),
  }),
})

export const errorResponseSchema = z.object({
  error: z.object({
    code: z.string(),
    message: z.string(),
  }),
})
