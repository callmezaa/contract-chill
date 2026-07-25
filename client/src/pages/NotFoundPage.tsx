import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useDocumentTitle } from '../hooks/useDocumentTitle';
import { Button } from '@/components/motion/button';

export const NotFoundPage = () => {
  const { t } = useTranslation();
  useDocumentTitle('404 - ContractChill');

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background px-4">
      <h1 className="text-6xl font-bold text-text">{t('errors.notFound.title')}</h1>
      <p className="mt-4 text-text-muted">{t('errors.notFound.message')}</p>
      <Link to="/dashboard" className="mt-8">
        <Button>{t('common.buttons.goHome')}</Button>
      </Link>
    </div>
  );
};
