import { NextRequest, NextResponse } from "next/server";
import { currentUser } from "@clerk/nextjs/server";
import { db } from "~/server/db";

export async function GET(
  request: NextRequest,
  { params }: { params: { pdfId: string } }
) {
  try {
    // Check authentication
    const user = await currentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const pdfId = parseInt(params.pdfId);

    if (isNaN(pdfId)) {
      return NextResponse.json({ error: "Invalid PDF ID" }, { status: 400 });
    }

    // Get PDF record from database
    const pdfRecord = await db.pDF.findUnique({
      where: { id: pdfId },
    });

    if (!pdfRecord) {
      return NextResponse.json({ error: "PDF not found" }, { status: 404 });
    }

    // Verify user owns this PDF
    if (pdfRecord.userId !== user.id) {
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }

    return NextResponse.json({
      id: pdfRecord.id,
      name: pdfRecord.name,
      url: pdfRecord.url,
      type: pdfRecord.type,
      userId: pdfRecord.userId,
      createdAt: pdfRecord.createdAt,
      updatedAt: pdfRecord.updatedAt,
    });

  } catch (error) {
    console.error("Error fetching PDF:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
} 