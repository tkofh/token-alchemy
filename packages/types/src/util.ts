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

type EnsureKeyDollarPrefix<Key> = Key extends `$${string}`
  ? Key
  : Key extends string
    ? `$${Key}`
    : never

type StripKeyDollarPrefix<PrefixedKey> = PrefixedKey extends `$${infer Key}`
  ? Key
  : PrefixedKey

type DollarPrefixValue<
  Object extends object,
  Key extends string,
> = Object extends { [K in EnsureKeyDollarPrefix<Key>]: infer Value }
  ? Value
  : Object extends { [K in StripKeyDollarPrefix<Key>]: infer Value }
    ? Value
    : never

export type DollarPrefix<Object extends object> = {
  [K in EnsureKeyDollarPrefix<keyof Object>]: DollarPrefixValue<Object, K>
}

type ImmutablePrimitive =
  | undefined
  | null
  | boolean
  | string
  | number
  | ((...args: Array<unknown>) => unknown)

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

// export type ReplaceProperties<T, Augment> =
//   | Augment
//   | (T extends object
//       ? { [K in keyof T]: ReplaceProperties<T[K], Augment> }
//       : never)

export type JsValue =
  | string
  | number
  | boolean
  | null
  | undefined
  | { [x: string]: JsValue }
  | Array<JsValue>
