export interface DesignTokenSpecificAttributes {
  $value: string | number
}

export interface DesignTokenGroupAttributes {
  $tier?: string | undefined
}

type GroupOrTokenPrefix =
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
  | '_'
  | '0'
  | '1'
  | '2'
  | '3'
  | '4'
  | '5'
  | '6'
  | '7'
  | '8'
  | '9'

type GroupOrTokenKey = `${
  | GroupOrTokenPrefix
  | Uppercase<GroupOrTokenPrefix>}${string}`

interface DesignTokenAttributes
  extends DesignTokenSpecificAttributes,
    DesignTokenGroupAttributes {}

export type DesignTokens = (
  | DesignTokenAttributes
  | DesignTokenGroupAttributes
) & {
  [K in GroupOrTokenKey]: DesignTokens
}

export const foo: DesignTokens = {
  $value: '',
  alpha: {
    $value: 'hello',
    $tier: 'hi',
  },
}
