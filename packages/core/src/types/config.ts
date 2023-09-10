import type { ZodRawShape } from 'zod'

export interface TokenAlchemyConfig {
  groupAttributes: ZodRawShape
  tokenAttributes: ZodRawShape
  attributePrefix: string
  tokenValueKey: string
}
