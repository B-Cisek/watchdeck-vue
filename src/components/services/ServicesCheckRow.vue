<script setup lang="ts">
import type { Check } from '@/types/check'
import { checkTarget } from '@/utils/checks'

defineProps<{ check: Check }>()
</script>

<template>
  <div class="flex items-center gap-3 text-base">
    <ServicesStatusBadge :status="check.enabled ? check.status : 'paused'" size="md" />
    <span class="shrink-0 max-w-48 truncate text-default">{{ check.name }}</span>
    <span class="min-w-0 truncate text-muted" :title="checkTarget(check)">
      {{ checkTarget(check) }}
    </span>
    <ServicesCheckedAt
      v-if="check.enabled"
      :last-checked-at="check.lastCheckedAt"
      class="ms-auto hidden shrink-0 text-sm text-dimmed sm:inline"
    />
  </div>
</template>
