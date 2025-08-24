"use client"

import Sidebar from '@/components/Sidebar';
import { usePathname } from 'next/navigation';
import { SidebarProvider, useSidebar } from '@/context/SidebarContext';

function ClientLayoutContent({ children }: { children: React.ReactNode }) {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { isSidebarExpanded, setIsSidebarExpanded } = useSidebar();
  const pathname = usePathname();

  // Check if we're on an edit page
  const isEditPage = pathname?.includes('/edit');
  const isAdminPage = pathname?.includes('/admin');

  return (
    <div className="flex h-full w-full overflow-hidden">
      {!isEditPage && !isAdminPage && (
        <Sidebar 
          onCollapseChange={setIsSidebarExpanded}
          onPathChange={() => {}}
          selectedPath={pathname}
        />
      )}
      <main className={`flex-1 overflow-auto ${isEditPage ? 'w-full' : ''}`}>
        {children}
      </main>
    </div>
  );
}

export default function ClientLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SidebarProvider>
      <ClientLayoutContent>{children}</ClientLayoutContent>
    </SidebarProvider>
  );
} 