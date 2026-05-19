
import React from 'react';
import { Logo } from './BrandKit';
import { Link } from 'react-router-dom';

export const GlobalFooter = () => {
  return (
    <footer className="bg-white border-t border-coffee-satin/5 pt-20 pb-10 px-6">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-20">
          <div className="col-span-1 md:col-span-1">
            <Logo size="md" className="mb-6" />
            <p className="text-soft-gray text-sm leading-relaxed">
              Curated freelance talent for the world's most ambitious businesses.
              Built on trust, powered by intelligence.
            </p>
          </div>
          
          <div>
            <h4 className="text-[10px] font-bold tracking-widest uppercase mb-6 text-coffee-satin">Platform</h4>
            <div className="flex flex-col gap-4">
              <Link to="/freelancer" className="text-sm text-soft-gray hover:text-coffee-satin">For Talent</Link>
              <Link to="/client" className="text-sm text-soft-gray hover:text-coffee-satin">For Clients</Link>
              <Link to="/enterprise" className="text-sm text-soft-gray hover:text-coffee-satin">Enterprise</Link>
              <Link to="/pricing" className="text-sm text-soft-gray hover:text-coffee-satin">Pricing & Fees</Link>
            </div>
          </div>

          <div>
            <h4 className="text-[10px] font-bold tracking-widest uppercase mb-6 text-coffee-satin">Community</h4>
            <div className="flex flex-col gap-4">
              <Link to="/stories" className="text-sm text-soft-gray hover:text-coffee-satin">Member Stories</Link>
              <Link to="/editorial" className="text-sm text-soft-gray hover:text-coffee-satin">Editorial UI</Link>
              <Link to="/badges" className="text-sm text-soft-gray hover:text-coffee-satin">Reputation System</Link>
              <Link to="/partners" className="text-sm text-soft-gray hover:text-coffee-satin">Partner Program</Link>
            </div>
          </div>

          <div>
            <h4 className="text-[10px] font-bold tracking-widest uppercase mb-6 text-coffee-satin">Company</h4>
            <div className="flex flex-col gap-4">
              <Link to="/about" className="text-sm text-soft-gray hover:text-coffee-satin">Our Philosophy</Link>
              <Link to="/careers" className="text-sm text-soft-gray hover:text-coffee-satin">Careers</Link>
              <Link to="/press" className="text-sm text-soft-gray hover:text-coffee-satin">Editorial Kit</Link>
              <Link to="/contact" className="text-sm text-soft-gray hover:text-coffee-satin">Contact</Link>
            </div>
          </div>
        </div>

        <div className="flex flex-col md:flex-row justify-between items-center pt-10 border-t border-coffee-satin/5 gap-6">
          <p className="text-[10px] text-soft-gray tracking-wider uppercase">©2026 MGNOVA. ALL RIGHTS RESERVED.</p>
          <div className="flex gap-8">
            <Link to="/privacy" className="text-[10px] text-soft-gray tracking-wider uppercase hover:text-coffee-satin">Privacy Policy</Link>
            <Link to="/terms" className="text-[10px] text-soft-gray tracking-wider uppercase hover:text-coffee-satin">Terms of Service</Link>
            <Link to="/cookies" className="text-[10px] text-soft-gray tracking-wider uppercase hover:text-coffee-satin">Cookie Policy</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};
