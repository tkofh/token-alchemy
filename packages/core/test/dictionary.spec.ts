import { describe, test } from 'vitest'
import type { DesignTokens } from '@token-alchemy/types'
import { resolveTokens } from '../src/dictionary'

// declare module '@token-alchemy/types' {
//   export interface DesignTokenAttributes {
//     $type: 'color' | 'dimension' | 'string'
//   }

//   export interface DesignTokenGroupAttributes {
//     $tier: 'component' | 'category' | 'property' | 'state'
//     $value: string | { light: string; dark: string }
//   }
// }

describe('resolveTokens', () => {
  test('it resolves root-level tokens', ({ expect }) => {
    const tokens = resolveTokens({
      tokenA: {
        $value: 'token',
      },
      tokenB: {
        $value: 'token',
      },
    })

    expect(tokens.get('{token-a}')).toBeDefined()
    expect(tokens.get('{token-b}')).toBeDefined()
  })

  test('it resolves (deeply) nested tokens', ({ expect }) => {
    const count = 5
    const numbers = Array.from({ length: count }, (_, i) => count - 1 - i)
    const input = numbers.reduce<DesignTokens>(
      (acc, i) => ({ [`${i}-a`]: acc, [`${i}-b`]: acc }),
      {
        $value: 'hello',
      },
    )

    const tokens = resolveTokens(input)

    expect(
      tokens.get(
        `{${[...numbers]
          .reverse()
          .map((i) => `${i}-a`)
          .join('.')}}`,
      ),
    ).toBeDefined()
    expect(
      tokens.get(
        `{${[...numbers]
          .reverse()
          .map((i) => `${i}-b`)
          .join('.')}}`,
      ),
    ).toBeDefined()
  })

  test('it resolves direct child tokens', ({ expect }) => {
    const tokens = resolveTokens({ a: { $value: 'a', b: { $value: 'b' } } })
    expect(tokens.get('{a}')).toBeDefined()
    expect(tokens.get('{a.b}')).toBeDefined()
  })

  test('it resolves aliases', ({ expect }) => {
    const expectedValue = 'hello'
    const tokens = resolveTokens({
      a: {
        $value: '{b}',
      },
      b: {
        $value: expectedValue,
      },
    })

    expect(tokens.get('{a}')?.value).toBe(expectedValue)
    expect(tokens.get('{a}')?.references).toStrictEqual(
      new Map([['$value', tokens.get('{b}')]]),
    )
  })

  test('it handles unknown references', ({ expect }) => {
    expect(() =>
      resolveTokens({
        a: { $value: '{b}' },
      }),
    ).toThrowError(
      "Unable to resolve token `a` reference: Unknown reference `'{b}'`",
    )
  })

  test('it handles circular references', ({ expect }) => {
    expect(() =>
      resolveTokens({
        a: { a: { $value: '{b}' } },
        b: { $value: '{c}' },
        c: { $value: '{a.a}' },
      }),
    ).toThrowError(
      "Unable to resolve token `b` reference: Circular reference between `'{b}', '{c}', '{a.a}'`",
    )
  })

  test('it handles complex value references', ({ expect }) => {
    const tokens = resolveTokens({
      light: { $value: 'light' },
      dark: { $value: 'dark' },

      // @ts-expect-error -- can't add declare module types
      complex: { $value: { light: '{light}', dark: '{dark}' } },
    })

    const complex = tokens.get('{complex}')
    expect(complex?.value).toStrictEqual({ light: 'light', dark: 'dark' })
    expect(complex?.references).toStrictEqual(
      new Map([
        ['$value.light', tokens.get('{light}')],
        ['$value.dark', tokens.get('{dark}')],
      ]),
    )
  })
})
