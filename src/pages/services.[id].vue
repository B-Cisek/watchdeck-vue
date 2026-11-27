<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import type { DropdownMenuItem } from '@nuxt/ui'
import { useMonitoring } from '@/composables/useMonitoring'
import { useServiceLogs } from '@/composables/useServiceLogs'
import type { Check } from '@/types/check'
import type { Service } from '@/types/service'
import { checksByService, serviceStatus } from '@/utils/checks'

const route = useRoute('/services.[id]')
const router = useRouter()

const { services, checks, status, load } = useMonitoring()
const checkModalOpen = ref(false)
const editedCheck = ref<Check>()
/** Only the logs of this container are shown; `null` for all of them. */
const logSourceId = ref<string | null>(null)
const deleteCheckModalOpen = ref(false)
const deletedCheck = ref<Check>()
const renameModalOpen = ref(false)
const deleteModalOpen = ref(false)
const logsModalOpen = ref(false)
const {
  sources: logSources,
  lines: logLines,
  status: logStatus,
  load: loadLogs,
  addSource: onLogSourceCreated,
} = useServiceLogs(() => route.params.id)

const service = computed(() => services.value.find(({ id }) => id === route.params.id))
const serviceChecks = computed(() => checksByService(checks.value).get(route.params.id) ?? [])
const overallStatus = computed(() => serviceStatus(serviceChecks.value))

const serviceMenuItems: DropdownMenuItem[][] = [
  [
    {
      label: 'Rename',
      icon: 'i-lucide-pencil',
      onSelect: () => {
        renameModalOpen.value = true
      },
    },
  ],
  [
    {
      label: 'Delete',
      icon: 'i-lucide-trash-2',
      color: 'error',
      onSelect: () => {
        deleteModalOpen.value = true
      },
    },
  ],
]

function onServiceRenamed(renamed: Service) {
  services.value = services.value.map((service) => (service.id === renamed.id ? renamed : service))
}

function addCheck() {
  editedCheck.value = undefined
  checkModalOpen.value = true
}

function editCheck(check: Check) {
  editedCheck.value = check
  checkModalOpen.value = true
}

function deleteCheck(check: Check) {
  deletedCheck.value = check
  deleteCheckModalOpen.value = true
}

function onCheckDeleted(deleted: Check) {
  checks.value = checks.value.filter(({ id }) => id !== deleted.id)
}

function onCheckSaved(saved: Check) {
  checks.value = checks.value.some(({ id }) => id === saved.id)
    ? checks.value.map((check) => (check.id === saved.id ? saved : check))
    : [...checks.value, saved]
}
</script>

