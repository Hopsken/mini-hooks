import { createHooksInstance, setInstance } from './hooks'

interface HookResult<T extends {} = any> {
  data?: T
  [key: string]: any
}

type PageRenderer<T> = () => HookResult<T>

export function HookPage<T>(render: PageRenderer<T>) {
  const hooksInstance = createHooksInstance()

  return Page<T, any>({
    onLoad() {
      setInstance(hooksInstance)
      hooksInstance.onMountStart()
      hooksInstance.subscribe(() => this.runLoop())
      hooksInstance.onMountEnd()
    },

    onReady() {
    },

    onUnload() {

    },

    runLoop() {
      setInstance(hooksInstance)
      const { data, ...methods } = render()
      Object.keys(methods).forEach((key) => {
        this[key] = methods[key]
      })
      this.setData(data, hooksInstance.runEffects)
    },
  })
}

type ComponentRenderer<P extends {}, R extends {}> = (props: P) => HookResult<R>

export function HookComponent<P, R>(render: ComponentRenderer<P, R>) {
  const hooksInstance = createHooksInstance()

  return Component<any, any, any>({
    // @ts-ignore
    didMount() {
      setInstance(hooksInstance)
      hooksInstance.onMountStart()
      hooksInstance.subscribe(() => this.runLoop())
      hooksInstance.onMountEnd()
    },

    didUpdate() {
      // TODO: need optimize
      hooksInstance.reschedule()
    },

    methods: {
      runLoop() {
        setInstance(hooksInstance)
        const { data, ...methods } = render(this.props)
        Object.keys(methods).forEach(key => {
          this[key] = methods[key]
        })
        this.setData(data, hooksInstance.runEffects)
      },
    }

  })
}
