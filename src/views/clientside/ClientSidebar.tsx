/**
 * ClientSidebar.tsx
 * Sidebar navigation for the Client Dashboard.
 * Matches the MGNOVA color palette and design language
 * from the Freelancer Dashboard (FreelancerDashboard.tsx).
 */

import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard,
  FolderOpen,
  FileText,
  Wallet,
  BarChart2,
  Settings,
  ChevronLeft,
  Menu,
  LogOut,
  Sparkles,
  X,
} from 'lucide-react';

// ─── Types ────────────────────────────────────────────────────────────────────
export interface ClientNavItem {
  icon: React.ElementType;
  label: string;
  key: string;
}

export interface ClientSidebarProps {
  /** Whether the sidebar is expanded (desktop) */
  expanded: boolean;
  /** Active page key */
  activePage: string;
  /** User display name */
  userName: string;
  /** User role / industry label */
  userRole: string;
  /** User initials for avatar */
  userInitials: string;
  /** Called when a nav item is clicked */
  onNavClick: (key: string) => void;
  /** Toggle collapse/expand (desktop) */
  onToggleExpand: () => void;
  /** Close mobile drawer */
  onCloseMobile?: () => void;
  /** Logout handler */
  onLogout: () => void;
  /** Whether we're in mobile drawer mode */
  isMobileDrawer?: boolean;
}

// ─── Color palette (mirrors FreelancerDashboard) ──────────────────────────────
const C = {
  ivory:       '#F7F3EE',
  coffee:      '#4B362F',
  gray:        '#999999',
  green:       '#66806A',
  gold:        '#D4AF37',
  copper:      '#7B4B3A',
  rodeo:       '#C7A19A',
  greenLight:  '#EEF3EF',
  copperLight: '#F5EBE8',
  goldLight:   '#FBF5E0',
  sidebarText: '#EDE8E3',
  sidebarMuted:'#B8AFA9',
} as const;

// ─── Shared micro-styles ──────────────────────────────────────────────────────
const labelStyle: React.CSSProperties = {
  fontSize: 11,
  color: C.gray,
  letterSpacing: '0.08em',
  textTransform: 'uppercase',
  fontFamily: "'DM Sans', sans-serif",
  fontWeight: 500,
};

const btnStyle: React.CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  gap: 6,
  padding: '9px 18px',
  borderRadius: 8,
  fontSize: 13,
  fontWeight: 600,
  cursor: 'pointer',
  border: 'none',
  transition: 'all 0.18s ease',
  fontFamily: "'DM Sans', sans-serif",
};

// ─── Nav items ────────────────────────────────────────────────────────────────
export const CLIENT_NAV_ITEMS: ClientNavItem[] = [
  { icon: LayoutDashboard, label: 'Dashboard',  key: 'dashboard'  },
  { icon: FolderOpen,      label: 'Projects',   key: 'projects'   },
  { icon: FileText,        label: 'Proposals',  key: 'proposals'  },
  { icon: FileText,        label: 'Contracts',  key: 'contracts'  },
  { icon: Sparkles,        label: 'AI Matches', key: 'matches'    },
  { icon: BarChart2,       label: 'Milestones', key: 'milestones' },
  { icon: Wallet,          label: 'Payments',   key: 'payments'   },
  { icon: BarChart2,       label: 'Analytics',  key: 'analytics'  },
  { icon: Settings,        label: 'Settings',   key: 'settings'   },
];

// ─── Logo ─────────────────────────────────────────────────────────────────────
function Logo({ collapsed }: { collapsed: boolean }) {
  return (
    <div style={{ display: 'flex', alignItems: 'baseline', gap: 0 }}>
      <span style={{
        fontSize: collapsed ? 18 : 22,
        fontWeight: 800,
        color: C.ivory,
        letterSpacing: '-0.03em',
        fontFamily: "'DM Sans', sans-serif",
      }}>MG</span>
      <span style={{
        fontSize: collapsed ? 18 : 22,
        fontWeight: 800,
        color: C.gold,
        letterSpacing: '-0.03em',
        fontFamily: "'DM Sans', sans-serif",
      }}>NOVA</span>
    </div>
  );
}

