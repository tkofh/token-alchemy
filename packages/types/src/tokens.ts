import type {
  Alphabet,
  DollarPrefix,
  Immutable,
  Numerals,
  OneOrBoth,
} from './util'

// biome-ignore lint/complexity/noBannedTypes: This interface is extended in userland
export type DesignTokenAttributes = {}

// biome-ignore lint/complexity/noBannedTypes: This interface is extended in userland
export type DesignTokenGroupAttributes = {}

type TokenPrefix = Alphabet | Uppercase<Alphabet> | Numerals

export type TokenKey = `${TokenPrefix}${string}`

export type DesignToken = Omit<
  DollarPrefix<DesignTokenAttributes>,
  '$value'
> & {
  $value: NonNullable<
    DollarPrefix<DesignTokenAttributes> extends { $value: infer Value }
      ? Value
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
