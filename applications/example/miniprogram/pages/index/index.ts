// index.ts
// 获取应用实例
import { HookPage } from '@mini-hooks/core'

HookPage(function ({
  useState,
}) {
  const [count, setCount] = useState(1)

  return {
    data: {
      count
    },
    methods: {
      increment() {
        setCount(count + 1)
      }
    }
  }
})

