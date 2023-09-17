import type {
  DesignTokensInput,
  TokenMap,
  ResolvedToken,
  ResolvedTokenPathSegment,
  DesignTokens,
  ExtractedTokenAttributes,
  JSValue,
} from '@token-alchemy/types'
import { kebabCase } from 'lodash-es'
import {
  extractGroupAttributes,
  extractGroupChildren,
  isReference,
  isToken,
  objectEntries,
} from './util'

interface TokenResolutionOperation {
  lineage: ResolvedTokenPathSegment[]
  tokens: DesignTokens
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
        .map((loopToken) => `'${loopToken.key}'`)
        .join(', ')}\``,
    )
  } else if (!resolved.has(token.key)) {
    const { value, valueReferences } = resolveReferences(
      ['$value'],
      token.value as JSValue,
      tokens,
      resolved,
      [...chain, token],
    )

    token.value = value as ResolvedToken['value']
    token.valueReferences = valueReferences as ResolvedToken['valueReferences']
    resolved.add(token.key)
  }
}

function resolveReferences(
  keys: string[],
  value: JSValue,
  tokens: TokenMap,
  resolved: Set<string>,
  chain: ResolvedToken[],
): { value: JSValue; valueReferences: JSValue } {
  if (isReference(value)) {
    const referencedToken = tokens.get(value) as ResolvedToken | undefined

    if (!referencedToken) {
      throw new Error(
        `Unknown reference \`'${value}'\` at \`${keys.join('.')}\``,
      )
    }

    resolveTokenReferences(referencedToken, tokens, resolved, chain)

    return {
      valueReferences: { $ref: referencedToken as unknown as JSValue },
      value: referencedToken.value,
    }
  } else if (typeof value === 'object' && value !== null) {
    const valueReferencesEntries: Array<[string, JSValue]> = []
    const valueEntries: Array<[string, JSValue]> = []
    let isNull = true

    for (const [key, childValue] of Object.entries(value)) {
      const child = resolveReferences(
        [...keys, key],
        childValue,
        tokens,
        resolved,
        chain,
      )

      if (child.valueReferences !== null) {
        isNull = false
      }

      valueReferencesEntries.push([key, child.valueReferences])
      valueEntries.push([key, child.value])
    }

    return {
      value: Object.fromEntries(valueEntries),
      valueReferences: isNull
        ? null
        : Object.fromEntries(valueReferencesEntries),
    }
  }
  return {
    value,
    valueReferences: null,
  }
}

export function resolveTokens(input: DesignTokensInput): TokenMap {
  const tokenMap = new Map<string, ResolvedToken>()

  const queue: TokenResolutionOperation[] = objectEntries(input).map(
    ([key, value]) => ({
      lineage: [
        {
          segmentKey: kebabCase(key),
          attributes: extractGroupAttributes(value),
        },
      ],
      tokens: value,
    }),
  )

  while (queue.length > 0) {
    const element = queue.shift()
    if (element != null) {
      const { lineage, tokens } = element

      if (isToken(tokens)) {
        const key = `{${lineage.map(({ segmentKey }) => segmentKey).join('.')}}`

        tokenMap.set(key, {
          key,
          attributes: lineage[lineage.length - 1]
            .attributes as ExtractedTokenAttributes,
          value: tokens.$value,
          valueReferences: null,
          path: lineage,
        })
      }

      const children = extractGroupChildren(tokens)
      if (children.length > 0) {
        for (const [segmentKey, childTokens] of children) {
          queue.push({
            lineage: [
              ...lineage,
              {
                segmentKey: kebabCase(segmentKey),
                attributes: extractGroupAttributes(childTokens),
              },
            ],
            tokens: childTokens,
          })
        }
      }
    }
  }

  for (const token of tokenMap.values()) {
    try {
      resolveTokenReferences(token, tokenMap, new Set(), [])
    } catch (e) {
      throw new Error(
        `Unable to resolveTokens: ${
          e instanceof Error ? e.message : 'an unknown error occured'
        }`,
      )
    }
  }

  return tokenMap
}

// export function createDictionary(input: DesignTokensInput): TokenDictionary {
//   const tokens = resolveTokens(input)

//   return { tokens }
// }
