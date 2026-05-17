import { useEffect } from 'react';

const rotasHTTPS = ['/login', '/dashboard', '/usuarios'];

export function useProtocol() {
  useEffect(() => {
    const path = window.location.pathname;
    const isHTTPS = window.location.protocol === 'https:';
    const isRotaSegura = rotasHTTPS.some(r => path.startsWith(r));

    if (isRotaSegura && !isHTTPS) {
      window.location.href = `https://localhost:3001${path}`;
    }

    if (!isRotaSegura && isHTTPS) {
      window.location.href = `http://localhost:3000${path}`;
    }
  }, []);
}