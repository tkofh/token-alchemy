import type {
  JsValue,
  ResolvedToken,
  ResolvedTokenReference,
  TokenMap,
} from '@token-alchemy/types'
import { TOKEN_REFERENCE_RE } from './constants'

function resolveStringReferences<
  Attributes extends object = { $value: string | number },
  GroupAttributes extends object = Attributes,
>(
  input: string,
  tokens: TokenMap<Attributes, GroupAttributes>,
): Array<ResolvedTokenReference<Attributes, GroupAttributes>> {
  const matches = Array.from(input.matchAll(TOKEN_REFERENCE_RE))
  const references: Array<ResolvedTokenReference<Attributes, GroupAttributes>> =
    []

  for (const match of matches) {
    const token = tokens.get(match[0])

    if (!token) {
      throw new Error(`unknown reference \`${match[0]}\``)
    }

    const tokenReference: ResolvedTokenReference<Attributes, GroupAttributes> =
      {
        token,
        start: match.index ?? 0,
        end: (match.index ?? 0) + match[0].length,
      }

    references.push(tokenReference)
  }

  return references
}

function resolveValueReferences<
  Attributes extends object = { $value: string | number },
  GroupAttributes extends object = Attributes,
>(
  keys: Array<string>,
  value: JsValue,
  tokens: TokenMap<Attributes, GroupAttributes>,
): Array<[string, Array<ResolvedTokenReference<Attributes, GroupAttributes>>]> {
  if (typeof value === 'string') {
    try {
      const references = resolveStringReferences<Attributes, GroupAttributes>(
        value,
        tokens,
      )

      return references.length > 0 ? [[keys.join('.'), references]] : []
    } catch (e) {
      throw new Error(
        `${
          e instanceof Error ? e.message : 'an unknown error occurred'
        } (at \`${keys.join('.')}\`)`,
      )
    }
  }

  if (typeof value === 'object' && value !== null) {
    const references: Array<
      [string, Array<ResolvedTokenReference<Attributes, GroupAttributes>>]
    > = []

    for (const [key, childValue] of Object.entries(value)) {
      const child = resolveValueReferences<Attributes, GroupAttributes>(
        [...keys, key],
        childValue,
        tokens,
      )

      references.push(...child)
    }

    return references
  }

  return []
}

export function resolveReferences<
  Attributes extends object = { $value: string | number },
  GroupAttributes extends object = Attributes,
>(
  tokens: TokenMap<Attributes, GroupAttributes>,
): Set<ResolvedToken<Attributes, GroupAttributes>> {
  const tokensWithReferences = new Set<
    ResolvedToken<Attributes, GroupAttributes>
  >()
  for (const token of tokens.values()) {
    try {
      const references = resolveValueReferences<Attributes, GroupAttributes>(
        ['$value'],
        token.value,
        tokens,
      )

      if (references.length > 0) {
        tokensWithReferences.add(token)
        for (const [key, refs] of references) {
          token.references.set(key, refs)
        }
      }
    } catch (e) {
      throw new Error(
        `Unable to resolve token \`${token.key}\` reference: ${
          e instanceof Error ? e.message : 'an unknown error occurred'
        }`,
      )
    }
  }

  return tokensWithReferences
}
