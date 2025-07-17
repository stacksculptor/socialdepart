"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import { Textarea } from "~/components/ui/textarea";
import { Label } from "~/components/ui/label";
import { Separator } from "~/components/ui/separator";
import { Play, FileText } from "lucide-react";
import { generateMarketingStrength } from "~/lib/actions/generate-marketing-strength";
import { processPdfUpload } from "~/lib/actions/process-pdf-upload";
import { toast } from "sonner";

interface CampaignData {
  name: string;
  selectedEpisodes: string[];
  goals: string[];
  kpis: string[];
  gender: string;
  ethnicity: string[];
  ageRanges: string[];
  fansOf: string[];
  marketingStrength: string;
  audienceInsight: string;
}

interface ProcessedPdfData {
  fileName: string;
  extractedText: string;
  analyzedData: {
    selectedEpisodes: string[];
    campaignGoals: string[];
    campaignKPIs: string[];
    gender: string;
    ethnicity: string[];
    age: string[];
    fansOf: string[];
  };
  uploadTime: string;
}

interface SessionPdfData {
  url: string;
  pdfId: number;
  fileName: string;
  documentType: string;
  uploadTime: string;
}

export default function GeneratePage() {
  const [outputs, setOutputs] = useState<string[]>(["", "", ""]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [pdfData, setPdfData] = useState<ProcessedPdfData | null>(null);

  const [campaignData, setCampaignData] = useState<CampaignData>({
    name: "Winter 2025",
    selectedEpisodes: [
      "Law And Order CI S01E05",
      "Law And Order CI S01E06", 
      "Law And Order CI S01E07"
    ],
    goals: ["Attract new audience to legacy IP"],
    kpis: ["Grow follow count", "Increase awareness"],
    gender: "Women",
    ethnicity: ["All ethnicities"],
    ageRanges: ["18 to 24 years old", "25 to 34 years old"],
    fansOf: ["Drama", "Romance", "News"],
    marketingStrength: "Dynamic Character Development and Moral Complexity: Law & Order offers young adult women a unique viewing experience that goes beyond typical crime dramas. The series excels in presenting morally complex situations that resonate with viewers seeking depth and nuance in their entertainment choices.",
    audienceInsight: "Women aged 18-34 are avid consumers of drama and romance content, often seeking emotional connections with characters. Law & Order's blend of intense storytelling and personal narratives can appeal to this demographic's desire for compelling, character-driven content."
  });

  // Process PDF data from session storage
  useEffect(() => {
    const processPdfFromSession = async () => {
      const pdfDataStr: string | null = sessionStorage.getItem('currentPdfData');
      if (pdfDataStr) {
        try {
          const pdfData: SessionPdfData = JSON.parse(pdfDataStr) as SessionPdfData;
          
          // Validate the stored data
          if (!pdfData.url || typeof pdfData.url !== 'string') {
            console.error('Invalid PDF data in session storage:', pdfData);
            sessionStorage.removeItem('currentPdfData');
            toast.error("Invalid PDF data found. Please upload a new PDF file.");
            return;
          }

          setIsAnalyzing(true);

          console.log("pdfData!!!!!", pdfData);
          
          // Call the process-pdf-upload action
          const result = await processPdfUpload({
            fileUrl: pdfData.url,
            documentType: pdfData.documentType || "marketing", // Use document type from session storage
          });

          if (result.validationErrors) {
            // Convert all error values to strings safely, handling objects/arrays
            const errorMessage = Object.values(result.validationErrors)
              .map((v) => typeof v === "string" ? v : JSON.stringify(v))
              .join(", ");
            console.error("Validation error:", errorMessage);

            // If it's a file not found error, clear the session storage
            if (errorMessage.includes("not found") || errorMessage.includes("Invalid filename")) {
              sessionStorage.removeItem('currentPdfData');
              toast.error("PDF file not found. Please upload a new PDF file.");
            } else {
              toast.error("Validation error: " + errorMessage);
            }
            return;
          }

          if (result.serverError) {
            console.error("Server error:", result.serverError);
            
            // If it's a file not found error, clear the session storage
            if (result.serverError.includes("not found") || result.serverError.includes("Invalid filename")) {
              sessionStorage.removeItem('currentPdfData');
              toast.error("PDF file not found. Please upload a new PDF file.");
            } else {
              toast.error("Server error: " + result.serverError);
            }
            return;
          }

          if (result.data) {
            const processedData: ProcessedPdfData = {
              fileName: result.data.fileName,
              extractedText: result.data.extractedText,
              analyzedData: result.data.analyzedData,
              uploadTime: new Date().toISOString()
            };
            
            setPdfData(processedData);

            // Update campaign data with extracted information
            setCampaignData(prev => ({
              ...prev,
              selectedEpisodes: Array.isArray(result.data!.analyzedData.selectedEpisodes) && result.data!.analyzedData.selectedEpisodes.length > 0 
                ? result.data!.analyzedData.selectedEpisodes 
                : prev.selectedEpisodes,
              goals: Array.isArray(result.data!.analyzedData.campaignGoals) && result.data!.analyzedData.campaignGoals.length > 0 
                ? result.data!.analyzedData.campaignGoals 
                : prev.goals,
              kpis: Array.isArray(result.data!.analyzedData.campaignKPIs) && result.data!.analyzedData.campaignKPIs.length > 0 
                ? result.data!.analyzedData.campaignKPIs 
                : prev.kpis,
              gender: typeof result.data!.analyzedData.gender === "string" && result.data!.analyzedData.gender
                ? result.data!.analyzedData.gender
                : prev.gender,
              ethnicity: Array.isArray(result.data!.analyzedData.ethnicity) && result.data!.analyzedData.ethnicity.length > 0
                ? result.data!.analyzedData.ethnicity
                : prev.ethnicity,
              ageRanges: Array.isArray(result.data!.analyzedData.age) && result.data!.analyzedData.age.length > 0 
                ? result.data!.analyzedData.age 
                : prev.ageRanges,
              fansOf: Array.isArray(result.data!.analyzedData.fansOf) && result.data!.analyzedData.fansOf.length > 0 
                ? result.data!.analyzedData.fansOf 
                : prev.fansOf,
            }));
          } else {
            throw new Error("No data returned from PDF processing");
          }
        } catch (error) {
          console.error('Error processing PDF:', error);
          
          // Clear invalid session storage data
          sessionStorage.removeItem('currentPdfData');
          
          if (error instanceof Error && error.message.includes("not found")) {
            toast.error("PDF file not found. Please upload a new PDF file.");
          } else {
            toast.error("Failed to process PDF. Using default parameters.");
          }
        } finally {
          setIsAnalyzing(false);
        }
      }
    };

    void processPdfFromSession();
  }, []);

  const handleGenerate = async () => {
    setIsGenerating(true);
    
    try {
      const result = await generateMarketingStrength({
        selectedEpisodes: campaignData.selectedEpisodes,
        campaignGoal: campaignData.goals.join(", "),
        campaignKPIs: campaignData.kpis,
        gender: campaignData.gender,
        ethnicity: campaignData.ethnicity,
        age: campaignData.ageRanges,
        fansOf: campaignData.fansOf,
      });

      if (result.data) {
        setOutputs(result.data.strengths);
        toast.success(`Marketing strength generated successfully!`);
      } else if (result.validationErrors) {
        console.error("Validation errors:", result.validationErrors);
        setOutputs([
          "Error: Invalid input data. Please check your campaign parameters.",
          "Error: Invalid input data. Please check your campaign parameters.",
          "Error: Invalid input data. Please check your campaign parameters.",
        ]);
        toast.error("Validation error occurred");
      } else {
        console.error("Failed to generate marketing strength");
        setOutputs([
          "Error: Failed to generate marketing strength. Please try again.",
          "Error: Failed to generate marketing strength. Please try again.",
          "Error: Failed to generate marketing strength. Please try again.",
        ]);
        toast.error("Failed to generate marketing strength");
      }
    } catch (error) {
      console.error("Error calling server action:", error);
      setOutputs([
        "Error: Network error occurred. Please check your connection and try again.",
        "Error: Network error occurred. Please check your connection and try again.",
        "Error: Network error occurred. Please check your connection and try again.",
      ]);
      toast.error("Network error occurred");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-950 via-purple-900 to-purple-950 pt-32 pb-6 px-6">
      {/* Progress Bar */}
      <div className="max-w-6xl mx-auto mb-8">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-bold text-white">Marketing Strength</h1>
          <span className="text-gray-300 text-sm">Target Strength</span>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left Panel - Input/Details */}
        <div className="space-y-6">
          {/* PDF Analysis Status */}
          {pdfData && (
            <Card className="bg-gray-800/50 border-gray-700 backdrop-blur-sm">
              <CardHeader className="pb-4">
                <CardTitle className="text-lg font-semibold text-white flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  PDF Analysis Status
                </CardTitle>
                <p className="text-sm text-gray-300 mt-1">
                  File: {pdfData.fileName}
                </p>
              </CardHeader>
              <CardContent className="space-y-4">
                {isAnalyzing ? (
                  <div className="flex items-center gap-3 p-3 bg-blue-600/20 border border-blue-500/30 rounded-md">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-300"></div>
                    <p className="text-blue-300 text-sm">
                      Processing PDF and extracting campaign parameters...
                    </p>
                  </div>
                ) : (
                  <div className="p-3 bg-green-600/20 border border-green-500/30 rounded-md">
                    <p className="text-green-300 text-sm">
                      ✓ PDF processed successfully! Campaign parameters updated below.
                    </p>
                  </div>
                )}
                <div className="text-xs text-gray-400">
                  <p>Extracted text length: {pdfData.extractedText.length} characters</p>
                  <p>Processed at: {new Date(pdfData.uploadTime).toLocaleString()}</p>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Show upload button if no PDF data */}
          {!pdfData && (
            <Card className="bg-gray-800/50 border-gray-700 backdrop-blur-sm">
              <CardHeader className="pb-4">
                <CardTitle className="text-lg font-semibold text-white flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  No PDF Data
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-3 bg-blue-600/20 border border-blue-500/30 rounded-md">
                  <p className="text-blue-300 text-sm">
                    Extracting and analyzing campaign parameters...
                  </p>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Campaign Parameters */}
          <Card className="bg-gray-800/50 border-gray-700 backdrop-blur-sm">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg font-semibold text-white">Campaign Parameters</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label className="text-sm font-medium text-gray-300">Selected Episodes</Label>
                <div className="mt-2 space-y-1">
                  {campaignData.selectedEpisodes.map((episode, index) => (
                    <div key={index} className="text-sm text-white bg-gray-700/50 px-3 py-2 rounded-md">
                      {episode}
                    </div>
                  ))}
                </div>
              </div>

              <Separator className="bg-gray-600" />

              <div>
                <Label className="text-sm font-medium text-gray-300">Campaign Goals</Label>
                <div className="mt-2 space-y-1">
                  {campaignData.goals.map((goal, index) => (
                    <div key={index} className="text-sm text-white bg-gray-700/50 px-3 py-2 rounded-md">
                      {goal}
                    </div>
                  ))}
                </div>
              </div>

              <Separator className="bg-gray-600" />

              <div>
                <Label className="text-sm font-medium text-gray-300">Campaign KPIs</Label>
                <div className="mt-2 space-y-1">
                  {campaignData.kpis.map((kpi, index) => (
                    <div key={index} className="text-sm text-white bg-gray-700/50 px-3 py-2 rounded-md">
                      {kpi}
                    </div>
                  ))}
                </div>
              </div>

              <Separator className="bg-gray-600" />

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium text-gray-300">Gender</Label>
                  <div className="mt-2 text-sm text-white bg-gray-700/50 px-3 py-2 rounded-md">
                    {campaignData.gender}
                  </div>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-300">Ethnicity</Label>
                  <div className="mt-2 space-y-1">
                  {campaignData.ethnicity.map((ethnicity, index) => (
                    <div key={index} className="text-sm text-white bg-gray-700/50 px-3 py-2 rounded-md">
                      {ethnicity}
                    </div>
                  ))}
                  </div>
                </div>
              </div>

              <Separator className="bg-gray-600" />

              <div>
                <Label className="text-sm font-medium text-gray-300">Age Ranges</Label>
                <div className="mt-2 space-y-1">
                  {campaignData.ageRanges.map((age, index) => (
                    <div key={index} className="text-sm text-white bg-gray-700/50 px-3 py-2 rounded-md">
                      {age}
                    </div>
                  ))}
                </div>
              </div>

              <Separator className="bg-gray-600" />

              <div>
                <Label className="text-sm font-medium text-gray-300">Fans Of</Label>
                <div className="mt-2 flex flex-wrap gap-2">
                  {campaignData.fansOf.map((genre, index) => (
                    <Badge key={index} variant="outline" className="text-xs bg-purple-600/20 text-purple-300 border-purple-500/30">
                      {genre}
                    </Badge>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Generate Button */}
          <Button 
            onClick={handleGenerate} 
            disabled={isGenerating || isAnalyzing}
            className="w-full cursor-pointer bg-gradient-to-r from-purple-600 to-purple-500 hover:from-purple-700 hover:to-purple-600 text-white border-0 shadow-lg shadow-purple-500/25 transition-all duration-200"
            size="lg"
          >
            {isGenerating ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                Generating...
              </>
            ) : isAnalyzing ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                Processing PDF...
              </>
            ) : (
              <>
                <Play className="w-4 h-4 mr-2" />
                Generate Marketing Strength
              </>
            )}
          </Button>
        </div>

        {/* Right Panel - Output */}
        <div className="space-y-6">
          <h2 className="text-xl font-semibold text-white">Generated Strengths</h2>
          
          {outputs.map((output, index) => (
            <Card key={index} className="bg-gray-800/50 border-gray-700 backdrop-blur-sm">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-medium text-white">Output {index + 1}</CardTitle>
                  <Badge 
                    variant="outline" 
                    className={`text-xs ${
                      isGenerating 
                        ? "bg-blue-600/20 text-blue-300 border-blue-500/30"
                        : output 
                          ? "bg-green-600/20 text-green-300 border-green-500/30"
                          : "bg-red-600/20 text-red-300 border-red-500/30"
                    }`}
                  >
                    {isGenerating ? "Generating" : output ? "Generated" : "Not yet"}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <Textarea
                  value={output}
                  placeholder="Your output will appear here after you submit."
                  className="min-h-[200px] resize-none bg-gray-700/50 border-gray-600 text-white placeholder:text-gray-400 focus:border-purple-500 focus:ring-purple-500"
                  readOnly
                />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
} 