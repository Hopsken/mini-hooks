type EffectCallback = () => (void | (() => void | undefined));
type DependencyList = ReadonlyArray<any>;

export function createHook() {
  let idx = 0
  let hooks: any[] = []

  function useState<T = any>(initVal: T) {
    const state = hooks[idx] || initVal
    const _idx = idx
    function setState(nextVal: T) {
      hooks[_idx] = nextVal
    }
    idx++
    return [state, setState]
  }

  function useRef<T = any>(initVal: T) {
    return useState({ current: initVal })[0]
  }

  function useEffect(effect: EffectCallback, deps?: DependencyList) {
    const prevDeps = hooks[idx]
    let hasChanged = true

    if (prevDeps && deps) {
      hasChanged = deps.some((dep, i) => dep !== prevDeps[i])
    }

    if (hasChanged) {
      effect()
    }

    hooks[idx] = deps
    idx++
  }

  function reschedule() {
    idx = 0
  }

  return {
    reschedule,

    useRef,
    useState,
    useEffect,
  }
}
