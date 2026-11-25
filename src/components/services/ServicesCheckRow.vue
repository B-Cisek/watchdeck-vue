<script setup lang="ts">
import type { Check } from '@/types/check'
import { checkTarget } from '@/utils/checks'

defineProps<{ check: Check }>()
</script>

<template>
  <div class="flex items-center gap-3 text-sm">
    <ServicesStatusBadge :status="check.status" />
    <span class="shrink-0 max-w-40 truncate text-default">{{ check.name }}</span>
    <span class="min-w-0 truncate text-muted" :title="checkTarget(check)">
      {{ checkTarget(check) }}
    </span>
    <ServicesCheckedAt
      :last-checked-at="check.lastCheckedAt"
      class="ms-auto hidden shrink-0 text-xs text-dimmed sm:inline"
    />
  </div>
</template>