// ─── Nav list (shared between desktop + mobile drawer) ───────────────────────
function NavList({
  collapsed,
  activePage,
  onNavClick,
}: {
  collapsed: boolean;
  activePage: string;
  onNavClick: (key: string) => void;
}) {
  return (
    <>
      {!collapsed && (
        <p style={{ ...labelStyle, color: `${C.ivory}50`, padding: '8px 12px 4px', fontSize: 9 }}>
          Navigation
        </p>
      )}
      {CLIENT_NAV_ITEMS.map(({ icon: Icon, label, key }) => {
        const isActive = activePage === key;
        return (
          <button
            key={key}
            onClick={() => onNavClick(key)}
            title={collapsed ? label : undefined}
            style={{
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              gap: collapsed ? 0 : 10,
              justifyContent: collapsed ? 'center' : 'flex-start',
              padding: collapsed ? '10px 0' : '10px 14px',
              borderRadius: 9,
              border: 'none',
              cursor: 'pointer',
              marginBottom: 2,
              background: isActive ? C.green : 'transparent',
              transition: 'all 0.15s',
              color: isActive ? C.ivory : C.sidebarText,
            }}
            onMouseEnter={e => {
              if (!isActive) (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.10)';
            }}
            onMouseLeave={e => {
              if (!isActive) (e.currentTarget as HTMLElement).style.background = 'transparent';
            }}
          >
            <Icon size={18} style={{ flexShrink: 0 }} />
            {!collapsed && (
              <span style={{
                fontSize: 13,
                fontWeight: isActive ? 600 : 400,
                whiteSpace: 'nowrap',
                fontFamily: "'DM Sans', sans-serif",
                color: isActive ? C.ivory : C.sidebarText,
              }}>
                {label}
              </span>
            )}
          </button>
        );
      })}
    </>
  );
}

// ─── Premium Upgrade Banner ───────────────────────────────────────────────────
function UpgradeBanner({ collapsed }: { collapsed: boolean }) {
  if (collapsed) return null;
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.3 }}
      style={{
        margin: '0 10px 10px',
        padding: '12px 14px',
        background: `${C.gold}15`,
        border: `1px solid ${C.gold}30`,
        borderRadius: 10,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
        <Sparkles size={12} color={C.gold} />
        <span style={{ fontSize: 11, fontWeight: 700, color: C.gold, fontFamily: "'DM Sans', sans-serif" }}>
          Go Premium
        </span>
      </div>
      <p style={{
        fontSize: 11,
        color: C.sidebarMuted,
        margin: '0 0 8px',
        lineHeight: 1.5,
        fontFamily: "'DM Sans', sans-serif",
      }}>
        Unlock AI proposals &amp; priority matching
      </p>
      <button
        style={{
          width: '100%',
          padding: '6px 0',
          background: C.gold,
          color: C.coffee,
          border: 'none',
          borderRadius: 6,
          fontSize: 11,
          fontWeight: 700,
          cursor: 'pointer',
          fontFamily: "'DM Sans', sans-serif",
        }}
      >
        Upgrade Now
      </button>
    </motion.div>
  );
}

// ─── User Footer ──────────────────────────────────────────────────────────────
function UserFooter({
  collapsed,
  userName,
  userRole,
  userInitials,
  onLogout,
}: {
  collapsed: boolean;
  userName: string;
  userRole: string;
  userInitials: string;
  onLogout: () => void;
}) {
  return (
    <div style={{ padding: '10px 8px', borderTop: `1px solid rgba(255,255,255,0.08)` }}>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: collapsed ? 0 : 10,
        justifyContent: collapsed ? 'center' : 'flex-start',
        padding: '8px',
        borderRadius: 9,
      }}>
        {/* Avatar */}
        <div style={{
          width: 32,
          height: 32,
          borderRadius: '50%',
          background: C.greenLight,
          color: C.green,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: 11,
          fontWeight: 800,
          flexShrink: 0,
          fontFamily: "'DM Sans', sans-serif",
        }}>
          {userInitials}
        </div>

        {/* Name / role */}
        {!collapsed && (
          <div style={{ flex: 1, minWidth: 0 }}>
            <p style={{
              fontSize: 12,
              fontWeight: 600,
              color: C.sidebarText,
              margin: 0,
              fontFamily: "'DM Sans', sans-serif",
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
            }}>
              {userName}
            </p>
            <p style={{ fontSize: 10, color: C.sidebarMuted, margin: 0, fontFamily: "'DM Sans', sans-serif" }}>
              {userRole}
            </p>
          </div>
        )}

        {/* Logout */}
        {!collapsed && (
          <button
            onClick={onLogout}
            title="Logout"
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              color: C.rodeo,
              display: 'flex',
              alignItems: 'center',
              flexShrink: 0,
              padding: 4,
              borderRadius: 6,
            }}
            onMouseEnter={e => ((e.currentTarget as HTMLElement).style.color = C.ivory)}
            onMouseLeave={e => ((e.currentTarget as HTMLElement).style.color = C.rodeo)}
          >
            <LogOut size={15} />
          </button>
        )}
      </div>
    </div>
  );
}

