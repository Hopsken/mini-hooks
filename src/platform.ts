import { createHook } from "./hook"

interface HookResult<T = any> {
  data?: T
  [key: string]: any
}
type HookCallback<T> = (hooks: ReturnType<typeof createHook>) => HookResult<T>

// let instance: ReturnType<typeof createHook> | null = null

export function HookPage<T = any>(func: HookCallback<T>) {
  const hooks = createHook()

  // instance = hooks

  return Page<T, any>({
    workLoop() {
      hooks.reschedule()
      const { data, ...others } = func(hooks)
      Object.keys(others).forEach(key => {
        if (typeof others[key] === 'function') {
          this[key] = (...args: any[]) => {
            others[key](...args)
            this.workLoop()
          }
        } else {
          this[key] = others[key]
        }
      })

      this.setData(data)
    },

    onLoad() {
      this.workLoop()
    },
  })
}
