import type {
  DesignTokensInput,
  TokenDictionary,
  TokenMap,
} from '@token-alchemy/types'
import { resolveTokens } from './resolve'
import { deserializeTokenMap, serializeTokenMap } from './serialize'

function createDictionaryImpl(tokens: TokenMap): TokenDictionary {
  return {
    all: () => tokens.values(),
    get: (key) => tokens.get(key),
    has: (key) => tokens.has(key),
    serialize: (pretty = false) => serializeTokenMap(tokens, pretty),
  }
}

export function createDictionary(input: DesignTokensInput): TokenDictionary {
  const tokens = resolveTokens(input)

  return createDictionaryImpl(tokens)
}

export function deserializeDictionary(serialized: string): TokenDictionary {
  const tokens = deserializeTokenMap(serialized)

  return createDictionaryImpl(tokens)
}
