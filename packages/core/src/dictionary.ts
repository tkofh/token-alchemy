import { TokenNode } from './node'
import { Token } from './token'
import type { DollarPrefix, TokenKey } from './types'

type Keys<T> = T extends unknown ? keyof T : never
type ShallowMergeRecordLeft<T, U> = T & {
  [K in Exclude<Keys<U>, keyof T>]?: never
}
type DistributeMerges<A, B> = A extends unknown
  ? ShallowMergeRecordLeft<A, B>
  : never
type MutuallyExclusive<T> = DistributeMerges<T, T>

type WithTokenChildren<T extends DollarPrefix<T>> = T & {
  [Key in TokenKey]: TokenInput<T>
}

type TokenInput<T extends DollarPrefix<T>> = WithTokenChildren<
  MutuallyExclusive<T>
>

type TokensInput<T extends DollarPrefix<T>> = Record<TokenKey, TokenInput<T>>

type TokenReplaceHandler<T extends DollarPrefix<T>, C> = (
  token: Token<T, C>,
) => string

type TokenReplaceInterceptor<T extends DollarPrefix<T>, C> = (
  replacer: TokenReplaceHandler<T, C>,
  token: Token<T, C>,
) => string

type TokenReplacer<T extends DollarPrefix<T>, C> = (
  formatted: string,
  replace: TokenReplaceHandler<T, C>,
) => string

export const REFERENCE_PATTERN =
  /({[a-zA-Z0-9]+(?:-[a-zA-Z0-9]+)*(?:\.[a-zA-Z0-9]+(?:-[a-zA-Z0-9]+)*)*})/g

export type FormattingContext<T extends DollarPrefix<T>, C> = {
  readonly token: Token<T, C>
  readonly context: C
  readonly resolve: TokenResolver<T, C>
  readonly replace: TokenReplacer<T, C>
}

export type Formatter<T extends DollarPrefix<T>, C> = (
  api: FormattingContext<T, C>,
) => string

type TokenResolver<T extends DollarPrefix<T>, C> = (
  reference: string,
) => Token<T, C>

type ReferenceCountingContext<T extends DollarPrefix<T>, C> = FormattingContext<
  T,
  C
> & {
  readonly depth: number
  readonly maxDepth: number
}

type TokenPredicate<T extends DollarPrefix<T>, C> = (
  token: Token<T, C>,
) => boolean

export type TokenValidator<T extends DollarPrefix<T>> = (
  tokenData: T,
  parentData: T | null,
) => { valid: true } | { valid: false; reason: string }

export type DictionaryOptions<T extends DollarPrefix<T>> = {
  validator: TokenValidator<T>
}

export class Dictionary<T extends DollarPrefix<T>, C = never> {
  readonly #keys = new Map<string, string>()
  readonly #tokens = new Map<string, Token<T, C>>()
  readonly #root = new TokenNode<T, C>(this)
  readonly #options: DictionaryOptions<T>

  #isFormatting = false

