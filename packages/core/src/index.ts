import type { TokenKey } from './types'

type DollarPrefix<T extends object> = {
  [K in keyof T]: K extends `$${string}` ? T[K] : never
}

type TokenInput<T extends DollarPrefix<T>> = T & {
  [Key in TokenKey]: TokenInput<T>
}

type TokenValue<T extends DollarPrefix<T>> = T extends { $value: infer V }
  ? V
  : never

type TokensInput<T extends DollarPrefix<T>> = Record<TokenKey, TokenInput<T>>

type TokenParent<T extends DollarPrefix<T>, C = never> = TokenNode<T, C> | null

class TokenNode<T extends DollarPrefix<T>, C = never> {
  readonly dictionary: Dictionary<T, C>
  readonly token: T | null
  readonly #parent: TokenParent<T, C>
  readonly #keyPart: string | null

  readonly #children = new Map<string, TokenNode<T, C>>()

  constructor(
    dictionary: Dictionary<T, C>,
    parent: TokenNode<T, C> | null = null,
    keyPart: string | null = null,
    token: T | null = null,
  ) {
    this.dictionary = dictionary
    this.token = token
    this.#parent = parent
    this.#keyPart = keyPart
  }

  keyParts(): ReadonlyArray<string> {
    if (this.#keyPart === null && this.#parent === null) {
      return []
    }

    if (this.#parent === null) {
      return [this.#keyPart as string]
    }

    if (this.#keyPart === null) {
      return this.#parent.keyParts()
    }

    return this.#parent.keyParts().concat(this.#keyPart)
  }

  child(keyPart: string, token: T | null): TokenNode<T, C> {
    const child =
      this.#children.get(keyPart) ??
      new TokenNode(this.dictionary, this, keyPart, token)
    this.#children.set(keyPart, child)

    return child
  }
}

class Token<T extends DollarPrefix<T>, C = never> {
  readonly #value: TokenValue<T>
  readonly #node: TokenNode<T, C>

  constructor(node: TokenNode<T, C>) {
    this.#node = node
    this.#value = (
      this.#node.token as unknown as { $value: TokenValue<T> }
    ).$value
  }

  key(): string {
    return this.#node.keyParts().join('-')
  }

  value(): TokenValue<T> {
    return this.#value
  }

  reference(): string {
    return `{${this.#node.keyParts().join('.')}}`
  }

  path(): string {
    return this.#node.keyParts().join('/')
  }

  format(context: C): string {
    return this.#node.dictionary.format(this.reference(), context)
  }
}

type Formatter<T extends DollarPrefix<T>, C> = (
  value: Token<T, C>,
  context: C,
  resolve: (alias: string, context?: C) => string,
) => string

interface DictionaryOptions<T extends DollarPrefix<T>, C> {
  formatter: Formatter<T, C>
}

class Dictionary<T extends DollarPrefix<T>, C = never> {
  readonly #keys = new Map<string, string>()
  readonly #tokens = new Map<string, Token<T, C>>()
  readonly #root = new TokenNode<T, C>(this)
  readonly #options: DictionaryOptions<T, C>

  constructor(options: Partial<DictionaryOptions<T, C>> = {}) {
    this.#options = {
      formatter:
        options.formatter ??
        (((token: Token<T, C>) => token.reference()) as unknown as Formatter<
          T,
          C
        >),
    }
  }

  insert(tokens: TokensInput<T>) {
    const queue: Array<[TokenNode<T, C>, TokensInput<T>]> = [
      [this.#root, tokens],
    ]

    while (queue.length) {
      // biome-ignore lint/style/noNonNullAssertion: will always be defined due to loop predicate
      const [parent, input] = queue.shift()!

      for (const [key, value] of Object.entries(input)) {
        if (key.startsWith('$')) {
          continue
        }

        const node = parent.child(
          key,
          Object.fromEntries(
            Object.entries(value).filter(([key]) => key.startsWith('$')),
          ) as DollarPrefix<T>,
        )

        queue.push([node, value])

        if ('$value' in value && value.$value !== undefined) {
          this.#insertToken(node)
        }
      }
    }
  }

  resolve(alias: string): Token<T, C> {
    const token = this.tryResolve(alias)

    if (!token) {
      throw new Error(`Token not found: ${alias}`)
    }

    return token
  }

  tryResolve(alias: string): Token<T, C> | undefined {
    return this.#tokens.get(alias)
  }

  format(alias: string, context: C): string {
    const visited = new Set<Token<T, C>>()
    const resolver = (alias: string) => {
      const token = this.resolve(alias)

      if (visited.has(token)) {
        throw new Error(
          `Circular reference: ${Array.from(visited, () => token.path()).join(' -> ')} --> ${token.path()}`,
        )
      }

      visited.add(token)

      return this.#options.formatter(token, context, resolver)
    }

    return resolver(alias)
  }

  #insertToken(node: TokenNode<T, C>) {
    const token = new Token(node)

    const tokenKey = token.key()
    const tokenReference = token.reference()

    if (this.#keys.has(tokenKey)) {
      const other = this.#tokens.get(
        this.#keys.get(tokenKey) as string,
      ) as Token<T, C>
      throw new Error(
        `Duplicate token key: ${tokenKey} (${other.path()} and ${token.path()})`,
      )
    }

    this.#keys.set(tokenKey, tokenReference)
    this.#tokens.set(tokenReference, token)

    console.log(token.key())
  }
}

