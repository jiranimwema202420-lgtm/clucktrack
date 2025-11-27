import { SidebarProvider, Sidebar, SidebarInset } from '@/components/ui/sidebar';
import Header from '@/components/header';
import Nav from '@/components/nav';
import { FirebaseClientProvider } from '@/firebase';
import { ThemeProvider } from '@/components/theme-provider';

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <FirebaseClientProvider>
      <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
        <SidebarProvider>
            <Sidebar>
              <Nav />
            </Sidebar>
            <SidebarInset>
              <Header />
              <div className="p-4 lg:p-8">
                {children}
              </div>
            </SidebarInset>
        </SidebarProvider>
      </ThemeProvider>
    </FirebaseClientProvider>
  );
}
