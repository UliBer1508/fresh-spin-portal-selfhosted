import { useTranslation } from 'react-i18next';

const Footer = () => {
  const { t } = useTranslation();
  const currentYear = new Date().getFullYear();
  
  return (
    <footer className="bg-background border-t border-border py-4 mt-auto">
      <div className="max-w-7xl mx-auto px-6 text-center">
        <p className="text-sm text-muted-foreground">
          {t('footer.copyright', { year: currentYear })}
        </p>
      </div>
    </footer>
  );
};

export default Footer;