// ---------------------------

type MyTokenBase = {
  $tier:
    | 'system'
    | 'theme'
    | 'group'
    | 'entity'
    | 'kind'
    | 'scope'
    | 'variant'
    | 'modifier'
    | 'state'
    | 'scale'
    | 'mode'
}

type MyToken =
  | MyTokenBase
  | (MyTokenBase & {
      $value:
        | string
        | number
        | { light: string | number; dark: string | number }
    })
type MyContext = { mode: 'light' | 'dark' }

const dictionary = new Dictionary<MyToken, MyContext>({
  formatter: (token, context) => {
    const value = token.value()

    if (typeof value === 'object') {
      return String(value[context.mode])
    }

    return String(value)
  },
})

dictionary.insert({
  color: {
    $tier: 'system',

    gray: {
      $tier: 'kind',
      1: {
        $tier: 'variant',
        $value: { light: '{color.gray1.light}', dark: '{color.gray1.dark}' },
        light: {
          $tier: 'mode',
          $value: 'color(display-p3 0.988 0.988 0.988)',
        },
        dark: {
          $tier: 'mode',
          $value: 'color(display-p3 0.067 0.067 0.067)',
        },
      },
      2: {
        $tier: 'variant',
        $value: { light: '{color.gray2.light}', dark: '{color.gray2.dark}' },
        light: {
          $tier: 'mode',
          $value: 'color(display-p3 0.975 0.975 0.975)',
        },
        dark: {
          $tier: 'mode',
          $value: 'color(display-p3 0.098 0.098 0.098)',
        },
      },
      3: {
        $tier: 'variant',
        $value: { light: '{color.gray3.light}', dark: '{color.gray3.dark}' },
        light: {
          $tier: 'mode',
          $value: 'color(display-p3 0.939 0.939 0.939)',
        },
        dark: {
          $tier: 'mode',
          $value: 'color(display-p3 0.135 0.135 0.135)',
        },
      },
      4: {
        $tier: 'variant',
        $value: { light: '{color.gray4.light}', dark: '{color.gray4.dark}' },
        light: {
          $tier: 'mode',
          $value: 'color(display-p3 0.908 0.908 0.908)',
        },
        dark: {
          $tier: 'mode',
          $value: 'color(display-p3 0.163 0.163 0.163)',
        },
      },
      5: {
        $tier: 'variant',
        $value: { light: '{color.gray5.light}', dark: '{color.gray5.dark}' },
        light: {
          $tier: 'mode',
          $value: 'color(display-p3 0.88 0.88 0.88)',
        },
        dark: {
          $tier: 'mode',
          $value: 'color(display-p3 0.192 0.192 0.192)',
        },
      },
      6: {
        $tier: 'variant',
        $value: { light: '{color.gray6.light}', dark: '{color.gray6.dark}' },
        light: {
          $tier: 'mode',
          $value: 'color(display-p3 0.849 0.849 0.849)',
        },
        dark: {
          $tier: 'mode',
          $value: 'color(display-p3 0.228 0.228 0.228)',
        },
      },
      7: {
        $tier: 'variant',
        $value: { light: '{color.gray7.light}', dark: '{color.gray7.dark}' },
        light: {
          $tier: 'mode',
          $value: 'color(display-p3 0.807 0.807 0.807)',
        },
        dark: {
          $tier: 'mode',
          $value: 'color(display-p3 0.283 0.283 0.283)',
        },
      },
      8: {
        $tier: 'variant',
        $value: { light: '{color.gray8.light}', dark: '{color.gray8.dark}' },
        light: {
          $tier: 'mode',
          $value: 'color(display-p3 0.732 0.732 0.732)',
        },
        dark: {
          $tier: 'mode',
          $value: 'color(display-p3 0.375 0.375 0.375)',
        },
      },
      9: {
        $tier: 'variant',
        $value: { light: '{color.gray9.light}', dark: '{color.gray9.dark}' },
        light: {
          $tier: 'mode',
          $value: 'color(display-p3 0.553 0.553 0.553)',
        },
        dark: {
          $tier: 'mode',
          $value: 'color(display-p3 0.431 0.431 0.431)',
        },
      },
      10: {
        $tier: 'variant',
        $value: { light: '{color.gray10.light}', dark: '{color.gray10.dark}' },
        light: {
          $tier: 'mode',
          $value: 'color(display-p3 0.512 0.512 0.512)',
        },
        dark: {
          $tier: 'mode',
          $value: 'color(display-p3 0.484 0.484 0.484)',
        },
      },
      11: {
        $tier: 'variant',
        $value: { light: '{color.gray11.light}', dark: '{color.gray11.dark}' },
        light: {
          $tier: 'mode',
          $value: 'color(display-p3 0.392 0.392 0.392)',
        },
        dark: {
          $tier: 'mode',
          $value: 'color(display-p3 0.706 0.706 0.706)',
        },
      },
      12: {
        $tier: 'variant',
        $value: { light: '{color.gray12.light}', dark: '{color.gray12.dark}' },
        light: {
          $tier: 'mode',
          $value: 'color(display-p3 0.125 0.125 0.125)',
        },
        dark: {
          $tier: 'mode',
          $value: 'color(display-p3 0.933 0.933 0.933)',
        },
      },
    },
  },
})

console.log(dictionary.format('{color.gray.1.light}', { mode: 'light' }))
