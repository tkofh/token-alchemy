import type {
  Alphabet,
  DollarPrefix,
  Immutable,
  Numerals,
  OneOrBoth,
} from './util'

type TokenPrefix = Alphabet | Uppercase<Alphabet> | Numerals

export type TokenKey = `${TokenPrefix}${string}`

export type DesignToken<Attributes extends object = Record<string, unknown>> =
  Omit<DollarPrefix<Attributes>, '$value'> & {
    $value: NonNullable<
      DollarPrefix<Attributes> extends { $value: infer Value }
        ? Value
        : string | number
    >
  }

export type DesignTokenValue<
  Attributes extends object = { $value: string | number },
> = DesignToken<Attributes>['$value']

export type DesignTokenGroup<
  Attributes extends object = { $value: string | number },
  GroupAttributes extends object = Attributes,
> = Omit<DollarPrefix<GroupAttributes>, keyof DesignToken<Attributes>>

export type DesignTokens<
  Attributes extends object = { $value: string | number },
  GroupAttributes extends object = Attributes,
> = OneOrBoth<
  DesignTokenGroup<Attributes, GroupAttributes>,
  DesignToken<Attributes>
> & {
  [K in TokenKey]: DesignTokens<Attributes, GroupAttributes>
}

export type DesignTokensInput<
  Attributes extends object = { $value: string | number },
  GroupAttributes extends object = Attributes,
> = Record<TokenKey, DesignTokens<Attributes, GroupAttributes>>

export type ExtractedTokenAttributes<
  Attributes extends object = { $value: string | number },
  GroupAttributes extends object = Attributes,
> = Immutable<
  OneOrBoth<
    DesignToken<Attributes>,
    DesignTokenGroup<Attributes, GroupAttributes>
  >
>
export type ExtractedTokenGroupAttributes<
  Attributes extends object = { $value: string | number },
  GroupAttributes extends object = Attributes,
> = Immutable<
  OneOrBoth<
    DesignTokenGroup<Attributes, GroupAttributes>,
    DesignToken<Attributes>
  >
>