// ─── Desktop Sidebar ──────────────────────────────────────────────────────────
export function ClientSidebar({
  expanded,
  activePage,
  userName,
  userRole,
  userInitials,
  onNavClick,
  onToggleExpand,
  onLogout,
}: ClientSidebarProps) {
  const width = expanded ? 240 : 64;

  return (
    <div style={{
      position: 'fixed',
      left: 0,
      top: 0,
      height: '100vh',
      width,
      background: C.coffee,
      zIndex: 50,
      display: 'flex',
      flexDirection: 'column',
      transition: 'width 0.3s cubic-bezier(0.4,0,0.2,1)',
      overflow: 'hidden',
    }}>
      {/* Header */}
      <div style={{
        padding: '18px 14px 14px',
        borderBottom: `1px solid rgba(255,255,255,0.08)`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        minHeight: 60,
      }}>
        {expanded && <Logo collapsed={false} />}
        <button
          onClick={onToggleExpand}
          style={{
            background: 'rgba(255,255,255,0.08)',
            border: 'none',
            cursor: 'pointer',
            width: 30,
            height: 30,
            borderRadius: 7,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginLeft: expanded ? 0 : 'auto',
            flexShrink: 0,
          }}
          onMouseEnter={e => ((e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.14)')}
          onMouseLeave={e => ((e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.08)')}
        >
          {expanded
            ? <ChevronLeft size={15} color={C.ivory} />
            : <Menu size={15} color={C.ivory} />
          }
        </button>
      </div>

      {/* Nav */}
      <nav style={{ flex: 1, padding: '10px 8px', overflowY: 'auto' }}>
        <NavList collapsed={!expanded} activePage={activePage} onNavClick={onNavClick} />
      </nav>

      <UpgradeBanner collapsed={!expanded} />

      <UserFooter
        collapsed={!expanded}
        userName={userName}
        userRole={userRole}
        userInitials={userInitials}
        onLogout={onLogout}
      />
    </div>
  );
}

// ─── Mobile Drawer ────────────────────────────────────────────────────────────
export function ClientMobileDrawer({
  open,
  activePage,
  userName,
  userEmail,
  userInitials,
  onNavClick,
  onClose,
  onLogout,
}: {
  open: boolean;
  activePage: string;
  userName: string;
  userEmail: string;
  userInitials: string;
  onNavClick: (key: string) => void;
  onClose: () => void;
  onLogout: () => void;
}) {
  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            style={{
              position: 'fixed',
              inset: 0,
              background: 'rgba(0,0,0,0.45)',
              zIndex: 60,
            }}
          />

          {/* Drawer panel */}
          <motion.div
            initial={{ x: -260 }}
            animate={{ x: 0 }}
            exit={{ x: -260 }}
            transition={{ type: 'spring', damping: 28, stiffness: 300 }}
            style={{
              position: 'fixed',
              left: 0,
              top: 0,
              bottom: 0,
              width: 260,
              background: C.coffee,
              zIndex: 70,
              display: 'flex',
              flexDirection: 'column',
              overflowY: 'auto',
            }}
          >
            {/* Header */}
            <div style={{
              padding: '20px 16px 16px',
              borderBottom: `1px solid rgba(255,255,255,0.08)`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}>
              <Logo collapsed={false} />
              <button
                onClick={onClose}
                style={{
                  background: 'rgba(255,255,255,0.08)',
                  border: 'none',
                  cursor: 'pointer',
                  width: 32,
                  height: 32,
                  borderRadius: 8,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <X size={16} color={C.ivory} />
              </button>
            </div>

            {/* User info */}
            <div style={{
              padding: '14px 16px',
              borderBottom: `1px solid rgba(255,255,255,0.08)`,
              display: 'flex',
              alignItems: 'center',
              gap: 12,
            }}>
              <div style={{
                width: 40,
                height: 40,
                borderRadius: '50%',
                background: C.greenLight,
                color: C.green,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 13,
                fontWeight: 800,
                flexShrink: 0,
                fontFamily: "'DM Sans', sans-serif",
              }}>
                {userInitials}
              </div>
              <div>
                <p style={{ fontSize: 13, fontWeight: 700, color: C.sidebarText, margin: 0, fontFamily: "'DM Sans', sans-serif" }}>
                  {userName}
                </p>
                <p style={{ fontSize: 11, color: C.sidebarMuted, margin: 0, fontFamily: "'DM Sans', sans-serif" }}>
                  {userEmail}
                </p>
              </div>
            </div>

            {/* Nav */}
            <nav style={{ flex: 1, padding: '12px 10px' }}>
              <NavList collapsed={false} activePage={activePage} onNavClick={onNavClick} />
            </nav>

            <UpgradeBanner collapsed={false} />

            {/* Logout */}
            <div style={{ padding: '10px 18px', borderTop: `1px solid rgba(255,255,255,0.08)` }}>
              <button
                onClick={onLogout}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  color: C.rodeo,
                  fontSize: 13,
                  fontFamily: "'DM Sans', sans-serif",
                  padding: '8px 0',
                  width: '100%',
                }}
                onMouseEnter={e => ((e.currentTarget as HTMLElement).style.color = C.ivory)}
                onMouseLeave={e => ((e.currentTarget as HTMLElement).style.color = C.rodeo)}
              >
                <LogOut size={16} /> Logout
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}