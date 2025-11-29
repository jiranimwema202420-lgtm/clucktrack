'use client';

import { usePathname, useRouter } from 'next/navigation';
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
import { ChevronsUpDown, LogIn, LogOut, Settings, ArrowLeft, ArrowRight } from 'lucide-react';
import { useFirebase, useDoc, useMemoFirebase } from '@/firebase';
import Link from 'next/link';
import { useToast } from '@/hooks/use-toast';
import { doc } from 'firebase/firestore';
import type { UserProfile } from '@/lib/types';


const pathToTitle: { [key: string]: string } = {
  '/dashboard': 'Dashboard',
  '/inventory': 'Inventory Management',
  '/sales': 'Sales Management',
  '/expenditure': 'Expenditure Tracking',
  '/reports': 'Performance Reports',
  '/financials': 'Financials',
  '/feed-optimization': 'AI Feed Optimizer',
  '/health-prediction': 'AI Health Predictor',
  '/poultry-qa': 'Poultry Q&A',
  '/settings': 'Settings'
};

export default function Header() {
  const pathname = usePathname();
  const router = useRouter();
  const avatar = PlaceHolderImages.find(img => img.id === 'user-avatar');
  const pageTitle = pathToTitle[pathname] || 'CluckHub';
  const { user, auth, firestore } = useFirebase();
  const { toast } = useToast();

  const userProfileRef = useMemoFirebase(() => {
    if (!user) return null;
    return doc(firestore, 'users', user.uid);
  }, [firestore, user]);
  const { data: userProfile } = useDoc<UserProfile>(userProfileRef);

  const handleLogout = () => {
    if (auth) {
      auth.signOut();
      toast({
        title: "Signed Out",
        description: "You have been successfully signed out.",
      })
    }
  };

  return (
    <header className="sticky top-0 z-10 flex h-16 items-center gap-4 border-b bg-background/80 px-4 backdrop-blur-sm lg:px-8">
      <SidebarTrigger className="md:hidden" />
      
      <div className="flex items-center gap-2">
        <Button variant="outline" size="icon" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <Button variant="outline" size="icon" onClick={() => router.forward()}>
          <ArrowRight className="h-4 w-4" />
        </Button>
      </div>

      <h1 className="text-xl font-semibold">{pageTitle}</h1>
      
      <div className="ml-auto">
        { user ? (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="flex items-center gap-2">
                <Avatar className="h-8 w-8">
                  {avatar && <AvatarImage src={user.photoURL || avatar.imageUrl} alt="User Avatar" />}
                  <AvatarFallback>{user.displayName?.charAt(0).toUpperCase() || user.email?.charAt(0).toUpperCase() || 'U'}</AvatarFallback>
                </Avatar>
                <div className="hidden flex-col items-start md:flex">
                  <span className="font-medium">{user.displayName || user.email || 'Anonymous User'}</span>
                  <span className="text-xs text-muted-foreground">{userProfile?.farmName || (user.isAnonymous ? 'Anonymous' : 'Member')}</span>
                </div>
                <ChevronsUpDown className="ml-2 h-4 w-4 text-muted-foreground" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>My Account</DropdownMenuLabel>
              <DropdownMenuSeparator />
               <Link href="/settings">
                <DropdownMenuItem>
                  <Settings className="mr-2 h-4 w-4" />
                  <span>Settings</span>
                </DropdownMenuItem>
              </Link>
              <DropdownMenuItem onClick={handleLogout}>
                <LogOut className="mr-2 h-4 w-4" />
                <span>Logout</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ) : (
          <Button asChild>
            <Link href="/settings">
                <LogIn className="mr-2 h-4 w-4"/>
                Sign In
            </Link>
          </Button>
        )}

      </div>
    </header>
  );
}
