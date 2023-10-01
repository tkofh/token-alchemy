import type {
  Alphabet,
  DollarPrefix,
  Immutable,
  Numerals,
  OneOrBoth,
} from './util'

// eslint-disable-next-line @typescript-eslint/no-empty-interface -- extended in user land
export interface DesignTokenAttributes {}

// eslint-disable-next-line @typescript-eslint/no-empty-interface -- extended in user land
export interface DesignTokenGroupAttributes {}

type TokenPrefix = Alphabet | Uppercase<Alphabet> | Numerals

export type TokenKey = `${TokenPrefix}${string}`

export type DesignToken = Omit<
  DollarPrefix<DesignTokenAttributes>,
  '$value'
> & {
  $value: NonNullable<
    DollarPrefix<DesignTokenAttributes> extends { $value: infer TValue }
      ? TValue
      : string | number
  >
}

export type DesignTokenValue = DesignToken['$value']

export type DesignTokenGroup = Omit<
  DollarPrefix<DesignTokenGroupAttributes>,
  keyof DesignToken
>

export type DesignTokens = OneOrBoth<DesignTokenGroup, DesignToken> & {
  [K in TokenKey]: DesignTokens
}

export type DesignTokensInput = Record<TokenKey, DesignTokens>

export type ExtractedTokenAttributes = Immutable<
  OneOrBoth<DesignToken, DesignTokenGroup>
>
export type ExtractedTokenGroupAttributes = Immutable<
  OneOrBoth<DesignTokenGroup, DesignToken>
>
