"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { Separator } from "~/components/ui/separator";
import { Textarea } from "~/components/ui/textarea";
import { ChevronRight, Play, ArrowLeft, ArrowRight, X, Plus } from "lucide-react";
import { generateMarketingStrength } from "~/lib/actions/generate-marketing-strength";
import { toast } from "sonner";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";

interface CampaignData {
    selectedEpisodes: string[];
    goals: string[];
    kpis: string[];
    gender: string;
    ethnicity: string[];
    ageRanges: string[];
    fansOf: string[];
}

// Sample data for Step One
const SAMPLE_EPISODES = [
  "Law And Order CI S01E05",
  "Law And Order CI S01E06",
  "Law And Order CI S01E07",
  "Law And Order CI S01E08",
  "Law And Order CI S01E09",
  "Law And Order CI S01E10",
  "Law And Order CI S02E01",
  "Law And Order CI S02E02",
  "Law And Order CI S02E03",
  "Law And Order CI S02E04",
  "Law And Order CI S02E05",
  "Law And Order CI S02E06",
];

const SAMPLE_GOALS = [
  "Attract new audience to legacy IP",
  "Increase brand awareness",
  "Drive engagement",
  "Generate leads",
  "Boost conversions",
  "Improve brand sentiment",
  "Expand market reach",
  "Strengthen brand loyalty",
];

const SAMPLE_KPIS = [
  "Grow follow count",
  "Increase awareness",
  "Boost engagement rate",
  "Improve click-through rate",
  "Increase conversion rate",
  "Reduce cost per acquisition",
  "Improve brand sentiment score",
  "Increase time spent on content",
];

// Sample data for Step Two
const GENDER_OPTIONS = [
  "Women",
  "Men",
  "All genders",
];

const ETHNICITY_OPTIONS = [
  "All ethnicities",
  "White",
  "Black or African American",
  "Hispanic or Latino",
  "Asian",
  "Native American",
  "Pacific Islander",
  "Middle Eastern",
  "Mixed race",
];

const AGE_OPTIONS = [
  "13 to 17 years old",
  "18 to 24 years old",
  "25 to 34 years old",
  "35 to 44 years old",
  "45 to 54 years old",
  "55 to 64 years old",
  "65+ years old",
];

const FANS_OF_OPTIONS = [
  "Drama",
  "Romance",
  "News",
  "Comedy",
  "Action",
  "Thriller",
  "Horror",
  "Sci-Fi",
  "Fantasy",
  "Documentary",
  "Reality TV",
  "Sports",
  "Music",
  "Gaming",
  "Technology",
  "Fashion",
  "Food",
  "Travel",
  "Health & Fitness",
  "Education",
];

