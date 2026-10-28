import { useEffect } from 'react';
import { useNavigate } from 'react-router';
import NotFoundPage from '~/features/error/NotFoundPage';
import { getTokenStatus } from '~/lib/auth';

export default function CatchAll() {
  const navigate = useNavigate();

  useEffect(() => {
    if (getTokenStatus() === 'none') {
      navigate('/login', { replace: true });
    }
  }, [navigate]);

  return <NotFoundPage />;
}
