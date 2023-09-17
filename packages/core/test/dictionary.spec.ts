import { describe, test } from 'vitest'
import type { DesignTokens } from '@token-alchemy/types'
import { resolveTokens } from '../src/dictionary'

// declare module '@token-alchemy/types' {
//   export interface DesignTokenGroupAttributes {
//     $tier: 'system' | 'component' | 'category' | 'concept' | 'property'
//   }

//   export interface DesignTokenAttributes {
//     $type: 'color' | 'dimension' | 'string'
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

    expect(tokens.get('token-a')).toBeDefined()
    expect(tokens.get('token-b')).toBeDefined()
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
        [...numbers]
          .reverse()
          .map((i) => `${i}-a`)
          .join('-'),
      ),
    ).toBeDefined()
    expect(
      tokens.get(
        [...numbers]
          .reverse()
          .map((i) => `${i}-b`)
          .join('-'),
      ),
    ).toBeDefined()
  })
})
