import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';

const rootEl = document.getElementById('root');
if (!rootEl) {
  document.body.innerHTML = '<pre style="color:red;padding:1rem">Root element #root not found.</pre>';
} else {
  try {
    createRoot(rootEl).render(<App />);
  } catch (err: any) {
    rootEl.innerHTML = `<pre style="color:red;padding:1rem;white-space:pre-wrap">${err?.stack || err?.message || String(err)}</pre>`;
    console.error(err);
  }
}
