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

export function isToken(
  tokens: DesignTokens,
): tokens is DesignToken & DesignTokenGroup {
  return '$value' in tokens
}

export function extractGroupAttributes(
  input: DesignTokens,
): ExtractedTokenGroupAttributes {
  return Object.fromEntries(
    Object.keys(input)
      .filter((key): key is keyof ExtractedTokenGroupAttributes =>
        key.startsWith('$'),
      )
      .map((key) => [key, input[key]]),
  ) as ExtractedTokenGroupAttributes
}

export function extractGroupChildren(
  input: DesignTokens,
): Array<[TokenKey, DesignTokens]> {
  return Object.keys(input)
    .filter((key): key is TokenKey => !key.startsWith('$'))
    .map((key) => [key, input[key]])
}
