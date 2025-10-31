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
        user && CreateUser();
    }, [user]);

    const CreateUser = async () => {
       const result = await axios.post('/api/users',{
       });
       console.log("Create User", result.data);
       setUserDetail(result.data?.user);
    }
    return (
    <div>
        <UserDetailContext value={{ userDetail, setUserDetail }}>        
            {children}
        </UserDetailContext>
    </div>
  )
}
