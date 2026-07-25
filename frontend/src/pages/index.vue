<script setup lang="ts">
import { onMounted } from 'vue'
import { useSEO } from '@/composables/useSEO'
import { useTransactionStore } from '@/stores/use-transaction-store'
import { useUserStore } from '@/stores/use-user-store'

useSEO({
  title: 'Dashboard - NgernNgern ThongThong',
  description: 'Personal finance tracking dashboard.',
  keywords: ['finance', 'income', 'expenses', 'tracking'],
})

const transactionStore = useTransactionStore()
const userStore = useUserStore()

function formatCurrency(amount: number) {
  return new Intl.NumberFormat('th-TH', { style: 'currency', currency: 'THB' }).format(amount)
}

onMounted(async () => {
  await Promise.all([
    userStore.fetchUsers(),
    transactionStore.fetchTransactions(),
    transactionStore.fetchSummary(),
  ])
})
</script>

<template>
  <div>
    <h1 class="text-h5 font-weight-bold mb-6">Dashboard</h1>

    <!-- Finance Summary -->
    <VRow class="mb-6">
      <VCol cols="12" sm="6" lg="3">
        <VCard>
          <VCardText class="d-flex align-center gap-3">
            <VAvatar color="success" variant="tonal" size="48">
              <VIcon icon="ri-arrow-up-line" size="24" />
            </VAvatar>
            <div>
              <div class="text-caption text-medium-emphasis">Total Income</div>
              <div class="text-h5 font-weight-bold text-success">{{ formatCurrency(transactionStore.summary.totalIncome) }}</div>
            </div>
          </VCardText>
        </VCard>
      </VCol>
      <VCol cols="12" sm="6" lg="3">
        <VCard>
          <VCardText class="d-flex align-center gap-3">
            <VAvatar color="error" variant="tonal" size="48">
              <VIcon icon="ri-arrow-down-line" size="24" />
            </VAvatar>
            <div>
              <div class="text-caption text-medium-emphasis">Total Expenses</div>
              <div class="text-h5 font-weight-bold text-error">{{ formatCurrency(transactionStore.summary.totalExpense) }}</div>
            </div>
          </VCardText>
        </VCard>
      </VCol>
      <VCol cols="12" sm="6" lg="3">
        <VCard>
          <VCardText class="d-flex align-center gap-3">
            <VAvatar
              :color="transactionStore.summary.balance >= 0 ? 'primary' : 'warning'"
              variant="tonal"
              size="48"
            >
              <VIcon icon="ri-wallet-3-line" size="24" />
            </VAvatar>
            <div>
              <div class="text-caption text-medium-emphasis">Balance</div>
              <div
                class="text-h5 font-weight-bold"
                :class="transactionStore.summary.balance >= 0 ? 'text-primary' : 'text-warning'"
              >
                {{ formatCurrency(transactionStore.summary.balance) }}
              </div>
            </div>
          </VCardText>
        </VCard>
      </VCol>
      <VCol cols="12" sm="6" lg="3">
        <VCard>
          <VCardText class="d-flex align-center gap-3">
            <VAvatar color="info" variant="tonal" size="48">
              <VIcon icon="ri-list-check" size="24" />
            </VAvatar>
            <div>
              <div class="text-caption text-medium-emphasis">Transactions</div>
              <div class="text-h5 font-weight-bold">{{ transactionStore.summary.transactionCount }}</div>
            </div>
          </VCardText>
        </VCard>
      </VCol>
    </VRow>

    <!-- Recent Transactions -->
    <VRow>
      <VCol cols="12" md="6">
        <VCard title="Recent Transactions">
          <VList lines="two">
            <VListItem
              v-for="tx in transactionStore.transactions.slice(0, 5)"
              :key="tx.id"
            >
              <template #prepend>
                <VAvatar
                  :color="tx.type === 'income' ? 'success' : 'error'"
                  variant="tonal"
                  size="36"
                >
                  <VIcon
                    :icon="tx.type === 'income' ? 'ri-arrow-up-line' : 'ri-arrow-down-line'"
                    size="18"
                  />
                </VAvatar>
              </template>
              <VListItemTitle>
                <span class="font-weight-medium">{{ tx.category }}</span>
                <span
                  class="float-right font-weight-bold"
                  :class="tx.type === 'income' ? 'text-success' : 'text-error'"
                >
                  {{ tx.type === 'income' ? '+' : '-' }}{{ formatCurrency(tx.amount) }}
                </span>
              </VListItemTitle>
              <VListItemSubtitle>{{ tx.description || tx.category }} · {{ new Date(tx.date).toLocaleDateString('th-TH') }}</VListItemSubtitle>
            </VListItem>
            <VListItem v-if="transactionStore.transactions.length === 0" class="text-center text-medium-emphasis py-4">
              No transactions yet.
            </VListItem>
          </VList>
          <VCardActions>
            <RouterLink :to="{ name: 'transaction-page' }">
              <VBtn variant="text" size="small">View all transactions</VBtn>
            </RouterLink>
          </VCardActions>
        </VCard>
      </VCol>
      <VCol cols="12" md="6">
        <VCard title="Recent Users">
          <VList lines="two">
            <VListItem
              v-for="user in userStore.users.slice(0, 5)"
              :key="user.id"
            >
              <template #prepend>
                <VAvatar color="primary" variant="tonal" size="36">
                  <VIcon icon="ri-user-3-line" size="18" />
                </VAvatar>
              </template>
              <VListItemTitle>{{ user.name }}</VListItemTitle>
              <VListItemSubtitle>{{ user.email }}</VListItemSubtitle>
            </VListItem>
            <VListItem v-if="userStore.users.length === 0" class="text-center text-medium-emphasis py-4">
              No users yet.
            </VListItem>
          </VList>
          <VCardActions>
            <RouterLink :to="{ name: 'user-page' }">
              <VBtn variant="text" size="small">View all users</VBtn>
            </RouterLink>
          </VCardActions>
        </VCard>
      </VCol>
    </VRow>
  </div>
</template>
