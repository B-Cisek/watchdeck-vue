export interface ServiceGroup {
  id: string
  name: string
}

export interface Service {
  id: string
  name: string
  group: ServiceGroup | null
}

export interface CreateService {
  name: string
  groupId: string | null
}

export interface CreateServiceGroup {
  name: string
}

/** A group with its services; `group` is null for services outside any group. */
export interface ServiceSection {
  group: ServiceGroup | null
  services: Service[]
}
