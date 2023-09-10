import { describe, test } from 'vitest'
import { string } from 'zod'
import { defineTokenConfig, defaults } from '../src/config'
import { prefixAttributes } from '../src/utils'

describe('defineTokenConfig', () => {
  test('it uses defaults when no input is provided', ({ expect }) => {
    expect(defineTokenConfig()).toMatchObject({
      ...defaults,
      tokenAttributes: prefixAttributes(
        defaults.tokenAttributes,
        defaults.attributePrefix,
      ),
      groupAttributes: prefixAttributes(
        defaults.groupAttributes,
        defaults.attributePrefix,
      ),
    })
  })

  test('it defaults the token attributes to an arbitrary value key', ({
    expect,
  }) => {
    expect(defineTokenConfig().tokenAttributes).toHaveProperty('$value')
    expect(
      defineTokenConfig({ tokenValueKey: 'val', attributePrefix: '_' })
        .tokenAttributes,
    ).toHaveProperty('_val')
  })

  test('it throws when the token value key is listed as a group attribute', ({
    expect,
  }) => {
    expect(() =>
      defineTokenConfig({
        groupAttributes: {
          $value: string(),
        },
      }),
    ).toThrow()
  })
})
