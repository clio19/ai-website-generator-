import { eq, desc, or, isNull, and } from 'drizzle-orm'
import { NextRequest, NextResponse } from 'next/server'
import { chatTable, frameTable, projectTable } from '@/config/schema';
import { db } from '@/config/db';

export async function GET(req: NextRequest) {  
    const {searchParams} = new URL(req.url);
    const frameId = searchParams.get('frame');
    const projectId = searchParams.get('projectId');

    if (!frameId) {
        return NextResponse.json({ error: 'frameId is required' }, { status: 400 });
    }

    const frameResult = await db.select().from(frameTable)
    //@ts-ignore
    .where(eq(frameTable.frameId, frameId));

    // projectId is currently not used for filtering; chats table no longer carries projectId

    // Fetch chats. Include rows for this frameId and legacy rows with null frameId
    const chatResult = await db
        .select()
        .from(chatTable)
        // @ts-ignore
        .where(
            // include chats for this frame OR legacy null frame rows (no project filter as chats no longer has projectId)
            // @ts-ignore
            or(eq(chatTable.frameId, frameId), isNull(chatTable.frameId))
        )
        // newest last for chat display
        // @ts-ignore
        .orderBy(desc(chatTable.createdOn));

    // Normalize chat messages: recursively parse nested JSON strings until we get actual objects
    // TODO : this was chanded by chat IA review it
    const parseNestedJson = (str: string, maxDepth = 10): any => {
        if (maxDepth <= 0) return str;
        if (typeof str !== 'string') return str;
        if (!str.trim().startsWith('[') && !str.trim().startsWith('{')) return str;
        
        try {
            const parsed = JSON.parse(str);
            // If it's still a string, try parsing again
            if (typeof parsed === 'string') {
                return parseNestedJson(parsed, maxDepth - 1);
            }
            return parsed;
        } catch {
            return str;
        }
    };

    const chatMessages = chatResult.flatMap((row: any) => {
        const raw = row?.chatMessage;
        if (raw == null) return [];
        
        // Recursively parse nested JSON strings
        const parsed = parseNestedJson(raw);
        
        if (Array.isArray(parsed)) {
            return parsed
                .filter((m) => m && typeof m === 'object' && typeof m?.content === 'string')
                .map((m) => ({ role: m.role ?? 'assistant', content: m.content }));
        }
        
        if (typeof parsed === 'object' && parsed !== null && typeof parsed.content === 'string') {
            return [{ role: parsed.role ?? 'assistant', content: parsed.content }];
        }
        
        return [{ role: 'assistant', content: String(raw) }];
    });

    const finalResult = {
        ...frameResult[0],
        chatMessages
    }

    return NextResponse.json(finalResult);
}

export async function POST(req: NextRequest) {  
    const { designCode, frameId, projectId } = await req.json();

    if (!frameId) {
        return NextResponse.json({ error: 'frameId is required' }, { status: 400 });
    }

    // Convert external projectId (UUID string) to internal numeric ID if provided
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

    // Update frame - filter by frameId and optionally by projectId
    const updateResult = await db.update(frameTable).set({
        designCode: designCode
    }).where(
        internalProjectId !== undefined
            ? // @ts-ignore
              and(eq(frameTable.frameId, frameId), eq(frameTable.projectId, internalProjectId))
            : // @ts-ignore
              eq(frameTable.frameId, frameId)
    );
   
    return NextResponse.json({ result: 'Updated Successfully !' });
}
