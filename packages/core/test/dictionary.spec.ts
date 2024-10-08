import { describe, expect, test } from 'vitest'
import { createDictionary } from '../src'

describe('dictionary', () => {
  test('it resolves tokens', () => {
    const dictionary = createDictionary<{ $value?: string }>(
      {},
      {
        a: {
          $value: 'a',
        },
        b: {
          $value: 'b',
        },
        test: {
          token: {
            $value: '{a} {b}',
          },
        },
      },
    )

    for (const token of dictionary) {
      console.log(token)
    }

    expect(
      dictionary.format(
        '{test.token}',
        (token) => token.data().$value as string,
      ),
    ).toBe('a b')
  })
})
