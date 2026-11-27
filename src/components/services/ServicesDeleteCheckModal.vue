<script setup lang="ts">
import { ref, watch } from 'vue'
import { checks } from '@/api/checks'
import type { Check } from '@/types/check'

const props = defineProps<{ check?: Check }>()

const emit = defineEmits<{ deleted: [check: Check] }>()
const open = defineModel<boolean>('open', { default: false })

const toast = useToast()
const failed = ref(false)

watch(open, (isOpen) => {
  if (isOpen) {
    failed.value = false
  }
})

async function onDelete() {
  const { check } = props
  if (!check) {
    return
  }
  failed.value = false
  try {
    await checks.remove(check.id)
    emit('deleted', check)
    open.value = false
    toast.add({
      title: 'Check deleted',
      description: check.name,
      icon: 'i-lucide-trash-2',
      color: 'success',
    })
  } catch {
    failed.value = true
  }
}
</script>

<template>
  <UModal
    v-model:open="open"
    :title="`Delete ${check?.name}?`"
    description="Its history goes with it. To stop it for a while, pause it instead. This cannot be undone."
  >
    <template #body>
      <div class="space-y-4">
        <UAlert
          v-if="failed"
          role="alert"
          color="error"
          variant="subtle"
          icon="i-lucide-circle-alert"
          title="Could not delete the check. Please try again."
        />

        <div class="flex justify-end gap-2">
          <UButton label="Cancel" color="neutral" variant="subtle" @click="open = false" />
          <UButton label="Delete" color="error" loading-auto @click="onDelete" />
        </div>
      </div>
    </template>
  </UModal>
</template>
