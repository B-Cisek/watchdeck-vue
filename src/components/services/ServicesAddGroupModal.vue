<script setup lang="ts">
import { reactive, ref, useTemplateRef, watch } from 'vue'
import * as z from 'zod'
import type { FormSubmitEvent } from '@nuxt/ui'
import { serviceGroups } from '@/api/serviceGroups'
import type { ServiceGroup } from '@/types/service'
import { fieldErrors } from '@/utils/violations'

const emit = defineEmits<{ created: [group: ServiceGroup] }>()
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
    state.name = ''
    failed.value = false
  }
})

async function onSubmit({ data }: FormSubmitEvent<Schema>) {
  failed.value = false
  try {
    const group = await serviceGroups.create(data)
    emit('created', group)
    open.value = false
    toast.add({
      title: 'Group created',
      description: group.name,
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
    title="New group"
    description="Groups keep related services together, such as a product or a team."
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
          title="Could not create the group. Please try again."
        />

        <UFormField label="Name" name="name" required>
          <UInput v-model="state.name" placeholder="ecommerce" autofocus class="w-full" />
        </UFormField>

        <div class="flex justify-end gap-2">
          <UButton label="Cancel" color="neutral" variant="subtle" @click="open = false" />
          <UButton label="Create group" type="submit" loading-auto />
        </div>
      </UForm>
    </template>
  </UModal>
</template>
