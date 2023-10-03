import { describe, test } from 'vitest'
import { createDictionary } from '@token-alchemy/core'
import { formatReferences } from '../src'

describe('formatReferences', () => {
  test('it formats every referenced token', ({ expect }) => {
    const tokens = createDictionary({
      a: { $value: 'a' },
      b: { $value: 'b' },
      c: { $value: '{a} {b} {a} {b}' },
    })

    const reformatted = formatReferences(
      tokens.get('{c}')!,
      (token) => `ref-${token.key}`,
    )

    expect(reformatted).toBe('ref-a ref-b ref-a ref-b')
  })

  test('it formats complex token values', ({ expect }) => {
    const tokens = createDictionary({
      a: { $value: 'a' },
      b: { $value: 'b' },
      // @ts-expect-error -- can't extend type
      c: { $value: { a: '{a} {b}', b: '{b} {a}' } },
    })

    const reformatted = formatReferences(
      tokens.get('{c}')!,
      (token) => `ref-${token.key}`,
    )

    expect(reformatted).toStrictEqual({
      a: 'ref-a ref-b',
      b: 'ref-b ref-a',
    })
  })
})
