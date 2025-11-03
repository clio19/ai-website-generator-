"use client"
import React, { JSX } from 'react'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { ArrowRight } from 'lucide-react'
import Link from 'next/link'
import { SignInButton, useUser } from '@clerk/nextjs'

const MenuOptions = [
    {
        name: "Pricing",
        href: "/pricing"
    },
    {
        name: "Contact",
        href: "/contact"
    }
]

function Header(): JSX.Element {
 const {user} = useUser();

  return (
    <div className='flex items-center justify-between p4 shadow'>
        {/* Logo*/}
    <div className='flex gap-2 items-center'>
        <Image src={'/logo.svg'} alt="Logo" width={35} height={35} />
        <h2 className='font-bold text-xl'>AI Website Generator</h2>
    </div>
        {/* Menu options*/}
    <div className='flex gap-3'>
        {MenuOptions.map((menu, index) => (         
                <Button variant="ghost" key={index}>
                    {menu.name}
                </Button>

        ))}
    </div>
        {/* Get started Button*/}
    <div>
        { !user ? <SignInButton mode='modal'
             forceRedirectUrl={'/workspace'}>
            <Button>Get Started <ArrowRight /></Button>
        </SignInButton>
         :
         <Link href={'/workspace'}>
            <Button>Go to Workspace <ArrowRight /></Button>
         </Link>
    }
    </div>
    </div>
  );
}

export default Header