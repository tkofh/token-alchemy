import type {
  ResolvedToken,
  SerializedToken,
  TokenMap,
} from '@token-alchemy/types'
import { compareTokenOrder } from './sort'

export function serializeTokenMap<
  Attributes extends object = { $value: string | number },
  GroupAttributes extends object = Attributes,
>(tokens: TokenMap<Attributes, GroupAttributes>, pretty = false): string {
  const serialized: Array<SerializedToken<Attributes, GroupAttributes>> = []

  const queue = Array.from(tokens.values()).sort((a, b) =>
    compareTokenOrder(a, b),
  )

  for (const token of queue) {
    serialized.push({
      ...token,
      dependencies: Array.from(token.dependencies).map(
        (dependency) => dependency.reference,
      ),
      references: Object.fromEntries(
        Array.from(token.references.entries()).map(([key, references]) => [
          key,
          references.map((reference) => ({
            start: reference.start,
            end: reference.end,
            reference: token.reference,
          })),
        ]),
      ),
    })
  }

  // console.log(JSON.stringify(serialized, null, 2))

  return JSON.stringify(serialized, null, pretty ? 2 : 0)
}

export function deserializeTokenMap<
  Attributes extends object = { $value: string | number },
  GroupAttributes extends object = Attributes,
>(serialized: string): TokenMap<Attributes, GroupAttributes> {
  const parsed = JSON.parse(serialized) as Array<
    SerializedToken<Attributes, GroupAttributes>
  >

  const serializedTokenMap = new Map<
    string,
    SerializedToken<Attributes, GroupAttributes>
  >(
    parsed.map((serializedToken) => [
      serializedToken.reference,
      serializedToken,
    ]),
  )

  const tokenMap = new Map<string, ResolvedToken<Attributes, GroupAttributes>>()
  for (const serializedToken of serializedTokenMap.values()) {
    tokenMap.set(serializedToken.reference, {
      ...serializedToken,
      dependencies: new Set(
        serializedToken.dependencies.map(
          (key) =>
            tokenMap.get(key) as unknown as ResolvedToken<
              Attributes,
              GroupAttributes
            >,
        ),
      ),
      references: new Map(
        Object.entries(serializedToken.references).map(([key, references]) => [
          key,
          references.map((reference) => ({
            ...reference,
            token: serializedTokenMap.get(
              reference.reference,
            ) as unknown as ResolvedToken<Attributes, GroupAttributes>,
          })),
        ]),
      ),
    })
  }

  return tokenMap
}
