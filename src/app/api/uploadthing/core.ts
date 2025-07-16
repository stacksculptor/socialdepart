import { createUploadthing, type FileRouter } from "uploadthing/next";
import { UploadThingError } from "uploadthing/server";
import { currentUser } from "@clerk/nextjs/server";
import { db } from "~/server/db";
import { z } from "zod";

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
    .middleware(async ({ req, input }) => {
      // This code runs on your server before upload
      const user = await currentUser();

      // If you throw, the user will not be able to upload
      if (!user) throw new UploadThingError("Unauthorized");

      // Get document type from input
      const documentType = input.documentType;

      // Whatever is returned here is accessible in onUploadComplete as `metadata`
      return { userId: user.id, documentType };
    })
    .onUploadComplete(async ({ metadata, file }) => {
      // This code RUNS ON YOUR SERVER after upload
      console.log("Upload complete for userId:", metadata.userId);

      // Save to Database
      try {
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

        // !!! Whatever is returned here is sent to the clientside `onClientUploadComplete` callback
        return { uploadedBy: metadata.userId, pdfId: pdfRecord.id };
      } catch (error) {
        console.error("Error saving PDF to database:", error);
        throw new UploadThingError("Failed to save PDF to database");
      }
    }),
} satisfies FileRouter;

export type OurFileRouter = typeof ourFileRouter;
