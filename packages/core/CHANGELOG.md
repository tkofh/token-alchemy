# @token-alchemy/core

## 0.0.4

### Patch Changes

- 4d3e924: fix sorting algorithm

## 0.0.3

### Patch Changes

- ac3795c: export `isReference` utility
- ac3795c: allow only lowercase letters for the beginnings of token segments

## 0.0.2

### Patch Changes

- 1a9abc0: add `Symbol.iterator` to `Dictionary`, enabling for loops:

  ```typescript
  import { createDictionary } from "token-alchemy";

  const dictionary = createDictionary(/* ... */);

  for (const token of dictionary) {
    // ...
  }
  ```

## 0.0.1

### Patch Changes

- b321e78: implement basic token dictionary api

## 1.0.1

### Patch Changes

- fixes numeric references

## 1.0.0

### Major Changes

- bump to 1.0

### Patch Changes

- Updated dependencies
  - @token-alchemy/types@1.0.0

## 0.2.0

### Minor Changes

- a0d29d2: implement formatReferences in format package

### Patch Changes

- Updated dependencies [a0d29d2]
  - @token-alchemy/types@0.2.0

## 0.1.5

### Patch Changes

- switch to unbuild
- Updated dependencies
  - @token-alchemy/types@0.1.3

## 0.1.4

### Patch Changes

- add main field to exports
- Updated dependencies
  - @token-alchemy/types@0.1.2

## 0.1.3

### Patch Changes

- add main field to package.json
- Updated dependencies
  - @token-alchemy/types@0.1.1

## 0.1.2

### Patch Changes

- fix export info

## 0.1.1

### Patch Changes

- export helper

## 0.1.0

### Minor Changes

- implement basic functionality

### Patch Changes

- Updated dependencies
  - @token-alchemy/types@0.1.0