<template>
  <UDashboardPanel id="service">
    <template #header>
      <UDashboardNavbar :title="service?.name ?? 'Service'" :ui="{ title: 'text-lg' }">
        <template #leading>
          <UDashboardSidebarCollapse />
          <UButton
            icon="i-lucide-arrow-left"
            color="neutral"
            variant="ghost"
            to="/services"
            aria-label="Back to services"
          />
        </template>

        <template #trailing>
          <ServicesStatusBadge v-if="overallStatus" :status="overallStatus" size="md" />
          <UBadge
            v-if="service?.group"
            :label="service.group.name"
            icon="i-lucide-folder"
            color="neutral"
            variant="subtle"
            size="md"
            class="hidden sm:inline-flex"
          />
        </template>

        <template #right>
          <UButton
            v-if="service"
            label="Add check"
            icon="i-lucide-plus"
            size="lg"
            @click="addCheck"
          />
          <UDropdownMenu v-if="service" :items="serviceMenuItems" :content="{ align: 'end' }">
            <UButton
              icon="i-lucide-ellipsis-vertical"
              color="neutral"
              variant="ghost"
              size="lg"
              :aria-label="`Actions for ${service.name}`"
            />
          </UDropdownMenu>
        </template>
      </UDashboardNavbar>
    </template>

    <template #body>
      <div v-if="status === 'loading'" class="space-y-4" role="status" aria-label="Loading service">
        <USkeleton class="h-7 w-36" />
        <div class="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          <USkeleton v-for="i in 3" :key="i" class="h-48" />
        </div>
      </div>

      <UEmpty
        size="lg"
        v-else-if="status === 'error'"
        role="alert"
        variant="naked"
        icon="i-lucide-circle-alert"
        title="Could not load the service"
        description="Check your connection and try again."
        :actions="[
          { label: 'Retry', icon: 'i-lucide-refresh-cw', color: 'neutral', onClick: load },
        ]"
      />

      <UEmpty
        size="lg"
        v-else-if="!service"
        variant="naked"
        icon="i-lucide-search-x"
        title="Service not found"
        description="It may have been removed."
        :actions="[
          { label: 'Back to services', color: 'neutral', variant: 'outline', to: '/services' },
        ]"
      />

      <template v-else>
        <section aria-labelledby="service-checks" class="space-y-3">
          <div class="flex items-center gap-2">
            <h2 id="service-checks" class="text-lg font-semibold text-highlighted">Checks</h2>
            <UBadge :label="serviceChecks.length" color="neutral" variant="subtle" size="md" />
          </div>

          <div v-if="serviceChecks.length" class="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            <ServicesCheckCard
              v-for="check in serviceChecks"
              :key="check.id"
              :check="check"
              @edit="editCheck(check)"
              @delete="deleteCheck(check)"
            />
          </div>

          <UEmpty
            size="lg"
            v-else
            icon="i-lucide-activity"
            title="No checks yet"
            :description="`Add a check to watch whether ${service.name} is up.`"
            :actions="[
              {
                label: 'Add check',
                icon: 'i-lucide-plus',
                onClick: addCheck,
              },
            ]"
          />
        </section>

        <section aria-labelledby="service-logs" class="space-y-3">
          <div class="flex items-center gap-2">
            <h2 id="service-logs" class="text-lg font-semibold text-highlighted">Logs</h2>
            <UBadge
              v-if="logStatus === 'ready'"
              :label="logSources.length"
              color="neutral"
              variant="subtle"
              size="md"
            />
            <UButton
              v-if="logStatus === 'ready' && logSources.length"
              label="Add logs"
              icon="i-lucide-plus"
              color="neutral"
              variant="subtle"
              size="md"
              class="ms-auto"
              @click="logsModalOpen = true"
            />
          </div>

          <USkeleton
            v-if="logStatus === 'loading'"
            class="h-96"
            role="status"
            aria-label="Loading logs"
          />

          <UAlert
            v-else-if="logStatus === 'error'"
            role="alert"
            color="error"
            variant="subtle"
            icon="i-lucide-circle-alert"
            title="Could not load the logs"
            :actions="[
              {
                label: 'Retry',
                icon: 'i-lucide-refresh-cw',
                color: 'neutral',
                variant: 'outline',
                onClick: loadLogs,
              },
            ]"
          />

          <UEmpty
            size="lg"
            v-else-if="!logSources.length"
            icon="i-lucide-scroll-text"
            title="No logs yet"
            description="Add a Docker container to see its logs here instead of over SSH."
            :actions="[
              {
                label: 'Add logs',
                icon: 'i-lucide-plus',
                onClick: () => {
                  logsModalOpen = true
                },
              },
            ]"
          />

          <template v-else>
            <ul class="flex flex-wrap gap-2" aria-label="Containers">
              <ServicesLogSource
                v-for="source in logSources"
                :key="source.id"
                :source="source"
                :selected="logSourceId === source.id"
                @toggle="logSourceId = logSourceId === source.id ? null : source.id"
              />
            </ul>
            <ServicesLogs :lines="logLines" :source-id="logSourceId" />
          </template>
        </section>
      </template>

      <ServicesCheckModal
        v-model:open="checkModalOpen"
        :service="service"
        :check="editedCheck"
        @saved="onCheckSaved"
      />
      <ServicesDeleteCheckModal
        v-model:open="deleteCheckModalOpen"
        :check="deletedCheck"
        @deleted="onCheckDeleted"
      />
      <ServicesAddLogsModal
        v-model:open="logsModalOpen"
        :service="service"
        @created="onLogSourceCreated"
      />
      <ServicesRenameModal
        v-model:open="renameModalOpen"
        :service="service"
        @renamed="onServiceRenamed"
      />
      <ServicesDeleteModal
        v-model:open="deleteModalOpen"
        :service="service"
        :check-count="serviceChecks.length"
        @deleted="router.push('/services')"
      />
    </template>
  </UDashboardPanel>
</template>
