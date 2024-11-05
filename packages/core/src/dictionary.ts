import { KEY_PART_PATTERN, REFERENCE_PATTERN } from './constants'
import { Node } from './node'
import { Token } from './token'
import type {
  DollarPrefix,
  FormatHelpers,
  Formatter,
  TokenKey,
  TokenPredicate,
  TokenReplacer,
  TokenResolver,
  TokensInput,
} from './types'

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

  override(
    tokens: TokensInput<
      Partial<Pick<Extract<T, { $value: unknown }>, '$value'>>
    >,
  ) {
    const changed = this.#root.override(tokens, '$value')
    for (const child of changed) {
      const result = this.#options.validator(
        child.token as T,
        child.parent?.token ?? null,
      )
      if (!result.valid) {
        throw new Error(
          `Invalid token data: ${child.keyParts().join('/')} (${result.reason})`,
        )
      }
    }
  }

  /**
   * Try to resolve a token by its alias. Returns `undefined` if the token is not found.
   *
   * When this method is called while the dictionary is formatting a token, or collecting its references, it will throw an error if a circular reference is detected.
   *
   * @param alias The alias of the token to resolve.
   */
  tryResolve(alias: string): Token<T> | undefined {
    return this.#tokens.get(alias)
  }

  /**
   * Resolve a token by its alias. Throws an error if the token is not found.
   *
   * When this method is called while the dictionary is formatting a token, or collecting its references, it will throw an error if a circular reference is detected.
   *
   * @param alias The alias of the token to resolve.
   */
  resolve(alias: string): Token<T> {
    const token = this.tryResolve(alias)

    if (!token) {
      throw new Error(`Token not found: ${alias}`)
    }

    return token
  }

  /**
   * Format a token by its reference using a formatter function.
   * @param reference The reference to the token to format.
   * @param formatter The formatter function to use.
   */
  format(reference: string, formatter: Formatter<T>): string
  /**
   * Format a token using a formatter function.
   * @param token The token to format.
   * @param formatter The formatter function to use.
   */
  format(token: Token<T>, formatter: Formatter<T>): string
  format(input: Token<T> | string, formatter: Formatter<T>) {
    const token = typeof input === 'string' ? this.resolve(input) : input

    const { helpers } = this.#createHelpers(token)

    return this.#format(formatter, token, helpers, 0, Number.POSITIVE_INFINITY)
  }

  /**
   * Collect all references of a token by its reference using a formatter function.
   * @param reference The reference to the token to collect references from.
   * @param formatter The formatter function to use.
   * @param depth The maximum depth of references to collect. Defaults to `0` (infinite).
   */
  references(
    reference: string,
    formatter: Formatter<T>,
    depth?: number,
  ): ReadonlySet<Token<T>>
  /**
   * Collect all references of a token using a formatter function.
   * @param token The token to collect references from.
   * @param formatter The formatter function to use.
   * @param depth The maximum depth of references to collect. Defaults to `0` (infinite).
   */
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
    const token = typeof input === 'string' ? this.resolve(input) : input

    const { visited, helpers } = this.#createHelpers(token)

    this.#format(
      formatter,
      token,
      helpers,
      0,
      depth <= 0 ? Number.POSITIVE_INFINITY : depth,
    )

    visited.delete(token)

    return visited
  }

  /**
   * Filter tokens using a predicate function.
   * @param predicate The predicate function to use.
   */
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

  [Symbol.iterator]() {
    return this.#tokens.values()
  }

  /**
   * Extract all tokens from the dictionary.
   */
  extract(): TokensInput<T> {
    return this.#root.extract()
  }

  sortByReference(formatter: Formatter<T>): ReadonlyArray<Token<T>>
  sortByReference(
    tokens: IterableIterator<Token<T>>,
    formatter: Formatter<T>,
  ): ReadonlyArray<Token<T>>
  sortByReference(
    predicate: TokenPredicate<T>,
    formatter: Formatter<T>,
  ): ReadonlyArray<Token<T>>
  sortByReference(
    a: Formatter<T> | IterableIterator<Token<T>> | TokenPredicate<T>,
    b?: Formatter<T>,
  ): ReadonlyArray<Token<T>> {
    const formatter: Formatter<T> = b ?? (a as Formatter<T>)
    const tokens = Array.from(
      b === undefined
        ? this.#tokens.values()
        : typeof a === 'function'
          ? this.filter(a as TokenPredicate<T>)
          : a,
    )

    const references = new Map<Token<T>, ReadonlySet<Token<T>>>()
    for (const token of tokens) {
      references.set(token, this.references(token, formatter))
    }

    tokens.sort((a, b) => {
      const aRefs = references.get(a) as ReadonlySet<Token<T>>
      const bRefs = references.get(b) as ReadonlySet<Token<T>>

      const aComesFirst = -1
      const bComesFirst = 1

      if (aRefs.size === 0) {
        return aComesFirst
      }

      if (bRefs.size === 0) {
        return bComesFirst
      }

      if (aRefs.has(b)) {
        return bComesFirst
      }

      if (bRefs.has(a)) {
        return aComesFirst
      }

      return 0
    })

    return tokens
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

  #createHelpers(token: Token<T>) {
    const visited = new Set<Token<T>>([token])

    const resolve: TokenResolver<T> = (reference) => {
      const token = this.resolve(reference)

      if (visited.has(token)) {
        throw new Error(
          `Circular reference: ${Array.from(visited, (token) => token.path()).join(' -> ')} -> ${token.path()}`,
        )
      }

      visited.add(token)

      return token
    }

    const replace: TokenReplacer<T> = (formatted, replace) => {
      return formatted.replace(REFERENCE_PATTERN, (reference) => {
        const token = resolve(reference)

        return replace(token)
      })
    }

    return {
      visited,
      helpers: {
        token,

        resolve,
        replace,
      },
    }
  }

  #format(
    formatter: Formatter<T>,
    token: Token<T>,
    helpers: FormatHelpers<T>,
    depth: number,
    maxDepth: number,
  ): string {
    if (depth >= maxDepth) {
      return token.reference()
    }

    const result = formatter(token, helpers)

    return result.replace(REFERENCE_PATTERN, (reference) => {
      const token = helpers.resolve(reference)

      return this.#format(formatter, token, helpers, depth + 1, maxDepth)
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