  constructor(options: Partial<DictionaryOptions<T>> = {}) {
    this.#options = {
      validator: options.validator ?? (() => ({ valid: true })),
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

        const node = this.#insertNode(parent, key, value)

        queue.push([node, value])

        if ('$value' in value && value.$value !== undefined) {
          this.#insertToken(node)
        }
      }
    }
  }

  /**
   * Try to resolve a token by its alias. Returns `undefined` if the token is not found.
   * @param alias The alias of the token to resolve.
   */
  tryResolve(alias: string): Token<T, C> | undefined {
    return this.#tokens.get(alias)
  }

  /**
   * Resolve a token by its alias. Throws an error if the token is not found.
   * @param alias The alias of the token to resolve.
   */
  resolve(alias: string): Token<T, C> {
    const token = this.tryResolve(alias)

    if (!token) {
      throw new Error(`Token not found: ${alias}`)
    }

    return token
  }

  format(reference: string, context: C, formatter: Formatter<T, C>): string
  format(token: Token<T, C>, context: C, formatter: Formatter<T, C>): string
  format(input: Token<T, C> | string, context: C, formatter: Formatter<T, C>) {
    if (this.#isFormatting) {
      throw new Error('Cannot format while formatting')
    }
    this.#isFormatting = true
    const token = typeof input === 'string' ? this.resolve(input) : input

    const resolve = this.#createResolver(new Set([token]))
    const replace = this.#createReplacer(resolve)

    const result = this.#format(
      {
        token,
        context,
        resolve,
        replace,
      },
      formatter,
    )

    this.#isFormatting = false

    return result
  }

  references(
    reference: string,
    context: C,
    formatter: Formatter<T, C>,
    depth?: number,
  ): ReadonlySet<Token<T, C>>
  references(
    token: Token<T, C>,
    context: C,
    formatter: Formatter<T, C>,
    depth?: number,
  ): ReadonlySet<Token<T, C>>
  references(
    input: Token<T, C> | string,
    context: C,
    formatter: Formatter<T, C>,
    depth = 0,
  ): ReadonlySet<Token<T, C>> {
    if (this.#isFormatting) {
      throw new Error('Cannot format while formatting')
    }
    this.#isFormatting = true

    const token = typeof input === 'string' ? this.resolve(input) : input

    const references = new Set<Token<T, C>>()

    const resolve = this.#createResolver(references)
    const replace = this.#createReplacer(resolve)

    this.#countReferences(
      {
        token,
        depth: 0,
        maxDepth: depth <= 0 ? Number.POSITIVE_INFINITY : depth,
        context,
        resolve,
        replace,
      },
      formatter,
    )

    this.#isFormatting = false

    return references
  }

  filter(predicate: TokenPredicate<T, C>): IterableIterator<Token<T, C>> {
    const tokens = this.#tokens
    return (function* () {
      for (const token of tokens.values()) {
        if (predicate(token)) {
          yield token
        }
      }
    })()
  }

  #insertNode(parent: TokenNode<T, C>, key: string, value: T) {
    const node = parent.child(
      key,
      Object.fromEntries(
        Object.entries(value).filter(([key]) => key.startsWith('$')),
      ) as DollarPrefix<T>,
    )

    if (this.#options.validator) {
      const result = this.#options.validator(node.token as T, parent.token)
      if (!result.valid) {
        throw new Error(
          `Invalid token data: ${node.keyParts().join('/')} (${result.reason})`,
        )
      }
    }

    return node
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
  }

  #createResolver(visited?: Set<Token<T, C>>) {
    return (reference: string) => {
      const token = this.resolve(reference)

      if (visited) {
        if (visited.has(token)) {
          throw new Error(
            `Circular reference: ${Array.from(visited, (token) => token.path()).join(' -> ')} -> ${token.path()}`,
          )
        }

        visited.add(token)
      }
      return token
    }
  }

  #createReplacer(
    resolver: TokenResolver<T, C>,
    interceptor?: TokenReplaceInterceptor<T, C>,
  ): TokenReplacer<T, C> {
    return (formatted: string, replace: TokenReplaceHandler<T, C>) => {
      if (interceptor) {
        return this.#replace(resolver, formatted, (token) =>
          interceptor(replace, token),
        )
      }
      return this.#replace(resolver, formatted, replace)
    }
  }

  #replace(
    resolver: TokenResolver<T, C>,
    formatted: string,
    replace: TokenReplaceHandler<T, C>,
  ): string {
    return formatted.replace(REFERENCE_PATTERN, (reference) => {
      const token = resolver(reference)

      return replace(token)
    })
  }

  #format(api: FormattingContext<T, C>, formatter: Formatter<T, C>): string {
    const result = formatter(api)

    return result.replace(REFERENCE_PATTERN, (reference) => {
      const token = api.resolve(reference)

      return this.#format({ ...api, token }, formatter)
    })
  }

  #countReferences(
    context: ReferenceCountingContext<T, C>,
    formatter: Formatter<T, C>,
  ) {
    if (context.depth >= context.maxDepth) {
      return
    }

    const result = formatter(context)

    result.replace(REFERENCE_PATTERN, (reference) => {
      context.resolve(reference)

      this.#countReferences({ ...context, depth: context.depth + 1 }, formatter)

      return reference
    })
  }
}
