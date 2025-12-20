const Footer = () => {
  const currentYear = new Date().getFullYear();
  
  return (
    <footer className="bg-background border-t border-border py-4 mt-auto">
      <div className="max-w-7xl mx-auto px-6 text-center">
        <p className="text-sm text-muted-foreground">
          © {currentYear} Copy Right Steinbock Chalets
        </p>
      </div>
    </footer>
  );
};

export default Footer;
