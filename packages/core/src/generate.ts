// import { zodToJsonSchema } from 'zod-to-json-schema'
import { object } from 'zod'
import { createTypeAlias, zodToTs, printNode } from 'zod-to-ts'
import type { TokenAlchemyConfig } from './types'

export function generate(config: TokenAlchemyConfig): void {
  console.log({
    typescript: [
      printNode(
        createTypeAlias(
          zodToTs(object(config.tokenAttributes)).node,
          'DesignTokenSpecificAttributes',
        ),
      )
        .replace(' = ', ' ')
        .replace('type', 'export interface'),
      printNode(
        createTypeAlias(
          zodToTs(object(config.groupAttributes)).node,
          'DesignTokenGroupAttributes',
        ),
      )
        .replace(' = ', ' ')
        .replace('type', 'export interface'),
    ].join('\n\n'),
    // jsonSchema: [].join('\n\n'),
  })
}
