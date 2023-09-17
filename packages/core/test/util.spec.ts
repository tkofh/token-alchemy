import { describe, test } from 'vitest'
import { isReference } from '../src/util'

describe('isReference', () => {
  test('it permits valid references', ({ expect }) => {
    expect(isReference('{foo}')).toBe(true)
    expect(isReference('{foo-bar}')).toBe(true)
    expect(isReference('{foo.bar}')).toBe(true)
    expect(isReference('{foo.bar-baz}')).toBe(true)
    expect(isReference('{foo.bar.baz}')).toBe(true)
  })

  test('it does not permit double dots', ({ expect }) => {
    expect(isReference('{foo..bar}')).toBe(false)
  })

  test('it does not permit empty accessor', ({ expect }) => {
    expect(isReference('{}')).toBe(false)
  })
})
