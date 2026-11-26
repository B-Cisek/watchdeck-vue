<script setup lang="ts">
import { computed, ref } from 'vue'
import { checks as checksApi } from '@/api/checks'
import { serviceGroups } from '@/api/serviceGroups'
import { services as servicesApi } from '@/api/services'
import { useCheckRefresh } from '@/composables/useCheckRefresh'
import type { Check } from '@/types/check'
import type { Service, ServiceGroup } from '@/types/service'
import { checksByService } from '@/utils/checks'
import { groupServices } from '@/utils/services'
import { count } from '@/utils/text'

const services = ref<Service[]>([])
const groups = ref<ServiceGroup[]>([])
const checks = ref<Check[]>([])
const status = ref<'loading' | 'ready' | 'error'>('loading')

const search = ref('')
const groupModalOpen = ref(false)
const serviceModalOpen = ref(false)
const serviceModalGroupId = ref<string>()
const checkModalOpen = ref(false)
const checkModalService = ref<Service>()

const sections = computed(() => groupServices(services.value, groups.value, search.value))
const serviceChecks = computed(() => checksByService(checks.value))
const isEmpty = computed(() => !services.value.length && !groups.value.length)
const summary = computed(
  () => `${count(services.value.length, 'service')} · ${count(groups.value.length, 'group')}`,
)

async function load() {
  status.value = 'loading'
  try {
    const [serviceList, groupList, checkList] = await Promise.all([
      servicesApi.list(),
      serviceGroups.list(),
      checksApi.list(),
    ])
    services.value = serviceList
    groups.value = groupList
    checks.value = checkList
    status.value = 'ready'
  } catch {
    status.value = 'error'
  }
}

function addService(groupId?: string) {
  serviceModalGroupId.value = groupId
  serviceModalOpen.value = true
}

function onServiceCreated(service: Service) {
  services.value.push(service)
  // An active search could hide what was just added.
  search.value = ''
}

function addCheck(service: Service) {
  checkModalService.value = service
  checkModalOpen.value = true
}

function onCheckCreated(check: Check) {
  checks.value = [...checks.value, check]
}

function onGroupCreated(group: ServiceGroup) {
  groups.value.push(group)
  search.value = ''
}

load()
useCheckRefresh(checks, () => status.value === 'ready')
</script>

<template>
  <UDashboardPanel id="services">
    <template #header>
      <UDashboardNavbar title="Services">
        <template #leading>
          <UDashboardSidebarCollapse />
        </template>

        <template #right>
          <UButton
            label="New group"
            icon="i-lucide-folder-plus"
            color="neutral"
            variant="outline"
            aria-label="New group"
            :disabled="status !== 'ready'"
            :ui="{ label: 'hidden sm:inline' }"
            @click="groupModalOpen = true"
          />
          <UButton
            label="New service"
            icon="i-lucide-plus"
            :disabled="status !== 'ready'"
            @click="addService()"
          />
        </template>
      </UDashboardNavbar>

      <ServicesTabs />
    </template>

    <template #body>
      <div
        v-if="status === 'loading'"
        class="space-y-4"
        role="status"
        aria-label="Loading services"
      >
        <USkeleton class="h-8 w-full sm:w-72" />
        <USkeleton v-for="i in 3" :key="i" class="h-32 w-full" />
      </div>

      <UEmpty
        v-else-if="status === 'error'"
        role="alert"
        variant="naked"
        icon="i-lucide-circle-alert"
        title="Could not load services"
        description="Check your connection and try again."
        :actions="[
          { label: 'Retry', icon: 'i-lucide-refresh-cw', color: 'neutral', onClick: load },
        ]"
      />

      <UEmpty
        v-else-if="isEmpty"
        variant="naked"
        icon="i-lucide-server"
        title="No services yet"
        description="Add the first service you want to monitor, or start with a group to put services in."
        :actions="[
          { label: 'New service', icon: 'i-lucide-plus', onClick: () => addService() },
          {
            label: 'New group',
            icon: 'i-lucide-folder-plus',
            color: 'neutral',
            variant: 'outline',
            onClick: () => {
              groupModalOpen = true
            },
          },
        ]"
      />

      <template v-else>
        <div class="flex flex-wrap items-center justify-between gap-x-4 gap-y-2">
          <UInput
            v-model="search"
            icon="i-lucide-search"
            placeholder="Search services or groups…"
            aria-label="Search services or groups"
            class="w-full sm:max-w-72"
          />
          <p class="text-sm text-muted">{{ summary }}</p>
        </div>

        <ServicesGroupCard
          v-for="section in sections"
          :key="section.group?.id ?? 'ungrouped'"
          :section="section"
          :checks="serviceChecks"
          class="shrink-0"
          @add="addService(section.group?.id)"
          @add-check="addCheck"
        />

        <UEmpty
          v-if="!sections.length"
          variant="naked"
          icon="i-lucide-search-x"
          title="Nothing found"
          :description="`No service or group matches “${search.trim()}”.`"
          :actions="[
            {
              label: 'Clear search',
              color: 'neutral',
              variant: 'outline',
              onClick: () => {
                search = ''
              },
            },
          ]"
        />
      </template>

      <ServicesAddModal
        v-model:open="serviceModalOpen"
        :groups="groups"
        :group-id="serviceModalGroupId"
        @created="onServiceCreated"
        @group-created="onGroupCreated"
      />
      <ServicesAddCheckModal
        v-model:open="checkModalOpen"
        :service="checkModalService"
        @created="onCheckCreated"
      />
      <ServicesGroupModal v-model:open="groupModalOpen" @created="onGroupCreated" />
    </template>
  </UDashboardPanel>
</template>
