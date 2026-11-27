<script setup lang="ts">
import { computed } from 'vue'
import type { Check } from '@/types/check'
import type { ServiceSection } from '@/types/service'

const props = defineProps<{
  section: ServiceSection
  /** Checks by the id of their service. */
  checks: Map<string, Check[]>
}>()
defineEmits<{ add: [] }>()

const name = computed(() => props.section.group?.name ?? 'Ungrouped')
</script>

<template>
  <UCard
    as="section"
    :aria-label="name"
    variant="subtle"
    :ui="{ header: 'flex items-center gap-2 min-h-14 px-4 py-2 sm:px-4', body: 'p-0 sm:p-0' }"
  >
    <template #header>
      <UIcon
        :name="section.group ? 'i-lucide-folder' : 'i-lucide-folder-x'"
        class="size-5 shrink-0 text-muted"
      />
      <h2 class="min-w-0 truncate text-base font-semibold text-highlighted">{{ name }}</h2>
      <UBadge :label="section.services.length" color="neutral" variant="subtle" size="md" />

      <UTooltip v-if="section.group" :text="`Add service to ${name}`">
        <UButton
          icon="i-lucide-plus"
          color="neutral"
          variant="ghost"
          size="md"
          class="ms-auto"
          :aria-label="`Add service to ${name}`"
          @click="$emit('add')"
        />
      </UTooltip>
    </template>

    <ul v-if="section.services.length" class="divide-y divide-default">
      <li v-for="service in section.services" :key="service.id" class="px-4 py-2">
        <div class="flex items-center gap-3 min-h-9">
          <UIcon name="i-lucide-server" class="size-5 shrink-0 text-dimmed" />
          <ULink
            :to="`/services/${service.id}`"
            class="min-w-0 truncate text-base font-medium text-highlighted hover:underline"
          >
            {{ service.name }}
          </ULink>
        </div>

        <ul
          v-if="checks.get(service.id)?.length"
          :aria-label="`Checks of ${service.name}`"
          class="space-y-2 ps-8 pt-1 pb-2"
        >
          <li v-for="check in checks.get(service.id)" :key="check.id">
            <ServicesCheckRow :check="check" />
          </li>
        </ul>
      </li>
    </ul>

    <div v-else class="flex flex-wrap items-center gap-x-3 gap-y-1 px-4 py-3 text-base text-muted">
      No services in this group yet.
      <UButton label="Add service" variant="link" size="lg" class="p-0" @click="$emit('add')" />
    </div>
  </UCard>
</template>
