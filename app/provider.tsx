"use client"
import React, { useEffect } from 'react'
import axios  from "axios";
import { useUser } from '@clerk/nextjs';
import { UserDetailContext } from '@/context/UserDetailContext';
export default function Provider({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {

    const {user} = useUser();
    const [userDetail, setUserDetail] = React.useState<any>();

    useEffect(() => {
        user && CreateNewUserUser();
    }, [user]);

    const CreateNewUserUser = async () => {
       try {
         const result = await axios.post('/api/users', {});
         console.log("Create User", result.data);
         setUserDetail(result.data?.user);
       } catch (err) {
         console.error('CreateUser failed', err);
       }
    }
    return (
    <div>
        <UserDetailContext.Provider value={{ userDetail, setUserDetail }}>        
            {children}
        </UserDetailContext.Provider>
    </div>
  )
}
