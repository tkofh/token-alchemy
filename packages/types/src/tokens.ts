import type { Alphabet, Numerals } from './util'

// eslint-disable-next-line @typescript-eslint/no-empty-interface -- extended in user land
export interface DesignTokenAttributes {}

// eslint-disable-next-line @typescript-eslint/no-empty-interface -- extended in user land
export interface DesignTokenGroupAttributes {}

type TokenPrefix = Alphabet | Uppercase<Alphabet> | Numerals

type TokenKey = `${TokenPrefix}${string}`

type TokenReservedKeys = '$value'

export type ResolvedDesignTokenAttributes = Omit<
  DesignTokenAttributes,
  TokenReservedKeys
>

export type ResolvedDesignTokenGroupAttributes = Omit<
  DesignTokenGroupAttributes,
  // eslint-disable-next-line @typescript-eslint/no-redundant-type-constituents -- DesignTokenAttributes extended in user land
  TokenReservedKeys | keyof ResolvedDesignTokenAttributes
>

export type DesignTokenValue = string | number

export interface DesignToken
  extends ResolvedDesignTokenAttributes,
    ResolvedDesignTokenGroupAttributes {
  $value: DesignTokenValue
}

export type DesignTokens = (
  | DesignToken
  | ResolvedDesignTokenGroupAttributes
) & {
  [K in TokenKey]: DesignTokens
}
