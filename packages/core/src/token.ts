import type { Formatter } from './dictionary'
import type { TokenNode } from './node'
import type { DollarPrefix } from './types'

type TokenValueData<T extends DollarPrefix<T>> = T extends { $value: unknown }
  ? T
  : never

export class Token<T extends DollarPrefix<T>, C = never> {
  readonly #node: TokenNode<T, C>

  constructor(node: TokenNode<T, C>) {
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

  format(context: C, formatter: Formatter<T, C>): string {
    return this.#node.dictionary.format(this.reference(), context, formatter)
  }

  references(
    context: C,
    formatter: Formatter<T, C>,
    depth = 0,
  ): ReadonlySet<Token<T, C>> {
    return this.#node.dictionary.references(this, context, formatter, depth)
  }

  [Symbol.for('nodejs.util.inspect.custom')]() {
    return `Token ${this.reference()}`
  }
}
