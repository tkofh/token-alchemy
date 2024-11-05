import { REFERENCE_PATTERN } from './constants'

export function isReference(reference: string): boolean {
  return REFERENCE_PATTERN.test(reference)
}
