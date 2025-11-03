import { db } from "@/config/db";
import { usersTable } from "@/config/schema";
import { currentUser } from "@clerk/nextjs/server";
import { NextResponse, NextRequest } from "next/server";
import { eq } from "drizzle-orm";

export async function POST(request: NextRequest) {
    const user = await currentUser();

    if (!user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userEmail = user.primaryEmailAddress?.emailAddress;
    if (!userEmail) {
        return NextResponse.json({ error: "No email on user" }, { status: 400 });
    }

    const userResult = await db
        .select()
        .from(usersTable)
        .where(eq(usersTable.email, userEmail));

    if (!userResult || userResult.length === 0) {
        const data = {
            name: user.fullName ?? "No Name",
            email: userEmail,
            credits: 2,
        };
        await db.insert(usersTable).values(data);
        return NextResponse.json({ user: data });
    }

    return NextResponse.json({ user: userResult[0], credits: userResult[0].credits });
}