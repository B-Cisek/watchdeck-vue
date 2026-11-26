<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { services } from '@/api/services'
import type { Service } from '@/types/service'
import { count } from '@/utils/text'

const props = defineProps<{
  service?: Service
  /** How many checks go with it. */
  checkCount: number
}>()

const emit = defineEmits<{ deleted: [service: Service] }>()
const open = defineModel<boolean>('open', { default: false })

const toast = useToast()
const failed = ref(false)

const description = computed(() =>
  props.checkCount
    ? `This also deletes ${count(props.checkCount, 'check')} and their history. This cannot be undone.`
    : 'This cannot be undone.',
)

watch(open, (isOpen) => {
  if (isOpen) {
    failed.value = false
  }
})

async function onDelete() {
  const { service } = props
  if (!service) {
    return
  }
  failed.value = false
  try {
    await services.remove(service.id)
    emit('deleted', service)
    open.value = false
    toast.add({
      title: 'Service deleted',
      description: service.name,
      icon: 'i-lucide-trash-2',
      color: 'success',
    })
  } catch {
    failed.value = true
  }
}
</script>

<template>
  <UModal v-model:open="open" :title="`Delete ${service?.name}?`" :description="description">
    <template #body>
      <div class="space-y-4">
        <UAlert
          v-if="failed"
          role="alert"
          color="error"
          variant="subtle"
          icon="i-lucide-circle-alert"
          title="Could not delete the service. Please try again."
        />

        <div class="flex justify-end gap-2">
          <UButton label="Cancel" color="neutral" variant="subtle" @click="open = false" />
          <UButton label="Delete" color="error" loading-auto @click="onDelete" />
        </div>
      </div>
    </template>
  </UModal>
</template>
