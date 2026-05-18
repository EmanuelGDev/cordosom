import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';

export function useRestoreSession() {
  const navigate = useNavigate();
  const [restoring, setRestoring] = useState(() => {
    // Começa como true SOMENTE se há tokens na URL
    const params = new URLSearchParams(window.location.search);
    return !!(params.get('access_token') && params.get('refresh_token'));
  });

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const accessToken = params.get('access_token');
    const refreshToken = params.get('refresh_token');

    if (!accessToken || !refreshToken) {
      setRestoring(false);
      return;
    }

    supabase.auth.setSession({
      access_token: accessToken,
      refresh_token: refreshToken,
    }).then(() => {
      // Espera o AuthContext processar a sessão
      const unsubscribe = supabase.auth.onAuthStateChange((event, session) => {
        if (session) {
          unsubscribe.data.subscription.unsubscribe();
          navigate(window.location.pathname, { replace: true });
          setRestoring(false);
        }
      });
    });
  }, []);

  return { restoring };
}