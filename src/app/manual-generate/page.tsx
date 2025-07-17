"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import { Label } from "~/components/ui/label";
import { Separator } from "~/components/ui/separator";
import { Textarea } from "~/components/ui/textarea";
import { ChevronRight, Play, ArrowLeft, ArrowRight, X } from "lucide-react";
import { generateMarketingStrength } from "~/lib/actions/generate-marketing-strength";
import { toast } from "sonner";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import {
  SUCCESS_MESSAGES,
  SAMPLE_EPISODES,
  SAMPLE_GOALS,
  SAMPLE_KPIS,
  GENDER_OPTIONS,
  ETHNICITY_OPTIONS,
  AGE_OPTIONS,
  FANS_OF_OPTIONS,
  ERROR_MESSAGES,
} from "~/lib/constants";

export default function ManualGeneratePage() {
  const [currentStep, setCurrentStep] = useState(1);
  const [outputs, setOutputs] = useState<string[]>(["", "", ""]);
  const [isGenerating, setIsGenerating] = useState(false);

  // Step One State
  const [selectedEpisodes, setSelectedEpisodes] = useState<string[]>([]);
  const [goals, setGoals] = useState<string[]>([]);
  const [kpis, setKpis] = useState<string[]>([]);

  // Step Two State
  const [gender, setGender] = useState("");
  const [ethnicity, setEthnicity] = useState<string[]>([]);
  const [ageRanges, setAgeRanges] = useState<string[]>([]);
  const [fansOf, setFansOf] = useState<string[]>([]);

  // Step One Handlers
  const handleEpisodeToggle = (episode: string) => {
    setSelectedEpisodes((prev) =>
      prev.includes(episode)
        ? prev.filter((e) => e !== episode)
        : [...prev, episode],
    );
  };

  const handleGoalToggle = (goal: string) => {
    setGoals((prev) =>
      prev.includes(goal) ? prev.filter((g) => g !== goal) : [...prev, goal],
    );
  };

  const handleKpiToggle = (kpi: string) => {
    setKpis((prev) =>
      prev.includes(kpi) ? prev.filter((k) => k !== kpi) : [...prev, kpi],
    );
  };

  const removeGoal = (goal: string) => {
    setGoals((prev) => prev.filter((g) => g !== goal));
  };

  const removeKpi = (kpi: string) => {
    setKpis((prev) => prev.filter((k) => k !== kpi));
  };

  // Step Two Handlers
  const handleEthnicityToggle = (ethnicityOption: string) => {
    setEthnicity((prev) => {
      if (ethnicityOption === "All ethnicities") {
        return ["All ethnicities"];
      }
      if (prev.includes("All ethnicities")) {
        return prev
          .filter((e) => e !== "All ethnicities")
          .concat(ethnicityOption);
      }
      return prev.includes(ethnicityOption)
        ? prev.filter((e) => e !== ethnicityOption)
        : [...prev, ethnicityOption];
    });
  };

  const handleAgeToggle = (ageOption: string) => {
    setAgeRanges((prev) =>
      prev.includes(ageOption)
        ? prev.filter((a) => a !== ageOption)
        : prev.length >= 3
          ? prev
          : [...prev, ageOption],
    );
  };

  const handleFansOfToggle = (fansOption: string) => {
    setFansOf((prev) =>
      prev.includes(fansOption)
        ? prev.filter((f) => f !== fansOption)
        : prev.length >= 3
          ? prev
          : [...prev, fansOption],
    );
  };

  const removeEthnicity = (ethnicityOption: string) => {
    setEthnicity((prev) => prev.filter((e) => e !== ethnicityOption));
  };

  const removeAge = (ageOption: string) => {
    setAgeRanges((prev) => prev.filter((a) => a !== ageOption));
  };

  const removeFansOf = (fansOption: string) => {
    setFansOf((prev) => prev.filter((f) => f !== fansOption));
  };

  // Navigation Handlers
  const handleNextStep = () => {
    if (selectedEpisodes.length === 0) {
      toast.error("Please select at least one episode");
      return;
    }
    if (goals.length === 0) {
      toast.error("Please select at least one goal");
      return;
    }
    if (kpis.length === 0) {
      toast.error("Please select at least one KPI");
      return;
    }
    setCurrentStep(2);
  };

  const handleGenerate = async () => {
    setIsGenerating(true);

    try {
      const result = await generateMarketingStrength({
        selectedEpisodes: selectedEpisodes,
        campaignGoal: goals.join(", "),
        campaignKPIs: kpis,
        gender: gender,
        ethnicity: ethnicity,
        age: ageRanges,
        fansOf: fansOf,
      });

      if (result.data) {
        setOutputs(result.data.strengths);
        toast.success(SUCCESS_MESSAGES.GENERATION_COMPLETE);
      } else if (result.validationErrors) {
        setOutputs([
          "Error: Invalid input data. Please check your campaign parameters.",
          "Error: Invalid input data. Please check your campaign parameters.",
          "Error: Invalid input data. Please check your campaign parameters.",
        ]);
        toast.error("Validation error occurred");
      } else {
        setOutputs([
          "Error: Failed to generate marketing strength. Please try again.",
          "Error: Failed to generate marketing strength. Please try again.",
          "Error: Failed to generate marketing strength. Please try again.",
        ]);
        toast.error("Failed to generate marketing strength");
      }
    } catch (error) {
      setOutputs([
        "Error: Network error occurred. Please check your connection and try again.",
        "Error: Network error occurred. Please check your connection and try again.",
        "Error: Network error occurred. Please check your connection and try again.",
      ]);
      if (error instanceof Error) {
        toast.error(error.message);
      } else {
        toast.error(ERROR_MESSAGES.PROCESSING_FAILED);
      }
    } finally {
      setIsGenerating(false);
    }
  };

  const canGenerate = () => {
    return (
      gender &&
      ethnicity.length > 0 &&
      ageRanges.length > 0 &&
      fansOf.length > 0
    );
  };

  // Step One Component
  const StepOneForm = () => (
    <div className="space-y-6">
      {/* Episodes Selection */}
      <Card className="border-gray-700 bg-gray-800/50 backdrop-blur-sm">
        <CardHeader className="pb-4">
          <CardTitle className="text-lg font-semibold text-white">
            Episodes Selection
          </CardTitle>
          <p className="text-sm text-gray-300">
            Select the episodes for your campaign (multiple selection)
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid max-h-60 grid-cols-1 gap-2 overflow-y-auto md:grid-cols-2">
            {SAMPLE_EPISODES.map((episode) => (
              <Button
                key={episode}
                variant={
                  selectedEpisodes.includes(episode) ? "default" : "outline"
                }
                size="sm"
                onClick={() => handleEpisodeToggle(episode)}
                className={`h-auto justify-start p-3 text-left ${
                  selectedEpisodes.includes(episode)
                    ? "border-purple-600 bg-purple-600 text-white"
                    : "border-gray-600 bg-gray-700/50 text-gray-300 hover:border-purple-500 hover:text-white"
                }`}
              >
                {episode}
              </Button>
            ))}
          </div>
          {selectedEpisodes.length > 0 && (
            <div className="pt-2">
              <Label className="text-sm font-medium text-gray-300">
                Selected Episodes ({selectedEpisodes.length})
              </Label>
              <div className="mt-2 flex flex-wrap gap-2">
                {selectedEpisodes.map((episode) => (
                  <Badge
                    key={episode}
                    variant="outline"
                    className="border-purple-500/30 bg-purple-600/20 text-xs text-purple-300"
                  >
                    {episode}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <Separator className="bg-gray-600" />

      {/* Campaign Goals */}
      <Card className="border-gray-700 bg-gray-800/50 backdrop-blur-sm">
        <CardHeader className="pb-4">
          <CardTitle className="text-lg font-semibold text-white">
            Campaign Goals
          </CardTitle>
          <p className="text-sm text-gray-300">
            Select or add custom campaign goals
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid max-h-40 grid-cols-1 gap-2 overflow-y-auto md:grid-cols-2">
            {SAMPLE_GOALS.map((goal) => (
              <Button
                key={goal}
                variant={goals.includes(goal) ? "default" : "outline"}
                size="sm"
                onClick={() => handleGoalToggle(goal)}
                className={`h-auto justify-start p-3 text-left ${
                  goals.includes(goal)
                    ? "border-purple-600 bg-purple-600 text-white"
                    : "border-gray-600 bg-gray-700/50 text-gray-300 hover:border-purple-500 hover:text-white"
                }`}
              >
                {goal}
              </Button>
            ))}
          </div>

          {goals.length > 0 && (
            <div className="pt-2">
              <Label className="text-sm font-medium text-gray-300">
                Selected Goals ({goals.length})
              </Label>
              <div className="mt-2 flex flex-wrap gap-2">
                {goals.map((goal) => (
                  <Badge
                    key={goal}
                    variant="outline"
                    className="flex items-center gap-1 border-purple-500/30 bg-purple-600/20 text-xs text-purple-300"
                  >
                    {goal}
                    <button
                      onClick={() => removeGoal(goal)}
                      className="ml-1 hover:text-red-300"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <Separator className="bg-gray-600" />

      {/* Campaign KPIs */}
      <Card className="border-gray-700 bg-gray-800/50 backdrop-blur-sm">
        <CardHeader className="pb-4">
          <CardTitle className="text-lg font-semibold text-white">
            Campaign KPIs
          </CardTitle>
          <p className="text-sm text-gray-300">
            Select or add custom campaign KPIs
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid max-h-40 grid-cols-1 gap-2 overflow-y-auto md:grid-cols-2">
            {SAMPLE_KPIS.map((kpi) => (
              <Button
                key={kpi}
                variant={kpis.includes(kpi) ? "default" : "outline"}
                size="sm"
                onClick={() => handleKpiToggle(kpi)}
                className={`h-auto justify-start p-3 text-left ${
                  kpis.includes(kpi)
                    ? "border-purple-600 bg-purple-600 text-white"
                    : "border-gray-600 bg-gray-700/50 text-gray-300 hover:border-purple-500 hover:text-white"
                }`}
              >
                {kpi}
              </Button>
            ))}
          </div>

          {kpis.length > 0 && (
            <div className="pt-2">
              <Label className="text-sm font-medium text-gray-300">
                Selected KPIs ({kpis.length})
              </Label>
              <div className="mt-2 flex flex-wrap gap-2">
                {kpis.map((kpi) => (
                  <Badge
                    key={kpi}
                    variant="outline"
                    className="flex items-center gap-1 border-purple-500/30 bg-purple-600/20 text-xs text-purple-300"
                  >
                    {kpi}
                    <button
                      onClick={() => removeKpi(kpi)}
                      className="ml-1 hover:text-red-300"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );

  // Step Two Component
  const StepTwoForm = () => (
    <div className="space-y-6">
      {/* Instructions */}
      <Card className="border-gray-700 bg-gray-800/50 backdrop-blur-sm">
        <CardHeader className="pb-4">
          <CardTitle className="text-lg font-semibold text-white">
            Generate a Marketing Strength
          </CardTitle>
          <p className="text-sm text-gray-300">
            Click below to generate a Marketing Strength for your selected
            series.
          </p>
        </CardHeader>
      </Card>

      {/* Gender Selection */}
      <Card className="border-gray-700 bg-gray-800/50 backdrop-blur-sm">
        <CardHeader className="pb-4">
          <CardTitle className="text-lg font-semibold text-white">
            Gender
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Select value={gender} onValueChange={setGender}>
            <SelectTrigger className="w-full border-gray-600 bg-gray-700/50 text-white focus:border-purple-500">
              <SelectValue placeholder="Select gender" />
            </SelectTrigger>
            <SelectContent className="border-gray-600 bg-gray-800">
              {GENDER_OPTIONS.map((option) => (
                <SelectItem
                  key={option}
                  value={option}
                  className="text-white hover:bg-gray-700"
                >
                  {option}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      <Separator className="bg-gray-600" />

      {/* Ethnicity Selection */}
      <Card className="border-gray-700 bg-gray-800/50 backdrop-blur-sm">
        <CardHeader className="pb-4">
          <CardTitle className="text-lg font-semibold text-white">
            Ethnicity/race
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid max-h-40 grid-cols-1 gap-2 overflow-y-auto md:grid-cols-2">
            {ETHNICITY_OPTIONS.map((option) => (
              <Button
                key={option}
                variant={ethnicity.includes(option) ? "default" : "outline"}
                size="sm"
                onClick={() => handleEthnicityToggle(option)}
                className={`h-auto justify-start p-3 text-left ${
                  ethnicity.includes(option)
                    ? "border-purple-600 bg-purple-600 text-white"
                    : "border-gray-600 bg-gray-700/50 text-gray-300 hover:border-purple-500 hover:text-white"
                }`}
              >
                {option}
              </Button>
            ))}
          </div>

          {ethnicity.length > 0 && (
            <div className="pt-2">
              <Label className="text-sm font-medium text-gray-300">
                Selected Ethnicities ({ethnicity.length})
              </Label>
              <div className="mt-2 flex flex-wrap gap-2">
                {ethnicity.map((option) => (
                  <Badge
                    key={option}
                    variant="outline"
                    className="flex items-center gap-1 border-purple-500/30 bg-purple-600/20 text-xs text-purple-300"
                  >
                    {option}
                    <button
                      onClick={() => removeEthnicity(option)}
                      className="ml-1 hover:text-red-300"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <Separator className="bg-gray-600" />

      {/* Age Selection */}
      <Card className="border-gray-700 bg-gray-800/50 backdrop-blur-sm">
        <CardHeader className="pb-4">
          <CardTitle className="text-lg font-semibold text-white">
            Age
          </CardTitle>
          <p className="text-sm text-gray-300">Select ages (max 3)</p>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid max-h-40 grid-cols-1 gap-2 overflow-y-auto md:grid-cols-2">
            {AGE_OPTIONS.map((option) => (
              <Button
                key={option}
                variant={ageRanges.includes(option) ? "default" : "outline"}
                size="sm"
                onClick={() => handleAgeToggle(option)}
                disabled={!ageRanges.includes(option) && ageRanges.length >= 3}
                className={`h-auto justify-start p-3 text-left ${
                  ageRanges.includes(option)
                    ? "border-purple-600 bg-purple-600 text-white"
                    : ageRanges.length >= 3
                      ? "cursor-not-allowed border-gray-500 bg-gray-600/50 text-gray-400"
                      : "border-gray-600 bg-gray-700/50 text-gray-300 hover:border-purple-500 hover:text-white"
                }`}
              >
                {option}
              </Button>
            ))}
          </div>

          {ageRanges.length > 0 && (
            <div className="pt-2">
              <Label className="text-sm font-medium text-gray-300">
                Selected Ages ({ageRanges.length}/3)
              </Label>
              <div className="mt-2 flex flex-wrap gap-2">
                {ageRanges.map((option) => (
                  <Badge
                    key={option}
                    variant="outline"
                    className="flex items-center gap-1 border-purple-500/30 bg-purple-600/20 text-xs text-purple-300"
                  >
                    {option}
                    <button
                      onClick={() => removeAge(option)}
                      className="ml-1 hover:text-red-300"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <Separator className="bg-gray-600" />

      {/* Fans Of Selection */}
      <Card className="border-gray-700 bg-gray-800/50 backdrop-blur-sm">
        <CardHeader className="pb-4">
          <CardTitle className="text-lg font-semibold text-white">
            Fans of
          </CardTitle>
          <p className="text-sm text-gray-300">Select subjects (max 3)</p>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid max-h-40 grid-cols-1 gap-2 overflow-y-auto md:grid-cols-2">
            {FANS_OF_OPTIONS.map((option) => (
              <Button
                key={option}
                variant={fansOf.includes(option) ? "default" : "outline"}
                size="sm"
                onClick={() => handleFansOfToggle(option)}
                disabled={!fansOf.includes(option) && fansOf.length >= 3}
                className={`h-auto justify-start p-3 text-left ${
                  fansOf.includes(option)
                    ? "border-purple-600 bg-purple-600 text-white"
                    : fansOf.length >= 3
                      ? "cursor-not-allowed border-gray-500 bg-gray-600/50 text-gray-400"
                      : "border-gray-600 bg-gray-700/50 text-gray-300 hover:border-purple-500 hover:text-white"
                }`}
              >
                {option}
              </Button>
            ))}
          </div>

          {fansOf.length > 0 && (
            <div className="pt-2">
              <Label className="text-sm font-medium text-gray-300">
                Selected Subjects ({fansOf.length}/3)
              </Label>
              <div className="mt-2 flex flex-wrap gap-2">
                {fansOf.map((option) => (
                  <Badge
                    key={option}
                    variant="outline"
                    className="flex items-center gap-1 border-purple-500/30 bg-purple-600/20 text-xs text-purple-300"
                  >
                    {option}
                    <button
                      onClick={() => removeFansOf(option)}
                      className="ml-1 hover:text-red-300"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );

  return (
    <main>
      <div className="min-h-screen bg-gradient-to-br from-purple-950 via-purple-900 to-purple-950 px-6 pt-32 pb-6">
        {/* Progress Bar */}
        <div className="mx-auto mb-8 max-w-6xl">
          <div className="mb-4 flex items-center justify-between">
            <h1 className="text-2xl font-bold text-white">
              Manual Strategy Generation
            </h1>
            <span className="text-sm text-gray-300">
              Step {currentStep} of 2
            </span>
          </div>

          {/* Step Indicator */}
          <div className="mb-6 flex items-center gap-4">
            <div
              className={`flex items-center gap-2 ${currentStep >= 1 ? "text-purple-300" : "text-gray-500"}`}
            >
              <div
                className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-medium ${
                  currentStep >= 1
                    ? "bg-purple-600 text-white"
                    : "bg-gray-700 text-gray-400"
                }`}
              >
                1
              </div>
              <span className="text-sm font-medium">Campaign Setup</span>
            </div>
            <ChevronRight className="text-gray-500" />
            <div
              className={`flex items-center gap-2 ${currentStep >= 2 ? "text-purple-300" : "text-gray-500"}`}
            >
              <div
                className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-medium ${
                  currentStep >= 2
                    ? "bg-purple-600 text-white"
                    : "bg-gray-700 text-gray-400"
                }`}
              >
                2
              </div>
              <span className="text-sm font-medium">Audience Targeting</span>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="mx-auto grid max-w-6xl grid-cols-1 gap-8 lg:grid-cols-2">
          {/* Left Panel - Form */}
          <div className="space-y-6">
            {currentStep === 1 ? <StepOneForm /> : <StepTwoForm />}

            {/* Navigation Buttons */}
            <div className="flex gap-4">
              {currentStep === 2 && (
                <Button
                  onClick={() => setCurrentStep(1)}
                  variant="outline"
                  className="flex-1 border-gray-600 bg-gray-800/50 text-gray-300 hover:border-purple-500 hover:text-white"
                >
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back to Step 1
                </Button>
              )}

              {currentStep === 1 && (
                <Button
                  onClick={handleNextStep}
                  className="flex-1 cursor-pointer border-0 bg-gradient-to-r from-purple-600 to-purple-500 text-white shadow-lg shadow-purple-500/25 transition-all duration-200 hover:from-purple-700 hover:to-purple-600"
                >
                  Next Step
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              )}

              {currentStep === 2 && (
                <Button
                  onClick={handleGenerate}
                  disabled={isGenerating || !canGenerate()}
                  className="flex-1 cursor-pointer border-0 bg-gradient-to-r from-purple-600 to-purple-500 text-white shadow-lg shadow-purple-500/25 transition-all duration-200 hover:from-purple-700 hover:to-purple-600"
                  size="lg"
                >
                  {isGenerating ? (
                    <>
                      <div className="mr-2 h-4 w-4 animate-spin rounded-full border-b-2 border-white" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <Play className="mr-2 h-4 w-4" />✨ GENERATE A MARKETING
                      STRENGTH
                    </>
                  )}
                </Button>
              )}
            </div>
          </div>

          {/* Right Panel - Output */}
          <div className="space-y-6">
            <h2 className="text-xl font-semibold text-white">
              Generated Strengths
            </h2>

            {outputs.map((output, index) => (
              <Card
                key={index}
                className="border-gray-700 bg-gray-800/50 backdrop-blur-sm"
              >
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-sm font-medium text-white">
                      Output {index + 1}
                    </CardTitle>
                    <Badge
                      variant="outline"
                      className={`text-xs ${
                        isGenerating
                          ? "border-blue-500/30 bg-blue-600/20 text-blue-300"
                          : output
                            ? "border-green-500/30 bg-green-600/20 text-green-300"
                            : "border-red-500/30 bg-red-600/20 text-red-300"
                      }`}
                    >
                      {isGenerating
                        ? "Generating"
                        : output
                          ? "Generated"
                          : "Not yet"}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <Textarea
                    value={output}
                    placeholder="Your output will appear here after you submit."
                    className="min-h-[200px] resize-none border-gray-600 bg-gray-700/50 text-white placeholder:text-gray-400 focus:border-purple-500 focus:ring-purple-500"
                    readOnly
                  />
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}
