import { NextRequest, NextResponse } from "next/server";
import { currentUser } from "@clerk/nextjs/server";
import { db } from "~/server/db";

export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const user = await currentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { pdfId } = await request.json();

    // Validate required fields
    if (!pdfId) {
      return NextResponse.json(
        { error: "Missing required fields: pdfId and question" },
        { status: 400 }
      );
    }

    // Get PDF record from database
    const pdfRecord = await db.pDF.findUnique({
      where: { id: parseInt(pdfId) },
    });

    if (!pdfRecord) {
      return NextResponse.json({ error: "PDF not found" }, { status: 404 });
    }

    // Verify user owns this PDF
    if (pdfRecord.userId !== user.id) {
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }

    // Send request to LangChain project
    const langchainResponse = await fetch(process.env.LANGCHAIN_API_URL + "/process-pdf", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${process.env.LANGCHAIN_API_KEY}`,
      },
      body: JSON.stringify({
        pdfUrl: pdfRecord.url,
        pdfName: pdfRecord.name,
        pdfType: pdfRecord.type,
        userId: user.id,
      }),
    });

    if (!langchainResponse.ok) {
      const errorData = await langchainResponse.json();
      console.error("LangChain API error:", errorData);
      return NextResponse.json(
        { error: "Failed to process PDF" },
        { status: 500 }
      );
    }

    const responseData = await langchainResponse.json();

    return NextResponse.json({
      success: true,
      answer: responseData.answer,
      sources: responseData.sources,
      processingTime: responseData.processingTime,
    });

  } catch (error) {
    console.error("Error processing PDF:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
} 