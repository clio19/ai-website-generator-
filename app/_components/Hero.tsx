"use client"
import { Button } from '@/components/ui/button'
import { SignInButton } from '@clerk/nextjs'
import { ArrowUp, HomeIcon, ImagePlus, Key, LayoutDashboard, User } from 'lucide-react'
import React from 'react'

const suggestion = [
  {
    label: 'Dashboard',
    prompt: 'Create an analytics dashboard to track customers and revenue data for a SaaS',
    icon: LayoutDashboard
  },
  {
    label: 'SignUp Form',
    prompt: 'Create a modern sign up form with email/password fields, Google and Github login options, and terms checkbox',
    icon: Key
  },
  {
    label: 'Hero',
    prompt: 'Create a modern header and centered hero section for a productivity SaaS. Include a badge for feature announcement, a title with a subtle gradient effe',
    icon: HomeIcon
  },
  {
    label: 'User Profile Card',
    prompt: 'Create a modern user profile card component for a social media website',
    icon: User
  }
]


export default function Hero() {
  const [userInput, setUserInput] = React.useState<string>('')

  return (
    <div className='flex flex-col items-center h-[80vh] justify-center'>
        {/* Header & description */}
            <h2 className='font-bold text-6xl'>O que vamos fazer hoje ?</h2>
            <p className='mt-2 text-xl text-gray-500'>Generate, Edit and explore with AI, Export code also</p>
        {/* Input box */}
        <div className='w-full max-w-2xl p-5 border mt-5 rounded-2xl'>
            <textarea placeholder='Describe your page design'
                    value={userInput}
                    onChange={event => setUserInput(event.target.value)}
                    className='w-full h-24 focus:outline-none focus:ring-0 resize-none'/>
            <div className='flex justify-between items-center'>
                <Button variant={'ghost'} size={'icon'}><ImagePlus /></Button>
                <SignInButton mode='modal' forceRedirectUrl={'/workspace'}>
                    <Button disabled={!userInput}> <ArrowUp /></Button>
                </SignInButton>
            </div>
        </div>
        {/* Suggestion list */}
        <div className='mt-04 flex gap-3'>
            {suggestion.map((suggestion, index) => (
                <Button key={index} 
                onClick={() => setUserInput(suggestion.prompt)}
                variant={'outline'}>
                    <suggestion.icon/>
                    {suggestion.label}
                </Button>
                
            ))}
        </div>
    </div>
  )
}
