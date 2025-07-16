"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { PdfChat } from "../../_components/PdfChat";
import { db } from "~/server/db";
import { toast } from "sonner";

interface PDF {
  id: number;
  name: string;
  url: string;
  type: string;
  userId: string;
}

export default function ChatPage() {
  const params = useParams();
  const pdfId = parseInt(params.pdfId as string);
  const [pdf, setPdf] = useState<PDF | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPdf = async () => {
      try {
        const response = await fetch(`/api/pdfs/${pdfId}`);
        if (!response.ok) {
          throw new Error("Failed to fetch PDF");
        }
        const data = await response.json();
        setPdf(data);
      } catch (error) {
        console.error("Error fetching PDF:", error);
        toast.error("Failed to load PDF");
      } finally {
        setLoading(false);
      }
    };

    if (pdfId) {
      fetchPdf();
    }
  }, [pdfId]);

  if (loading) {
    return (
      <div className="container mx-auto p-8 pt-24 max-w-4xl min-h-screen">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  if (!pdf) {
    return (
      <div className="container mx-auto p-8 pt-24 max-w-4xl min-h-screen">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-white mb-4">PDF Not Found</h1>
          <p className="text-muted-foreground">
            The PDF you're looking for doesn't exist or you don't have access to it.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-8 pt-24 max-w-4xl min-h-screen">
      <div className="space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold text-white">
            Chat with your PDF
          </h1>
          <p className="text-muted-foreground">
            Ask questions about your uploaded document and get AI-powered responses.
          </p>
        </div>

        {/* Chat Interface */}
        <PdfChat pdfId={pdf.id} pdfName={pdf.name} />
      </div>
    </div>
  );
} 