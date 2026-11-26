<script setup lang="ts">
import { computed, reactive, ref, useTemplateRef, watch } from 'vue'
import type * as z from 'zod'
import type { FormSubmitEvent } from '@nuxt/ui'
import { useClipboard } from '@vueuse/core'
import { logs } from '@/api/logs'
import type { AddedLogSource, LogSource } from '@/types/log'
import type { Service } from '@/types/service'
import { logSourceSchema } from '@/utils/logs'
import { fieldErrors } from '@/utils/violations'

const props = defineProps<{ service?: Service }>()
const emit = defineEmits<{ created: [source: LogSource] }>()
const open = defineModel<boolean>('open', { default: false })

type Schema = z.output<typeof logSourceSchema>

const COMPOSE = `services:
  vector:
    image: timberio/vector:latest-alpine
    container_name: vector
    restart: unless-stopped
    command: ["--config-dir", "/etc/vector/conf.d", "--watch-config"]
    volumes:
      - /var/run/docker.sock:/var/run/docker.sock:ro
      - ./conf.d:/etc/vector/conf.d:ro
      - vector_data:/var/lib/vector

volumes:
  vector_data:
`

const toast = useToast()
const form = useTemplateRef('form')
const state = reactive({ containerName: '', host: '' })
const failed = ref(false)
const added = ref<AddedLogSource | null>(null)
const { copy, copied } = useClipboard({ legacy: true })

const description = computed(() =>
  added.value
    ? `Put this file on the server that runs ${added.value.logSource.containerName}.`
    : `Show the logs of a Docker container in ${props.service?.name ?? 'the service'}.`,
)

watch(open, (isOpen) => {
  if (isOpen) {
    Object.assign(state, { containerName: '', host: '' })
    failed.value = false
    added.value = null
  }
})

async function onSubmit({ data }: FormSubmitEvent<Schema>) {
  const { service } = props
  if (!service) {
    return
  }

  failed.value = false
  try {
    added.value = await logs.addSource(service.id, data)
    emit('created', added.value.logSource)
    toast.add({
      title: 'Logs added',
      description: `${added.value.logSource.containerName} in ${service.name}`,
      icon: 'i-lucide-check',
      color: 'success',
    })
  } catch (e) {
    const errors = fieldErrors(e, ['containerName', 'host'] as const)
    form.value?.setErrors(errors)
    failed.value = !errors.length
  }
}

function download({ fileName, content }: AddedLogSource['vectorConfig']) {
  const url = URL.createObjectURL(new Blob([content], { type: 'application/yaml' }))
  const link = Object.assign(document.createElement('a'), { href: url, download: fileName })
  link.click()
  URL.revokeObjectURL(url)
}
</script>

<template>
  <UModal
    v-model:open="open"
    :title="added ? 'Send the logs with Vector' : 'Add logs'"
    :description="description"
    :ui="{ content: added ? 'sm:max-w-2xl' : undefined }"
  >
    <template #body>
      <div v-if="added" class="space-y-4">
        <ol class="list-decimal space-y-1 ps-5 text-sm text-default">
          <li>
            Save it as
            <code class="text-highlighted">conf.d/{{ added.vectorConfig.fileName }}</code> next to
            Vector's <code>compose.yaml</code>.
          </li>
          <li>Vector picks it up on its own, no restart needed.</li>
          <li>New lines show up here a few seconds after the container writes them.</li>
        </ol>

        <div class="relative">
          <pre
            class="max-h-72 overflow-auto rounded-lg bg-elevated/50 p-3 font-mono text-xs text-default ring ring-default"
            :aria-label="added.vectorConfig.fileName"
            >{{ added.vectorConfig.content }}</pre>
        </div>

        <UCollapsible class="space-y-2">
          <UButton
            label="No Vector on this server yet?"
            color="neutral"
            variant="link"
            trailing-icon="i-lucide-chevron-down"
            class="px-0"
          />
          <template #content>
            <p class="text-sm text-muted">
              Save this as <code>compose.yaml</code>, create <code>conf.d/</code> next to it and run
              <code>docker compose up -d</code>.
            </p>
            <pre
              class="mt-2 overflow-auto rounded-lg bg-elevated/50 p-3 font-mono text-xs text-default ring ring-default"
              >{{ COMPOSE }}</pre>
          </template>
        </UCollapsible>

        <div class="flex flex-wrap justify-end gap-2">
          <UButton
            :label="copied ? 'Copied' : 'Copy'"
            :icon="copied ? 'i-lucide-check' : 'i-lucide-copy'"
            color="neutral"
            variant="subtle"
            @click="copy(added.vectorConfig.content)"
          />
          <UButton
            label="Download"
            icon="i-lucide-download"
            color="neutral"
            variant="subtle"
            @click="download(added.vectorConfig)"
          />
          <UButton label="Done" @click="open = false" />
        </div>
      </div>

      <!-- Validates on submit only, like the other forms. -->
      <UForm
        v-else
        ref="form"
        :schema="logSourceSchema"
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
          title="Could not add the logs. Please try again."
        />

        <UFormField
          label="Container name"
          name="containerName"
          help="Exactly as docker ps shows it, e.g. shop-app-1 for Compose."
          required
        >
          <UInput v-model="state.containerName" placeholder="shop-app-1" autofocus class="w-full" />
        </UFormField>

        <UFormField label="Server" name="host" help="Only a label, to tell servers apart.">
          <UInput v-model="state.host" placeholder="vps-1" class="w-full" />
        </UFormField>

        <div class="flex justify-end gap-2">
          <UButton label="Cancel" color="neutral" variant="subtle" @click="open = false" />
          <UButton label="Add logs" type="submit" loading-auto />
        </div>
      </UForm>
    </template>
  </UModal>
</template>
