import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Sparkles, 
  Wand2, 
  Upload, 
  Edit3, 
  Download, 
  Zap, 
  Crown, 
  Palette,
  ArrowRight,
  Star,
  Check
} from "lucide-react";

export default function Landing() {
  const features = [
    {
      icon: Wand2,
      title: "AI-Powered Design",
      description: "Advanced AI creates unique logos tailored to your business vision"
    },
    {
      icon: Upload,
      title: "Reference Matching",
      description: "Upload inspiration images and our AI matches the style perfectly"
    },
    {
      icon: Edit3,
      title: "Logo Enhancement",
      description: "Transform existing logos with color changes and style improvements"
    },
    {
      icon: Download,
      title: "High-Resolution Export",
      description: "Download professional-quality files ready for any use case"
    }
  ];

  const styles = [
    { id: 'modern', icon: Zap, label: 'Modern', desc: 'Clean & minimal' },
    { id: 'classic', icon: Crown, label: 'Classic', desc: 'Timeless & elegant' },
    { id: 'playful', icon: Sparkles, label: 'Playful', desc: 'Fun & creative' },
    { id: 'organic', icon: Palette, label: 'Organic', desc: 'Natural & flowing' }
  ];

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
                <h1 className="text-xl font-bold text-gray-900">LogoCraft AI</h1>
                <p className="text-xs text-gray-500">Professional Logo Design</p>
              </div>
            </div>
            
            <Button
              onClick={() => window.location.href = '/api/login'}
              className="bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 shadow-lg"
            >
              Get Started
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 text-center">
        <div className="container mx-auto px-6">
          <div className="max-w-4xl mx-auto">
            <Badge className="mb-6 bg-gradient-to-r from-indigo-500 to-purple-600 text-white border-0">
              <Sparkles className="h-3 w-3 mr-1" />
              AI-Powered Logo Design
            </Badge>
            
            <h1 className="text-5xl md:text-7xl font-bold text-gray-900 mb-6 leading-tight">
              Create Perfect Logos
              <span className="bg-gradient-to-r from-indigo-500 to-purple-600 bg-clip-text text-transparent block">
                In Minutes
              </span>
            </h1>
            
            <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto leading-relaxed">
              Professional logo design powered by AI. Describe your vision, upload references, or modify existing logos with precision and creativity.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
              <Button
                onClick={() => window.location.href = '/api/login'}
                size="lg"
                className="h-14 px-8 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 shadow-xl text-lg"
              >
                <Sparkles className="mr-2 h-5 w-5" />
                Start Creating Now
              </Button>
              
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Crown className="h-4 w-4 text-emerald-500" />
                15 Free Credits • No Credit Card Required
              </div>
            </div>

            {/* Trust Indicators */}
            <div className="flex justify-center items-center gap-6 text-sm text-gray-500">
              <div className="flex items-center gap-1">
                <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                <span>AI-Powered</span>
              </div>
              <div className="flex items-center gap-1">
                <Check className="h-4 w-4 text-green-500" />
                <span>High Resolution</span>
              </div>
              <div className="flex items-center gap-1">
                <Zap className="h-4 w-4 text-blue-500" />
                <span>Instant Results</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white/50">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Everything You Need for Perfect Logos
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Three powerful ways to create your ideal brand identity with AI assistance
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <Card key={index} className="border-0 shadow-lg hover:shadow-xl transition-shadow bg-white/80 backdrop-blur-sm">
                <CardContent className="p-6 text-center">
                  <div className="flex justify-center mb-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 shadow-lg">
                      <feature.icon className="h-6 w-6 text-white" />
                    </div>
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-gray-600">
                    {feature.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Style Showcase */}
      <section className="py-20">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Any Style, Any Vision
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              From modern minimalism to classic elegance, create logos that perfectly match your brand personality
            </p>
          </div>
          
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-4xl mx-auto">
            {styles.map((style) => (
              <Card key={style.id} className="border-2 border-gray-200 hover:border-indigo-300 transition-colors bg-white/80 backdrop-blur-sm">
                <CardContent className="p-6 text-center">
                  <div className="flex justify-center mb-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gray-100">
                      <style.icon className="h-5 w-5 text-gray-700" />
                    </div>
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-1">
                    {style.label}
                  </h3>
                  <p className="text-sm text-gray-600">
                    {style.desc}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-indigo-500 to-purple-600">
        <div className="container mx-auto px-6 text-center">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Ready to Create Your Perfect Logo?
            </h2>
            <p className="text-lg text-indigo-100 mb-8">
              Join thousands of businesses who've already created stunning logos with LogoCraft AI
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Button
                onClick={() => window.location.href = '/api/login'}
                size="lg"
                className="h-14 px-8 bg-white text-indigo-600 hover:bg-gray-100 shadow-xl text-lg font-semibold"
              >
                <Sparkles className="mr-2 h-5 w-5" />
                Start Free Trial
              </Button>
              
              <div className="flex items-center gap-2 text-sm text-indigo-100">
                <Crown className="h-4 w-4" />
                15 Free Credits • Pay Only When You Export
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 bg-white border-t">
        <div className="container mx-auto px-6 text-center">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600">
              <Sparkles className="h-4 w-4 text-white" />
            </div>
            <span className="font-bold text-gray-900">LogoCraft AI</span>
          </div>
          <p className="text-gray-600">
            Professional logo design powered by artificial intelligence
          </p>
        </div>
      </footer>
    </div>
  );
}