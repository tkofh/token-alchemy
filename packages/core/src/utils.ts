import type { ZodRawShape } from 'zod'

export function ensurePrefix(input: string, prefix: string): string {
  return input.startsWith(prefix) ? input : `${prefix}${input}`
}

export function prefixAttributes(
  input: ZodRawShape,
  prefix: string,
): ZodRawShape {
  return Object.fromEntries(
    Object.entries(input).map(([key, value]) => [
      ensurePrefix(key, prefix),
      value,
    ]),
  ) as ZodRawShape
}
