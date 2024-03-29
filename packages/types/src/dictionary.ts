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

export interface SerializedTokenReference {
  reference: string
  start: number
  end: number
}

export interface ResolvedTokenReference {
  token: ResolvedToken
  start: number
  end: number
}

export interface ResolvedToken {
  key: string
  reference: string
  attributes: OneOrBoth<DesignToken, DesignTokenGroup>
  value: DesignTokenValue
  references: Map<string, Array<ResolvedTokenReference>>
  dependencies: Set<ResolvedToken>
  path: Array<ResolvedTokenPathSegment>
}

export type TokenMap = ReadonlyMap<string, ResolvedToken>

export interface TokenDictionary {
  readonly all: () => IterableIterator<Immutable<ResolvedToken>>
  readonly get: (key: string) => Immutable<ResolvedToken> | undefined
  readonly has: (key: string) => boolean
  readonly serialize: (pretty?: boolean) => string
}

export interface SerializedToken
  extends Omit<ResolvedToken, 'references' | 'dependencies'> {
  references: Record<string, Array<SerializedTokenReference>>
  dependencies: Array<string>
}
