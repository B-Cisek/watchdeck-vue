<script setup lang="ts">
import { computed, reactive, ref, useTemplateRef, watch } from 'vue'
import * as z from 'zod'
import type { FormSubmitEvent } from '@nuxt/ui'
import { serviceGroups } from '@/api/serviceGroups'
import type { ServiceGroup } from '@/types/service'
import { fieldErrors } from '@/utils/violations'

const props = defineProps<{
  /** The group to rename; without it the form creates a new one. */
  group?: ServiceGroup
}>()

const emit = defineEmits<{ created: [group: ServiceGroup]; updated: [group: ServiceGroup] }>()
const open = defineModel<boolean>('open', { default: false })

const schema = z.object({
  name: z.string().trim().min(1, 'Name is required').max(100, 'Use 100 characters or fewer'),
})

type Schema = z.output<typeof schema>

const toast = useToast()
const form = useTemplateRef('form')
const state = reactive({ name: '' })
const failed = ref(false)

const copy = computed(() =>
  props.group
    ? {
        title: 'Rename group',
        description: 'Services in this group keep their place.',
        submit: 'Save',
        error: 'Could not rename the group. Please try again.',
      }
    : {
        title: 'New group',
        description: 'Groups keep related services together, such as a product or a team.',
        submit: 'Create group',
        error: 'Could not create the group. Please try again.',
      },
)

watch(open, (isOpen) => {
  if (isOpen) {
    state.name = props.group?.name ?? ''
    failed.value = false
  }
})

async function onSubmit({ data }: FormSubmitEvent<Schema>) {
  failed.value = false
  try {
    if (props.group) {
      const group = await serviceGroups.update(props.group.id, data)
      emit('updated', group)
      toast.add({
        title: 'Group renamed',
        description: group.name,
        icon: 'i-lucide-check',
        color: 'success',
      })
    } else {
      const group = await serviceGroups.create(data)
      emit('created', group)
      toast.add({
        title: 'Group created',
        description: group.name,
        icon: 'i-lucide-check',
        color: 'success',
      })
    }
    open.value = false
  } catch (e) {
    const errors = fieldErrors(e, ['name'])
    form.value?.setErrors(errors)
    failed.value = !errors.length
  }
}
</script>

<template>
  <UModal v-model:open="open" :title="copy.title" :description="copy.description">
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
          :title="copy.error"
        />

        <UFormField label="Name" name="name" required>
          <UInput v-model="state.name" placeholder="ecommerce" autofocus class="w-full" />
        </UFormField>

        <div class="flex justify-end gap-2">
          <UButton label="Cancel" color="neutral" variant="subtle" @click="open = false" />
          <UButton :label="copy.submit" type="submit" loading-auto />
        </div>
      </UForm>
    </template>
  </UModal>
</template>
