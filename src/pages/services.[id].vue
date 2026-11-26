<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useMonitoring } from '@/composables/useMonitoring'
import { sampleLogs } from '@/mocks/logs'
import type { Check } from '@/types/check'
import type { Service } from '@/types/service'
import { checksByService, serviceStatus } from '@/utils/checks'

const route = useRoute('/services.[id]')
const router = useRouter()

const { services, checks, status, load } = useMonitoring()
const checkModalOpen = ref(false)
const renameModalOpen = ref(false)
const deleteModalOpen = ref(false)
const logLines = sampleLogs()

const service = computed(() => services.value.find(({ id }) => id === route.params.id))
const serviceChecks = computed(() => checksByService(checks.value).get(route.params.id) ?? [])
const overallStatus = computed(() => serviceStatus(serviceChecks.value))

function onServiceRenamed(renamed: Service) {
  services.value = services.value.map((service) => (service.id === renamed.id ? renamed : service))
}

function onCheckCreated(check: Check) {
  checks.value = [...checks.value, check]
}
</script>

<template>
  <UDashboardPanel id="service">
    <template #header>
      <UDashboardNavbar :title="service?.name ?? 'Service'">
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
          <ServicesStatusBadge v-if="overallStatus" :status="overallStatus" />
          <UBadge
            v-if="service?.group"
            :label="service.group.name"
            icon="i-lucide-folder"
            color="neutral"
            variant="subtle"
            size="sm"
            class="hidden sm:inline-flex"
          />
        </template>

        <template #right>
          <UTooltip v-if="service" :text="`Rename ${service.name}`">
            <UButton
              icon="i-lucide-pencil"
              color="neutral"
              variant="ghost"
              :aria-label="`Rename ${service.name}`"
              @click="renameModalOpen = true"
            />
          </UTooltip>
          <UTooltip v-if="service" :text="`Delete ${service.name}`">
            <UButton
              icon="i-lucide-trash-2"
              color="neutral"
              variant="ghost"
              :aria-label="`Delete ${service.name}`"
              @click="deleteModalOpen = true"
            />
          </UTooltip>
          <UButton
            v-if="service"
            label="Add check"
            icon="i-lucide-plus"
            @click="checkModalOpen = true"
          />
        </template>
      </UDashboardNavbar>
    </template>

    <template #body>
      <div v-if="status === 'loading'" class="space-y-4" role="status" aria-label="Loading service">
        <USkeleton class="h-6 w-32" />
        <div class="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          <USkeleton v-for="i in 3" :key="i" class="h-40" />
        </div>
      </div>

      <UEmpty
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
            <h2 id="service-checks" class="font-semibold text-highlighted">Checks</h2>
            <UBadge :label="serviceChecks.length" color="neutral" variant="subtle" size="sm" />
          </div>

          <div v-if="serviceChecks.length" class="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            <ServicesCheckCard v-for="check in serviceChecks" :key="check.id" :check="check" />
          </div>

          <UEmpty
            v-else
            icon="i-lucide-activity"
            title="No checks yet"
            :description="`Add a check to watch whether ${service.name} is up.`"
            :actions="[
              {
                label: 'Add check',
                icon: 'i-lucide-plus',
                onClick: () => {
                  checkModalOpen = true
                },
              },
            ]"
          />
        </section>

        <section aria-labelledby="service-logs" class="space-y-3">
          <div class="flex items-center gap-2">
            <h2 id="service-logs" class="font-semibold text-highlighted">Logs</h2>
            <UBadge label="Sample data" color="warning" variant="subtle" size="sm" />
          </div>
          <ServicesLogs :lines="logLines" />
        </section>
      </template>

      <ServicesAddCheckModal
        v-model:open="checkModalOpen"
        :service="service"
        @created="onCheckCreated"
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
