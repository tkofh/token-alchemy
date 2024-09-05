import type { DesignTokens } from '@token-alchemy/types'
import { describe, test } from 'vitest'
import { createDictionary, deserializeDictionary } from '../src'

describe('createDictionary', () => {
  test('it resolves root-level tokens', ({ expect }) => {
    const tokens = createDictionary({
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
      (acc, i) => ({ [`${i}-a`]: acc, [`${i}-b`]: acc }) as DesignTokens,
      {
        $value: 'hello',
      },
    )

    const tokens = createDictionary(input)

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
    const tokens = createDictionary({
      a: { $value: 'a', b: { $value: 'b' } },
    })
    expect(tokens.get('{a}')).toBeDefined()
    expect(tokens.get('{a.b}')).toBeDefined()
  })

  test('it resolves dependencies', ({ expect }) => {
    const tokens = createDictionary({
      a: { $value: 'a' },
      b: { $value: '{a}' },
      c: { $value: '{b}' },
      d: { $value: '{a} {b}' },
    })

    expect(tokens.get('{a}')?.dependencies.size).toBe(0)
    expect(tokens.get('{b}')?.dependencies.size).toBe(1)
    expect(tokens.get('{c}')?.dependencies.size).toBe(2)
    expect(tokens.get('{d}')?.dependencies.size).toBe(2)
  })

  test('it resolves aliases', ({ expect }) => {
    const expectedValue = 'hello'
    const tokens = createDictionary({
      a: {
        $value: '{b}',
      },
      b: {
        $value: expectedValue,
      },
      1: {
        $value: '{2}',
      },
      2: {
        $value: expectedValue,
      },
    })

    // expect(tokens.get('{a}')?.value).toBe(expectedValue)
    expect(tokens.get('{a}')?.references).toStrictEqual(
      new Map([['$value', [{ start: 0, end: 3, token: tokens.get('{b}') }]]]),
    )

    // expect(tokens.get('{1}')?.value).toBe(expectedValue)
    expect(tokens.get('{1}')?.references).toStrictEqual(
      new Map([['$value', [{ start: 0, end: 3, token: tokens.get('{2}') }]]]),
    )
  })

  test('it handles unknown references', ({ expect }) => {
    expect(() =>
      createDictionary({
        a: { $value: '{b}' },
      }),
    ).toThrowError(
      'Unable to resolve token `a` reference: unknown reference `{b}` (at `$value`)',
    )
  })

  test('it handles circular references', ({ expect }) => {
    expect(() =>
      createDictionary({
        a: { a: { $value: '{b}' } },
        b: { $value: '{c}' },
        c: { $value: '{a.a}' },
      }),
    ).toThrowError(
      'Unable to resolve token `b` dependencies: Circular reference between `{b} -> {c} -> {a.a} -> {b}`',
    )
  })

  test('it handles complex value references', ({ expect }) => {
    const tokens = createDictionary({
      light: { $value: 'light' },
      dark: { $value: 'dark' },

      // @ts-expect-error -- can't add declare module types
      complex: { $value: { light: '{light}', dark: '{dark}' } },
    })

    const complex = tokens.get('{complex}')
    // expect(complex?.value).toStrictEqual({ light: 'light', dark: 'dark' })
    expect(complex?.references).toStrictEqual(
      new Map([
        ['$value.light', [{ start: 0, end: 7, token: tokens.get('{light}') }]],
        ['$value.dark', [{ start: 0, end: 6, token: tokens.get('{dark}') }]],
      ]),
    )
  })

  test('it handles multi reference values', ({ expect }) => {
    const tokens = createDictionary({
      a: { $value: 'a' },
      b: { $value: 'b' },
      c: { $value: '{a} {b}' },
    })

    expect(tokens.get('{c}')?.references).toStrictEqual(
      new Map([
        [
          '$value',
          [
            { start: 0, end: 3, token: tokens.get('{a}') },
            { start: 4, end: 7, token: tokens.get('{b}') },
          ],
        ],
      ]),
    )
  })

  test('it serializes and deserializes', ({ expect }) => {
    const tokens = createDictionary({
      a: {
        $value: 'foo',
      },
      b: {
        $value: '{a}',
      },
    })
    const serialized = tokens.serialize()

    const otherTokens = deserializeDictionary(serialized)

    expect(otherTokens.get('{a}')).toBeDefined()
    expect(otherTokens.get('{b}')).toBeDefined()
  })
})
