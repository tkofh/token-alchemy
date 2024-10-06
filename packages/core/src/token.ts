import type { Node } from './node'
import type { DollarPrefix, Formatter } from './types'

type TokenValueData<T extends DollarPrefix<T>> = T extends { $value: unknown }
  ? T
  : never

export class Token<T extends DollarPrefix<T>> {
  readonly #node: Node<T>

  constructor(node: Node<T>) {
    this.#node = node
  }

  key(): string {
    return this.#node.keyParts().join('-')
  }

  data(): TokenValueData<T> {
    return this.#node.token as TokenValueData<T>
  }

  reference(): string {
    return `{${this.#node.keyParts().join('.')}}`
  }

  path(): string {
    return this.#node.keyParts().join('/')
  }

  format(formatter: Formatter<T>): string {
    return this.#node.dictionary.format(this.reference(), formatter)
  }

  references(formatter: Formatter<T>, depth = 0): ReadonlySet<Token<T>> {
    return this.#node.dictionary.references(this, formatter, depth)
  }

  [Symbol.for('nodejs.util.inspect.custom')]() {
    return `Token ${this.reference()}`
  }
}
