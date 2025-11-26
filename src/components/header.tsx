'use client';

import { usePathname } from 'next/navigation';
import { SidebarTrigger } from '@/components/ui/sidebar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { ChevronsUpDown, User, UserCog, UserCheck, LogIn, LogOut } from 'lucide-react';
import { useFirebase } from '@/firebase/provider';
import { initiateAnonymousSignIn } from '@/firebase/non-blocking-login';
import { getAuth } from 'firebase/auth';

const pathToTitle: { [key: string]: string } = {
  '/dashboard': 'Dashboard',
  '/inventory': 'Inventory Management',
  '/sales': 'Sales Management',
  '/expenditure': 'Expenditure Tracking',
  '/reports': 'Performance Reports',
  '/financials': 'Financials',
  '/feed-optimization': 'AI Feed Optimizer',
  '/health-prediction': 'AI Health Predictor',
};

export default function Header() {
  const pathname = usePathname();
  const avatar = PlaceHolderImages.find(img => img.id === 'user-avatar');
  const pageTitle = pathToTitle[pathname] || 'CluckHub';
  const { user, auth } = useFirebase();

  const handleLogin = () => {
    if (auth) {
      initiateAnonymousSignIn(auth);
    }
  };

  const handleLogout = () => {
    if (auth) {
      auth.signOut();
    }
  };

  return (
    <header className="sticky top-0 z-10 flex h-16 items-center gap-4 border-b bg-background/80 px-4 backdrop-blur-sm lg:px-8">
      <SidebarTrigger className="md:hidden" />

      <h1 className="text-xl font-semibold">{pageTitle}</h1>
      
      <div className="ml-auto">
        { user ? (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="flex items-center gap-2">
                <Avatar className="h-8 w-8">
                  {avatar && <AvatarImage src={avatar.imageUrl} alt="User Avatar" />}
                  <AvatarFallback>JD</AvatarFallback>
                </Avatar>
                <div className="hidden flex-col items-start md:flex">
                  <span className="font-medium">Guest User</span>
                  <span className="text-xs text-muted-foreground">Anonymous</span>
                </div>
                <ChevronsUpDown className="ml-2 h-4 w-4 text-muted-foreground" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>My Account</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleLogout}>
                <LogOut className="mr-2 h-4 w-4" />
                <span>Logout</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ) : (
          <Button onClick={handleLogin}>
            <LogIn className="mr-2 h-4 w-4"/>
            Sign In
          </Button>
        )}

      </div>
    </header>
  );
}
