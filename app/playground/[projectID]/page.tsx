"use client"
import React, { useEffect, useState } from 'react'
import PlaygroundHeader from '../_components/PlaygroundHeader'
import ChatSection from '../_components/ChatSection'
import WebDesign from '../_components/WebDesign'
import ElementSettingSection from '../_components/ElementSettingSection'
import { useParams, useSearchParams } from 'next/navigation'
import axios from 'axios'
import { userInfo } from 'os'
import { POST } from '@/app/api/projects/route'
import { read } from 'fs'
import { toast } from 'sonner'

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

const Prompt=`userInput: {userInput}
Based on the user input, generate a complete HTML Tailwind CSS code using Flowbite UI components. Use a modern design with blue as the primary color theme.
Do not add HTML head or title tag, just body
make it fully responsive.

Requirements:
- All primary components must match the theme color.
- Add proper padding and margin for each element.
- Components should not be connected to one another; each element should be independent.
- Design must be fully responsive for all screen sizes.
- Use placeholders for all images for light mode:
  https://community.softr.io/uploads/db9118/original/2X/7/74e6e7e382doff5d7773ca9a87e6f6f8817a68a6.jpeg
  and for dark mode use:
  https://www.cibaky.com/wp-content/uploads/2015/12/placeholder-3.jpg
For image , add alt tag with image prompt for that image
- Do not include broken links.
- Library already install so do not installed or add in script
- Header menu options should be spread out and not connected.

use the following component where appropriate:
- fa fa icons
- **Flowbite** for UI components like buttons, modals, forms, tables, tabs, and alerts, cards, dialog, dropdown, etc
- Chart.js for charts & graphs
- Swiper.js for sliders/carousels
- tooltip & Popover Library (Tippy.js)

Additional requirements:
- Ensure proper spacing, alignment, and hierarchy for all elements.
- Include interactive components like modals, dropdowns, and accordions where suitable.
- Ensure charts are visually appealing and match the theme color.
- Do not add any extra text before or after the HTML code.
- Output a complete, ready-to-use HTML page.
Do not give any raw text before start and end pont the ai reponse

or image , add alt tag with image prompt for that image
- Do not include broken links.
- Library already install so do not installed or add in script
- Header menu options should be spread out and not connected.

use the following component where appropriate:
- fa fa icons
- **Flowbite** for UI components like buttons, modals, forms, tables, tabs, and alerts, cards, dialog, dropdown, etc
- Chart.js for charts & graphs
- Swiper.js for sliders/carousels
- tooltip & Popover Library (Tippy.js)

Additional requirements:
- Ensure proper spacing, alignment, and hierarchy for all elements.
- Include interactive components like modals, dropdowns, and accordions where suitable.
- Ensure charts are visually appealing and match the theme color.
- Do not add any extra text before or after the HTML code.
- Output a complete, ready-to-use HTML page.
Do not give any raw text before start and end pont the ai response
`

