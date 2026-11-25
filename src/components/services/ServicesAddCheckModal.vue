<script setup lang="ts">
import { reactive, ref, useTemplateRef, watch } from 'vue'
import type * as z from 'zod'
import type { FormSubmitEvent } from '@nuxt/ui'
import { checks } from '@/api/checks'
import type { Check, CheckTarget, HttpCheckMethod } from '@/types/check'
import type { Service } from '@/types/service'
import { checkSchema } from '@/utils/checks'
import { fieldErrors } from '@/utils/violations'

const props = defineProps<{ service?: Service }>()
const emit = defineEmits<{ created: [check: Check] }>()
const open = defineModel<boolean>('open', { default: false })

type Schema = z.output<typeof checkSchema>

const FIELDS = [
  'name',
  'type',
  'config.url',
  'config.method',
  'config.expectedStatus',
  'config.host',
  'config.port',
  'intervalSeconds',
  'timeoutSeconds',
] as const

const typeItems = [
  { label: 'HTTP', value: 'http', description: 'A URL answers with the expected status.' },
  { label: 'TCP', value: 'tcp', description: 'A port accepts connections.' },
]

const intervalItems = [
  { label: '30 seconds', value: 30 },
  { label: '1 minute', value: 60 },
  { label: '5 minutes', value: 300 },
  { label: '15 minutes', value: 900 },
  { label: '1 hour', value: 3600 },
]

const methodItems: HttpCheckMethod[] = ['GET', 'HEAD']

function initialState() {
  return {
    name: '',
    type: 'http' as CheckTarget['type'],
    config: {
      url: '',
      method: 'GET' as HttpCheckMethod,
      expectedStatus: 200,
      host: '',
      port: undefined as number | undefined,
    },
    intervalSeconds: 60,
    timeoutSeconds: 5,
  }
}

const toast = useToast()
const form = useTemplateRef('form')
const state = reactive(initialState())
const failed = ref(false)

watch(open, (isOpen) => {
  if (isOpen) {
    Object.assign(state, initialState())
    failed.value = false
  }
})

watch(
  () => state.type,
  () => form.value?.clear(),
)

async function onSubmit({ data }: FormSubmitEvent<Schema>) {
  const { service } = props
  if (!service) {
    return
  }

  failed.value = false
  try {
    const check = await checks.create(service.id, data)
    emit('created', check)
    open.value = false
    toast.add({
      title: 'Check added',
      description: `${check.name} in ${service.name}`,
      icon: 'i-lucide-check',
      color: 'success',
    })
  } catch (e) {
    const errors = fieldErrors(e, FIELDS)
    form.value?.setErrors(errors)
    failed.value = !errors.length
  }
}
</script>

<template>
  <UModal
    v-model:open="open"
    title="New check"
    :description="`Watch whether ${service?.name ?? 'the service'} is up.`"
  >
    <template #body>
      <!-- Validates on submit only, like login: a blur error shifts the layout mid-click. -->
      <UForm
        ref="form"
        :schema="checkSchema"
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
          title="Could not add the check. Please try again."
        />

        <UFormField label="Name" name="name" required>
          <UInput v-model="state.name" placeholder="Home page" autofocus class="w-full" />
        </UFormField>

        <UFormField label="Type" name="type">
          <URadioGroup
            v-model="state.type"
            :items="typeItems"
            variant="card"
            orientation="horizontal"
            :ui="{ fieldset: 'grid grid-cols-2 w-full', item: 'min-w-0' }"
          />
        </UFormField>

        <template v-if="state.type === 'http'">
          <UFormField label="URL" name="config.url" required>
            <UInput
              v-model="state.config.url"
              inputmode="url"
              placeholder="https://example.com/health"
              class="w-full"
            />
          </UFormField>

          <div class="grid grid-cols-2 gap-4">
            <UFormField label="Method" name="config.method">
              <USelect v-model="state.config.method" :items="methodItems" class="w-full" />
            </UFormField>
            <UFormField
              label="Expected status"
              name="config.expectedStatus"
              help="Redirects are not followed."
            >
              <UInputNumber
                v-model="state.config.expectedStatus"
                :min="100"
                :max="599"
                class="w-full"
              />
            </UFormField>
          </div>
        </template>

        <div v-if="state.type === 'tcp'" class="grid grid-cols-3 gap-4">
          <UFormField label="Host" name="config.host" required class="col-span-2">
            <UInput v-model="state.config.host" placeholder="shop-db" class="w-full" />
          </UFormField>
          <UFormField label="Port" name="config.port" required>
            <UInputNumber
              v-model="state.config.port"
              :min="1"
              :max="65535"
              :format-options="{ useGrouping: false }"
              :increment="false"
              :decrement="false"
              placeholder="5432"
              class="w-full"
            />
          </UFormField>
        </div>

        <div class="grid grid-cols-2 gap-4">
          <UFormField label="Check every" name="intervalSeconds">
            <USelect v-model="state.intervalSeconds" :items="intervalItems" class="w-full" />
          </UFormField>
          <UFormField label="Timeout (seconds)" name="timeoutSeconds">
            <UInputNumber v-model="state.timeoutSeconds" :min="1" :max="60" class="w-full" />
          </UFormField>
        </div>

        <div class="flex justify-end gap-2">
          <UButton label="Cancel" color="neutral" variant="subtle" @click="open = false" />
          <UButton label="Add check" type="submit" loading-auto />
        </div>
      </UForm>
    </template>
  </UModal>
</template>
