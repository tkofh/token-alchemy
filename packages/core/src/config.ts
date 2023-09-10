import { defu } from 'defu'
import { string, number, union } from 'zod'
import type { TokenAlchemyConfig } from './types'
import { prefixAttributes, ensurePrefix } from './utils'

export const defaults = {
  groupAttributes: {},
  tokenAttributes: {},
  attributePrefix: '$',
  tokenValueKey: 'value',
} satisfies TokenAlchemyConfig

export function defineTokenConfig(
  config: Partial<TokenAlchemyConfig> = {},
): TokenAlchemyConfig {
  const prefixedTokenValueKey = ensurePrefix(
    config.tokenValueKey ?? defaults.tokenValueKey,
    config.attributePrefix ?? defaults.attributePrefix,
  )

  const merged = defu<Partial<TokenAlchemyConfig>, [TokenAlchemyConfig]>(
    config,
    {
      ...defaults,
      tokenAttributes: {
        [prefixedTokenValueKey]: union([string(), number()]),
      },
    },
  )
  merged.tokenAttributes = prefixAttributes(
    merged.tokenAttributes,
    merged.attributePrefix,
  )
  merged.groupAttributes = prefixAttributes(
    merged.groupAttributes,
    merged.attributePrefix,
  )

  if (!(prefixedTokenValueKey in merged.tokenAttributes)) {
    throw new Error(
      `[token alchemy defineConfig]: \`config.tokenAttributes\` must declare the token value key, \`${prefixedTokenValueKey}\` (prefix \`${merged.attributePrefix}\` optional)`,
    )
  }

  if (prefixedTokenValueKey in merged.groupAttributes) {
    throw new Error(
      `[token alchemy defineConfig]: \`config.groupAttributes\` must not declare the token value key, \`${prefixedTokenValueKey}\` (with or without the \`${merged.attributePrefix}\` prefix)`,
    )
  }

  return merged
}
