import type {
  JsValue,
  ResolvedToken,
  ResolvedTokenReference,
  TokenMap,
} from '@token-alchemy/types'
import { TOKEN_REFERENCE_RE } from './constants'

function resolveStringReferences(
  input: string,
  tokens: TokenMap,
): Array<ResolvedTokenReference> {
  const matches = Array.from(input.matchAll(TOKEN_REFERENCE_RE))
  const references: Array<ResolvedTokenReference> = []

  for (const match of matches) {
    const token = tokens.get(match[0])

    if (!token) {
      throw new Error(`unknown reference \`${match[0]}\``)
    }

    const tokenReference: ResolvedTokenReference = {
      token,
      start: match.index ?? 0,
      end: (match.index ?? 0) + match[0].length,
    }

    references.push(tokenReference)
  }

  return references
}

function resolveValueReferences(
  keys: Array<string>,
  value: JsValue,
  tokens: TokenMap,
): Array<[string, Array<ResolvedTokenReference>]> {
  if (typeof value === 'string') {
    try {
      const references = resolveStringReferences(value, tokens)

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
    const references: Array<[string, Array<ResolvedTokenReference>]> = []

    for (const [key, childValue] of Object.entries(value)) {
      const child = resolveValueReferences([...keys, key], childValue, tokens)

      references.push(...child)
    }

    return references
  }

  return []
}

export function resolveReferences(tokens: TokenMap): Set<ResolvedToken> {
  const tokensWithReferences = new Set<ResolvedToken>()
  for (const token of tokens.values()) {
    try {
      const references = resolveValueReferences(['$value'], token.value, tokens)

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
