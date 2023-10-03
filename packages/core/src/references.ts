import type {
  TokenMap,
  ResolvedToken,
  JSValue,
  TokenReference,
} from '@token-alchemy/types'

export function resolveTokenMapReferences(tokens: TokenMap): void {
  const resolved = new Set<string>()
  for (const token of tokens.values()) {
    try {
      resolveTokenReferences(token, tokens, resolved, [])
    } catch (e) {
      throw new Error(
        `Unable to resolve token \`${token.key}\` reference: ${
          e instanceof Error ? e.message : 'an unknown error occurred'
        }`,
      )
    }
  }
}

function resolveTokenReferences(
  token: ResolvedToken,
  tokens: TokenMap,
  resolved: Set<string>,
  chain: ResolvedToken[],
): void {
  if (chain.includes(token)) {
    throw new Error(
      `Circular reference between \`${chain
        .slice(chain.indexOf(token))
        .map((loopToken) => `'${loopToken.reference}'`)
        .join(', ')}\``,
    )
  } else if (!resolved.has(token.key)) {
    const { value, references } = resolveReferences(
      ['$value'],
      token.value as JSValue,
      tokens,
      resolved,
      [...chain, token],
    )

    token.value = value as ResolvedToken['value']
    token.references = new Map(references)
    resolved.add(token.key)
  }
}

function resolveReferences(
  keys: string[],
  value: JSValue,
  tokens: TokenMap,
  resolved: Set<string>,
  chain: ResolvedToken[],
): { value: JSValue; references: Array<[string, TokenReference[]]> } {
  if (typeof value === 'string') {
    const matches = Array.from(value.matchAll(/{[a-z-]+(?:.[a-z-]+)*}/g))

    if (matches.length > 0) {
      let resolvedValue = value
      const references: TokenReference[] = []

      for (const match of matches) {
        const referencedToken = tokens.get(match[0])

        if (!referencedToken) {
          throw new Error(
            `Unknown reference \`'${value}'\` at \`${keys.join('.')}\``,
          )
        }

        resolveTokenReferences(referencedToken, tokens, resolved, chain)

        const tokenReference: TokenReference = {
          token: referencedToken,
          start: match.index ?? 0,
          end: (match.index ?? 0) + match[0].length,
        }

        references.push(tokenReference)

        resolvedValue = resolvedValue.replace(
          referencedToken.reference,
          String(referencedToken.value),
        )
      }

      return {
        references: [[keys.join('.'), references]],
        value: resolvedValue,
      }
    }
  } else if (typeof value === 'object' && value !== null) {
    const references: Array<[string, TokenReference[]]> = []
    const valueEntries: Array<[string, JSValue]> = []

    for (const [key, childValue] of Object.entries(value)) {
      const child = resolveReferences(
        [...keys, key],
        childValue,
        tokens,
        resolved,
        chain,
      )

      references.push(...child.references)
      valueEntries.push([key, child.value])
    }

    return {
      value: Object.fromEntries(valueEntries),
      references,
    }
  }
  return {
    value,
    references: [],
  }
}
