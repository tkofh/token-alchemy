import type {
  DesignToken,
  DesignTokenGroup,
  DesignTokenValue,
  ExtractedTokenGroupAttributes,
} from './tokens'
import type { Immutable, OneOrBoth } from './util'

export interface ResolvedTokenPathSegment {
  segmentKey: string
  attributes: ExtractedTokenGroupAttributes
}

export interface ResolvedToken {
  key: string
  reference: string
  attributes: OneOrBoth<DesignToken, DesignTokenGroup>
  value: DesignTokenValue
  references: Map<string, ResolvedToken>
  path: ResolvedTokenPathSegment[]
}

export type TokenMap = ReadonlyMap<string, ResolvedToken>

export interface TokenDictionary {
  readonly all: () => IterableIterator<Immutable<ResolvedToken>>
  readonly get: (key: string) => Immutable<ResolvedToken> | undefined
  readonly has: (key: string) => boolean
  readonly serialize: (pretty?: boolean) => string
}

export interface SerializedToken extends Omit<ResolvedToken, 'references'> {
  references: Record<string, string>
}
