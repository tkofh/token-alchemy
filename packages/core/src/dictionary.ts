import type {
  DesignTokensInput,
  TokenDictionary,
  TokenMap,
  ResolvedToken,
  ResolvedTokenPathSegment,
  DesignTokens,
  DesignToken,
  DesignTokenGroup,
  ExtractedTokenAttributes,
} from '@token-alchemy/types'
import kebabCase from 'lodash-es/kebabCase'
import {
  extractGroupAttributes,
  extractGroupChildren,
  objectEntries,
} from './util'

interface TokenResolutionOperation {
  lineage: ResolvedTokenPathSegment[]
  tokens: DesignTokens
}

function isToken(
  tokens: DesignTokens,
): tokens is DesignToken & DesignTokenGroup {
  return '$value' in tokens
}

export function resolveTokens(input: DesignTokensInput): TokenMap {
  const tokenMap = new Map<string, ResolvedToken>()

  const queue: TokenResolutionOperation[] = []
  for (const [key, value] of objectEntries(input)) {
    queue.push({
      lineage: [
        {
          segmentKey: kebabCase(key),
          attributes: extractGroupAttributes(value),
        },
      ],
      tokens: value,
    })
  }

  while (queue.length > 0) {
    const element = queue.shift()
    if (element != null) {
      const { lineage, tokens } = element

      if (isToken(tokens)) {
        const key = lineage.map(({ segmentKey }) => segmentKey).join('-')

        tokenMap.set(key, {
          key,
          attributes: lineage[lineage.length - 1]
            .attributes as ExtractedTokenAttributes,
          value: tokens.$value,
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

  return tokenMap
}

export function createDictionary(input: DesignTokensInput): TokenDictionary {
  const tokens = resolveTokens(input)

  return { tokens }
}
