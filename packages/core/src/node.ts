import type { Dictionary } from './dictionary'
import type { DollarPrefix } from './types'

type TokenParent<T extends DollarPrefix<T>> = TokenNode<T> | null

export class TokenNode<T extends DollarPrefix<T>> {
  readonly dictionary: Dictionary<T>
  readonly token: T | null
  readonly #parent: TokenParent<T>
  readonly #keyPart: string | null

  readonly #children = new Map<string, TokenNode<T>>()

  constructor(
    dictionary: Dictionary<T>,
    parent: TokenNode<T> | null = null,
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

  child(keyPart: string, token: T | null): TokenNode<T> {
    const child =
      this.#children.get(keyPart) ??
      new TokenNode(this.dictionary, this, keyPart, token)
    this.#children.set(keyPart, child)

    return child
  }
}
