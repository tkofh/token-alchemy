import type { DesignTokensInput } from '@token-alchemy/types'

export function defineTokens<
  Attributes extends object = { $value: string | number },
  GroupAttributes extends object = Attributes,
>(
  tokens: DesignTokensInput<Attributes, GroupAttributes>,
): DesignTokensInput<Attributes, GroupAttributes> {
  return tokens
}
