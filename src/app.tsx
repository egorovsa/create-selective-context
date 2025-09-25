import { createRoot } from 'react-dom/client';
import { DevLayout } from './dev/dev-layout';
import './dev/dev-styles.css';

window.onload = () => {
  createRoot(document.getElementById('app') as HTMLElement).render(
    <DevLayout />
  );
};
