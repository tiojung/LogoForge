import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { isUnauthorizedError } from "@/lib/authUtils";
import { apiRequest } from "@/lib/queryClient";
import { ObjectUploader } from "@/components/ObjectUploader";
import { Wand2, Upload, Edit3, Sparkles, Download, Palette, Zap, Crown } from "lucide-react";
import type { UploadResult } from '@uppy/core';

interface LogoVariation {
  id: string;
  concept: string;
  style: string;
  colors: string[];
  description: string;
  prompt: string;
  imageUrl?: string;
  generated?: boolean;
  error?: string;
}

export default function Home() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [activeTab, setActiveTab] = useState("describe");
  const [businessName, setBusinessName] = useState("");
  const [description, setDescription] = useState("");
  const [selectedStyle, setSelectedStyle] = useState("modern");
  const [generatedLogos, setGeneratedLogos] = useState<LogoVariation[]>([]);
  const [selectedLogoId, setSelectedLogoId] = useState<string | null>(null);
  const [referenceImages, setReferenceImages] = useState<string[]>([]);

  // Fetch user credits
  const { data: creditsData } = useQuery({
    queryKey: ["/api/credits"],
    retry: false,
  });

  // Logo generation mutation
  const generateLogosMutation = useMutation({
    mutationFn: async (data: {
      businessName: string;
      description?: string;
      style?: string;
    }) => {
      const response = await apiRequest("POST", "/api/generate-logos", data);
      return response.json();
    },
    onSuccess: (data) => {
      setGeneratedLogos(data.logos);
      queryClient.invalidateQueries({ queryKey: ["/api/credits"] });
      toast({
        title: "🎨 Logos Generated!",
        description: `Created ${data.logos.length} unique logo variations.`,
      });
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Authentication Required",
          description: "Please log in to continue.",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 1000);
        return;
      }
      toast({
        title: "Generation Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Logo export mutation
  const exportLogoMutation = useMutation({
    mutationFn: async (logoData: LogoVariation) => {
      const response = await apiRequest("POST", "/api/export-logo", {
        logoData,
        projectId: "current",
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/credits"] });
      toast({
        title: "✨ Export Successful!",
        description: "Your high-resolution logo is ready!",
      });
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Authentication Required",
          description: "Please log in to continue.",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 1000);
        return;
      }
      toast({
        title: "Export Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleGenerateLogos = () => {
    if (!businessName.trim()) {
      toast({
        title: "Business Name Required",
        description: "Please enter your business name to get started.",
        variant: "destructive",
      });
      return;
    }

    generateLogosMutation.mutate({
      businessName: businessName.trim(),
      description: description.trim() || undefined,
      style: selectedStyle,
    });
  };

  const handleReferenceUpload = async () => {
    const response = await apiRequest("POST", "/api/objects/upload", {});
    const data = await response.json();
    return {
      method: 'PUT' as const,
      url: data.uploadURL,
    };
  };

  const handleUploadComplete = (result: UploadResult<Record<string, unknown>, Record<string, unknown>>) => {
    if (result?.successful && result.successful.length > 0) {
      const uploadedUrls = result.successful.map(file => file.uploadURL as string);
      setReferenceImages(prev => [...prev, ...uploadedUrls]);
      toast({
        title: "Upload Successful",
        description: `Added ${result.successful.length} reference image(s).`,
      });
    }
  };

  const currentCredits = (creditsData as any)?.currentCredits || 0;
  const selectedLogo = generatedLogos.find(logo => logo.id === selectedLogoId);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-indigo-50/30">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b bg-white/80 backdrop-blur-xl">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 shadow-lg">
                <Sparkles className="h-5 w-5 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">Logo Forge</h1>
                <p className="text-xs text-gray-500">Professional Logo Design</p>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <Badge variant="secondary" className="flex items-center gap-2 bg-emerald-50 text-emerald-700 border-emerald-200">
                <Crown className="h-3 w-3" />
                {currentCredits} Credits
              </Badge>
              
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-gray-700">
                  {(user as any)?.firstName || 'User'}
                </span>
                <Button
                  onClick={() => window.location.href = '/api/logout'}
                  variant="outline"
                  size="sm"
                >
                  Logout
                </Button>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-6 py-8">
        <div className="grid lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
          {/* Creation Panel */}
          <div className="lg:col-span-2 space-y-6">
            {/* Hero Section */}
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-gray-900 mb-3">
                Create Your Perfect Logo
              </h2>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                AI-powered logo design that understands your vision. Describe, upload, or modify - your perfect brand identity is just moments away.
              </p>
            </div>

            {/* Creation Hub */}
            <Card className="border-0 shadow-xl bg-white/90 backdrop-blur-sm">
              <CardContent className="p-6">
                <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                  <TabsList className="grid w-full grid-cols-3 bg-gray-100/80">
                    <TabsTrigger value="describe" className="flex items-center gap-2">
                      <Wand2 className="h-4 w-4" />
                      Describe
                    </TabsTrigger>
                    <TabsTrigger value="upload" className="flex items-center gap-2">
                      <Upload className="h-4 w-4" />
                      Reference
                    </TabsTrigger>
                    <TabsTrigger value="modify" className="flex items-center gap-2">
                      <Edit3 className="h-4 w-4" />
                      Modify
                    </TabsTrigger>
                  </TabsList>

                  {/* Describe Tab */}
                  <TabsContent value="describe" className="space-y-6 mt-6">
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Business Name
                        </label>
                        <Input 
                          placeholder="e.g., TechFlow Solutions"
                          value={businessName}
                          onChange={(e) => setBusinessName(e.target.value)}
                          className="h-12 border-gray-200 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Describe Your Vision
                        </label>
                        <Textarea 
                          placeholder="A modern, minimalist logo for a tech startup. Clean lines, professional blue colors, representing innovation and trust..."
                          value={description}
                          onChange={(e) => setDescription(e.target.value)}
                          className="min-h-[100px] border-gray-200 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 resize-none"
                        />
                      </div>

                      {/* Style Selection */}
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-3">
                          Style Direction
                        </label>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                          {[
                            { id: 'modern', icon: Zap, label: 'Modern', desc: 'Clean & minimal' },
                            { id: 'classic', icon: Crown, label: 'Classic', desc: 'Timeless & elegant' },
                            { id: 'playful', icon: Sparkles, label: 'Playful', desc: 'Fun & creative' },
                            { id: 'organic', icon: Palette, label: 'Organic', desc: 'Natural & flowing' }
                          ].map((style) => (
                            <Button
                              key={style.id}
                              variant={selectedStyle === style.id ? "default" : "outline"}
                              className={`h-auto p-4 flex flex-col items-center gap-2 transition-all ${
                                selectedStyle === style.id 
                                  ? 'bg-indigo-500 text-white shadow-lg border-indigo-500' 
                                  : 'hover:border-indigo-300 hover:bg-indigo-50'
                              }`}
                              onClick={() => setSelectedStyle(style.id)}
                            >
                              <style.icon className="h-5 w-5" />
                              <div className="text-center">
                                <div className="font-semibold text-sm">{style.label}</div>
                                <div className="text-xs opacity-75">{style.desc}</div>
                              </div>
                            </Button>
                          ))}
                        </div>
                      </div>
                    </div>
                  </TabsContent>

                  {/* Upload Reference Tab */}
                  <TabsContent value="upload" className="space-y-6 mt-6">
                    <ObjectUploader
                      maxNumberOfFiles={5}
                      maxFileSize={10485760}
                      onGetUploadParameters={handleReferenceUpload}
                      onComplete={handleUploadComplete}
                      buttonClassName="w-full h-40 border-2 border-dashed border-gray-300 rounded-xl hover:border-indigo-400 transition-all duration-200 bg-gradient-to-br from-gray-50 to-indigo-50/50 hover:from-indigo-50 hover:to-indigo-100"
                    >
                      <div className="text-center">
                        <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                        <h3 className="text-lg font-semibold text-gray-700 mb-2">
                          Upload Reference Images
                        </h3>
                        <p className="text-sm text-gray-500 mb-2">
                          Drag & drop or click to browse
                        </p>
                        <Badge variant="secondary" className="text-xs">
                          JPG, PNG, SVG up to 10MB
                        </Badge>
                      </div>
                    </ObjectUploader>
                    
                    {referenceImages.length > 0 && (
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                        {referenceImages.map((imageUrl, index) => (
                          <div key={index} className="relative group">
                            <img 
                              src={imageUrl} 
                              alt={`Reference ${index + 1}`}
                              className="w-full h-32 object-cover rounded-lg border-2 border-gray-200 shadow-sm"
                            />
                            <Button
                              size="sm"
                              variant="destructive"
                              className="absolute -top-2 -right-2 w-6 h-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity rounded-full shadow-lg"
                              onClick={() => setReferenceImages(prev => prev.filter((_, i) => i !== index))}
                            >
                              ×
                            </Button>
                          </div>
                        ))}
                      </div>
                    )}
                  </TabsContent>

                  {/* Modify Tab */}
                  <TabsContent value="modify" className="space-y-6 mt-6">
                    <ObjectUploader
                      maxNumberOfFiles={1}
                      maxFileSize={10485760}
                      onGetUploadParameters={handleReferenceUpload}
                      onComplete={handleUploadComplete}
                      buttonClassName="w-full h-40 border-2 border-dashed border-gray-300 rounded-xl hover:border-indigo-400 transition-all duration-200 bg-gradient-to-br from-gray-50 to-purple-50/50"
                    >
                      <div className="text-center">
                        <Edit3 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                        <h3 className="text-lg font-semibold text-gray-700 mb-2">
                          Upload Current Logo
                        </h3>
                        <p className="text-sm text-gray-500 mb-2">
                          We'll analyze and suggest improvements
                        </p>
                        <Badge variant="secondary" className="text-xs">
                          AI-powered enhancement
                        </Badge>
                      </div>
                    </ObjectUploader>
                    
                    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-4">
                      <h4 className="font-semibold text-blue-900 mb-2">Modification Options</h4>
                      <ul className="text-sm text-blue-700 space-y-1">
                        <li>• Color palette adjustments</li>
                        <li>• Typography refinements</li>
                        <li>• Style modernization</li>
                        <li>• Format optimization</li>
                      </ul>
                    </div>
                  </TabsContent>
                </Tabs>

                {/* Generate Button */}
                <div className="pt-6 border-t mt-8">
                  <Button
                    onClick={handleGenerateLogos}
                    disabled={generateLogosMutation.isPending || !businessName.trim()}
                    className="w-full h-12 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 shadow-lg transition-all duration-200"
                  >
                    {generateLogosMutation.isPending ? (
                      <>
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                        Creating Magic...
                      </>
                    ) : (
                      <>
                        <Sparkles className="h-5 w-5 mr-2" />
                        Generate Logos
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Results Panel */}
          <div className="space-y-6">
            {/* Generated Logos */}
            {generatedLogos.length > 0 && (
              <Card className="border-0 shadow-xl bg-white/90 backdrop-blur-sm">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-bold text-gray-900">Generated Logos</h3>
                    <Badge variant="outline" className="text-xs">
                      {generatedLogos.length} variations
                    </Badge>
                  </div>
                  
                  <div className="space-y-4">
                    {generatedLogos.map((logo, index) => (
                      <div
                        key={logo.id}
                        className={`relative p-4 rounded-lg border-2 cursor-pointer transition-all ${
                          selectedLogoId === logo.id
                            ? 'border-indigo-500 bg-indigo-50'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                        onClick={() => setSelectedLogoId(logo.id)}
                      >
                        {logo.imageUrl ? (
                          <img
                            src={logo.imageUrl}
                            alt={`Logo variation ${index + 1}`}
                            className="w-full h-32 object-contain bg-white rounded-lg mb-3 shadow-sm"
                          />
                        ) : (
                          <div className="w-full h-32 bg-gray-100 rounded-lg mb-3 flex items-center justify-center">
                            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-indigo-500"></div>
                          </div>
                        )}
                        
                        <div className="text-sm">
                          <p className="font-medium text-gray-900 mb-1">{logo.concept}</p>
                          <p className="text-gray-600 text-xs">{logo.description}</p>
                        </div>
                        
                        {selectedLogoId === logo.id && (
                          <div className="absolute top-2 right-2">
                            <Badge className="bg-indigo-500 text-white">Selected</Badge>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                  
                  {selectedLogo && (
                    <Button
                      onClick={() => exportLogoMutation.mutate(selectedLogo)}
                      disabled={exportLogoMutation.isPending}
                      className="w-full mt-4 bg-emerald-500 hover:bg-emerald-600"
                    >
                      {exportLogoMutation.isPending ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                          Exporting...
                        </>
                      ) : (
                        <>
                          <Download className="h-4 w-4 mr-2" />
                          Export High-Res (1 Credit)
                        </>
                      )}
                    </Button>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Quick Tips */}
            <Card className="border-0 shadow-lg bg-gradient-to-br from-purple-50 to-indigo-50">
              <CardContent className="p-6">
                <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-purple-600" />
                  Pro Tips
                </h3>
                <div className="space-y-3 text-sm text-gray-700">
                  <div className="flex items-start gap-2">
                    <div className="w-2 h-2 bg-purple-400 rounded-full mt-2"></div>
                    <p>Be specific about your industry and target audience</p>
                  </div>
                  <div className="flex items-start gap-2">
                    <div className="w-2 h-2 bg-indigo-400 rounded-full mt-2"></div>
                    <p>Upload reference images for better style matching</p>
                  </div>
                  <div className="flex items-start gap-2">
                    <div className="w-2 h-2 bg-blue-400 rounded-full mt-2"></div>
                    <p>Try different style directions for variety</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}