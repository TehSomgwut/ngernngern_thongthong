<script setup lang="ts">
import { useTransactionStore } from '@/stores/use-transaction-store'
import type { CreateTransactionBody, Transaction } from '@/models'

const transactionStore = useTransactionStore()
const { transactions, summary, isLoading, error } = storeToRefs(transactionStore)

// Categories
const INCOME_CATEGORIES = ['salary', 'freelance', 'investment', 'gift', 'other'] as const
const EXPENSE_CATEGORIES = ['food', 'transport', 'utilities', 'housing', 'shopping', 'entertainment', 'health', 'education', 'other'] as const

const headers = [
  { title: 'Date', key: 'date' },
  { title: 'Type', key: 'type' },
  { title: 'Category', key: 'category' },
  { title: 'Amount', key: 'amount' },
  { title: 'Description', key: 'description' },
  { title: 'Action', key: 'action', sortable: false, align: 'end' as const },
]

// Dialog state
const dialog = ref(false)
const deleteDialog = ref(false)
const isSubmitting = ref(false)
const editingTransaction = ref<Transaction | null>(null)
const deletingTransaction = ref<Transaction | null>(null)

const form = ref<CreateTransactionBody>({
  type: 'expense',
  amount: 0,
  category: 'food',
  description: '',
  date: new Date().toISOString().split('T')[0],
})

const categories = computed(() =>
  form.value.type === 'income' ? INCOME_CATEGORIES : EXPENSE_CATEGORIES
)

// Reset category when type changes
watch(() => form.value.type, () => {
  form.value.category = categories.value[0]
})

function openCreate() {
  editingTransaction.value = null
  form.value = {
    type: 'expense',
    amount: 0,
    category: 'food',
    description: '',
    date: new Date().toISOString().split('T')[0],
  }
  dialog.value = true
}

function openEdit(tx: Transaction) {
  editingTransaction.value = tx
  form.value = {
    type: tx.type,
    amount: tx.amount,
    category: tx.category,
    description: tx.description,
    date: tx.date,
  }
  dialog.value = true
}

function openDelete(tx: Transaction) {
  deletingTransaction.value = tx
  deleteDialog.value = true
}

async function submit() {
  isSubmitting.value = true
  try {
    if (editingTransaction.value)
      await transactionStore.updateTransaction(editingTransaction.value.id, form.value)
    else
      await transactionStore.createTransaction(form.value as CreateTransactionBody)
    dialog.value = false
  }
  finally {
    isSubmitting.value = false
  }
}

async function confirmDelete() {
  if (!deletingTransaction.value) return
  isSubmitting.value = true
  try {
    await transactionStore.deleteTransaction(deletingTransaction.value.id)
    deleteDialog.value = false
  }
  finally {
    isSubmitting.value = false
  }
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('th-TH', { dateStyle: 'medium' })
}

function formatCurrency(amount: number) {
  return new Intl.NumberFormat('th-TH', { style: 'currency', currency: 'THB' }).format(amount)
}

onMounted(() => {
  transactionStore.fetchTransactions()
  transactionStore.fetchSummary()
})
</script>

