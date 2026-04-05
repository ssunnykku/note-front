import { useEffect } from 'react';
import { useNavigate } from 'react-router';
import NotFoundPage from '~/features/error/NotFoundPage';

export default function CatchAll() {
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    if (!token) {
      navigate('/login', { replace: true });
    }
  }, [navigate]);

  return <NotFoundPage />;
}
