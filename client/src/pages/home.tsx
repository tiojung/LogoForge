import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { isUnauthorizedError } from "@/lib/authUtils";
import { apiRequest } from "@/lib/queryClient";
import { ObjectUploader } from "@/components/ObjectUploader";
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

interface User {
  id: string;
  credits: number;
  firstName?: string;
  lastName?: string;
}

export default function Home() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [activeTab, setActiveTab] = useState<'describe' | 'upload' | 'modify'>('describe');
  const [businessName, setBusinessName] = useState("");
  const [description, setDescription] = useState("");
  const [selectedStyle, setSelectedStyle] = useState("modern");
  const [generatedLogos, setGeneratedLogos] = useState<LogoVariation[]>([]);
  const [selectedLogoId, setSelectedLogoId] = useState<string | null>(null);
  const [referenceImages, setReferenceImages] = useState<string[]>([]);

  // Fetch user data
  const { data: userData, isLoading: userLoading } = useQuery<User>({
    queryKey: ["/api/auth/user"],
    retry: false,
  });

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
      queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
      queryClient.invalidateQueries({ queryKey: ["/api/credits"] });
      toast({
        title: "Logos Generated!",
        description: `Created ${data.logos.length} logo variations.`,
      });
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Unauthorized",
          description: "You are logged out. Logging in again...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
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
        projectId: "current", // In a real app, this would be the current project ID
      });
      return response.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
      queryClient.invalidateQueries({ queryKey: ["/api/credits"] });
      toast({
        title: "Export Successful!",
        description: "Your logo has been exported in high resolution.",
      });
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Unauthorized",
          description: "You are logged out. Logging in again...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
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
        description: "Please enter your business name.",
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

  const handleLogoSelect = (logoId: string) => {
    setSelectedLogoId(logoId);
  };

  const handleExportLogo = () => {
    const selectedLogo = generatedLogos.find(logo => logo.id === selectedLogoId);
    if (!selectedLogo) {
      toast({
        title: "No Logo Selected",
        description: "Please select a logo to export.",
        variant: "destructive",
      });
      return;
    }

    exportLogoMutation.mutate(selectedLogo);
  };

  const handleReferenceUpload = async () => {
    return {
      method: 'PUT' as const,
      url: await apiRequest("POST", "/api/objects/upload", {}).then(res => res.json()).then(data => data.uploadURL),
    };
  };

  const handleUploadComplete = (result: UploadResult<Record<string, unknown>, Record<string, unknown>>) => {
    if (result.successful.length > 0) {
      const uploadedUrls = result.successful.map(file => file.uploadURL as string);
      setReferenceImages(prev => [...prev, ...uploadedUrls]);
      toast({
        title: "Upload Successful",
        description: `Uploaded ${result.successful.length} reference image(s).`,
      });
    }
  };

  const selectedLogo = generatedLogos.find(logo => logo.id === selectedLogoId);
  const currentCredits = userData?.credits || 0;

  if (userLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-100 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-violet-500 rounded-xl flex items-center justify-center">
                  <i className="fas fa-magic text-white text-lg"></i>
                </div>
                <h1 className="text-xl font-bold text-gray-900">LogoCraft AI</h1>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="hidden sm:flex items-center space-x-2 bg-emerald-50 px-4 py-2 rounded-full">
                <i className="fas fa-coins text-emerald-600"></i>
                <span className="text-emerald-700 font-medium">{currentCredits} Credits</span>
              </div>
              
              <div className="flex items-center space-x-3">
                <Button
                  onClick={() => window.location.href = '/api/logout'}
                  variant="outline"
                  className="hidden sm:block"
                >
                  Logout
                </Button>
                <div className="flex items-center space-x-2">
                  <span className="hidden sm:inline text-gray-700">
                    {userData?.firstName || 'User'}
                  </span>
                  <i className="fas fa-user text-gray-600"></i>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left Panel: Creation Hub */}
          <div className="lg:col-span-2 space-y-6">
            {/* Welcome Section */}
            <Card className="p-6 border-0 shadow-sm">
              <CardContent className="p-0">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Create Your Perfect Logo</h2>
                <p className="text-gray-600 mb-6">
                  Describe your vision, upload references, or modify existing logos with AI-powered precision.
                </p>
                
                {/* Tab Navigation */}
                <div className="flex space-x-1 bg-gray-100 p-1 rounded-xl mb-6">
                  <Button
                    variant={activeTab === 'describe' ? 'default' : 'ghost'}
                    className={`flex-1 ${activeTab === 'describe' ? 'bg-white text-indigo-600 shadow-sm' : 'text-gray-600'}`}
                    onClick={() => setActiveTab('describe')}
                  >
                    <i className="fas fa-pen-nib mr-2"></i>Describe
                  </Button>
                  <Button
                    variant={activeTab === 'upload' ? 'default' : 'ghost'}
                    className={`flex-1 ${activeTab === 'upload' ? 'bg-white text-indigo-600 shadow-sm' : 'text-gray-600'}`}
                    onClick={() => setActiveTab('upload')}
                  >
                    <i className="fas fa-upload mr-2"></i>Upload Reference
                  </Button>
                  <Button
                    variant={activeTab === 'modify' ? 'default' : 'ghost'}
                    className={`flex-1 ${activeTab === 'modify' ? 'bg-white text-indigo-600 shadow-sm' : 'text-gray-600'}`}
                    onClick={() => setActiveTab('modify')}
                  >
                    <i className="fas fa-edit mr-2"></i>Modify Existing
                  </Button>
                </div>

                {/* Tab Content: Describe */}
                {activeTab === 'describe' && (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Business Name</label>
                      <Input 
                        placeholder="Enter your business name..."
                        value={businessName}
                        onChange={(e) => setBusinessName(e.target.value)}
                        className="w-full"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Describe Your Vision</label>
                      <Textarea 
                        placeholder="A modern, minimalist logo for a tech startup. Think clean lines, professional blue colors, representing innovation and trust..."
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        className="w-full h-24 resize-none"
                      />
                    </div>

                    {/* Style Preferences */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-3">Style Preferences</label>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                        {[
                          { id: 'modern', icon: 'fas fa-layer-group', label: 'Modern' },
                          { id: 'classic', icon: 'fas fa-university', label: 'Classic' },
                          { id: 'playful', icon: 'fas fa-laugh', label: 'Playful' },
                          { id: 'organic', icon: 'fas fa-leaf', label: 'Organic' }
                        ].map((style) => (
                          <Button
                            key={style.id}
                            variant={selectedStyle === style.id ? 'default' : 'outline'}
                            className={`p-3 h-auto flex-col ${
                              selectedStyle === style.id 
                                ? 'border-2 border-indigo-500 bg-indigo-50 text-indigo-700' 
                                : 'border border-gray-200 text-gray-700'
                            }`}
                            onClick={() => setSelectedStyle(style.id)}
                          >
                            <i className={`${style.icon} mb-2`}></i>
                            <div className="text-sm font-medium">{style.label}</div>
                          </Button>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* Tab Content: Upload Reference */}
                {activeTab === 'upload' && (
                  <div className="space-y-4">
                    <ObjectUploader
                      maxNumberOfFiles={5}
                      maxFileSize={10485760}
                      onGetUploadParameters={handleReferenceUpload}
                      onComplete={handleUploadComplete}
                      buttonClassName="w-full h-32 border-2 border-dashed border-gray-300 rounded-xl hover:border-indigo-400 transition-colors bg-gray-50 hover:bg-indigo-50"
                    >
                      <div className="text-center">
                        <i className="fas fa-cloud-upload-alt text-4xl text-gray-400 mb-4"></i>
                        <p className="text-lg font-medium text-gray-700 mb-2">Drag & drop reference images</p>
                        <p className="text-sm text-gray-500 mb-4">Or click to browse (JPG, PNG, SVG up to 10MB)</p>
                      </div>
                    </ObjectUploader>
                    
                    {referenceImages.length > 0 && (
                      <div className="grid grid-cols-3 gap-4">
                        {referenceImages.map((imageUrl, index) => (
                          <div key={index} className="relative group">
                            <img 
                              src={imageUrl} 
                              alt={`Reference ${index + 1}`}
                              className="w-full h-24 object-cover rounded-lg border border-gray-200"
                            />
                            <Button
                              size="sm"
                              variant="destructive"
                              className="absolute top-2 right-2 w-6 h-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                              onClick={() => setReferenceImages(prev => prev.filter((_, i) => i !== index))}
                            >
                              <i className="fas fa-times text-xs"></i>
                            </Button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* Tab Content: Modify Existing */}
                {activeTab === 'modify' && (
                  <div className="space-y-4">
                    <ObjectUploader
                      maxNumberOfFiles={1}
                      maxFileSize={10485760}
                      onGetUploadParameters={handleReferenceUpload}
                      onComplete={handleUploadComplete}
                      buttonClassName="w-full border-2 border-dashed border-gray-300 rounded-xl p-6 text-center hover:border-indigo-400 transition-colors"
                    >
                      <div className="text-center">
                        <i className="fas fa-edit text-3xl text-gray-400 mb-3"></i>
                        <p className="text-lg font-medium text-gray-700 mb-2">Upload your current logo</p>
                        <p className="text-sm text-gray-500 mb-4">We'll analyze it and suggest improvements</p>
                      </div>
                    </ObjectUploader>
                    
                    <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                      <h4 className="font-medium text-blue-900 mb-2">What would you like to modify?</h4>
                      <div className="space-y-2">
                        {[
                          'Change colors',
                          'Add/edit text', 
                          'Refine shapes',
                          'Change style'
                        ].map((option) => (
                          <label key={option} className="flex items-center">
                            <input type="checkbox" className="w-4 h-4 text-indigo-600 rounded border-gray-300" />
                            <span className="ml-2 text-sm text-blue-800">{option}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* Generate Button */}
                <Button 
                  className="w-full py-4 bg-gradient-to-r from-indigo-600 to-violet-600 text-white rounded-xl font-medium hover:from-indigo-700 hover:to-violet-700 transition-all shadow-lg hover:shadow-xl"
                  onClick={handleGenerateLogos}
                  disabled={generateLogosMutation.isPending || currentCredits < 1}
                >
                  {generateLogosMutation.isPending ? (
                    <>
                      <i className="fas fa-spinner fa-spin mr-2"></i>
                      Generating...
                    </>
                  ) : (
                    <>
                      <i className="fas fa-magic mr-2"></i>
                      Generate Logos (1 Credit)
                    </>
                  )}
                </Button>

                {currentCredits < 1 && (
                  <p className="text-sm text-red-600 text-center mt-2">
                    Insufficient credits. Please purchase more to continue.
                  </p>
                )}
              </CardContent>
            </Card>

            {/* Generated Results Section */}
            {generatedLogos.length > 0 && (
              <Card className="p-6 border-0 shadow-sm">
                <CardContent className="p-0">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-xl font-bold text-gray-900">Generated Logos</h3>
                    <div className="flex items-center space-x-2 text-sm text-gray-600">
                      <i className="fas fa-sync-alt"></i>
                      <span>Just generated</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
                    {generatedLogos.map((logo) => (
                      <Button
                        key={logo.id}
                        variant="ghost"
                        className={`group relative bg-gray-50 rounded-xl p-6 hover:bg-gray-100 transition-all h-auto border-2 ${
                          selectedLogoId === logo.id 
                            ? 'border-indigo-300 bg-indigo-50' 
                            : 'border-transparent hover:border-indigo-300'
                        }`}
                        onClick={() => handleLogoSelect(logo.id)}
                      >
                        <div className="aspect-square flex items-center justify-center mb-3">
                          {logo.imageUrl ? (
                            <img 
                              src={logo.imageUrl} 
                              alt={logo.concept}
                              className="w-16 h-16 object-contain"
                            />
                          ) : (
                            <div className="w-16 h-16 bg-gray-200 rounded-lg flex items-center justify-center">
                              <i className="fas fa-image text-gray-400"></i>
                            </div>
                          )}
                        </div>
                        <div className="text-center">
                          <div className="font-medium text-gray-900 mb-1">{businessName}</div>
                          <div className={`text-xs ${selectedLogoId === logo.id ? 'text-indigo-600' : 'text-gray-500'}`}>
                            {logo.style} • {logo.concept}
                          </div>
                        </div>
                        {selectedLogoId === logo.id && (
                          <div className="absolute top-3 right-3">
                            <div className="w-8 h-8 bg-indigo-600 rounded-full flex items-center justify-center">
                              <i className="fas fa-check text-white text-sm"></i>
                            </div>
                          </div>
                        )}
                      </Button>
                    ))}
                  </div>

                  <Button 
                    variant="outline"
                    className="w-full py-3 bg-gray-100 text-gray-700 rounded-xl font-medium hover:bg-gray-200 transition-colors"
                    onClick={handleGenerateLogos}
                    disabled={generateLogosMutation.isPending || currentCredits < 1}
                  >
                    <i className="fas fa-plus mr-2"></i>
                    Generate 6 More Variations (1 Credit)
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Right Panel: Preview & Controls */}
          <div className="space-y-6">
            {/* Live Preview */}
            <Card className="p-6 border-0 shadow-sm sticky top-24">
              <CardContent className="p-0">
                <h3 className="text-lg font-bold text-gray-900 mb-4">Live Preview</h3>
                
                {/* Selected Logo Display */}
                <div className="bg-gray-50 rounded-xl p-8 mb-6 text-center">
                  <div className="w-24 h-24 mx-auto mb-4 flex items-center justify-center">
                    {selectedLogo?.imageUrl ? (
                      <img 
                        src={selectedLogo.imageUrl} 
                        alt={selectedLogo.concept}
                        className="w-full h-full object-contain"
                      />
                    ) : (
                      <div className="w-full h-full bg-gray-200 rounded-lg flex items-center justify-center">
                        <i className="fas fa-image text-gray-400 text-2xl"></i>
                      </div>
                    )}
                  </div>
                  <div className="text-lg font-medium text-gray-900">{businessName || "Your Business"}</div>
                  {selectedLogo && (
                    <div className="text-sm text-gray-500">{selectedLogo.style} • {selectedLogo.concept}</div>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="space-y-3">
                  <Button 
                    className="w-full py-3 bg-emerald-600 text-white rounded-xl font-medium hover:bg-emerald-700 transition-colors"
                    onClick={handleExportLogo}
                    disabled={!selectedLogo || exportLogoMutation.isPending || currentCredits < 3}
                  >
                    {exportLogoMutation.isPending ? (
                      <>
                        <i className="fas fa-spinner fa-spin mr-2"></i>
                        Exporting...
                      </>
                    ) : (
                      <>
                        <i className="fas fa-download mr-2"></i>
                        Export Logo (3 Credits)
                      </>
                    )}
                  </Button>

                  {currentCredits < 3 && (
                    <p className="text-sm text-red-600 text-center">
                      Need 3 credits to export
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Credit Status */}
            <Card className="p-6 border-0 shadow-sm bg-gradient-to-br from-emerald-50 to-blue-50 border-emerald-100">
              <CardContent className="p-0">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-bold text-gray-900">Credit Status</h3>
                  <i className="fas fa-coins text-2xl text-emerald-600"></i>
                </div>
                
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Available Credits</span>
                    <span className="font-bold text-xl text-emerald-600">{currentCredits}</span>
                  </div>
                  
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-gray-500">Next Generation</span>
                    <span className="text-gray-700">1 Credit</span>
                  </div>
                  
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-gray-500">Logo Export</span>
                    <span className="text-gray-700">3 Credits</span>
                  </div>
                  
                  <div className="pt-3 border-t border-gray-200">
                    <Button className="w-full py-2 bg-emerald-600 text-white rounded-lg text-sm font-medium hover:bg-emerald-700 transition-colors">
                      <i className="fas fa-plus mr-2"></i>
                      Buy More Credits
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

      {/* Floating Help Button */}
      <div className="fixed bottom-6 right-6 z-50">
        <Button className="w-14 h-14 bg-indigo-600 text-white rounded-full shadow-lg hover:bg-indigo-700 transition-all hover:scale-105 p-0">
          <i className="fas fa-question text-xl"></i>
        </Button>
      </div>
    </div>
  );
}
