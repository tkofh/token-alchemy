import type {
  DesignTokenValue,
  ExtractedTokenAttributes,
  ExtractedTokenGroupAttributes,
} from './tokens'
import type { Immutable } from './util'

export interface ResolvedTokenPathSegment<
  Attributes extends object = { $value: string | number },
  GroupAttributes extends object = Attributes,
> {
  segmentKey: string
  attributes: ExtractedTokenGroupAttributes<Attributes, GroupAttributes>
}

export interface SerializedTokenReference {
  reference: string
  start: number
  end: number
}

export interface ResolvedTokenReference<
  Attributes extends object = { $value: string | number },
  GroupAttributes extends object = Attributes,
> {
  token: ResolvedToken<Attributes, GroupAttributes>
  start: number
  end: number
}

export interface ResolvedToken<
  Attributes extends object = { $value: string | number },
  GroupAttributes extends object = Attributes,
> {
  key: string
  reference: string
  attributes: ExtractedTokenAttributes<Attributes, GroupAttributes>
  value: DesignTokenValue<Attributes>
  references: Map<
    string,
    Array<ResolvedTokenReference<Attributes, GroupAttributes>>
  >
  dependencies: Set<ResolvedToken<Attributes, GroupAttributes>>
  path: Array<ResolvedTokenPathSegment<Attributes, GroupAttributes>>
}

export interface ResolveValueResult<
  Attributes extends object = { $value: string | number },
  GroupAttributes extends object = Attributes,
> {
  value: DesignTokenValue<Attributes>
  references: Array<
    [string, Array<ResolvedTokenReference<Attributes, GroupAttributes>>]
  >
}

export interface ResolveValueArgs<
  Attributes extends object = { $value: string | number },
  GroupAttributes extends object = Attributes,
> {
  keys: Array<string>
  value: DesignTokenValue<Attributes>
  tokens: TokenMap
  reference: ResolvedTokenReference<Attributes, GroupAttributes>
}

export type ResolveValueFn<
  Attributes extends object = { $value: string | number },
  GroupAttributes extends object = Attributes,
> = (
  args: ResolveValueArgs<Attributes, GroupAttributes>,
) => ResolveValueResult<Attributes, GroupAttributes>

export type TokenMap<
  Attributes extends object = { $value: string | number },
  GroupAttributes extends object = Attributes,
> = ReadonlyMap<string, ResolvedToken<Attributes, GroupAttributes>>

export interface TokenDictionary<
  Attributes extends object = { $value: string | number },
  GroupAttributes extends object = Attributes,
> {
  readonly all: () => IterableIterator<
    Immutable<ResolvedToken<Attributes, GroupAttributes>>
  >
  readonly get: (
    key: string,
  ) => Immutable<ResolvedToken<Attributes, GroupAttributes>> | undefined
  readonly has: (key: string) => boolean
  readonly serialize: (pretty?: boolean) => string
}

export interface SerializedToken<
  Attributes extends object = { $value: string | number },
  GroupAttributes extends object = Attributes,
> extends Omit<
    ResolvedToken<Attributes, GroupAttributes>,
    'references' | 'dependencies'
  > {
  references: Record<string, Array<SerializedTokenReference>>
  dependencies: Array<string>
}
