type TokenPrefix =
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
  | 'A'
  | 'B'
  | 'C'
  | 'D'
  | 'E'
  | 'F'
  | 'G'
  | 'H'
  | 'I'
  | 'J'
  | 'K'
  | 'L'
  | 'M'
  | 'N'
  | 'O'
  | 'P'
  | 'Q'
  | 'R'
  | 'S'
  | 'T'
  | 'U'
  | 'V'
  | 'W'
  | 'X'
  | 'Y'
  | 'Z'
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

export type TokenKey = `${TokenPrefix}${string}` | number

type EnsureKeyDollarPrefix<Key> = Key extends `$${string}`
  ? Key
  : Key extends string
    ? `$${Key}`
    : never

type StripKeyDollarPrefix<PrefixedKey> = PrefixedKey extends `$${infer Key}`
  ? Key
  : PrefixedKey

type DollarPrefixValue<Object, Key extends string> = Object extends {
  [K in EnsureKeyDollarPrefix<Key>]: infer Value
}
  ? Value
  : Object extends { [K in StripKeyDollarPrefix<Key>]: infer Value }
    ? Value
    : never

export type DollarPrefix<Object> = {
  [K in EnsureKeyDollarPrefix<keyof Object>]: DollarPrefixValue<Object, K>
}
