import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import './lib/chart-setup'; // Register Chart.js components
import App from './App.tsx';
import './index.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
