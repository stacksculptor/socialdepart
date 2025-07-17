"use client";

import { useRouter } from "next/navigation";
import { useUploadThing } from "~/utils/uploadthing";
import { toast } from "sonner";
import { Button } from "~/components/ui/button";
import { Plus } from "lucide-react";
import { Label } from "~/components/ui/label";
import { useState } from "react";
import type { ClientUploadedFileData } from "uploadthing/types";
import type { OurFileRouter } from "~/app/api/uploadthing/core";
import { ERROR_MESSAGES, SUCCESS_MESSAGES } from "~/lib/constants";

interface UploadCallbacks {
  onUploadBegin?: () => void;
  onUploadError?: (error: Error) => void;
  onClientUploadComplete?: (
    res: ClientUploadedFileData<OurFileRouter>[],
  ) => void;
}

const useUploadThingInputProps = (
  endpoint: "pdfUploader",
  callbacks?: UploadCallbacks,
) => {
  // Adapt callbacks to match the expected shape for useUploadThing
  const adaptedCallbacks = callbacks
    ? {
        onUploadBegin: callbacks.onUploadBegin,
        onUploadError: callbacks.onUploadError,
        onClientUploadComplete: callbacks.onClientUploadComplete as
          | ((
              res: ClientUploadedFileData<{
                uploadedBy: string;
                pdfId: number;
              }>[],
            ) => void)
          | undefined,
      }
    : undefined;

  const $ut = useUploadThing(endpoint, adaptedCallbacks);

  return {
    startUpload: $ut.startUpload,
    isUploading: $ut.isUploading,
  };
};

interface ServerData {
  pdfId: number;
  url?: string;
}

export function SimpleUploadButton({ documentType }: { documentType: string }) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const router = useRouter();

  const { startUpload, isUploading: uploadThingIsUploading } =
    useUploadThingInputProps("pdfUploader", {
      onUploadBegin() {
        console.log("Uploading...");
      },
      onUploadError(error: Error) {
        toast.error(`${ERROR_MESSAGES.UPLOAD_FAILED}: ${error.message}`);
      },
      onClientUploadComplete(res: ClientUploadedFileData<OurFileRouter>[]) {
        toast(SUCCESS_MESSAGES.UPLOAD_COMPLETE);

        // Store PDF data in session storage and redirect to generate page
        if (res?.[0]?.serverData) {
          const sd = res[0].serverData;
          if (
            typeof sd === "object" &&
            sd !== null &&
            "pdfId" in sd &&
            typeof (sd as { pdfId: unknown }).pdfId === "number" &&
            res[0].ufsUrl
          ) {
            const serverData: ServerData = {
              pdfId: (sd as { pdfId: number }).pdfId,
              url: res[0].ufsUrl,
            };
            // Store PDF data securely in session storage
            const pdfData = {
              url: res[0].ufsUrl,
              pdfId: serverData.pdfId,
              fileName: res[0].name,
              documentType: documentType, // Store the document type
              uploadTime: new Date().toISOString(),
            };
            sessionStorage.setItem("currentPdfData", JSON.stringify(pdfData));
            router.push("/generate");
          } else {
            router.push("/generate");
          }
        }
      },
    });

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.type !== "application/pdf") {
        toast.error(ERROR_MESSAGES.INVALID_FILE_TYPE);
        return;
      }
      setSelectedFile(file);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      toast.error("Please select a file first");
      return;
    }

    if (!documentType) {
      toast.error("Please select a document type first");
      return;
    }

    await startUpload([selectedFile], { documentType });
  };

  return (
    <>
      <div className="space-y-2">
        <Label>Select a PDF document to upload:</Label>
        <div className="relative">
          <input
            id="file-input"
            type="file"
            onChange={handleFileSelect}
            accept="application/pdf"
            className="sr-only"
          />
          <label
            htmlFor="file-input"
            className="border-primary/50 bg-primary/5 hover:bg-primary/10 flex h-32 w-full cursor-pointer items-center justify-center rounded-lg border-2 border-dashed transition-colors"
          >
            <div className="space-y-2 text-center">
              <div className="flex items-center justify-center">
                <Plus className="text-primary h-8 w-8" />
              </div>
              <div className="text-sm font-medium">
                {selectedFile ? selectedFile.name : "Select file"}
              </div>
              {selectedFile && (
                <div className="text-muted-foreground text-xs">
                  {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                </div>
              )}
            </div>
          </label>
        </div>
      </div>

      {/* Upload button */}
      <Button
        className="w-full cursor-pointer"
        size="lg"
        onClick={handleUpload}
        disabled={!selectedFile || uploadThingIsUploading}
      >
        {uploadThingIsUploading ? (
          <div className="flex items-center space-x-2">
            <div className="h-4 w-4 animate-spin rounded-full border-b-2 border-white"></div>
            <span>Uploading...</span>
          </div>
        ) : (
          <div className="flex items-center space-x-2">
            <span>Upload PDF</span>
          </div>
        )}
      </Button>
    </>
  );
}
