import { describe, expect, test } from 'bun:test'
import type { Service, ServiceSection } from '@/types/service'
import { countByGroup, groupServices } from '@/utils/services'

const ecommerce = { id: 'g1', name: 'ecommerce' }
const internal = { id: 'g2', name: 'Internal' }
const nike: Service = { id: 's1', name: 'Nike', group: ecommerce }
const adidas: Service = { id: 's2', name: 'adidas', group: ecommerce }
const blog: Service = { id: 's3', name: 'Blog', group: null }

function names(sections: ServiceSection[]) {
  return sections.map(({ group, services }) => [group?.name ?? null, services.map((s) => s.name)])
}

describe('groupServices', () => {
  test('sorts groups and services by name, ungrouped last', () => {
    expect(names(groupServices([nike, blog, adidas], [internal, ecommerce]))).toEqual([
      ['ecommerce', ['adidas', 'Nike']],
      ['Internal', []],
      [null, ['Blog']],
    ])
  })

  test('has no ungrouped section when every service has a group', () => {
    expect(names(groupServices([nike], [ecommerce]))).toEqual([['ecommerce', ['Nike']]])
  })

  // Both lists are fetched separately, so a group can be created in between.
  test('keeps services of a group missing from the group list', () => {
    expect(names(groupServices([nike], []))).toEqual([['ecommerce', ['Nike']]])
  })

  test('keeps groups of the same name apart', () => {
    const duplicate = { id: 'g3', name: 'ecommerce' }

    expect(names(groupServices([nike], [ecommerce, duplicate]))).toEqual([
      ['ecommerce', ['Nike']],
      ['ecommerce', []],
    ])
  })

  test('finds services by name and leaves out sections without a match', () => {
    expect(names(groupServices([nike, adidas, blog], [ecommerce, internal], ' NIK '))).toEqual([
      ['ecommerce', ['Nike']],
    ])
  })

  test('keeps the whole group when its name matches', () => {
    expect(names(groupServices([nike, adidas, blog], [ecommerce, internal], 'ecom'))).toEqual([
      ['ecommerce', ['adidas', 'Nike']],
    ])
    expect(names(groupServices([nike], [ecommerce, internal], 'intern'))).toEqual([
      ['Internal', []],
    ])
  })

  test('does not change the lists it is given', () => {
    const services = [nike, adidas]
    const groups = [internal, ecommerce]

    groupServices(services, groups)

    expect(services).toEqual([nike, adidas])
    expect(groups).toEqual([internal, ecommerce])
  })
})

describe('countByGroup', () => {
  test('counts services by the id of their group, skipping ungrouped ones', () => {
    const counts = countByGroup([nike, blog, adidas])

    expect([...counts]).toEqual([['g1', 2]])
    expect(counts.get('g2')).toBeUndefined()
  })
})
