import React from 'react'
import Image from 'next/image'
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarHeader,
} from "@/components/ui/sidebar"
import { Button } from '@/components/ui/button'
import Link from 'next/link'

export function AppSidebar() {
  const [projectList, setProjectList] = React.useState<Array<{id: string; name: string}>>([
    {id: '1', name: 'Project One'},
    {id: '2', name: 'Project Two'},
  ]);

  return (
    <Sidebar>
      <div>
        <Image src={'/logo.svg'} alt="Logo" width={35} height={35} />
        <h2 className='text-lg font-bold'>AI WebSite Builder</h2>
      </div>
      <Link href={'/workspace'} className='mt-5 w-full'>
        <Button className='w-full'>+ Add New Project</Button>
      </Link>
      <SidebarHeader />
      <SidebarContent>
        <SidebarGroup>
          
        <SidebarGroup />
      </SidebarContent>
      <SidebarFooter />
    </Sidebar>
  )
}
