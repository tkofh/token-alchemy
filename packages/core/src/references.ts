import type { TokenMap, ResolvedToken, JSValue } from '@token-alchemy/types'
import { isReference } from './util'

export function resolveTokenMapReferences(tokens: TokenMap): void {
  const resolved = new Set<string>()
  for (const token of tokens.values()) {
    try {
      resolveTokenReferences(token , tokens, resolved, [])
    } catch (e) {
      throw new Error(
        `Unable to resolve token \`${token.key}\` reference: ${
          e instanceof Error ? e.message : 'an unknown error occured'
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
): { value: JSValue; references: Array<[string, ResolvedToken]> } {
  if (isReference(value)) {
    const referencedToken = tokens.get(value) 

    if (!referencedToken) {
      throw new Error(
        `Unknown reference \`'${value}'\` at \`${keys.join('.')}\``,
      )
    }

    resolveTokenReferences(referencedToken, tokens, resolved, chain)

    return {
      references: [[keys.join('.'), referencedToken]],
      value: referencedToken.value,
    }
  } else if (typeof value === 'object' && value !== null) {
    const references: Array<[string, ResolvedToken]> = []
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
