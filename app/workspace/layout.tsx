import { SidebarProvider } from '@/components/ui/sidebar';
import { AppSidebar } from './_components/AppSideBar';
import React from 'react'
import AppHeader from './_components/AppHeader';

function WorkSpaceLayout({
   children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return ( 
    <SidebarProvider>
        <AppSidebar />
        <div className='w-full'>
            <AppHeader />
        </div>
        <div>{children}</div>
    </SidebarProvider>
  )
}

export default WorkSpaceLayout