import type { Service, ServiceGroup, ServiceSection } from '@/types/service'

const byName = (a: { name: string }, b: { name: string }) => a.name.localeCompare(b.name)

/** Groups and their services sorted by name, with services outside any group at the end. */
export function groupServices(
  services: Service[],
  groups: ServiceGroup[],
  query = '',
): ServiceSection[] {
  const sections = new Map<string, ServiceSection>()
  const ungrouped: Service[] = []

  for (const group of groups) {
    sections.set(group.id, { group, services: [] })
  }

  for (const service of [...services].sort(byName)) {
    if (!service.group) {
      ungrouped.push(service)
      continue
    }
    const section = sections.get(service.group.id) ?? { group: service.group, services: [] }
    section.services.push(service)
    sections.set(service.group.id, section)
  }

  const result: ServiceSection[] = [...sections.values()].sort((a, b) => byName(a.group!, b.group!))
  if (ungrouped.length) {
    result.push({ group: null, services: ungrouped })
  }

  return filterSections(result, query.trim().toLowerCase())
}

function filterSections(sections: ServiceSection[], search: string): ServiceSection[] {
  if (!search) {
    return sections
  }

  return sections.flatMap((section) => {
    if (section.group?.name.toLowerCase().includes(search)) {
      return [section]
    }
    const services = section.services.filter(({ name }) => name.toLowerCase().includes(search))
    return services.length ? [{ ...section, services }] : []
  })
}

/** How many services each group has, by group id; groups without services are left out. */
export function countByGroup(services: Service[]): Map<string, number> {
  const counts = new Map<string, number>()
  for (const { group } of services) {
    if (group) {
      counts.set(group.id, (counts.get(group.id) ?? 0) + 1)
    }
  }
  return counts
}
