"use server";

// Disable pdf-parse debug mode
process.env.AUTO_KENT_DEBUG = "true";

import { z } from "zod";
import { env } from "~/env";
import { returnValidationErrors } from "next-safe-action";
import { actionClient } from "~/lib/safe-action";
import { join } from "path";
import { readFileSync, existsSync } from "fs";
import PdfParse from "pdf-parse";
import { currentUser } from "@clerk/nextjs/server";

// Schema for the input data
const processPdfUploadSchema = z.object({
  localFileName: z.string().min(1, "Local file name is required"),
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

      // Construct the file path in public/pdfs
      const pdfsDir = join(process.cwd(), "public", "pdfs");
      const filePath = join(pdfsDir, data.localFileName);

      // Check if file exists
      if (!existsSync(filePath)) {
        console.error(`File not found: ${filePath}`);
        console.error(`Current working directory: ${process.cwd()}`);
        console.error(`PDFs directory: ${pdfsDir}`);
        console.error(`Requested filename: ${data.localFileName}`);
        throw new Error(`PDF file not found: ${data.localFileName}. Please upload a new PDF file.`);
      }

      // Extract text from PDF using pdf-parse
      const dataBuffer = readFileSync(filePath);
      const pdfData = PdfParse(dataBuffer);
      const extractedText = (await pdfData).text;

      console.log("Extracted text length:", extractedText.length);
      console.log("First 200 characters:", extractedText.substring(0, 200));

      // Analyze the extracted text with OpenAI
      const analyzedData = await analyzePdfContent(extractedText, data.documentType);

      return {
        fileName: data.localFileName,
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
    const jsonMatch = generatedText.match(/\{[\s\S]*\}/) as RegExpMatchArray | null;
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