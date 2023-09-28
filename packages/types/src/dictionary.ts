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

export interface ResolvedTokenValueReference {
  $ref: ResolvedToken
}

export interface ResolvedToken {
  key: string
  reference: string
  attributes: OneOrBoth<DesignToken, DesignTokenGroup>
  value: DesignTokenValue
  references: Map<string, ResolvedToken>
  path: ResolvedTokenPathSegment[]
}

export type TokenMap = Immutable<Map<string, ResolvedToken>>

export interface TokenDictionary {
  readonly tokens: TokenMap
}
