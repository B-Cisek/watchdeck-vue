<script setup lang="ts">
import { computed, reactive, ref, useTemplateRef, watch } from 'vue'
import * as z from 'zod'
import type { FormSubmitEvent } from '@nuxt/ui'
import { serviceGroups } from '@/api/serviceGroups'
import { services } from '@/api/services'
import type { Service, ServiceGroup } from '@/types/service'
import { fieldErrors } from '@/utils/violations'

const props = defineProps<{
  groups: ServiceGroup[]
  /** Group selected when the form opens. */
  groupId?: string
}>()

const emit = defineEmits<{
  created: [service: Service]
  groupCreated: [group: ServiceGroup]
}>()
const open = defineModel<boolean>('open', { default: false })

// The select's own clear button cannot be reached by keyboard, so no group is an option.
const NO_GROUP = 'none'

const schema = z.object({
  name: z.string().trim().min(1, 'Name is required').max(100, 'Use 100 characters or fewer'),
  groupId: z.string(),
})

type Schema = z.output<typeof schema>

const toast = useToast()
const form = useTemplateRef('form')
const state = reactive({ name: '', groupId: NO_GROUP })
const error = ref<string | null>(null)
const creatingGroup = ref(false)
const groupMenuOpen = ref(false)

const groupItems = computed(() => [
  { label: 'No group', value: NO_GROUP },
  ...props.groups
    .map(({ id, name }) => ({ label: name, value: id }))
    .sort((a, b) => a.label.localeCompare(b.label)),
])

watch(open, (isOpen) => {
  if (isOpen) {
    state.name = ''
    state.groupId = props.groupId ?? NO_GROUP
    error.value = null
  }
})

async function createGroup(name: string) {
  error.value = null
  form.value?.clear('groupId')
  groupMenuOpen.value = false
  creatingGroup.value = true
  try {
    const group = await serviceGroups.create({ name: name.trim() })
    emit('groupCreated', group)
    state.groupId = group.id
  } catch (e) {
    const errors = fieldErrors(e, ['name'])
    form.value?.setErrors(
      errors.map(({ message }) => ({ name: 'groupId', message })),
      'groupId',
    )
    error.value = errors.length ? null : 'Could not create the group. Please try again.'
  } finally {
    creatingGroup.value = false
  }
}

async function onSubmit({ data }: FormSubmitEvent<Schema>) {
  error.value = null
  try {
    const service = await services.create({
      name: data.name,
      groupId: data.groupId === NO_GROUP ? null : data.groupId,
    })
    emit('created', service)
    open.value = false
    toast.add({
      title: 'Service added',
      description: service.group ? `${service.name} in ${service.group.name}` : service.name,
      icon: 'i-lucide-check',
      color: 'success',
    })
  } catch (e) {
    const errors = fieldErrors(e, ['name', 'groupId'])
    form.value?.setErrors(errors)
    error.value = errors.length ? null : 'Could not add the service. Please try again.'
  }
}
</script>

<template>
  <UModal
    v-model:open="open"
    title="New service"
    description="Add a service you want to keep an eye on."
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
          v-if="error"
          role="alert"
          color="error"
          variant="subtle"
          icon="i-lucide-circle-alert"
          :title="error"
        />

        <UFormField label="Name" name="name" required>
          <UInput v-model="state.name" placeholder="Nike" autofocus class="w-full" />
        </UFormField>

        <UFormField
          label="Group"
          name="groupId"
          hint="Optional"
          help="Type a new name to create a group."
        >
          <USelectMenu
            v-model="state.groupId"
            v-model:open="groupMenuOpen"
            :items="groupItems"
            value-key="value"
            :search-input="{ placeholder: 'Search or create…' }"
            create-item
            :loading="creatingGroup"
            :disabled="creatingGroup"
            class="w-full"
            @create="createGroup"
          />
        </UFormField>

        <div class="flex justify-end gap-2">
          <UButton label="Cancel" color="neutral" variant="subtle" @click="open = false" />
          <UButton label="Add service" type="submit" loading-auto :disabled="creatingGroup" />
        </div>
      </UForm>
    </template>
  </UModal>
</template>
