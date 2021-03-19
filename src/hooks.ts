type HooksInstance = ReturnType<typeof createHooksInstance>
type DependencyList = ReadonlyArray<any>;
type EffectCallback = () => (void | (() => void | undefined));

let currentInstance: HooksInstance

function ensureCurrentInstance() {
  if (!currentInstance) {
    throw new Error(
      `invalid hooks call: hooks can only be called in a function passed to withHooks.`
    )
  }
}

export function setInstance(instance: HooksInstance) {
  currentInstance = instance
}

export function getInstance() {
  return currentInstance
}

export function createHooksInstance() {
  let callback: Function
  let isMounting = false
  let callIndex = 0
  let _state: any[] = []
  let _effectStore: any[] = []

  function useState<T = any>(initVal: T) {
    ensureCurrentInstance()
    const id = ++callIndex
    function setState(nextVal: T) {
      _state[id] = nextVal
      reschedule()
    }
    if (isMounting) {
      _state[id] = initVal
    }
    return [_state[id], setState]
  }

  function useEffect(rawEffect: EffectCallback, deps: DependencyList) {
    ensureCurrentInstance()
    const id = ++callIndex

    // TODO: need optimize
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

      _effectStore[id] = {
        effect,
        cleanup,
        deps
      }
    } else {
      const record = _effectStore[id]
      if (!record) return
      const { effect, cleanup, deps: prevDeps = [] } = record
      record.deps = deps
      if (!deps || deps.some((d, i) => d !== prevDeps[i])) {
        cleanup()
        effect.current = rawEffect
      }
    }
  }

  function runEffects() {
    _effectStore.forEach((entry) => {
      if (!entry) return
      try {
        entry.effect()
      } catch (e) {
        console.error(e)
      }
    })
  }

  function reschedule() {
    callIndex = 0
    // TODO: use batch update
    return Promise.resolve().then(() => callback && callback())
  }

  function subscribe(func: any) {
    if (!callback) {
      callback = func
      func()
    }
  }

  return {
    useState,
    useEffect,
    runEffects,
    subscribe,
    onMountStart() {
      isMounting = true
    },
    onMountEnd() {
      isMounting = false
    }
  }
}

export function useState<T = any>(initVal: T) {
  ensureCurrentInstance()
  return currentInstance.useState(initVal)
}

export function useEffect(rawEffect: EffectCallback, deps: DependencyList) {
  ensureCurrentInstance()
  return currentInstance.useEffect(rawEffect, deps)
}


