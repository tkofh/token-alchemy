import type {
  TokenMap,
  Immutable,
  SerializedToken,
  ResolvedToken,
} from '@token-alchemy/types'

export function serializeTokenMap(tokens: TokenMap, pretty = false): string {
  const serialized: Array<Immutable<SerializedToken>> = []
  for (const token of tokens.values()) {
    serialized.push({
      ...token,
      references: Object.fromEntries(
        Array.from(token.references.entries()).map(([key, references]) => [
          key,
          references.map((reference) => ({
            ...reference,
            token: token.reference,
          })),
        ]),
      ),
    })
  }

  return JSON.stringify(serialized, null, pretty ? 2 : 0)
}

export function deserializeTokenMap(serialized: string): TokenMap {
  const parsed = JSON.parse(serialized) as SerializedToken[]

  const serializedTokenMap = new Map<string, SerializedToken>(
    parsed.map((serializedToken) => [
      serializedToken.reference,
      serializedToken,
    ]),
  )

  const tokenMap = new Map<string, ResolvedToken>()
  for (const serializedToken of serializedTokenMap.values()) {
    tokenMap.set(serializedToken.reference, {
      ...serializedToken,
      references: new Map(
        Object.entries(serializedToken.references).map(([key, references]) => [
          key,
          references.map((reference) => ({
            ...reference,
            token: serializedTokenMap.get(
              reference.token,
            ) as unknown as ResolvedToken,
          })),
        ]),
      ),
    })
  }

  return tokenMap
}
