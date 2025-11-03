import { db } from '@/config/db';
import { chatTable, frameTable, projectTable, usersTable } from '@/config/schema';
import { currentUser } from '@clerk/nextjs/server'
import { NextRequest, NextResponse } from 'next/server'
import React from 'react'
import { eq } from 'drizzle-orm'

export async function POST(req: NextRequest) {

    const { projectId, frameId, messages } = await req.json()
    const user = await currentUser();

    if (!user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const userEmail = user.primaryEmailAddress?.emailAddress
    if (!userEmail) {
        return NextResponse.json({ error: 'No user email' }, { status: 400 })
    }

    const userRows = await db.select().from(usersTable).where(eq(usersTable.email, userEmail))
    if (!userRows.length) {
        return NextResponse.json({ error: 'User not found in DB' }, { status: 404 })
    }
    const dbUser = userRows[0]

    await db.insert(projectTable).values({    
        projectId,
        createdBy: dbUser.id
    });

    // fetch project row to get numeric id
    const projectRows = await db.select().from(projectTable).where(eq(projectTable.projectId, projectId))
    const project = projectRows[0]

    await db.insert(frameTable).values({    
        frameId,
        projectId: project.id
    });

    await db.insert(chatTable).values({
        chatMessage: JSON.stringify(messages),
        projectId: project.id,
    });

    return NextResponse.json({ projectId, frameId });
}

