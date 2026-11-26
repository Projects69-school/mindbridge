import { createContext, useCallback, useContext, useEffect, useRef, useState, useSyncExternalStore } from 'react'
import type { PropsWithChildren } from 'react'
import { Check, X } from 'lucide-react'
import { Modal } from '../components/ui'
import { createDemoStore } from './store'
import type { DemoActions } from './store'
import type { DemoState } from '../types/demo'

interface Confirmation { title: string; message: string; label?: string }
interface DemoContextValue {
  state: DemoState
  actions: DemoActions
  toast: (message: string) => void
  confirm: (options: Confirmation) => Promise<boolean>
}
const Context = createContext<DemoContextValue | null>(null)

export function DemoProvider({ children }: PropsWithChildren) {
  const [store] = useState(createDemoStore)
  const state = useSyncExternalStore(store.subscribe, store.getState)
  const [message, setMessage] = useState('')
  const [dialog, setDialog] = useState<Confirmation | null>(null)
  const timer = useRef<number | undefined>(undefined)
  const response = useRef<((value: boolean) => void) | null>(null)
  useEffect(() => () => window.clearTimeout(timer.current), [])
  const toast = useCallback((text: string) => {
    setMessage(text)
    window.clearTimeout(timer.current)
    timer.current = window.setTimeout(() => setMessage(''), 4400)
  }, [])
  const confirm = useCallback((options: Confirmation) => new Promise<boolean>(resolve => {
    response.current?.(false)
    response.current = resolve
    setDialog(options)
  }), [])
  function finish(answer: boolean) {
    response.current?.(answer)
    response.current = null
    setDialog(null)
  }
  return <Context.Provider value={{ state, actions: store.actions, toast, confirm }}>
    {children}
    {dialog && <Modal title={dialog.title} onClose={() => finish(false)}>
      <p>{dialog.message}</p>
      <div className="button-row modal-actions"><button type="button" autoFocus className="btn btn-secondary" onClick={() => finish(false)}>ยกเลิก</button>
        <button type="button" className="btn btn-primary" onClick={() => finish(true)}>{dialog.label ?? 'ยืนยัน'}</button></div>
    </Modal>}
    <div className="toast-region" aria-live="polite">{message && <div className="toast">
      <Check size={18} /><span>{message}</span><button className="icon-btn" aria-label="ปิดการแจ้งเตือน" onClick={() => setMessage('')}><X size={17} /></button>
    </div>}</div>
  </Context.Provider>
}

export function useDemo() {
  const context = useContext(Context)
  if (!context) throw new Error('DemoProvider is required')
  return context
}
