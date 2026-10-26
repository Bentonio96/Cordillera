import { StrictMode } from 'react'
import { createRoot, hydrateRoot } from 'react-dom/client'
import '@fontsource-variable/inter-tight/wght.css'
import '@fontsource/jetbrains-mono/latin-400.css'
import './index.css'
import App from './App.tsx'

const tree = (
  <StrictMode>
    <App />
  </StrictMode>
)

const root = document.getElementById('root')!

// Production HTML arrives prerendered (scripts/prerender.mjs), so the title
// paints before any JS runs; hydrate it. In dev the root is empty.
if (root.hasChildNodes()) hydrateRoot(root, tree)
else createRoot(root).render(tree)
