import { createUploadthing, type FileRouter } from "uploadthing/next";
import { currentUser } from "@clerk/nextjs/server";
import { db } from "~/server/db";
import { z } from "zod";
import { writeFile, mkdir } from "fs/promises";
import { join } from "path";

const f = createUploadthing();

// FileRouter for your app, can contain multiple FileRoutes
export const ourFileRouter = {
  // Define as many FileRoutes as you like, each with a unique routeSlug
  pdfUploader: f({
    pdf: {
      maxFileSize: "32MB",
      maxFileCount: 1,
    }
  })
    .input(z.object({
      documentType: z.string(),
    }))
    // Set permissions and file types for this FileRoute
    .middleware(async ({ input }) => {
      // This code runs on your server before upload
      const user = await currentUser();

      // If you throw, the user will not be able to upload
      if (!user) throw new Error("Unauthorized");

      // Get document type from input
      const documentType = input.documentType;

      // Whatever is returned here is accessible in onUploadComplete as `metadata`
      return { userId: user.id, documentType };
    })
    .onUploadComplete(async ({ metadata, file }) => {
      // This code RUNS ON YOUR SERVER after upload
      console.log("Upload complete for userId:", metadata.userId);

      try {
        // Create public/pdfs directory if it doesn't exist
        const pdfsDir = join(process.cwd(), "public", "pdfs");
        await mkdir(pdfsDir, { recursive: true });

        // Generate unique filename for local storage
        const timestamp = Date.now();
        const sanitizedFileName = file.name.replace(/[^a-zA-Z0-9.-]/g, "_");
        const localFileName = `${timestamp}_${sanitizedFileName}`;
        const localFilePath = join(pdfsDir, localFileName);

        // Download the file from uploadthing and save to local storage
        const response = await fetch(file.ufsUrl);
        if (!response.ok) {
          throw new Error(`Failed to download file from uploadthing: ${response.statusText}`);
        }
        
        const fileBuffer = await response.arrayBuffer();
        await writeFile(localFilePath, Buffer.from(fileBuffer));

        console.log("File saved locally:", localFilePath);

        // Save to Database
        const pdfRecord = await db.pDF.create({
          data: {
            name: file.name,
            url: file.ufsUrl,
            userId: metadata.userId,
            type: metadata.documentType || "other",
          },
        });

        console.log("PDF saved to database with ID:", pdfRecord.id);
        console.log("file url", file.ufsUrl);

        // Return both the uploadthing data and the local filename
        return { 
          uploadedBy: metadata.userId, 
          pdfId: pdfRecord.id,
          localFileName: localFileName // This will be stored in session storage
        };
      } catch (error) {
        console.error("Error saving PDF to database or local storage:", error);
        throw new Error("Failed to save PDF");
      }
    }),
} satisfies FileRouter;

export type OurFileRouter = typeof ourFileRouter;
