import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

// Validation schema for generate request
const generateSchema = z.object({
  prompt: z.string().min(1).max(1000),
  type: z.enum(["content", "summary", "analysis"]),
  options: z.object({
    length: z.enum(["short", "medium", "long"]).optional(),
    tone: z.enum(["professional", "casual", "creative"]).optional(),
  }).optional(),
});

export async function POST(request: NextRequest) {
  try {
    // Authentication check (middleware should handle this, but double-check)
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json(
        { 
          error: "Authentication required",
          message: "Please sign in to generate content"
        },
        { status: 401 }
      );
    }

    // Parse and validate request body
    const body = await request.json();
    const validatedData = generateSchema.parse(body);

    // Simulate content generation
    const generatedContent = {
      id: `gen_${Date.now()}`,
      userId,
      prompt: validatedData.prompt,
      type: validatedData.type,
      options: validatedData.options,
      generatedAt: new Date().toISOString(),
      content: `Generated ${validatedData.type} content based on: "${validatedData.prompt}"`,
      status: "completed"
    };

    return NextResponse.json({
      success: true,
      data: generatedContent,
      message: "Content generated successfully"
    });

  } catch (error) {
    console.error("Generate API error:", error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { 
          error: "Validation error",
          message: "Invalid request data",
          details: error.errors
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { 
        error: "Internal server error",
        message: "Failed to generate content"
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json(
    { 
      error: "Method not allowed",
      message: "Use POST method for content generation"
    },
    { status: 405 }
  );
} 