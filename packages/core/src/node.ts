import type { Dictionary } from './dictionary'
import type { DollarPrefix } from './types'

type TokenParent<T extends DollarPrefix<T>, C = never> = TokenNode<T, C> | null

export class TokenNode<T extends DollarPrefix<T>, C = never> {
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