export default function ManualGeneratePage() {
    const [currentStep, setCurrentStep] = useState(1);
    const [outputs, setOutputs] = useState<string[]>(["", "", ""]);
    const [isGenerating, setIsGenerating] = useState(false);
    const [lastGeneratedId, setLastGeneratedId] = useState<number | null>(null);

    // Step One State
    const [selectedEpisodes, setSelectedEpisodes] = useState<string[]>([]);
    const [goals, setGoals] = useState<string[]>([]);
    const [kpis, setKpis] = useState<string[]>([]);
    const [newGoal, setNewGoal] = useState("");
    const [newKpi, setNewKpi] = useState("");

    // Step Two State
    const [gender, setGender] = useState("");
    const [ethnicity, setEthnicity] = useState<string[]>([]);
    const [ageRanges, setAgeRanges] = useState<string[]>([]);
    const [fansOf, setFansOf] = useState<string[]>([]);

    // Step One Handlers
    const handleEpisodeToggle = (episode: string) => {
        setSelectedEpisodes(prev => 
            prev.includes(episode) 
                ? prev.filter(e => e !== episode)
                : [...prev, episode]
        );
    };

    const handleGoalToggle = (goal: string) => {
        setGoals(prev => 
            prev.includes(goal) 
                ? prev.filter(g => g !== goal)
                : [...prev, goal]
        );
    };

    const handleKpiToggle = (kpi: string) => {
        setKpis(prev => 
            prev.includes(kpi) 
                ? prev.filter(k => k !== kpi)
                : [...prev, kpi]
        );
    };

    const addCustomGoal = () => {
        if (newGoal.trim() && !goals.includes(newGoal.trim())) {
            setGoals(prev => [...prev, newGoal.trim()]);
            setNewGoal("");
        }
    };

    const addCustomKpi = () => {
        if (newKpi.trim() && !kpis.includes(newKpi.trim())) {
            setKpis(prev => [...prev, newKpi.trim()]);
            setNewKpi("");
        }
    };

    const removeGoal = (goal: string) => {
        setGoals(prev => prev.filter(g => g !== goal));
    };

    const removeKpi = (kpi: string) => {
        setKpis(prev => prev.filter(k => k !== kpi));
    };

    // Step Two Handlers
    const handleEthnicityToggle = (ethnicityOption: string) => {
        setEthnicity(prev => {
            if (ethnicityOption === "All ethnicities") {
                return ["All ethnicities"];
            }
            if (prev.includes("All ethnicities")) {
                return prev.filter(e => e !== "All ethnicities").concat(ethnicityOption);
            }
            return prev.includes(ethnicityOption)
                ? prev.filter(e => e !== ethnicityOption)
                : [...prev, ethnicityOption];
        });
    };

    const handleAgeToggle = (ageOption: string) => {
        setAgeRanges(prev => 
            prev.includes(ageOption)
                ? prev.filter(a => a !== ageOption)
                : prev.length >= 3
                    ? prev
                    : [...prev, ageOption]
        );
    };

    const handleFansOfToggle = (fansOption: string) => {
        setFansOf(prev => 
            prev.includes(fansOption)
                ? prev.filter(f => f !== fansOption)
                : prev.length >= 3
                    ? prev
                    : [...prev, fansOption]
        );
    };

    const removeEthnicity = (ethnicityOption: string) => {
        setEthnicity(prev => prev.filter(e => e !== ethnicityOption));
    };

    const removeAge = (ageOption: string) => {
        setAgeRanges(prev => prev.filter(a => a !== ageOption));
    };

    const removeFansOf = (fansOption: string) => {
        setFansOf(prev => prev.filter(f => f !== fansOption));
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
                setLastGeneratedId(result.data.id);
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
            <Card className="bg-gray-800/50 border-gray-700 backdrop-blur-sm">
                <CardHeader className="pb-4">
                    <CardTitle className="text-lg font-semibold text-white">Episodes Selection</CardTitle>
                    <p className="text-sm text-gray-300">Select the episodes for your campaign (multiple selection)</p>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2 max-h-60 overflow-y-auto">
                        {SAMPLE_EPISODES.map((episode) => (
                            <Button
                                key={episode}
                                variant={selectedEpisodes.includes(episode) ? "default" : "outline"}
                                size="sm"
                                onClick={() => handleEpisodeToggle(episode)}
                                className={`justify-start text-left h-auto p-3 ${
                                    selectedEpisodes.includes(episode)
                                        ? "bg-purple-600 text-white border-purple-600"
                                        : "bg-gray-700/50 border-gray-600 text-gray-300 hover:text-white hover:border-purple-500"
                                }`}
                            >
                                {episode}
                            </Button>
                        ))}
                    </div>
                    {selectedEpisodes.length > 0 && (
                        <div className="pt-2">
                            <Label className="text-sm font-medium text-gray-300">Selected Episodes ({selectedEpisodes.length})</Label>
                            <div className="mt-2 flex flex-wrap gap-2">
                                {selectedEpisodes.map((episode) => (
                                    <Badge key={episode} variant="outline" className="text-xs bg-purple-600/20 text-purple-300 border-purple-500/30">
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
            <Card className="bg-gray-800/50 border-gray-700 backdrop-blur-sm">
                <CardHeader className="pb-4">
                    <CardTitle className="text-lg font-semibold text-white">Campaign Goals</CardTitle>
                    <p className="text-sm text-gray-300">Select or add custom campaign goals</p>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2 max-h-40 overflow-y-auto">
                        {SAMPLE_GOALS.map((goal) => (
                            <Button
                                key={goal}
                                variant={goals.includes(goal) ? "default" : "outline"}
                                size="sm"
                                onClick={() => handleGoalToggle(goal)}
                                className={`justify-start text-left h-auto p-3 ${
                                    goals.includes(goal)
                                        ? "bg-purple-600 text-white border-purple-600"
                                        : "bg-gray-700/50 border-gray-600 text-gray-300 hover:text-white hover:border-purple-500"
                                }`}
                            >
                                {goal}
                            </Button>
                        ))}
                    </div>
                    
                    {/* Custom Goal Input */}
                    <div className="flex gap-2">
                        <Input
                            value={newGoal}
                            onChange={(e) => setNewGoal(e.target.value)}
                            placeholder="Add custom goal..."
                            className="flex-1 bg-gray-700/50 border-gray-600 text-white placeholder:text-gray-400 focus:border-purple-500"
                            onKeyPress={(e) => e.key === 'Enter' && addCustomGoal()}
                        />
                        <Button
                            onClick={addCustomGoal}
                            size="sm"
                            className="bg-purple-600 hover:bg-purple-700 text-white"
                        >
                            <Plus className="w-4 h-4" />
                        </Button>
                    </div>

                    {goals.length > 0 && (
                        <div className="pt-2">
                            <Label className="text-sm font-medium text-gray-300">Selected Goals ({goals.length})</Label>
                            <div className="mt-2 flex flex-wrap gap-2">
                                {goals.map((goal) => (
                                    <Badge key={goal} variant="outline" className="text-xs bg-purple-600/20 text-purple-300 border-purple-500/30 flex items-center gap-1">
                                        {goal}
                                        <button
                                            onClick={() => removeGoal(goal)}
                                            className="ml-1 hover:text-red-300"
                                        >
                                            <X className="w-3 h-3" />
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
            <Card className="bg-gray-800/50 border-gray-700 backdrop-blur-sm">
                <CardHeader className="pb-4">
                    <CardTitle className="text-lg font-semibold text-white">Campaign KPIs</CardTitle>
                    <p className="text-sm text-gray-300">Select or add custom campaign KPIs</p>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2 max-h-40 overflow-y-auto">
                        {SAMPLE_KPIS.map((kpi) => (
                            <Button
                                key={kpi}
                                variant={kpis.includes(kpi) ? "default" : "outline"}
                                size="sm"
                                onClick={() => handleKpiToggle(kpi)}
                                className={`justify-start text-left h-auto p-3 ${
                                    kpis.includes(kpi)
                                        ? "bg-purple-600 text-white border-purple-600"
                                        : "bg-gray-700/50 border-gray-600 text-gray-300 hover:text-white hover:border-purple-500"
                                }`}
                            >
                                {kpi}
                            </Button>
                        ))}
                    </div>
                    
                    {/* Custom KPI Input */}
                    <div className="flex gap-2">
                        <Input
                            value={newKpi}
                            onChange={(e) => setNewKpi(e.target.value)}
                            placeholder="Add custom KPI..."
                            className="flex-1 bg-gray-700/50 border-gray-600 text-white placeholder:text-gray-400 focus:border-purple-500"
                            onKeyPress={(e) => e.key === 'Enter' && addCustomKpi()}
                        />
                        <Button
                            onClick={addCustomKpi}
                            size="sm"
                            className="bg-purple-600 hover:bg-purple-700 text-white"
                        >
                            <Plus className="w-4 h-4" />
                        </Button>
                    </div>

                    {kpis.length > 0 && (
                        <div className="pt-2">
                            <Label className="text-sm font-medium text-gray-300">Selected KPIs ({kpis.length})</Label>
                            <div className="mt-2 flex flex-wrap gap-2">
                                {kpis.map((kpi) => (
                                    <Badge key={kpi} variant="outline" className="text-xs bg-purple-600/20 text-purple-300 border-purple-500/30 flex items-center gap-1">
                                        {kpi}
                                        <button
                                            onClick={() => removeKpi(kpi)}
                                            className="ml-1 hover:text-red-300"
                                        >
                                            <X className="w-3 h-3" />
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
            <Card className="bg-gray-800/50 border-gray-700 backdrop-blur-sm">
                <CardHeader className="pb-4">
                    <CardTitle className="text-lg font-semibold text-white">Generate a Marketing Strength</CardTitle>
                    <p className="text-sm text-gray-300">Click below to generate a Marketing Strength for your selected series.</p>
                </CardHeader>
            </Card>

            {/* Gender Selection */}
            <Card className="bg-gray-800/50 border-gray-700 backdrop-blur-sm">
                <CardHeader className="pb-4">
                    <CardTitle className="text-lg font-semibold text-white">Gender</CardTitle>
                </CardHeader>
                <CardContent>
                    <Select value={gender} onValueChange={setGender}>
                        <SelectTrigger className="w-full bg-gray-700/50 border-gray-600 text-white focus:border-purple-500">
                            <SelectValue placeholder="Select gender" />
                        </SelectTrigger>
                        <SelectContent className="bg-gray-800 border-gray-600">
                            {GENDER_OPTIONS.map((option) => (
                                <SelectItem key={option} value={option} className="text-white hover:bg-gray-700">
                                    {option}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </CardContent>
            </Card>

            <Separator className="bg-gray-600" />

            {/* Ethnicity Selection */}
            <Card className="bg-gray-800/50 border-gray-700 backdrop-blur-sm">
                <CardHeader className="pb-4">
                    <CardTitle className="text-lg font-semibold text-white">Ethnicity/race</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2 max-h-40 overflow-y-auto">
                        {ETHNICITY_OPTIONS.map((option) => (
                            <Button
                                key={option}
                                variant={ethnicity.includes(option) ? "default" : "outline"}
                                size="sm"
                                onClick={() => handleEthnicityToggle(option)}
                                className={`justify-start text-left h-auto p-3 ${
                                    ethnicity.includes(option)
                                        ? "bg-purple-600 text-white border-purple-600"
                                        : "bg-gray-700/50 border-gray-600 text-gray-300 hover:text-white hover:border-purple-500"
                                }`}
                            >
                                {option}
                            </Button>
                        ))}
                    </div>
                    
                    {ethnicity.length > 0 && (
                        <div className="pt-2">
                            <Label className="text-sm font-medium text-gray-300">Selected Ethnicities ({ethnicity.length})</Label>
                            <div className="mt-2 flex flex-wrap gap-2">
                                {ethnicity.map((option) => (
                                    <Badge key={option} variant="outline" className="text-xs bg-purple-600/20 text-purple-300 border-purple-500/30 flex items-center gap-1">
                                        {option}
                                        <button
                                            onClick={() => removeEthnicity(option)}
                                            className="ml-1 hover:text-red-300"
                                        >
                                            <X className="w-3 h-3" />
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
            <Card className="bg-gray-800/50 border-gray-700 backdrop-blur-sm">
                <CardHeader className="pb-4">
                    <CardTitle className="text-lg font-semibold text-white">Age</CardTitle>
                    <p className="text-sm text-gray-300">Select ages (max 3)</p>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2 max-h-40 overflow-y-auto">
                        {AGE_OPTIONS.map((option) => (
                            <Button
                                key={option}
                                variant={ageRanges.includes(option) ? "default" : "outline"}
                                size="sm"
                                onClick={() => handleAgeToggle(option)}
                                disabled={!ageRanges.includes(option) && ageRanges.length >= 3}
                                className={`justify-start text-left h-auto p-3 ${
                                    ageRanges.includes(option)
                                        ? "bg-purple-600 text-white border-purple-600"
                                        : ageRanges.length >= 3
                                            ? "bg-gray-600/50 border-gray-500 text-gray-400 cursor-not-allowed"
                                            : "bg-gray-700/50 border-gray-600 text-gray-300 hover:text-white hover:border-purple-500"
                                }`}
                            >
                                {option}
                            </Button>
                        ))}
                    </div>
                    
                    {ageRanges.length > 0 && (
                        <div className="pt-2">
                            <Label className="text-sm font-medium text-gray-300">Selected Ages ({ageRanges.length}/3)</Label>
                            <div className="mt-2 flex flex-wrap gap-2">
                                {ageRanges.map((option) => (
                                    <Badge key={option} variant="outline" className="text-xs bg-purple-600/20 text-purple-300 border-purple-500/30 flex items-center gap-1">
                                        {option}
                                        <button
                                            onClick={() => removeAge(option)}
                                            className="ml-1 hover:text-red-300"
                                        >
                                            <X className="w-3 h-3" />
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
            <Card className="bg-gray-800/50 border-gray-700 backdrop-blur-sm">
                <CardHeader className="pb-4">
                    <CardTitle className="text-lg font-semibold text-white">Fans of</CardTitle>
                    <p className="text-sm text-gray-300">Select subjects (max 3)</p>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2 max-h-40 overflow-y-auto">
                        {FANS_OF_OPTIONS.map((option) => (
                            <Button
                                key={option}
                                variant={fansOf.includes(option) ? "default" : "outline"}
                                size="sm"
                                onClick={() => handleFansOfToggle(option)}
                                disabled={!fansOf.includes(option) && fansOf.length >= 3}
                                className={`justify-start text-left h-auto p-3 ${
                                    fansOf.includes(option)
                                        ? "bg-purple-600 text-white border-purple-600"
                                        : fansOf.length >= 3
                                            ? "bg-gray-600/50 border-gray-500 text-gray-400 cursor-not-allowed"
                                            : "bg-gray-700/50 border-gray-600 text-gray-300 hover:text-white hover:border-purple-500"
                                }`}
                            >
                                {option}
                            </Button>
                        ))}
                    </div>
                    
                    {fansOf.length > 0 && (
                        <div className="pt-2">
                            <Label className="text-sm font-medium text-gray-300">Selected Subjects ({fansOf.length}/3)</Label>
                            <div className="mt-2 flex flex-wrap gap-2">
                                {fansOf.map((option) => (
                                    <Badge key={option} variant="outline" className="text-xs bg-purple-600/20 text-purple-300 border-purple-500/30 flex items-center gap-1">
                                        {option}
                                        <button
                                            onClick={() => removeFansOf(option)}
                                            className="ml-1 hover:text-red-300"
                                        >
                                            <X className="w-3 h-3" />
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
            <div className="min-h-screen bg-gradient-to-br from-purple-950 via-purple-900 to-purple-950 pt-32 pb-6 px-6">
                {/* Progress Bar */}
                <div className="max-w-6xl mx-auto mb-8">
                    <div className="flex items-center justify-between mb-4">
                        <h1 className="text-2xl font-bold text-white">Manual Strategy Generation</h1>
                        <span className="text-gray-300 text-sm">Step {currentStep} of 2</span>
                    </div>

                    {/* Step Indicator */}
                    <div className="flex items-center gap-4 mb-6">
                        <div className={`flex items-center gap-2 ${currentStep >= 1 ? 'text-purple-300' : 'text-gray-500'}`}>
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${currentStep >= 1 ? 'bg-purple-600 text-white' : 'bg-gray-700 text-gray-400'
                                }`}>
                                1
                            </div>
                            <span className="text-sm font-medium">Campaign Setup</span>
                        </div>
                        <ChevronRight className="text-gray-500" />
                        <div className={`flex items-center gap-2 ${currentStep >= 2 ? 'text-purple-300' : 'text-gray-500'}`}>
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${currentStep >= 2 ? 'bg-purple-600 text-white' : 'bg-gray-700 text-gray-400'
                                }`}>
                                2
                            </div>
                            <span className="text-sm font-medium">Audience Targeting</span>
                        </div>
                    </div>
                </div>

                {/* Main Content */}
                <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Left Panel - Form */}
                    <div className="space-y-6">
                        {currentStep === 1 ? <StepOneForm /> : <StepTwoForm />}

                        {/* Navigation Buttons */}
                        <div className="flex gap-4">
                            {currentStep === 2 && (
                                <Button
                                    onClick={() => setCurrentStep(1)}
                                    variant="outline"
                                    className="flex-1 bg-gray-800/50 border-gray-600 text-gray-300 hover:text-white hover:border-purple-500"
                                >
                                    <ArrowLeft className="w-4 h-4 mr-2" />
                                    Back to Step 1
                                </Button>
                            )}

                            {currentStep === 1 && (
                                <Button
                                    onClick={handleNextStep}
                                    className="flex-1 bg-gradient-to-r from-purple-600 to-purple-500 hover:from-purple-700 hover:to-purple-600 text-white border-0 shadow-lg shadow-purple-500/25 transition-all duration-200"
                                >
                                    Next Step
                                    <ArrowRight className="w-4 h-4 ml-2" />
                                </Button>
                            )}

                            {currentStep === 2 && (
                                <Button
                                    onClick={handleGenerate}
                                    disabled={isGenerating || !canGenerate()}
                                    className="flex-1 cursor-pointer bg-gradient-to-r from-purple-600 to-purple-500 hover:from-purple-700 hover:to-purple-600 text-white border-0 shadow-lg shadow-purple-500/25 transition-all duration-200"
                                    size="lg"
                                >
                                    {isGenerating ? (
                                        <>
                                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                                            Generating...
                                        </>
                                    ) : (
                                        <>
                                            <Play className="w-4 h-4 mr-2" />
                                            ✨ GENERATE A MARKETING STRENGTH
                                        </>
                                    )}
                                </Button>
                            )}
                        </div>
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
                                            className={`text-xs ${isGenerating
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
        </main>
    );
} 