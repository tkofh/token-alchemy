import type {
  DesignTokens,
  ExtractedTokenGroupAttributes,
  ExtractedTokenAttributes,
  TokenKey,
} from '@token-alchemy/types'

export function objectEntries<T extends object>(
  input: T,
): Array<{ [K in keyof T]: [K, T[K]] }[keyof T]> {
  return Object.entries(input) as Array<{ [K in keyof T]: [K, T[K]] }[keyof T]>
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

export function extractTokenAttributes(
  input: DesignTokens,
): ExtractedTokenAttributes {
  return Object.fromEntries(
    Object.keys(input)
      .filter((key): key is keyof ExtractedTokenAttributes =>
        key.startsWith('$'),
      )
      .map((key) => [key, input[key]]),
  ) as ExtractedTokenAttributes
}

export function extractGroupChildren(
  input: DesignTokens,
): Array<[TokenKey, DesignTokens]> {
  return Object.keys(input)
    .filter((key): key is TokenKey => !key.startsWith('$'))
    .map((key) => [key, input[key]])
}
