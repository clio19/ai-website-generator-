import React from 'react'

type Props = {
  generatedCode: string;
}

function WebDesign({ generatedCode }: Props) {
  return (
    <div className='p-5 flex-1 h-[91vh] overflow-auto'>
      <div className='w-full h-full'>
        <div dangerouslySetInnerHTML={{ __html: generatedCode }} />

      </div>
    </div>
  )
}

export default WebDesign