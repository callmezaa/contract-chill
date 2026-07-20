import { Link } from 'react-router-dom';
import { useDocumentTitle } from '../hooks/useDocumentTitle';
import { Button } from '@/components/motion/button';

export const NotFoundPage = () => {
  useDocumentTitle('404 - ContractChill');

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background px-4">
      <h1 className="text-6xl font-bold text-text">404</h1>
      <p className="mt-4 text-text-muted">This page doesn't exist.</p>
      <Link to="/dashboard" className="mt-8">
        <Button>Go Home</Button>
      </Link>
    </div>
  );
};
