<script setup lang="ts">
import { computed, ref } from 'vue'
import { serviceGroups } from '@/api/serviceGroups'
import { services as servicesApi } from '@/api/services'
import type { Service, ServiceGroup } from '@/types/service'
import { countByGroup } from '@/utils/services'
import { count } from '@/utils/text'

const groups = ref<ServiceGroup[]>([])
const services = ref<Service[]>([])
const status = ref<'loading' | 'ready' | 'error'>('loading')

const groupModalOpen = ref(false)
const groupModalGroup = ref<ServiceGroup>()
const deleteModalOpen = ref(false)
const deleteModalGroup = ref<ServiceGroup>()

const sortedGroups = computed(() => [...groups.value].sort((a, b) => a.name.localeCompare(b.name)))
const serviceCounts = computed(() => countByGroup(services.value))

async function load() {
  status.value = 'loading'
  try {
    const [groupList, serviceList] = await Promise.all([serviceGroups.list(), servicesApi.list()])
    groups.value = groupList
    services.value = serviceList
    status.value = 'ready'
  } catch {
    status.value = 'error'
  }
}

function newGroup() {
  groupModalGroup.value = undefined
  groupModalOpen.value = true
}

function renameGroup(group: ServiceGroup) {
  groupModalGroup.value = group
  groupModalOpen.value = true
}

function deleteGroup(group: ServiceGroup) {
  deleteModalGroup.value = group
  deleteModalOpen.value = true
}

function onGroupCreated(group: ServiceGroup) {
  groups.value.push(group)
}

function onGroupUpdated(updated: ServiceGroup) {
  groups.value = groups.value.map((group) => (group.id === updated.id ? updated : group))
}

function onGroupDeleted({ id }: ServiceGroup) {
  groups.value = groups.value.filter((group) => group.id !== id)
  services.value = services.value.map((service) =>
    service.group?.id === id ? { ...service, group: null } : service,
  )
}

load()
</script>

<template>
  <UDashboardPanel id="service-groups">
    <template #header>
      <UDashboardNavbar title="Services">
        <template #leading>
          <UDashboardSidebarCollapse />
        </template>

        <template #right>
          <UButton
            label="New group"
            icon="i-lucide-folder-plus"
            :disabled="status !== 'ready'"
            @click="newGroup"
          />
        </template>
      </UDashboardNavbar>

      <ServicesTabs />
    </template>

    <template #body>
      <div v-if="status === 'loading'" class="space-y-2" role="status" aria-label="Loading groups">
        <USkeleton v-for="i in 3" :key="i" class="h-12 w-full" />
      </div>

      <UEmpty
        v-else-if="status === 'error'"
        role="alert"
        variant="naked"
        icon="i-lucide-circle-alert"
        title="Could not load groups"
        description="Check your connection and try again."
        :actions="[
          { label: 'Retry', icon: 'i-lucide-refresh-cw', color: 'neutral', onClick: load },
        ]"
      />

      <UEmpty
        v-else-if="!groups.length"
        variant="naked"
        icon="i-lucide-folder"
        title="No groups yet"
        description="Groups keep related services together, such as a product or a team."
        :actions="[{ label: 'New group', icon: 'i-lucide-folder-plus', onClick: newGroup }]"
      />

      <UCard v-else variant="subtle" :ui="{ body: 'p-0 sm:p-0' }">
        <ul aria-label="Groups" class="divide-y divide-default">
          <li
            v-for="group in sortedGroups"
            :key="group.id"
            class="flex min-h-12 items-center gap-3 px-4 py-2"
          >
            <UIcon name="i-lucide-folder" class="size-4 shrink-0 text-muted" />
            <span class="min-w-0 truncate text-sm font-medium text-highlighted">
              {{ group.name }}
            </span>
            <span class="shrink-0 text-sm text-muted">
              {{ count(serviceCounts.get(group.id) ?? 0, 'service') }}
            </span>

            <div class="ms-auto flex shrink-0 items-center gap-1">
              <UTooltip :text="`Rename ${group.name}`">
                <UButton
                  icon="i-lucide-pencil"
                  color="neutral"
                  variant="ghost"
                  size="sm"
                  :aria-label="`Rename ${group.name}`"
                  @click="renameGroup(group)"
                />
              </UTooltip>
              <UTooltip :text="`Delete ${group.name}`">
                <UButton
                  icon="i-lucide-trash-2"
                  color="neutral"
                  variant="ghost"
                  size="sm"
                  :aria-label="`Delete ${group.name}`"
                  @click="deleteGroup(group)"
                />
              </UTooltip>
            </div>
          </li>
        </ul>
      </UCard>

      <ServicesGroupModal
        v-model:open="groupModalOpen"
        :group="groupModalGroup"
        @created="onGroupCreated"
        @updated="onGroupUpdated"
      />
      <ServicesDeleteGroupModal
        v-model:open="deleteModalOpen"
        :group="deleteModalGroup"
        :service-count="serviceCounts.get(deleteModalGroup?.id ?? '') ?? 0"
        @deleted="onGroupDeleted"
      />
    </template>
  </UDashboardPanel>
</template>
