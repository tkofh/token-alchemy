import type {
  DesignToken,
  DesignTokenGroup,
  DesignTokens,
  ExtractedTokenGroupAttributes,
  TokenKey,
} from '@token-alchemy/types'

export function objectEntries<T extends object>(
  input: T,
): Array<{ [K in keyof T]: [K, T[K]] }[keyof T]> {
  return Object.entries(input) as Array<{ [K in keyof T]: [K, T[K]] }[keyof T]>
}

export function objectKeys<T extends object>(input: T): Array<keyof T> {
  return Object.keys(input) as Array<keyof T>
}

export function isToken<
  Attributes extends object = { $value: string | number },
  GroupAttributes extends object = Attributes,
>(
  tokens: DesignTokens<Attributes, GroupAttributes>,
): tokens is DesignToken<Attributes> &
  DesignTokenGroup<Attributes, GroupAttributes> {
  return '$value' in tokens
}

export function extractGroupAttributes<
  Attributes extends object = { $value: string | number },
  GroupAttributes extends object = Attributes,
>(
  input: DesignTokens<Attributes, GroupAttributes>,
): ExtractedTokenGroupAttributes<Attributes, GroupAttributes> {
  return Object.fromEntries(
    objectKeys(input)
      .filter((key) => key.startsWith('$'))
      .map((key) => [key, input[key]]),
  ) as ExtractedTokenGroupAttributes<Attributes, GroupAttributes>
}

export function extractGroupChildren<
  Attributes extends object = { $value: string | number },
  GroupAttributes extends object = Attributes,
>(
  input: DesignTokens<Attributes, GroupAttributes>,
): Array<[TokenKey, DesignTokens<Attributes, GroupAttributes>]> {
  return Object.keys(input)
    .filter((key): key is TokenKey => !key.startsWith('$'))
    .map((key) => [key, input[key]])
}
