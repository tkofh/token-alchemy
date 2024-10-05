import type {
  DesignTokensInput,
  Immutable,
  ResolvedToken,
  TokenDictionary,
  TokenMap,
} from '@token-alchemy/types'
import { resolveTokens } from './resolve'
import { deserializeTokenMap, serializeTokenMap } from './serialize'

function createDictionaryImpl<
  Attributes extends object = { $value: string | number },
  GroupAttributes extends object = Attributes,
>(
  tokens: TokenMap<Attributes, GroupAttributes>,
): TokenDictionary<Attributes, GroupAttributes> {
  return {
    all: () =>
      tokens.values() as unknown as IterableIterator<
        Immutable<ResolvedToken<Attributes, GroupAttributes>>
      >,
    get: (key) =>
      tokens.get(key) as unknown as
        | Immutable<ResolvedToken<Attributes, GroupAttributes>>
        | undefined,
    has: (key) => tokens.has(key),
    serialize: (pretty = false) =>
      serializeTokenMap<Attributes, GroupAttributes>(tokens, pretty),
  }
}

export function createDictionary<
  Attributes extends object = { $value: string | number },
  GroupAttributes extends object = Attributes,
>(
  input: DesignTokensInput<Attributes, GroupAttributes>,
): TokenDictionary<Attributes, GroupAttributes> {
  const tokens = resolveTokens<Attributes, GroupAttributes>(input)

  return createDictionaryImpl<Attributes, GroupAttributes>(tokens)
}

export function deserializeDictionary<
  Attributes extends object = { $value: string | number },
  GroupAttributes extends object = Attributes,
>(serialized: string): TokenDictionary<Attributes, GroupAttributes> {
  const tokens = deserializeTokenMap<Attributes, GroupAttributes>(serialized)

  return createDictionaryImpl<Attributes, GroupAttributes>(tokens)
}
