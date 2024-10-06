import { Node } from './node'
import { Token } from './token'
import type {
  DollarPrefix,
  Formatter,
  FormattingContext,
  ReferenceCountingContext,
  ReplaceHandler,
  ReplaceInterceptor,
  TokenKey,
  TokenPredicate,
  TokenReplacer,
  TokenResolver,
  TokensInput,
} from './types'

const KEY_PART_PATTERN = /^[a-zA-Z0-9]+(?:-[a-zA-Z0-9]+)*$/

const REFERENCE_PATTERN =
  /({[a-zA-Z0-9]+(?:-[a-zA-Z0-9]+)*(?:\.[a-zA-Z0-9]+(?:-[a-zA-Z0-9]+)*)*})/g

type TokenValidator<T extends DollarPrefix<T>> = (
  tokenData: T,
  parentData: T | null,
) => { valid: true } | { valid: false; reason: string }

export type DictionaryOptions<T extends DollarPrefix<T>> = {
  validator: TokenValidator<T>
}

class Dictionary<T extends DollarPrefix<T> = never> {
  readonly #keys = new Map<string, string>()
  readonly #tokens = new Map<string, Token<T>>()
  readonly #root = new Node<T>(this)
  readonly #options: DictionaryOptions<T>

  #isFormatting = false

  constructor(options: Partial<DictionaryOptions<T>> = {}) {
    this.#options = {
      validator: options.validator ?? (() => ({ valid: true })),
    }
  }

  insert(tokens: TokensInput<T>) {
    const queue: Array<[Node<T>, TokensInput<T>]> = [[this.#root, tokens]]

    while (queue.length) {
      // biome-ignore lint/style/noNonNullAssertion: will always be defined due to loop predicate
      const [parent, input] = queue.shift()!

      for (const [key, value] of Object.entries(input)) {
        if (key.startsWith('$')) {
          continue
        }

        const node = this.#insertNode(parent, key as TokenKey, value)

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
  tryResolve(alias: string): Token<T> | undefined {
    return this.#tokens.get(alias)
  }

  /**
   * Resolve a token by its alias. Throws an error if the token is not found.
   * @param alias The alias of the token to resolve.
   */
  resolve(alias: string): Token<T> {
    const token = this.tryResolve(alias)

    if (!token) {
      throw new Error(`Token not found: ${alias}`)
    }

    return token
  }

  format(reference: string, formatter: Formatter<T>): string
  format(token: Token<T>, formatter: Formatter<T>): string
  format(input: Token<T> | string, formatter: Formatter<T>) {
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
    formatter: Formatter<T>,
    depth?: number,
  ): ReadonlySet<Token<T>>
  references(
    token: Token<T>,
    formatter: Formatter<T>,
    depth?: number,
  ): ReadonlySet<Token<T>>
  references(
    input: Token<T> | string,
    formatter: Formatter<T>,
    depth = 0,
  ): ReadonlySet<Token<T>> {
    if (this.#isFormatting) {
      throw new Error('Cannot format while formatting')
    }
    this.#isFormatting = true

    const token = typeof input === 'string' ? this.resolve(input) : input

    const references = new Set<Token<T>>()

    const resolve = this.#createResolver(references)
    const replace = this.#createReplacer(resolve)

    this.#countReferences(
      {
        token,
        depth: 0,
        maxDepth: depth <= 0 ? Number.POSITIVE_INFINITY : depth,
        resolve,
        replace,
      },
      formatter,
    )

    this.#isFormatting = false

    return references
  }

  filter(predicate: TokenPredicate<T>): IterableIterator<Token<T>> {
    const tokens = this.#tokens
    return (function* () {
      for (const token of tokens.values()) {
        if (predicate(token)) {
          yield token
        }
      }
    })()
  }

  extract(): TokensInput<T> {
    return this.#root.extract()
  }

  #insertNode(parent: Node<T>, key: TokenKey, value: T) {
    if (String(key).match(KEY_PART_PATTERN) === null) {
      throw new Error(`Invalid key: ${key}`)
    }

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

  #insertToken(node: Node<T>) {
    const token = new Token(node)

    const tokenKey = token.key()
    const tokenReference = token.reference()

    if (this.#keys.has(tokenKey)) {
      const other = this.#tokens.get(
        this.#keys.get(tokenKey) as string,
      ) as Token<T>
      throw new Error(
        `Duplicate token key: ${tokenKey} (${other.path()} and ${token.path()})`,
      )
    }

    this.#keys.set(tokenKey, tokenReference)
    this.#tokens.set(tokenReference, token)
  }

  #createResolver(visited?: Set<Token<T>>) {
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
    resolver: TokenResolver<T>,
    interceptor?: ReplaceInterceptor<T>,
  ): TokenReplacer<T> {
    return (formatted: string, replace: ReplaceHandler<T>) => {
      return formatted.replace(REFERENCE_PATTERN, (reference) => {
        const token = resolver(reference)

        return interceptor ? interceptor(replace, token) : replace(token)
      })
    }
  }

  #format(context: FormattingContext<T>, formatter: Formatter<T>): string {
    const result = formatter(context)

    return result.replace(REFERENCE_PATTERN, (reference) => {
      const token = context.resolve(reference)

      return this.#format({ ...context, token }, formatter)
    })
  }

  #countReferences(
    context: ReferenceCountingContext<T>,
    formatter: Formatter<T>,
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

export type { Dictionary }

export function createDictionary<T extends DollarPrefix<T> = never>(
  options: Partial<DictionaryOptions<T>> = {},
  input?: TokensInput<T>,
) {
  const dictionary = new Dictionary(options)

  if (input) {
    dictionary.insert(input)
  }

  return dictionary
}
