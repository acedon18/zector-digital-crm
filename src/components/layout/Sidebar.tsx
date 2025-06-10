import { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Users, BarChart3, MessageSquare, Calendar, Settings, LogOut, ChevronLeft, ChevronRight, LifeBuoy, Eye, Globe, Target, Shield, Brain, Mail, Download, CreditCard } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Separator } from '@/components/ui/separator';
import { useIsMobile } from '@/hooks/use-mobile';
import { Link } from 'react-router-dom';
interface SidebarProps {
  isOpen: boolean;
  toggleSidebar: () => void;
}

interface NavItemProps {
  icon: React.ElementType;
  label: string;
  href: string;
  isCollapsed?: boolean;
}

function NavItem({ icon: Icon, label, href, isCollapsed }: NavItemProps) {
  return (
    <NavLink
      to={href}
      end={href === '/'}
      className={({ isActive }) =>
        cn(
          'flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-all hover:bg-accent',
          isActive ? 'bg-sidebar-accent text-sidebar-accent-foreground font-medium' : 'text-sidebar-foreground/80 hover:text-sidebar-foreground'
        )
      }
    >
      <Icon className="h-5 w-5 flex-shrink-0" />
      {!isCollapsed && <span>{label}</span>}
    </NavLink>
  );
}

export function Sidebar({ isOpen, toggleSidebar }: SidebarProps) {
  const isMobile = useIsMobile();
  const [isCollapsed, setIsCollapsed] = useState(false);

  const handleToggleCollapse = () => {
    if (!isMobile) {
      setIsCollapsed(!isCollapsed);
    } else {
      toggleSidebar();
    }
  };

  // Hide completely on mobile when closed
  if (isMobile && !isOpen) {
    return null;
  }

  return (
    <>
      {/* Mobile overlay */}
      {isMobile && isOpen && <div className="fixed inset-0 z-40 bg-background/80 backdrop-blur-sm" onClick={toggleSidebar} />}

      <aside
        className={cn(
          'bg-sidebar border-r border-border z-50 transition-all duration-300 ease-in-out',
          isMobile ? (isOpen ? 'fixed inset-y-0 left-0 w-64' : '-translate-x-full') : isCollapsed ? 'w-16' : 'w-64',
          isMobile ? 'bottom-0 top-0' : 'h-screen'
        )}
      >
        <div className="flex h-16 items-center border-b border-border pl-4">
          <Link to="/" className="flex items-center space-x-2">
            <div className="flex items-center gap-2 overflow-hidden">
              <div className="bg-primary rounded h-8 w-8 flex items-center justify-center text-white font-bold">Z</div>
              {!isCollapsed && <span className="font-bold text-lg tracking-tight">Zector Digital</span>}
            </div>
          </Link>

          <Button variant="ghost" size="icon" onClick={handleToggleCollapse} className="ml-auto -mr-4  rounded-full">
            {isCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
            <span className="sr-only">{isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}</span>
          </Button>
        </div>

        <div className="flex flex-col gap-1 p-2">
          <nav className="grid gap-1">
            <NavItem icon={LayoutDashboard} label="Dashboard" href="/" isCollapsed={isCollapsed} />
            <NavItem icon={Eye} label="Lead Tracking" href="/lead-tracking" isCollapsed={isCollapsed} />
            <NavItem icon={Globe} label="Website Intelligence" href="/website-intelligence" isCollapsed={isCollapsed} />
            <NavItem icon={Brain} label="AI Qualification" href="/ai-qualification" isCollapsed={isCollapsed} />
            <NavItem icon={Mail} label="Email Alerts" href="/email-alerts" isCollapsed={isCollapsed} />
            <NavItem icon={Download} label="Data Export" href="/data-export" isCollapsed={isCollapsed} />
            <NavItem icon={Users} label="Contacts" href="/contacts" isCollapsed={isCollapsed} />
            <NavItem icon={BarChart3} label="Analytics" href="/analytics" isCollapsed={isCollapsed} />
            <NavItem icon={MessageSquare} label="Messages" href="/messages" isCollapsed={isCollapsed} />
            <NavItem icon={Calendar} label="Calendar" href="/calendar" isCollapsed={isCollapsed} />
          </nav>

          <Separator className="my-4" />

          <nav className="grid gap-1 mt-auto">
            <NavItem icon={CreditCard} label="Billing" href="/billing" isCollapsed={isCollapsed} />
            <NavItem icon={Shield} label="Admin Panel" href="/admin" isCollapsed={isCollapsed} />
            <NavItem icon={Settings} label="Settings" href="/settings" isCollapsed={isCollapsed} />
            <NavItem icon={LifeBuoy} label="Support" href="/support" isCollapsed={isCollapsed} />
            <Button
              variant="ghost"
              className={cn('flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-all', 'justify-start text-sidebar-foreground/80 hover:text-sidebar-foreground hover:bg-accent')}
            >
              <LogOut className="h-5 w-5 flex-shrink-0" />
              {!isCollapsed && <span>Logout</span>}
            </Button>
          </nav>
        </div>
      </aside>
    </>
  );
}
