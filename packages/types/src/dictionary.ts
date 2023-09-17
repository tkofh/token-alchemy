import type {
  DesignToken,
  DesignTokenGroup,
  DesignTokenValue,
  ExtractedTokenGroupAttributes,
} from './tokens'
import type { ExtractKeys, Immutable, OneOrBoth, SubsetOf } from './util'

export interface ResolvedTokenPathSegment {
  readonly segmentKey: string
  readonly attributes: ExtractedTokenGroupAttributes
}

export interface ResolvedToken {
  readonly key: string
  readonly attributes: Immutable<OneOrBoth<DesignToken, DesignTokenGroup>>
  readonly value: DesignTokenValue
  readonly path: readonly ResolvedTokenPathSegment[]
}

interface TokenReference {
  // eslint-disable-next-line @typescript-eslint/no-redundant-type-constituents -- type could be extended in user land
  readonly key: '$value' | ExtractKeys<DesignTokenValue>
  readonly token: ResolvedToken
}

export type TokenResolverFilter = (
  token: ResolvedToken,
  branch: ReadonlySet<string>,
) => SubsetOf<DesignTokenValue>

export type TokenMap = Immutable<Map<string, ResolvedToken>>

export interface TokenDictionary {
  readonly tokens: TokenMap
  readonly getReferences: (
    token: ResolvedToken,
    filter?: TokenResolverFilter,
  ) => Immutable<TokenReference>
}
