"use client"
import React from 'react'
import Image from 'next/image'
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { UserDetailContext } from '@/context/UserDetailContext'
import { Progress } from '@radix-ui/react-progress'
import { UserButton } from '@clerk/nextjs'

export function AppSidebar() {
  const [projectList, setProjectList] = React.useState([]);
  const { userDetail, setUserDetail } = React.useContext(UserDetailContext) || {} as any;
  
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
          <SidebarGroupLabel>Projects</SidebarGroupLabel>
          { projectList.length == 0 && <h2 className='text-sm px-2 text-gray-500'>No projects found</h2> }
          { projectList.length > 0 && <SidebarGroupContent>
           
          </SidebarGroupContent> }
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter className='p-2'>
        <div className='p-3 border rounded-xl space-y-3 bg-secondary'> 
          <h2 className='flex justify-between items-center'>Remaining Credits <span className='font-bold'> {userDetail?.credits} </span> 
          </h2>
        <Progress value={33}></Progress>
        <Button className='w-full'>Upgrade to Unlimited</Button>
        </div>
        <div className='flex items-center gap-2'>
          <UserButton/>
          <Button variant={'ghost'}>Settings</Button>
        </div>
     </SidebarFooter>
    </Sidebar>
  )
}
