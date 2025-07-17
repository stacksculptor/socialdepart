"use server";

import { z } from "zod";
import { env } from "~/env";
import { returnValidationErrors } from "next-safe-action";
import { actionClient } from "~/lib/safe-action";
import { currentUser } from "@clerk/nextjs/server";
import { pdfToText } from "pdf-ts";

// Schema for the input data
const processPdfUploadSchema = z.object({
  fileUrl: z.string().min(1, "File URL is required"),
  documentType: z.string().min(1, "Document type is required"),
});

// Schema for the extracted data
const extractedDataSchema = z.object({
  selectedEpisodes: z.array(z.string()),
  campaignGoals: z.array(z.string()),
  campaignKPIs: z.array(z.string()),
  gender: z.string(),
  ethnicity: z.array(z.string()),
  age: z.array(z.string()),
  fansOf: z.array(z.string()),
});

// Schema for the response
const processPdfUploadResponseSchema = z.object({
  fileName: z.string(),
  extractedText: z.string(),
  analyzedData: extractedDataSchema,
});

export const processPdfUpload = actionClient
  .inputSchema(processPdfUploadSchema)
  .outputSchema(processPdfUploadResponseSchema)
  .action(async ({ parsedInput: data }) => {
    try {
      // Check authentication
      const user = await currentUser();
      if (!user) {
        throw new Error("Unauthorized");
      }

      // Fetch the PDF from the remote URL
      const response = await fetch(data.fileUrl);
      if (!response.ok) {
        throw new Error(`Failed to fetch PDF from URL: ${data.fileUrl}`);
      }
      const arrayBuffer = await response.arrayBuffer();
      const dataBuffer = Buffer.from(arrayBuffer);

      // Extract text from PDF using pdf-parse
      const extractedText: string = await pdfToText(dataBuffer);

      console.log("Extracted text length:", extractedText.length);
      console.log("First 200 characters:", extractedText.substring(0, 200));

      // Analyze the extracted text with OpenAI
      const analyzedData = await analyzePdfContent(extractedText, data.documentType);

      return {
        fileName: data.fileUrl.split("/").pop() ?? "unknown.pdf",
        extractedText,
        analyzedData,
      };
    } catch (error) {
      console.error("Error processing PDF upload:", error);
      
      // Return a more specific error message
      if (error instanceof Error) {
        return returnValidationErrors(processPdfUploadSchema, { 
          _errors: [error.message] 
        });
      }
      
      return returnValidationErrors(processPdfUploadSchema, { 
        _errors: ["Failed to process PDF upload"] 
      });
    }
  });

interface OpenAIMessage {
    role: string;
    content: string;
}

interface OpenAIChoice {
    message: OpenAIMessage;
}

interface OpenAIResponse {
    choices?: OpenAIChoice[];
}

async function analyzePdfContent(text: string, documentType: string) {
  try {
    const prompt = `You are an AI assistant that analyzes PDF documents to extract marketing campaign parameters. Analyze the following PDF content and extract relevant information.

Document Type: ${documentType}
PDF Content:
${text.substring(0, 3000)}${text.length > 3000 ? "..." : ""}

Please extract and return the following information in JSON format:
{
  "selectedEpisodes": ["episode names or titles found in the document"],
  "campaignGoals": ["marketing goals or objectives mentioned"],
  "campaignKPIs": ["key performance indicators or metrics mentioned"],
  "gender": "target gender (e.g., 'Men', 'Women', 'All')",
  "ethnicity": ["target ethnicities (e.g., ['All ethnicities'], ['Hispanic', 'African American'], ['Asian', 'White'])"],
  "age": ["age ranges mentioned (e.g., '18 to 24 years old', '25 to 34 years old')"],
  "fansOf": ["genres, interests, or preferences mentioned"]
}

If any information is not found in the document, provide reasonable defaults based on the document type and content.`;

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${env.OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: "gpt-4",
        messages: [
          {
            role: "system",
            content: "You are an AI assistant that extracts marketing campaign parameters from PDF documents. Always respond with valid JSON."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        temperature: 0.3,
        max_tokens: 1000,
      }),
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.status} ${response.statusText}`);
    }

    const result = await response.json() as OpenAIResponse;
    const generatedText = result.choices?.[0]?.message?.content;

    if (!generatedText) {
      throw new Error("No content generated from OpenAI");
    }

    // Parse the JSON response
    const jsonMatch = /\{[\s\S]*\}/.exec(generatedText);
    if (!jsonMatch) {
      throw new Error("No JSON found in OpenAI response");
    }

    const parsedData = JSON.parse(jsonMatch[0]) as unknown;
    
    // Validate and return the parsed data
    return extractedDataSchema.parse(parsedData);
  } catch (error) {
    console.error("Error analyzing PDF content:", error);
    
    // Return default data if analysis fails
    return {
      selectedEpisodes: ["Sample Episode 1", "Sample Episode 2"],
      campaignGoals: ["Increase brand awareness"],
      campaignKPIs: ["Grow audience engagement"],
      gender: "All",
      ethnicity: ["All ethnicities"],
      age: ["18 to 34 years old"],
      fansOf: ["Drama", "Entertainment"]
    };
  }
} 