import type { Dictionary } from './dictionary'
import type {
  DollarPrefix,
  PropertyKey,
  TokenInput,
  TokenKey,
  TokenValueData,
  TokensInput,
} from './types'

type TokenParent<T extends DollarPrefix<T>> = Node<T> | null

export class Node<T extends DollarPrefix<T>> {
  readonly dictionary: Dictionary<T>
  readonly token: T | null
  readonly parent: TokenParent<T>
  readonly #keyPart: TokenKey | null

  readonly #children = new Map<TokenKey, Node<T>>()

  constructor(
    dictionary: Dictionary<T>,
    parent: Node<T> | null = null,
    keyPart: TokenKey | null = null,
    token: T | null = null,
  ) {
    this.dictionary = dictionary
    this.token = token
    this.parent = parent
    this.#keyPart = keyPart
  }

  keyParts(): ReadonlyArray<string> {
    if (this.#keyPart === null && this.parent === null) {
      return []
    }

    if (this.parent === null) {
      return [this.#keyPart as string]
    }

    if (this.#keyPart === null) {
      return this.parent.keyParts()
    }

    return this.parent.keyParts().concat(String(this.#keyPart))
  }

  child(keyPart: TokenKey, token: T | null): Node<T> {
    const child =
      this.#children.get(keyPart) ??
      new Node(this.dictionary, this, keyPart, token)
    this.#children.set(keyPart, child)

    return child
  }

  extract(): TokensInput<T> {
    const result: TokensInput<T> = {} as TokensInput<T>

    for (const [key, child] of this.#children) {
      result[key] = child.extract() as TokenInput<T>
    }

    if (this.token) {
      Object.assign(result, this.token)
    }

    return result
  }

  override(
    tokens: Partial<Pick<TokenValueData<T>, '$value'>>,
    property: PropertyKey,
  ) {
    const changed = new Set<Node<T>>()
    for (const [key, value] of Object.entries(tokens)) {
      if (
        key === property &&
        this.token !== null &&
        property in this.token &&
        value !== undefined
      ) {
        ;(this.token as Record<PropertyKey, unknown>)[property] = value
        changed.add(this)
        continue
      }

      if (key.startsWith('$')) {
        continue
      }
      const child = this.#children.get(key as TokenKey)

      if (child) {
        for (const changedChild of child.override(value, property)) {
          changed.add(changedChild)
        }
      }
    }

    return changed
  }
}
