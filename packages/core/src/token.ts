import {
  camelCase,
  constantCase,
  kebabCase,
  pascalCase,
  snakeCase,
} from 'change-case'
import type { Node } from './node'
import type { DollarPrefix, Formatter, TokenValueData } from './types'

type Casing = 'kebab' | 'camel' | 'pascal' | 'snake' | 'constant'

export class Token<T extends DollarPrefix<T>> {
  readonly #node: Node<T>

  constructor(node: Node<T>) {
    this.#node = node
  }

  key(casing: Casing = 'kebab'): string {
    const base = this.#node.keyParts().join('-')
    switch (casing) {
      case 'camel':
        return camelCase(base)
      case 'pascal':
        return pascalCase(base)
      case 'snake':
        return snakeCase(base)
      case 'constant':
        return constantCase(base)
      case 'kebab':
        return kebabCase(base)
    }
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
