import { db } from "@/config/db";
import { chatTable } from "@/config/schema";
import { eq } from "drizzle-orm";
import { NextResponse, NextRequest } from "next/server";

export async function PUT(req: NextRequest) {
    const { messages, frameId } = await req.json();

    // Ensure messages is properly stringified (only once)
    const chatMessageValue = Array.isArray(messages) 
        ? JSON.stringify(messages) 
        : typeof messages === 'string' 
            ? messages 
            : JSON.stringify(messages);

    const result = await db.update(chatTable).set({
        chatMessage: chatMessageValue
    }).where(eq(chatTable.frameId, frameId));

    return NextResponse.json({result: 'updated'})
}
