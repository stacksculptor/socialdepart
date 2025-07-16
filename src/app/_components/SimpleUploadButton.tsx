"use client";

import { useRouter } from "next/navigation";
import { useUploadThing } from "~/utils/uploadthing";
import { toast } from "sonner";
import { Button } from "~/components/ui/button";
import { Plus } from "lucide-react";
import { Label } from "~/components/ui/label";
import { useState } from "react";

interface UploadCallbacks {
    onUploadBegin?: () => void;
    onUploadError?: (error: Error) => void;
    onClientUploadComplete?: () => void;
}

const useUploadThingInputProps = (endpoint: "pdfUploader", callbacks?: UploadCallbacks) => {
    const $ut = useUploadThing(endpoint, callbacks);

    return {
        startUpload: $ut.startUpload,
        isUploading: $ut.isUploading,
    };
};

function UploadSVG() {
    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
            className="h-6 w-6"
        >
            <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5m-13.5-9L12 3m0 0 4.5 4.5M12 3v13.5"
            />
        </svg>
    );
}

function LoadingSpinnerSVG() {
    return (
        <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
            fill="white"
        >
            <path
                d="M12,1A11,11,0,1,0,23,12,11,11,0,0,0,12,1Zm0,19a8,8,0,1,1,8-8A8,8,0,0,1,12,20Z"
                opacity=".25"
            />
            <path
                d="M10.14,1.16a11,11,0,0,0-9,8.92A1.59,1.59,0,0,0,2.46,12,1.52,1.52,0,0,0,4.11,10.7a8,8,0,0,1,6.66-6.61A1.42,1.42,0,0,0,12,2.69h0A1.57,1.57,0,0,0,10.14,1.16Z"
                className="spinner_ajPY"
            />
        </svg>
    );
}


export function SimpleUploadButton({documentType}: {documentType: string}) {

    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [isUploading, setIsUploading] = useState<Boolean | null>(false);
    const router = useRouter();

    const { startUpload, isUploading: uploadThingIsUploading } = useUploadThingInputProps("pdfUploader", {
        onUploadBegin() {
            toast(
                <div className="flex items-center gap-2 text-white">
                    <LoadingSpinnerSVG /> <span className="text-lg">Uploading...</span>
                </div>,
                {
                    duration: 100000,
                    id: "upload-begin",
                },
            );
        },
        onUploadError(error: Error) {
            toast.dismiss("upload-begin");
            toast.error("Upload failed");
        },
        onClientUploadComplete() {
            setIsUploading(true);
            toast.dismiss("upload-begin");
            toast("Upload complete!");
            // router.refresh();
        },
    });

    const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            if (file.type !== "application/pdf") {
                toast.error("Please select a PDF file");
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
                        className="flex items-center justify-center w-full h-32 border-2 border-dashed border-primary/50 rounded-lg bg-primary/5 hover:bg-primary/10 transition-colors cursor-pointer"
                    >
                        <div className="text-center space-y-2">
                            <div className="flex items-center justify-center">
                                <Plus className="h-8 w-8 text-primary" />
                            </div>
                            <div className="text-sm font-medium">
                                {selectedFile ? selectedFile.name : "Select file"}
                            </div>
                            {selectedFile && (
                                <div className="text-xs text-muted-foreground">
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
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
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