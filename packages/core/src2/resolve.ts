import type {
  DesignTokenValue,
  DesignTokens,
  DesignTokensInput,
  ExtractedTokenAttributes,
  ResolvedToken,
  ResolvedTokenPathSegment,
  TokenMap,
} from '@token-alchemy/types'
import { kebabCase } from 'lodash-es'
import { resolveDependencies } from './dependencies'
import { resolveReferences } from './references'
import {
  extractGroupAttributes,
  extractGroupChildren,
  isToken,
  objectEntries,
} from './util'

interface TokenResolutionOperation<
  Attributes extends object = { $value: string | number },
  GroupAttributes extends object = Attributes,
> {
  lineage: Array<ResolvedTokenPathSegment<Attributes, GroupAttributes>>
  tokens: DesignTokens<Attributes, GroupAttributes>
}

export function resolveTokens<
  Attributes extends object = { $value: string | number },
  GroupAttributes extends object = Attributes,
>(
  input: DesignTokensInput<Attributes, GroupAttributes>,
): TokenMap<Attributes, GroupAttributes> {
  const tokenMap = new Map<string, ResolvedToken<Attributes, GroupAttributes>>()

  const queue: Array<TokenResolutionOperation<Attributes, GroupAttributes>> =
    objectEntries(input).map(([key, value]) => ({
      lineage: [
        {
          segmentKey: kebabCase(key),
          attributes: extractGroupAttributes<Attributes, GroupAttributes>(
            value,
          ),
        },
      ],
      tokens: value,
    }))

  while (queue.length > 0) {
    const element = queue.shift()
    if (element != null) {
      const { lineage, tokens } = element

      if (isToken<Attributes, GroupAttributes>(tokens)) {
        const keyParts = lineage.map(({ segmentKey }) => segmentKey)
        const reference = `{${keyParts.join('.')}}`

        tokenMap.set(reference, {
          key: keyParts.join('-'),
          reference,
          attributes: lineage[lineage.length - 1]
            .attributes as ExtractedTokenAttributes<
            Attributes,
            GroupAttributes
          >,
          value: tokens.$value as DesignTokenValue<Attributes>,
          references: new Map(),
          dependencies: new Set(),
          path: lineage,
        })
      }

      const children = extractGroupChildren<Attributes, GroupAttributes>(tokens)
      if (children.length > 0) {
        for (const [segmentKey, childTokens] of children) {
          queue.push({
            lineage: [
              ...lineage,
              {
                segmentKey: kebabCase(segmentKey),
                attributes: extractGroupAttributes<Attributes, GroupAttributes>(
                  childTokens,
                ),
              },
            ],
            tokens: childTokens,
          })
        }
      }
    }
  }

  const tokensWithReferences = resolveReferences<Attributes, GroupAttributes>(
    tokenMap,
  )
  resolveDependencies<Attributes, GroupAttributes>(
    tokenMap,
    tokensWithReferences,
  )

  return tokenMap
}
