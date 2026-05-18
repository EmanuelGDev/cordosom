import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';

const rotasHTTPS = ['/login', '/dashboard', '/usuarios'];

export function useProtocol() {
  const location = useLocation();

  useEffect(() => {
    const path = window.location.pathname;
    const isHTTPS = window.location.protocol === 'https:';
    const isRotaSegura = rotasHTTPS.some(r => path.startsWith(r));

    // Já está no protocolo certo, não faz nada
    if (isRotaSegura && isHTTPS) return;   // rota segura + HTTPS ✅
    if (!isRotaSegura && !isHTTPS) return; // rota pública + HTTP ✅

    const redirect = async (targetUrl: string) => {
      const { data } = await supabase.auth.getSession();
      const session = data.session;

      if (session) {
        const params = new URLSearchParams({
          access_token: session.access_token,
          refresh_token: session.refresh_token,
        });
        window.location.href = `${targetUrl}?${params.toString()}`;
      } else {
        window.location.href = targetUrl;
      }
    };

    // Rota segura em HTTP -> vai para HTTPS
    if (isRotaSegura && !isHTTPS) redirect(`https://localhost:3001${path}`);

    // Rota pública em HTTPS -> vai para HTTP
    if (!isRotaSegura && isHTTPS) redirect(`http://localhost:3000${path}`);

  }, [location.pathname]);
}