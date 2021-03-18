let currentInstance: any
let isMounting = false
let callIndex = 0

function ensureCurrentInstance() {
  if (!currentInstance) {
    throw new Error(
      `invalid hooks call: hooks can only be called in a function passed to withHooks.`
    )
  }
}

export function useState<T = any>(initVal: T) {
  ensureCurrentInstance()
  const id = ++callIndex
  function setState(nextVal: T) {
    currentInstance.updateState$(id, nextVal)
  }
  if (isMounting) {
    currentInstance.updateState$(id, initVal)
  }
  return [currentInstance._state[id], setState]
}

type DependencyList = ReadonlyArray<any>;
type EffectCallback = () => (void | (() => void | undefined));

export function useEffect(rawEffect: EffectCallback, deps: DependencyList) {
  ensureCurrentInstance()
  const id = ++callIndex
  if (isMounting) {
    const cleanup: any = () => {
      const { current } = cleanup
      if (current) {
        current()
        cleanup.current = null
      }
    }
    const effect: any = function () {
      const { current } = effect
      if (current) {
        // @ts-ignore
        cleanup.current = current.call(this)
        effect.current = null
      }
    }
    effect.current = rawEffect

    currentInstance._effectStore[id] = {
      effect,
      cleanup,
      deps
    }
  } else {
    const record = currentInstance._effectStore[id]
    const { effect, cleanup, deps: prevDeps = [] } = record
    record.deps = deps
    if (!deps || deps.some((d, i) => d !== prevDeps[i])) {
      cleanup()
      effect.current = rawEffect
    }
  }
}

interface HookResult<T = any> {
  data?: T
  [key: string]: any
}

export function withHooks(render: () => HookResult) {
  return Page<any, any>({
    _state: {},
    _effectStore: {},

    onLoad() {
      // this._refsStore = {}
      // this._computedStore = {}
      isMounting = true
      this.workLoop()
    },

    onReady() {
      isMounting = false
      Object.keys(this._effectStore).forEach((idx) => {
        const { effect } = this._effectStore[idx]
        try {
          effect()
        } catch (e) {
          console.error(e)
        }
      })
    },

    onUnload() {
      Object.keys(this._effectStore).forEach((idx) => {
        const { cleanup } = this._effectStore[idx]
        try {
          cleanup()
        } catch (e) {
          console.error(e)
        }
      })
    },

    workLoop() {
      callIndex = 0
      currentInstance = this
      const { data, ...methods } = render()
      Object.keys(methods).forEach((key) => {
        this[key] = methods[key]
      })
      this.setData(data, this.runEffects)
    },

    runEffects() {
      Object.keys(this._effectStore).forEach((idx) => {
        const { effect } = this._effectStore[idx]
        try {
          effect()
        } catch (e) {
          console.error(e)
        }
      })
    },

    updateState$(id: number, val: any) {
      this._state[id] = val
      this.workLoop()
    }
  })
}
