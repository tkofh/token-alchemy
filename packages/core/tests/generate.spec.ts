import { describe, test } from 'vitest'
import { string } from 'zod'
import { generate } from '../src/generate'
import { defineTokenConfig } from '../src/config'

describe('generate', () => {
  test('it runs', () => {
    generate(
      defineTokenConfig({
        groupAttributes: {
          tier: string().optional(),
        },
        tokenAttributes: {},
      }),
    )
  })
})
