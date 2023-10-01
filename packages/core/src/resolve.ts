import type {
  DesignTokensInput,
  TokenMap,
  ResolvedToken,
  ResolvedTokenPathSegment,
  DesignTokens,
  ExtractedTokenAttributes,
} from '@token-alchemy/types'
import { kebabCase } from 'lodash-es'
import {
  extractGroupAttributes,
  extractGroupChildren,
  isToken,
  objectEntries,
} from './util'
import { resolveTokenMapReferences } from './references'

interface TokenResolutionOperation {
  lineage: ResolvedTokenPathSegment[]
  tokens: DesignTokens
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
        const keyParts = lineage.map(({ segmentKey }) => segmentKey)
        const reference = `{${keyParts.join('.')}}`

        tokenMap.set(reference, {
          key: keyParts.join('-'),
          reference,
          attributes: lineage[lineage.length - 1]
            .attributes as ExtractedTokenAttributes,
          value: tokens.$value,
          references: new Map(),
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

  resolveTokenMapReferences(tokenMap)

  return tokenMap
}