<template>
  <div>
    <h1 class="text-h5 font-weight-bold mb-6">Income &amp; Expenses</h1>

    <!-- Summary Cards -->
    <VRow class="mb-6">
      <VCol cols="12" sm="6" md="3">
        <VCard>
          <VCardText class="d-flex align-center gap-3">
            <VAvatar color="success" variant="tonal" size="48">
              <VIcon icon="ri-arrow-up-line" size="24" />
            </VAvatar>
            <div>
              <div class="text-caption text-medium-emphasis">Total Income</div>
              <div class="text-h5 font-weight-bold text-success">{{ formatCurrency(summary.totalIncome) }}</div>
            </div>
          </VCardText>
        </VCard>
      </VCol>
      <VCol cols="12" sm="6" md="3">
        <VCard>
          <VCardText class="d-flex align-center gap-3">
            <VAvatar color="error" variant="tonal" size="48">
              <VIcon icon="ri-arrow-down-line" size="24" />
            </VAvatar>
            <div>
              <div class="text-caption text-medium-emphasis">Total Expenses</div>
              <div class="text-h5 font-weight-bold text-error">{{ formatCurrency(summary.totalExpense) }}</div>
            </div>
          </VCardText>
        </VCard>
      </VCol>
      <VCol cols="12" sm="6" md="3">
        <VCard>
          <VCardText class="d-flex align-center gap-3">
            <VAvatar
              :color="summary.balance >= 0 ? 'primary' : 'warning'"
              variant="tonal"
              size="48"
            >
              <VIcon icon="ri-wallet-3-line" size="24" />
            </VAvatar>
            <div>
              <div class="text-caption text-medium-emphasis">Balance</div>
              <div
                class="text-h5 font-weight-bold"
                :class="summary.balance >= 0 ? 'text-primary' : 'text-warning'"
              >
                {{ formatCurrency(summary.balance) }}
              </div>
            </div>
          </VCardText>
        </VCard>
      </VCol>
      <VCol cols="12" sm="6" md="3">
        <VCard>
          <VCardText class="d-flex align-center gap-3">
            <VAvatar color="info" variant="tonal" size="48">
              <VIcon icon="ri-list-check" size="24" />
            </VAvatar>
            <div>
              <div class="text-caption text-medium-emphasis">Transactions</div>
              <div class="text-h5 font-weight-bold">{{ summary.transactionCount }}</div>
            </div>
          </VCardText>
        </VCard>
      </VCol>
    </VRow>

    <!-- Transactions Table -->
    <VCard>
      <VCardTitle class="d-flex align-center justify-space-between pa-4">
        <span class="text-h6">All Transactions</span>
        <VBtn
          color="primary"
          prepend-icon="ri-add-line"
          @click="openCreate"
        >
          Add Transaction
        </VBtn>
      </VCardTitle>

      <VDivider />

      <VAlert
        v-if="error"
        type="error"
        class="ma-4"
        :text="error"
        closable
      />

      <VDataTable
        :headers="headers"
        :items="transactions"
        :loading="isLoading"
        hover
      >
        <template #item.date="{ item }">
          {{ formatDate(item.date) }}
        </template>

        <template #item.type="{ item }">
          <VChip
            :color="item.type === 'income' ? 'success' : 'error'"
            size="small"
            variant="tonal"
          >
            <VIcon
              :icon="item.type === 'income' ? 'ri-arrow-up-line' : 'ri-arrow-down-line'"
              size="14"
              class="me-1"
            />
            {{ item.type === 'income' ? 'Income' : 'Expense' }}
          </VChip>
        </template>

        <template #item.amount="{ item }">
          <span :class="item.type === 'income' ? 'text-success' : 'text-error'" class="font-weight-bold">
            {{ item.type === 'income' ? '+' : '-' }}{{ formatCurrency(item.amount) }}
          </span>
        </template>

        <template #item.action="{ item }">
          <IconBtn @click="openEdit(item)">
            <VTooltip activator="parent" location="top">Edit</VTooltip>
            <VIcon icon="ri-pencil-line" />
          </IconBtn>
          <IconBtn color="error" @click="openDelete(item)">
            <VTooltip activator="parent" location="top">Delete</VTooltip>
            <VIcon icon="ri-delete-bin-line" />
          </IconBtn>
        </template>

        <template #no-data>
          <div class="text-center py-8 text-disabled">
            No transactions yet. Click "Add Transaction" to get started.
          </div>
        </template>
      </VDataTable>
    </VCard>

    <!-- Create / Edit Dialog -->
    <VDialog v-model="dialog" max-width="520" persistent>
      <VCard :title="editingTransaction ? 'Edit Transaction' : 'Add Transaction'">
        <VCardText>
          <VForm @submit.prevent="submit">
            <VRow>
              <VCol cols="12">
                <VRadioGroup
                  v-model="form.type"
                  inline
                  hide-details
                >
                  <VRadio
                    label="Expense"
                    value="expense"
                    color="error"
                    prepend-icon="ri-arrow-down-line"
                  />
                  <VRadio
                    label="Income"
                    value="income"
                    color="success"
                    prepend-icon="ri-arrow-up-line"
                  />
                </VRadioGroup>
              </VCol>

              <VCol cols="12" sm="6">
                <VTextField
                  v-model="form.amount"
                  label="Amount"
                  type="number"
                  step="0.01"
                  min="0.01"
                  prepend-inner-icon="ri-money-dollar-circle-line"
                  required
                />
              </VCol>

              <VCol cols="12" sm="6">
                <VTextField
                  v-model="form.date"
                  label="Date"
                  type="date"
                  required
                />
              </VCol>

              <VCol cols="12">
                <VSelect
                  v-model="form.category"
                  :items="categories"
                  label="Category"
                  prepend-inner-icon="ri-price-tag-3-line"
                  required
                />
              </VCol>

              <VCol cols="12">
                <VTextField
                  v-model="form.description"
                  label="Description (optional)"
                  prepend-inner-icon="ri-file-text-line"
                />
              </VCol>
            </VRow>
          </VForm>
        </VCardText>
        <VCardActions class="justify-end pa-4">
          <VBtn variant="text" @click="dialog = false">Cancel</VBtn>
          <VBtn
            color="primary"
            :loading="isSubmitting"
            @click="submit"
          >
            {{ editingTransaction ? 'Save' : 'Create' }}
          </VBtn>
        </VCardActions>
      </VCard>
    </VDialog>

    <!-- Delete Dialog -->
    <VDialog v-model="deleteDialog" max-width="400">
      <VCard title="Delete Transaction">
        <VCardText>
          Are you sure you want to delete this <strong>{{ deletingTransaction?.type === 'income' ? 'income' : 'expense' }}</strong> of <strong>{{ deletingTransaction ? formatCurrency(deletingTransaction.amount) : '' }}</strong>? This action cannot be undone.
        </VCardText>
        <VCardActions class="justify-end pa-4">
          <VBtn variant="text" @click="deleteDialog = false">Cancel</VBtn>
          <VBtn
            color="error"
            :loading="isSubmitting"
            @click="confirmDelete"
          >
            Delete
          </VBtn>
        </VCardActions>
      </VCard>
    </VDialog>
  </div>
</template>
