import type {
  DesignToken,
  DesignTokenGroup,
  DesignTokenValue,
  ExtractedTokenGroupAttributes,
} from './tokens'
import type { ReplaceProperties, Immutable, OneOrBoth } from './util'

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
  valueReferences: ReplaceProperties<
    DesignTokenValue,
    ResolvedTokenValueReference | null
  > | null
  path: ResolvedTokenPathSegment[]
}

export type TokenMap = Immutable<Map<string, ResolvedToken>>

export interface TokenDictionary {
  readonly tokens: TokenMap
}
