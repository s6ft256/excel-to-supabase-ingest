import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

const AuthCallback = () => {
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const finishAuth = async () => {
      try {
        const url = new URL(window.location.href);
        const code = url.searchParams.get('code');

        if (code) {
          const { error } = await supabase.auth.exchangeCodeForSession(code);
          if (error) throw error;
          toast({ title: 'Email confirmed', description: 'You are now signed in.' });
          navigate('/', { replace: true });
          return;
        }

        // Fallback for older hash-style tokens
        if (window.location.hash.includes('access_token') && window.location.hash.includes('refresh_token')) {
          const params = new URLSearchParams(window.location.hash.replace('#', ''));
          const access_token = params.get('access_token');
          const refresh_token = params.get('refresh_token');
          if (access_token && refresh_token) {
            const { error } = await supabase.auth.setSession({ access_token, refresh_token });
            if (error) throw error;
            toast({ title: 'Email confirmed', description: 'You are now signed in.' });
            navigate('/', { replace: true });
            return;
          }
        }

        // If we reach here, no tokens found
        toast({ title: 'No token found', description: 'Redirecting to sign in.', variant: 'destructive' });
        navigate('/auth', { replace: true });
      } catch (error) {
        toast({
          title: 'Confirmation failed',
          description: error instanceof Error ? error.message : 'Unable to complete confirmation',
          variant: 'destructive',
        });
        navigate('/auth', { replace: true });
      }
    };

    void finishAuth();
  }, [navigate, toast]);

  return (
    <main className="min-h-screen grid place-items-center bg-background">
      <div className="text-center space-y-2">
        <h1 className="text-2xl font-semibold">Finishing sign in…</h1>
        <p className="text-muted-foreground">Please wait a moment.</p>
      </div>
    </main>
  );
};

export default AuthCallback;
