import { createHook } from "hook"

interface HookResult<T = any> {
  data?: T,
  methods?: {
    [key: string]: Function
  }
}
type HookCallback<T> = (query?: any) => HookResult<T>

export function HookPage<T = any>(func: HookCallback<T>) {
  const hooks = createHook()

  return Page<T, any>({
    workLoop() {
      hooks.reschedule()
      const nextLoop = func()
      if (nextLoop.methods) {
        Object.keys(nextLoop.methods).forEach(method => {
          this[method] = (...args: any[]) => {
            nextLoop.methods?.[method](...args)
            this.workLoop()
          }
        })
      }

      this.setData(nextLoop.data)
    },

    onLoad() {
      this.workLoop()
    },
  })
}
