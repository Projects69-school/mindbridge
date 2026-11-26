import './styles/base.css'
import { createRoot } from 'react-dom/client'
import { HashRouter } from 'react-router-dom'
import App from './App'
import { DemoProvider } from './context/DemoContext'

createRoot(document.getElementById('root')!).render(
  <HashRouter><DemoProvider><App /></DemoProvider></HashRouter>,
)
