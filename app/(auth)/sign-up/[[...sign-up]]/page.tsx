import { SignUp, SignedIn, SignedOut } from '@clerk/nextjs'
import { redirect } from 'next/navigation'

export default function Page() {
  return (
    <>
      <SignedIn>
        {redirect('/workspace')}
      </SignedIn>
      <SignedOut>
        <div className='flex items-center justify-center h-screen'>
          <SignUp />
        </div>
      </SignedOut>
    </>
  )
}