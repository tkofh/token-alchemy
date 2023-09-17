export type Alphabet =
  | 'a'
  | 'b'
  | 'c'
  | 'd'
  | 'e'
  | 'f'
  | 'g'
  | 'h'
  | 'i'
  | 'j'
  | 'k'
  | 'l'
  | 'm'
  | 'n'
  | 'o'
  | 'p'
  | 'q'
  | 'r'
  | 's'
  | 't'
  | 'u'
  | 'v'
  | 'w'
  | 'x'
  | 'y'
  | 'z'

export type Numerals = '0' | '1' | '2' | '3' | '4' | '5' | '6' | '7' | '8' | '9'

type ShallowMergeRecordLeft<T, U> = T & {
  [K in Exclude<keyof U, keyof T>]?: never
}
export type MutuallyExclusive<A, B> =
  | ShallowMergeRecordLeft<A, B>
  | ShallowMergeRecordLeft<B, A>

export type OneOrBoth<A, B> = MutuallyExclusive<A, A & B>

type EnsureKeyDollarPrefix<TKey> = TKey extends `$${string}`
  ? TKey
  : TKey extends string
  ? `$${TKey}`
  : never

type StripKeyDollarPrefix<TPrefixedKey> = TPrefixedKey extends `$${infer TKey}`
  ? TKey
  : TPrefixedKey

type DollarPrefixValue<
  TObject extends object,
  TKey extends string,
> = TObject extends { [K in EnsureKeyDollarPrefix<TKey>]: infer TValue }
  ? TValue
  : TObject extends { [K in StripKeyDollarPrefix<TKey>]: infer TValue }
  ? TValue
  : never

export type DollarPrefix<TObject extends object> = {
  [K in EnsureKeyDollarPrefix<keyof TObject>]: DollarPrefixValue<TObject, K>
}

type ImmutablePrimitive =
  | undefined
  | null
  | boolean
  | string
  | number
  | ((...args: unknown[]) => unknown)

type ImmutableArray<T> = ReadonlyArray<Immutable<T>>
type ImmutableMap<K, V> = ReadonlyMap<Immutable<K>, Immutable<V>>
type ImmutableSet<T> = ReadonlySet<Immutable<T>>
type ImmutableObject<T> = { readonly [K in keyof T]: Immutable<T[K]> }

export type Immutable<T> = T extends ImmutablePrimitive
  ? T
  : T extends Array<infer U>
  ? ImmutableArray<U>
  : T extends Map<infer K, infer V>
  ? ImmutableMap<K, V>
  : T extends Set<infer M>
  ? ImmutableSet<M>
  : ImmutableObject<T>

export type ExtractKeys<T> = T extends object ? keyof T : never
export type SubsetOf<T> =
  | T
  | (T extends object ? { [K in keyof T]: T[K] }[keyof T] : never)
