import { SidebarProvider, Sidebar, SidebarInset } from '@/components/ui/sidebar';
import Header from '@/components/header';
import Nav from '@/components/nav';
import { FirebaseClientProvider } from '@/firebase';

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <FirebaseClientProvider>
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
    </FirebaseClientProvider>
  );
}
