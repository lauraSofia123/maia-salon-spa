import { useEffect, useState } from 'react';
import TopBar from './layout/TopBar';
import Navbar, { navLinks } from './layout/Navbar';
import MobileMenu from './layout/MobileMenu';

const Header = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <>
      <TopBar />
      <header className="sticky top-0 z-40">
        <Navbar isScrolled={isScrolled} onOpenMenu={() => setMenuOpen(true)} />
      </header>
      <MobileMenu open={menuOpen} onClose={() => setMenuOpen(false)} navLinks={navLinks} />
    </>
  );
};

export default Header;