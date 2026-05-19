
import React, { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { Logo } from './BrandKit';
import { Bell, Search, LayoutDashboard, Briefcase, CreditCard, MessageSquare, PieChart, ShieldCheck, Settings, Award, Users, ChevronRight } from 'lucide-react';
import { cn } from '../utils/helpers';

interface SidebarItem {
  icon: React.ElementType;
  label: string;
  path: string;
}

export const DashboardLayout = ({ children, sidebarItems }: { children: React.ReactNode, sidebarItems: SidebarItem[] }) => {
  const [searchFocused, setSearchFocused] = useState(false);
  const location = useLocation();

  return (
    <div className="flex min-h-screen bg-warm-ivory">
      {/* Sidebar */}
      <aside className="w-72 border-r border-coffee-satin/10 flex flex-col sticky top-0 h-screen bg-white bg-opacity-40">
        <div className="p-8">
          <Logo size="sm" />
        </div>
        
        <nav className="flex-1 px-4 flex flex-col gap-1.5 mt-4">
          {sidebarItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) => cn(
                "flex items-center gap-3 px-4 py-3 rounded-secondary transition-all duration-300 text-sm font-medium",
                isActive 
                  ? "bg-coffee-satin text-warm-ivory shadow-lg shadow-coffee-satin/10" 
                  : "text-soft-gray hover:text-coffee-satin hover:bg-coffee-satin/5"
              )}
            >
              <item.icon size={18} />
              {item.label}
              {location.pathname === item.path && <ChevronRight size={14} className="ml-auto" />}
            </NavLink>
          ))}
        </nav>

        <div className="p-8 border-t border-coffee-satin/5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-rodeo-dust">
              <img src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=100&h=100&auto=format&fit=crop" alt="User" />
            </div>
            <div>
              <p className="text-xs font-bold text-coffee-satin">Sophia Sterling</p>
              <p className="text-[10px] text-soft-gray font-semibold uppercase tracking-wider">Premium Member</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 h-screen overflow-y-auto">
        {/* Topbar */}
        <header className="h-20 border-b border-coffee-satin/10 px-6 lg:px-12 flex items-center justify-between sticky top-0 z-50 bg-warm-ivory/80 backdrop-blur-xl">
          <div className={cn(
            "flex items-center gap-3 px-4 py-2.5 border transition-all duration-500 rounded-input max-w-lg w-full",
            searchFocused ? "border-coffee-satin/30 bg-white shadow-premium" : "border-coffee-satin/5 bg-coffee-satin/5"
          )}>
            <Search size={16} className="text-soft-gray" />
            <input 
              type="text" 
              placeholder="Search across ecosystem..." 
              className="bg-transparent text-sm outline-none w-full text-coffee-satin font-medium"
              onFocus={() => setSearchFocused(true)}
              onBlur={() => setSearchFocused(false)}
            />
          </div>

          <div className="flex items-center gap-6 lg:gap-10">
            <button className="relative text-soft-gray hover:text-coffee-satin transition-colors duration-300">
              <Bell size={20} />
              <span className="absolute -top-1 -right-1 w-2 h-2 bg-old-copper rounded-full ring-4 ring-warm-ivory"></span>
            </button>
            <div className="flex items-center gap-4 pl-6 lg:pl-10 border-l border-coffee-satin/10">
              <div className="text-right hidden sm:block">
                <p className="text-[10px] font-bold text-coffee-satin tracking-widest uppercase">Sophia Sterling</p>
                <p className="text-[9px] text-glade-green font-bold tracking-tighter">ELITE PARTNER</p>
              </div>
              <div className="h-10 w-10 rounded-full bg-white border border-coffee-satin/10 flex items-center justify-center shadow-sm overflow-hidden">
                <img src="https://i.pravatar.cc/100?u=sophia" alt="SS" className="w-full h-full object-cover" />
              </div>
            </div>
          </div>
        </header>

        {/* Dynamic Content */}
        <div className="flex-1 w-full max-w-[1440px] mx-auto px-6 lg:px-16 py-12 lg:py-16">
          {children}
        </div>
      </main>
    </div>
  );
};
