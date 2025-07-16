"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Label } from "~/components/ui/label";
import { RadioGroup, RadioGroupItem } from "~/components/ui/radio-group";
import { Button } from "~/components/ui/button";
import { SimpleUploadButton } from "../_components/SimpleUploadButton";
import { SignIn } from "@clerk/nextjs";

const documentTypes = [
  { value: "brand-voice", label: "Brand Voice document" },
  { value: "marketing", label: "Marketing document" },
  { value: "audience-data", label: "Audience Data document" },
  { value: "press", label: "Press document" },
  { value: "series-bible", label: "Series Bible document" },
  { value: "glossary", label: "Glossary document" },
  { value: "series-credits", label: "Series Credits document" },
  { value: "other", label: "Other document" },
];

const seriesOptions = [
  { value: "brief-history-future", label: "A Brief History Of The Future" },
  { value: "new-series", label: "Add a new series..." },
];

export default function UploadPage() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [series, setSeries] = useState("");
  const [documentType, setDocumentType] = useState("");
  const { isSignedIn, isLoaded } = useAuth();
  const router = useRouter();

  // Show loading state while Clerk is loading
  if (!isLoaded) {
    return (
      <div className="container mx-auto p-8 pt-24 max-w-2xl min-h-screen">
        <div className="flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500"></div>
        </div>
      </div>
    );
  }

  // Show sign-in page if user is not authenticated
  if (!isSignedIn) {
    return (
      <div className="container mx-auto p-8 pt-24 max-w-md min-h-screen">
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold text-white mb-2">
            Sign in to Upload Documents
          </h1>
          <p className="text-muted-foreground">
            Please sign in to access the document upload feature.
          </p>
        </div>
        <SignIn 
          appearance={{
            elements: {
              rootBox: "mx-auto",
              card: "bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60",
            }
          }}
        />
      </div>
    );
  }

  return (
    <div className="container mx-auto p-8 pt-24 max-w-2xl min-h-screen">
      <div className="space-y-4">
        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold text-white">
            Upload a PDF document to Demo
          </h1>
          <p className="text-muted-foreground">
            Uploaded documents will inform AI outputs for the selected series.
          </p>
        </div>

        <Card className="bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <CardHeader>
            <CardTitle className="text-xl">Document Upload</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">

            {/* Select document type */}
            <div className="space-y-2">
              <Label>Select a document type</Label>
              <RadioGroup value={documentType} onValueChange={setDocumentType}>
                {documentTypes.map((type) => (
                  <div key={type.value} className="flex items-center space-x-2">
                    <RadioGroupItem value={type.value} id={type.value} />
                    <Label htmlFor={type.value} className="text-sm">
                      {type.label}
                    </Label>
                  </div>
                ))}
              </RadioGroup>
            </div>

            {/* Upload button */}
            <SimpleUploadButton documentType={documentType} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}