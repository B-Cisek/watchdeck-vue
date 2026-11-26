<script setup lang="ts">
import { reactive, ref, useTemplateRef, watch } from 'vue'
import * as z from 'zod'
import type { FormSubmitEvent } from '@nuxt/ui'
import { services } from '@/api/services'
import type { Service } from '@/types/service'
import { fieldErrors } from '@/utils/violations'

const props = defineProps<{ service?: Service }>()

const emit = defineEmits<{ renamed: [service: Service] }>()
const open = defineModel<boolean>('open', { default: false })

const schema = z.object({
  name: z.string().trim().min(1, 'Name is required').max(100, 'Use 100 characters or fewer'),
})

type Schema = z.output<typeof schema>

const toast = useToast()
const form = useTemplateRef('form')
const state = reactive({ name: '' })
const failed = ref(false)

watch(open, (isOpen) => {
  if (isOpen) {
    state.name = props.service?.name ?? ''
    failed.value = false
  }
})

async function onSubmit({ data }: FormSubmitEvent<Schema>) {
  if (!props.service) {
    return
  }
  failed.value = false
  try {
    const service = await services.rename(props.service.id, data.name)
    emit('renamed', service)
    open.value = false
    toast.add({
      title: 'Service renamed',
      description: service.name,
      icon: 'i-lucide-check',
      color: 'success',
    })
  } catch (e) {
    const errors = fieldErrors(e, ['name'])
    form.value?.setErrors(errors)
    failed.value = !errors.length
  }
}
</script>

<template>
  <UModal
    v-model:open="open"
    title="Rename service"
    description="Its checks and history stay as they are."
  >
    <template #body>
      <!-- Validates on submit only, like login: a blur error shifts the layout mid-click. -->
      <UForm
        ref="form"
        :schema="schema"
        :state="state"
        :validate-on="[]"
        class="space-y-4"
        @submit="onSubmit"
      >
        <UAlert
          v-if="failed"
          role="alert"
          color="error"
          variant="subtle"
          icon="i-lucide-circle-alert"
          title="Could not rename the service. Please try again."
        />

        <UFormField label="Name" name="name" required>
          <UInput v-model="state.name" placeholder="Nike" autofocus class="w-full" />
        </UFormField>

        <div class="flex justify-end gap-2">
          <UButton label="Cancel" color="neutral" variant="subtle" @click="open = false" />
          <UButton label="Save" type="submit" loading-auto />
        </div>
      </UForm>
    </template>
  </UModal>
</template>
