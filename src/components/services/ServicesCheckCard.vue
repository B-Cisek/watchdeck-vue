<script setup lang="ts">
import { computed } from 'vue'
import type { DropdownMenuItem } from '@nuxt/ui'
import type { Check } from '@/types/check'
import { checkTarget, formatSeconds } from '@/utils/checks'

const props = defineProps<{ check: Check }>()
const emit = defineEmits<{ edit: []; delete: [] }>()

const details = computed(() => {
  const { check } = props
  return [
    check.type === 'http'
      ? { label: 'Expects', value: `${check.config.method} → ${check.config.expectedStatus}` }
      : { label: 'Expects', value: 'Open port' },
    { label: 'Every', value: formatSeconds(check.intervalSeconds) },
    { label: 'Timeout', value: formatSeconds(check.timeoutSeconds) },
  ]
})

const menuItems: DropdownMenuItem[][] = [
  [{ label: 'Edit', icon: 'i-lucide-pencil', onSelect: () => emit('edit') }],
  [{ label: 'Delete', icon: 'i-lucide-trash-2', color: 'error', onSelect: () => emit('delete') }],
]
</script>

<template>
  <UCard
    as="article"
    :aria-label="check.name"
    variant="subtle"
    :ui="{ body: 'p-4 sm:p-4 space-y-3' }"
  >
    <div class="flex items-center gap-2">
      <h3 class="min-w-0 truncate text-base font-semibold text-highlighted">{{ check.name }}</h3>
      <UBadge :label="check.type.toUpperCase()" color="neutral" variant="outline" size="md" />
      <ServicesStatusBadge
        :status="check.enabled ? check.status : 'paused'"
        size="md"
        class="ms-auto"
      />
      <UDropdownMenu :items="menuItems" :content="{ align: 'end' }">
        <UButton
          icon="i-lucide-ellipsis-vertical"
          color="neutral"
          variant="ghost"
          size="sm"
          class="-me-1.5"
          :aria-label="`Actions for ${check.name}`"
        />
      </UDropdownMenu>
    </div>

    <p class="truncate text-base text-muted" :title="checkTarget(check)">
      {{ checkTarget(check) }}
    </p>

    <dl class="flex flex-wrap gap-x-6 gap-y-2 text-base">
      <div v-for="{ label, value } in details" :key="label">
        <dt class="text-sm text-muted">{{ label }}</dt>
        <dd class="text-default">{{ value }}</dd>
      </div>
    </dl>

    <p v-if="!check.enabled" class="text-sm text-muted">Paused, not checked until resumed</p>
    <ServicesCheckedAt
      v-else
      :last-checked-at="check.lastCheckedAt"
      class="block text-sm text-muted first-letter:uppercase"
    />
  </UCard>
</template>
