import type {
  DesignToken,
  DesignTokenGroup,
  DesignTokenValue,
  ExtractedTokenGroupAttributes,
} from './tokens'
import type {
  ReplaceProperties,
  // ExtractKeys,
  Immutable,
  OneOrBoth,
  // SubsetOf,
} from './util'

export interface ResolvedTokenPathSegment {
  segmentKey: string
  attributes: ExtractedTokenGroupAttributes
}

export interface ResolvedTokenValueReference {
  $ref: ResolvedToken
}

export interface ResolvedToken {
  key: string
  attributes: OneOrBoth<DesignToken, DesignTokenGroup>
  value: DesignTokenValue
  valueReferences: ReplaceProperties<
    DesignTokenValue,
    ResolvedTokenValueReference | null
  > | null
  path: ResolvedTokenPathSegment[]
}

// interface TokenReference {
//   // eslint-disable-next-line @typescript-eslint/no-redundant-type-constituents -- type could be extended in user land
//   key: '$value' | ExtractKeys<DesignTokenValue>
//   token: ResolvedToken
// }

// export type TokenResolverFilter = (
//   token: ResolvedToken,
//   branch: ReadonlySet<string>,
// ) => SubsetOf<DesignTokenValue>

export type TokenMap = Immutable<Map<string, ResolvedToken>>

export interface TokenDictionary {
  readonly tokens: TokenMap
  // readonly getReferences: (
  //   token: Immutable<ResolvedToken>,
  //   filter?: TokenResolverFilter,
  // ) => Immutable<TokenReference>
}
