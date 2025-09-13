import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import Dashboard from '@/components/Dashboard';
import { Button } from '@/components/ui/button';

const Index = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && !user) {
      navigate('/auth');
    }
  }, [user, loading, navigate]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="text-center">
          <h1 className="mb-4 text-2xl font-bold">Loading...</h1>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="text-center space-y-4">
          <h1 className="mb-4 text-4xl font-bold">HSE Statistics Portal</h1>
          <p className="text-xl text-muted-foreground">Manage your Health, Safety & Environment data</p>
          <Button onClick={() => navigate('/auth')}>
            Sign In to Continue
          </Button>
        </div>
      </div>
    );
  }

  return <Dashboard />;
};

export default Index;
