import type {
  TokenMap,
  Immutable,
  SerializedToken,
  ResolvedToken,
} from '@token-alchemy/types'
import { array, object, record, string, unknown } from 'zod'

const serializedSchema = array(
  object({
    key: string(),
    reference: string(),
    attributes: record(string(), unknown()),
    value: unknown(),
    references: record(string(), string()),
    path: array(
      object({
        segmentKey: string(),
        attributes: record(string(), unknown()),
      }),
    ),
  }),
)

export function serializeTokenMap(tokens: TokenMap, pretty = false): string {
  const serialized: Array<Immutable<SerializedToken>> = []
  for (const token of tokens.values()) {
    serialized.push({
      ...token,
      references: Object.fromEntries(
        Array.from(token.references.entries()).map(([key, { reference }]) => [
          key,
          reference,
        ]),
      ),
    })
  }

  return JSON.stringify(serialized, null, pretty ? 2 : 0)
}

export function deserializeTokenMap(serialized: string): TokenMap {
  const parsed = serializedSchema.parse(JSON.parse(serialized))

  const serializedTokenMap = new Map<string, SerializedToken>(
    parsed.map((serializedToken) => [
      serializedToken.reference,
      serializedToken as SerializedToken,
    ]),
  )

  const tokenMap = new Map<string, ResolvedToken>()
  for (const serializedToken of serializedTokenMap.values()) {
    tokenMap.set(serializedToken.reference, {
      ...serializedToken,
      references: new Map(
        Object.entries(serializedToken.references).map(([key, reference]) => [
          key,
          serializedTokenMap.get(reference) as unknown as ResolvedToken,
        ]),
      ),
    })
  }

  return tokenMap
}
