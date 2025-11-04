"use client"
import React, { useEffect, useState } from 'react'
import PlaygroundHeader from '../_components/PlaygroundHeader'
import ChatSection from '../_components/ChatSection'
import WebDesign from '../_components/WebDesign'
import ElementSettingSection from '../_components/ElementSettingSection'
import { useParams, useSearchParams } from 'next/navigation'
import axios from 'axios'
import { userInfo } from 'os'

export type Frame = {
  projectId: string,
  frameId: string,
  designCode:  string,
  chatMessages: Messages[]
}

export type Messages = {
  role: string,
  content: string
}

export default function Playground() {
  const { projectID } =  useParams();
  const params = useSearchParams();
  const frameId = params.get('frame');
  const [frameDetail,setFrameDetail] = useState<Frame>();

  useEffect(() => {
    if (!frameId || !projectID) return;
    GetFrameDetails();
  }, [frameId, projectID])

  const GetFrameDetails = async () => {
    const result = await axios.get('/api/frames?frameId='+frameId+"&projectId="+projectID)
    console.log(result.data);
    setFrameDetail(result.data)
  }

  const SendMessage = (userInput:string)  => {
    
  }

  return (
    <div>
        <PlaygroundHeader />

        <div className='flex'>

         {/* Chat Content */}
         <ChatSection messages={frameDetail?.chatMessages ?? []}
         onSend={(input: string) => SendMessage(input)} />
         {/* Website design */}
         <WebDesign />
         {/* Setting Content */}
        {/* <ElementSettingSection /> */}
        </div>

    </div>
  )
}
