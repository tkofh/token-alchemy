---
"token-alchemy": patch
---

add `Symbol.iterator` to `Dictionary`, enabling for loops:

```typescript
import { createDictionary } from 'token-alchemy'

const dictionary = createDictionary(/* ... */)

for(const token of dictionary) {
  // ...
}
```
