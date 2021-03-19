## Mini Hooks

一个在小程序中使用类 React Hooks 写法的尝试性项目

### Example
```typescript
// pages/index/index.js
import { useState, useEffect } from 'mini-hooks'
import { HookPage } from 'mini-hooks/ali'

HookPage(() => {
  const [count, setCount] = useState(1)
  const [text, setText] = useState('Bonjour')

  useEffect(() => {
    console.info('Running effect')
    setTimeout(() => {
      setCount(10)
    }, 2000)
  }, [])

  return {
    data: {
      count,
      text,
    },

    increment(event) {
      console.info(count + 1)
      setCount(count + 1)
    },

    say() {
      setText(text + '~')
    },
  }
})
```
