import { and, eq, desc, or, isNull } from 'drizzle-orm'
import { NextRequest, NextResponse } from 'next/server'
import { chatTable, frameTable, projectTable } from '@/config/schema';
import { db } from '@/config/db';

export async function GET(req: NextRequest) {  
    const {searchParams} = new URL(req.url);
    const frameId = searchParams.get('frameId');
    const projectId = searchParams.get('projectId');

    if (!frameId) {
        return NextResponse.json({ error: 'frameId is required' }, { status: 400 });
    }

    const frameResult = await db.select().from(frameTable)
    //@ts-ignore
    .where(eq(frameTable.frameId, frameId));

    // When projectId is provided as external string (projects.projectId), map it to internal numeric projects.id
    let internalProjectId: number | undefined = undefined;
    if (projectId) {
        const proj = await db
            .select({ id: projectTable.id })
            .from(projectTable)
            // @ts-ignore
            .where(eq(projectTable.projectId, projectId));
        if (proj.length === 0) {
            return NextResponse.json({ error: 'Project not found' }, { status: 404 });
        }
        internalProjectId = proj[0].id as number;
    }

    // Fetch chats. If a projectId is provided, include legacy rows where frameId is null but project matches
    const chatResult = await db
        .select()
        .from(chatTable)
        // @ts-ignore
        .where(
            internalProjectId !== undefined
                ? and(
                    // include chats for this frame OR legacy null frame rows
                    // @ts-ignore
                    or(eq(chatTable.frameId, frameId), isNull(chatTable.frameId)),
                    // and restrict to the same project
                    // @ts-ignore
                    eq(chatTable.projectId, internalProjectId)
                  )
                : // no projectId provided: match frameId only
                  // @ts-ignore
                  eq(chatTable.frameId, frameId)
        )
        // newest last for chat display
        // @ts-ignore
        .orderBy(desc(chatTable.createdOn));

    // Normalize chat messages: support plain text, single object, or array of objects stored as JSON
    const chatMessages = chatResult.flatMap((row: any) => {
        const raw = row?.chatMessage;
        if (raw == null) return [];
        if (typeof raw === 'string' && (raw.trim().startsWith('[') || raw.trim().startsWith('{'))) {
            try {
                const parsed = JSON.parse(raw);
                if (Array.isArray(parsed)) {
                    return parsed
                        .filter((m) => typeof m?.content === 'string')
                        .map((m) => ({ role: m.role ?? 'assistant', content: m.content }));
                }
                if (typeof parsed === 'object' && typeof parsed.content === 'string') {
                    return [{ role: parsed.role ?? 'assistant', content: parsed.content }];
                }
            } catch {
                // fall through to treat as plain text
            }
        }
        return [{ role: 'assistant', content: String(raw) }];
    });

    const finalResult = {
        ...frameResult[0],
        chatMessages
    }

    return NextResponse.json(finalResult);
}