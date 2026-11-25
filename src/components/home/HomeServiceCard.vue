<script setup lang="ts">
import { computed } from 'vue'
import type { ServiceOverview } from '@/utils/overview'
import { count } from '@/utils/text'

const props = defineProps<{ item: ServiceOverview }>()

const details = computed(() => {
  const { service, up, total } = props.item
  const checks = total ? `${up} of ${count(total, 'check')} up` : null
  return [service.group?.name, checks].filter(Boolean).join(' · ')
})
</script>

<template>
  <ULink
    :to="`/services/${item.service.id}`"
    class="flex flex-col gap-1 rounded-lg bg-elevated/50 p-4 ring ring-default hover:bg-elevated"
  >
    <span class="flex items-center gap-2">
      <span class="min-w-0 truncate text-sm font-semibold text-highlighted">
        {{ item.service.name }}
      </span>
      <HomeStateBadge :state="item.state" class="ms-auto" />
    </span>
    <span class="min-h-5 truncate text-sm text-muted">{{ details }}</span>
  </ULink>
</template>