export default function Playground() {
  const { projectID } =  useParams();
  const params = useSearchParams();
  const frameId = params.get('frame');
  const [frameDetail,setFrameDetail] = useState<Frame>();
  const [loading, setLoading]=useState(false);
  const [messages, setMessages]=useState<Messages[]>([]);
  const [generatedCode, setGeneratedCode]=useState<string>('');

  useEffect(() => {
   frameId &&  GetFrameDetails();
  }, [frameId])

  const GetFrameDetails = async () => {
    const result = await axios.get('/api/frames?frame='+frameId+"&projectId="+projectID)
    console.log(result.data);
    setFrameDetail(result.data)
    
    // Always set messages from API response
    const apiMessages = result.data?.chatMessages ?? [];
    if (Array.isArray(apiMessages) && apiMessages.length > 0) {
      setMessages(apiMessages);
    }
  }

  const isCodeRequest = (text: string): boolean => {
    const lower = text.toLowerCase();
    
    // Explicit code mentions
    if (lower.includes('code') || lower.includes('html') || lower.includes('tailwind') || lower.includes('css')) {
      return true;
    }
    
    // Design/UI component requests (create, build, make, design + UI element)
    const designPattern = /(create|make|build|generate|design|show|give).*(form|button|card|page|website|component|ui|dashboard|landing|signup|login|ecommerce|product|modal|table|chart|navbar|header|footer)/i;
    if (designPattern.test(text)) {
      return true;
    }
    
    // Questions about how to do something (likely not code generation)
    if (lower.startsWith('how') || lower.startsWith('what') || lower.startsWith('why') || lower.startsWith('when') || lower.startsWith('where')) {
      return false;
    }
    
    // Simple greetings or casual questions
    if (/^(hi|hello|hey|thanks|thank you|yes|no|ok|okay)$/i.test(text.trim())) {
      return false;
    }
    
    return false;
  };

  const SendMessage = async (userInput:string)  => {
    setLoading(true);
    // add user message to chat
    setMessages((prev: any) => ([
      ...prev,
      { role: 'user', content: userInput }
    ]))

    // Determine if this is a code generation request or a regular question
    const shouldGenerateCode = isCodeRequest(userInput);
    const messageContent = shouldGenerateCode 
      ? Prompt.replace('{userInput}', userInput)
      : userInput;

    const result = await fetch('/api/ai-model', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        messages: [{ role: "user", content: messageContent }]
      })
    });

    const reader = result.body?.getReader();
    const decoder = new TextDecoder;

    let aiResponse = '';
    let isCode = false;
    let codeBuffer = '';

    const looksLikeHtml = (text: string) => /<\s*(html|body|section|div|header|main|footer|nav|form|button|input|img)[\s>]/i.test(text);

    while (true) {
      //@ts-ignore
      const { done , value } = await reader?.read();

      if (done) break;

      const chunk = decoder.decode(value, { stream: true});

      aiResponse += chunk;

      if (!isCode) {
        if (aiResponse.includes('```html')) {
          isCode = true;
          const startIdx = aiResponse.indexOf('```html') + 7;
          codeBuffer += aiResponse.slice(startIdx);
        } else if (looksLikeHtml(aiResponse)) {
          isCode = true;
          codeBuffer += chunk;
        }
      } else {
        codeBuffer += chunk;
      }

      // If a closing fence appears, stop accumulating beyond it
      if (isCode && codeBuffer.includes('```')) {
        codeBuffer = codeBuffer.split('```')[0];
      }
    }

    if (isCode) {
      // Final cleanup: remove any trailing fence just in case
      if (codeBuffer.includes('```')) {
        codeBuffer = codeBuffer.split('```')[0];
      }
      setGeneratedCode(codeBuffer);
    }

    // After streaming end
    if (!isCode) {
      setMessages((prev:any) => [
        ...prev,
        { role: 'assistant', content : aiResponse}
      ])
    } else {
      setMessages((prev:any) => [
        ...prev,
        { role: 'assistant', content : 'your code is ready !'}
      ])
    }
    await SaveGeneratedCode();
    setLoading(false);
  }


  useEffect(() => {
    if (messages.length > 0  ) {
      SaveMessages();
    }
    console.log( " generated Code " , generatedCode);
  }, [messages]);

  const SaveMessages = async () => {
    const result = await axios.put('/api/chats', {
      messages,
      frameId
    });
    console.log( "  result " , result);
    
  }

  useEffect(() => {
    if (generatedCode.length > 10 && !loading) {
      SaveGeneratedCode();
    }
  }, [generatedCode]);

  const SaveGeneratedCode = async () => {
    const result = await axios.post('/api/frames', {
      designCode: generatedCode,
      frameId,
      projectId: projectID
    });
    console.log( " result " , result.data);
    toast.success('Web site is Ready!');
  }

  return (
    <div>
        <PlaygroundHeader />

        <div className='flex'>

         {/* Chat Content */}
         <ChatSection messages={messages ?? []}
         loading={loading}
         onSend={(input: string) => SendMessage(input)} />
         {/* Website design */}
         {/* <WebDesign generatedCode={generatedCode.replace('```', '')} /> */}
         <WebDesign generatedCode={generatedCode} />
         {/* Setting Content */}

        {/* <ElementSettingSection /> */}
        </div>

    </div>
  )
}
