import type { Token } from './token'

// biome-ignore format: entire alphabet doesn't need to wrap
type TokenPrefix = 'a' | 'b' | 'c' | 'd' | 'e' | 'f' | 'g' | 'h' | 'i' | 'j' | 'k' | 'l' | 'm' | 'n' | 'o' | 'p' | 'q' | 'r' | 's' | 't' | 'u' | 'v' | 'w' | 'x' | 'y' | 'z' | 'A' | 'B' | 'C' | 'D' | 'E' | 'F' | 'G' | 'H' | 'I' | 'J' | 'K' | 'L' | 'M' | 'N' | 'O' | 'P' | 'Q' | 'R' | 'S' | 'T' | 'U' | 'V' | 'W' | 'X' | 'Y' | 'Z' | '0' | '1' | '2' | '3' | '4' | '5' | '6' | '7' | '8' | '9'

type Keys<T> = T extends unknown ? keyof T : never
type ShallowMergeRecordLeft<T, U> = T & {
  [K in Exclude<Keys<U>, keyof T>]?: never
}
type DistributeMerges<A, B> = A extends unknown
  ? ShallowMergeRecordLeft<A, B>
  : never
type MutuallyExclusive<T> = DistributeMerges<T, T>

type WithTokenChildren<T extends DollarPrefix<T>> = T & {
  [Key in TokenKey]: TokenInput<T>
}

export type TokenInput<T extends DollarPrefix<T>> = WithTokenChildren<
  MutuallyExclusive<T>
>

export type TokensInput<T extends DollarPrefix<T>> = Record<
  TokenKey,
  TokenInput<T>
>

export type TokenKey = `${TokenPrefix}${string}` | number

export type DollarPrefix<T extends object> = {
  [K in keyof T]: K extends `$${string}` ? T[K] : never
}

export type ReplaceInterceptor<T extends DollarPrefix<T>> = (
  handler: ReplaceHandler<T>,
  token: Token<T>,
) => string

export interface ReferenceCountingContext<T extends DollarPrefix<T>>
  extends FormattingContext<T> {
  readonly depth: number
  readonly maxDepth: number
}

export type TokenResolver<T extends DollarPrefix<T>> = (
  reference: string,
) => Token<T>

export type ReplaceHandler<T extends DollarPrefix<T>> = (
  token: Token<T>,
) => string

export type TokenReplacer<T extends DollarPrefix<T>> = (
  formatted: string,
  handler: ReplaceHandler<T>,
) => string

export interface FormattingContext<T extends DollarPrefix<T>> {
  readonly token: Token<T>
  readonly resolve: TokenResolver<T>
  readonly replace: TokenReplacer<T>
}

export type Formatter<T extends DollarPrefix<T>> = (
  api: FormattingContext<T>,
) => string

export type TokenPredicate<T extends DollarPrefix<T>> = (
  token: Token<T>,
) => boolean
