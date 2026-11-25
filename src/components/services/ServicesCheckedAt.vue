<script setup lang="ts">
import { useTimeAgo } from '@vueuse/core'

const props = defineProps<{ lastCheckedAt: string | null }>()

const timeAgo = useTimeAgo(() => props.lastCheckedAt ?? Date.now(), {
  showSecond: true,
  updateInterval: 1000,
})
</script>

<template>
  <span>{{ lastCheckedAt ? `checked ${timeAgo}` : 'not checked yet' }}</span>
</template>
