import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Logo } from './BrandKit';
import { Button } from './UIBlocks';
import { Menu, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export const GlobalHeader = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { name: 'FIND TALENT', path: '/client/discover' },
    { name: 'BROWSE WORK', path: '/freelancer/discover' },
    { name: 'HOW IT WORKS', path: '/#how-it-works' },
    { name: 'ENTERPRISE', path: '/enterprise' }
  ];

  return (
    <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${isScrolled ? 'premium-blur py-4 border-b border-coffee-satin/5' : 'bg-transparent py-8'}`}>
      <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
        <Link to="/">
          <Logo size="md" />
        </Link>

        <nav className="hidden md:flex items-center gap-10">
          {navLinks.map((link) => (
            <Link
              key={link.name}
              to={link.path}
              className="text-[11px] font-semibold tracking-widest text-coffee-satin/70 hover:text-coffee-satin transition-colors"
            >
              {link.name}
            </Link>
          ))}
        </nav>

        <div className="hidden md:flex items-center gap-6">
          <Link to="/login" className="text-[11px] font-semibold tracking-widest text-coffee-satin/70 hover:text-coffee-satin">
            LOG IN
          </Link>
          <Link to="/register">
            <Button variant="primary" size="md" className="rounded-full px-8">
              JOIN MGNOVA
            </Button>
          </Link>
        </div>

        <button className="md:hidden text-coffee-satin" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
          {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="md:hidden premium-blur absolute top-full left-0 right-0 border-b border-coffee-satin/5 p-6"
          >
            <div className="flex flex-col gap-6 items-center">
              {navLinks.map((link) => (
                <Link
                  key={link.name}
                  to={link.path}
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-sm font-semibold tracking-widest text-coffee-satin"
                >
                  {link.name}
                </Link>
              ))}
              <hr className="w-full border-coffee-satin/5" />
              <Link to="/register" className="w-full">
                <Button variant="primary" size="lg" className="w-full">JOIN AS FREELANCER</Button>
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
};