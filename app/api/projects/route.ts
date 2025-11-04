import { db } from '@/config/db';
import { chatTable, frameTable, projectTable, usersTable } from '@/config/schema';
import { currentUser } from '@clerk/nextjs/server'
import { NextRequest, NextResponse } from 'next/server'
import { and, eq } from 'drizzle-orm'

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

    // Ensure project exists for this projectId; create if not
    const existing = await db.select().from(projectTable).where(eq(projectTable.projectId, projectId));
    if (existing.length === 0) {
        await db.insert(projectTable).values({ projectId, createdBy: dbUser.id });
    }
    const projectRows = await db.select().from(projectTable).where(eq(projectTable.projectId, projectId));
    const projectInternalId = projectRows[0].id;
    // create Frame
    await db.insert(frameTable).values({
        frameId,
        projectId: projectInternalId
    });

    // save user msg
    await db.insert(chatTable).values({
       chatMessage: typeof messages === 'string' ? messages : JSON.stringify(messages),
       frameId: frameId,
       projectId: projectInternalId
    });

    return NextResponse.json({ projectId, frameId, messages });
}

