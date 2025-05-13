import { ReactNode } from 'react';
import { Link, useLocation } from 'wouter';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  CogIcon,
  CreditCard,
  Users,
  Settings,
  ToggleLeft,
  Mail,
  Bell,
  Lock,
  Info,
  ArrowLeft
} from 'lucide-react';

interface SettingsNavItemProps {
  href: string;
  icon: ReactNode;
  text: string;
  isActive: boolean;
}

function SettingsNavItem({ href, icon, text, isActive }: SettingsNavItemProps) {
  return (
    <Link href={href}>
      <a
        className={cn(
          'flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors',
          isActive
            ? 'bg-primary/10 text-primary'
            : 'text-muted-foreground hover:text-foreground hover:bg-muted'
        )}
      >
        {icon}
        {text}
      </a>
    </Link>
  );
}

interface SettingsLayoutProps {
  children: ReactNode;
}

export function SettingsLayout({ children }: SettingsLayoutProps) {
  const [location] = useLocation();

  const navItems = [
    {
      href: '/settings',
      icon: <CogIcon className="w-5 h-5" />,
      text: 'General Settings',
    },
    {
      href: '/settings/account',
      icon: <Users className="w-5 h-5" />,
      text: 'Account Settings',
    },
    {
      href: '/settings/billing',
      icon: <CreditCard className="w-5 h-5" />,
      text: 'Billing & Subscription',
    },
    {
      href: '/settings/notifications',
      icon: <Bell className="w-5 h-5" />,
      text: 'Notifications',
    },
    {
      href: '/settings/email',
      icon: <Mail className="w-5 h-5" />,
      text: 'Email Settings',
    },
    {
      href: '/settings/security',
      icon: <Lock className="w-5 h-5" />,
      text: 'Security',
    },
    {
      href: '/feature-flags',
      icon: <ToggleLeft className="w-5 h-5" />,
      text: 'Feature Flags',
    },
    {
      href: '/settings/about',
      icon: <Info className="w-5 h-5" />,
      text: 'About',
    },
  ];

  return (
    <div className="flex flex-col min-h-screen">
      <div className="flex-1 container mx-auto py-6 px-4 md:px-6 lg:px-8">
        <Button
          variant="ghost"
          size="sm"
          className="mb-6 inline-flex items-center"
          asChild
        >
          <Link href="/">
            <a>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Dashboard
            </a>
          </Link>
        </Button>

        <div className="grid grid-cols-1 gap-8 md:grid-cols-[240px_1fr]">
          <aside className="hidden md:block">
            <nav className="flex flex-col gap-1 sticky top-16">
              {navItems.map((item) => (
                <SettingsNavItem
                  key={item.href}
                  href={item.href}
                  icon={item.icon}
                  text={item.text}
                  isActive={location === item.href}
                />
              ))}
            </nav>
          </aside>

          <main className="flex-1">{children}</main>
        </div>
      </div>
    </div>
  );
}