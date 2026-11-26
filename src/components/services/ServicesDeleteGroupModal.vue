<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { serviceGroups } from '@/api/serviceGroups'
import type { ServiceGroup } from '@/types/service'
import { count } from '@/utils/text'

const props = defineProps<{
  group?: ServiceGroup
  /** How many services are in it. */
  serviceCount: number
}>()

const emit = defineEmits<{ deleted: [group: ServiceGroup] }>()
const open = defineModel<boolean>('open', { default: false })

const toast = useToast()
const failed = ref(false)

const description = computed(() =>
  props.serviceCount
    ? `Its ${count(props.serviceCount, 'service')} stay, without a group.`
    : 'It has no services.',
)

watch(open, (isOpen) => {
  if (isOpen) {
    failed.value = false
  }
})

async function onDelete() {
  const { group } = props
  if (!group) {
    return
  }
  failed.value = false
  try {
    await serviceGroups.remove(group.id)
    emit('deleted', group)
    open.value = false
    toast.add({
      title: 'Group deleted',
      description: group.name,
      icon: 'i-lucide-trash-2',
      color: 'success',
    })
  } catch {
    failed.value = true
  }
}
</script>

<template>
  <UModal v-model:open="open" :title="`Delete ${group?.name}?`" :description="description">
    <template #body>
      <div class="space-y-4">
        <UAlert
          v-if="failed"
          role="alert"
          color="error"
          variant="subtle"
          icon="i-lucide-circle-alert"
          title="Could not delete the group. Please try again."
        />

        <div class="flex justify-end gap-2">
          <UButton label="Cancel" color="neutral" variant="subtle" @click="open = false" />
          <UButton label="Delete" color="error" loading-auto @click="onDelete" />
        </div>
      </div>
    </template>
  </UModal>
</template>
