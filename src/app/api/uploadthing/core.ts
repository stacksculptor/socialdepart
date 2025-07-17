import { createUploadthing, type FileRouter } from "uploadthing/next";
import { currentUser } from "@clerk/nextjs/server";
import { db } from "~/server/db";
import { z } from "zod";
import { ERROR_MESSAGES } from "~/lib/constants";

const f = createUploadthing();

// FileRouter for your app, can contain multiple FileRoutes
export const ourFileRouter = {
  // Define as many FileRoutes as you like, each with a unique routeSlug
  pdfUploader: f({
    pdf: {
      maxFileSize: "32MB",
      maxFileCount: 1,
    },
  })
    .input(
      z.object({
        documentType: z.string(),
      }),
    )
    // Set permissions and file types for this FileRoute
    .middleware(async ({ input }) => {
      // This code runs on your server before upload
      const user = await currentUser();

      // If you throw, the user will not be able to upload
      if (!user) throw new Error(ERROR_MESSAGES.UNAUTHORIZED);

      // Get document type from input
      const documentType = input.documentType;

      // Whatever is returned here is accessible in onUploadComplete as `metadata`
      return { userId: user.id, documentType };
    })
    .onUploadComplete(async ({ metadata, file }) => {
      // This code RUNS ON YOUR SERVER after upload

      try {
        // Save to Database
        const pdfRecord = await db.pDF.create({
          data: {
            name: file.name,
            url: file.ufsUrl,
            userId: metadata.userId,
            type: metadata.documentType || "other",
          },
        });

        // Return only the uploadthing data (no local filename)
        return {
          uploadedBy: metadata.userId,
          pdfId: pdfRecord.id,
        };
      } catch (error) {
        throw new Error(
          `${ERROR_MESSAGES.PROCESSING_FAILED}: ${error instanceof Error ? error.message : ERROR_MESSAGES.PROCESSING_FAILED}`,
        );
      }
    }),
} satisfies FileRouter;

export type OurFileRouter = typeof ourFileRouter;
