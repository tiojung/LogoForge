import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function Landing() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-violet-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-16">
          <div className="flex items-center justify-center space-x-3 mb-8">
            <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-violet-500 rounded-2xl flex items-center justify-center">
              <i className="fas fa-magic text-white text-2xl"></i>
            </div>
            <h1 className="text-4xl font-bold text-gray-900">LogoCraft AI</h1>
          </div>
          
          <h2 className="text-5xl font-bold text-gray-900 mb-6">
            Create Perfect Logos with AI
          </h2>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            Professional logo design made simple. Describe your vision, upload references, 
            or modify existing logos with AI-powered precision. Pay only for what you export.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <Button 
              onClick={() => window.location.href = '/api/login'}
              className="px-8 py-4 bg-gradient-to-r from-indigo-600 to-violet-600 text-white rounded-xl font-medium hover:from-indigo-700 hover:to-violet-700 transition-all shadow-lg hover:shadow-xl text-lg"
            >
              Start Creating - Free Trial
            </Button>
            <Button 
              variant="outline"
              className="px-8 py-4 border-2 border-indigo-200 text-indigo-700 rounded-xl font-medium hover:bg-indigo-50 transition-all text-lg"
            >
              View Examples
            </Button>
          </div>
          
          <div className="flex items-center justify-center space-x-8 text-sm text-gray-500">
            <div className="flex items-center space-x-2">
              <i className="fas fa-coins text-emerald-500"></i>
              <span>15 Free Credits</span>
            </div>
            <div className="flex items-center space-x-2">
              <i className="fas fa-magic text-indigo-500"></i>
              <span>AI-Powered</span>
            </div>
            <div className="flex items-center space-x-2">
              <i className="fas fa-download text-violet-500"></i>
              <span>High-Res Export</span>
            </div>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-8 mb-16">
          <Card className="p-6 text-center border-0 shadow-lg bg-white/80 backdrop-blur-sm">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-xl flex items-center justify-center mx-auto mb-4">
              <i className="fas fa-pen-nib text-white"></i>
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Describe Your Vision</h3>
            <p className="text-gray-600">
              Tell our AI what you want. Specify your business, style preferences, and let AI create the perfect logo.
            </p>
          </Card>

          <Card className="p-6 text-center border-0 shadow-lg bg-white/80 backdrop-blur-sm">
            <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-green-500 rounded-xl flex items-center justify-center mx-auto mb-4">
              <i className="fas fa-upload text-white"></i>
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Upload References</h3>
            <p className="text-gray-600">
              Have inspiration? Upload reference images and our AI will create logos in similar styles.
            </p>
          </Card>

          <Card className="p-6 text-center border-0 shadow-lg bg-white/80 backdrop-blur-sm">
            <div className="w-12 h-12 bg-gradient-to-br from-violet-500 to-purple-500 rounded-xl flex items-center justify-center mx-auto mb-4">
              <i className="fas fa-edit text-white"></i>
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Modify Existing</h3>
            <p className="text-gray-600">
              Already have a logo? Upload it and let AI refine, recolor, or completely redesign it.
            </p>
          </Card>
        </div>

        <div className="bg-white/60 backdrop-blur-sm rounded-3xl p-8 border border-gray-100">
          <div className="text-center mb-8">
            <h3 className="text-3xl font-bold text-gray-900 mb-4">Pay-As-You-Go Pricing</h3>
            <p className="text-lg text-gray-600">No subscriptions. Pay only for what you export.</p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-6">
            <div className="text-center p-6 rounded-xl bg-gray-50">
              <div className="text-2xl font-bold text-gray-900 mb-2">1 Credit</div>
              <div className="text-gray-600 mb-4">Logo Generation</div>
              <div className="text-sm text-gray-500">6 AI-generated variations</div>
            </div>
            
            <div className="text-center p-6 rounded-xl bg-gray-50">
              <div className="text-2xl font-bold text-gray-900 mb-2">1 Credit</div>
              <div className="text-gray-600 mb-4">Logo Modification</div>
              <div className="text-sm text-gray-500">Refine existing designs</div>
            </div>
            
            <div className="text-center p-6 rounded-xl bg-gradient-to-br from-emerald-50 to-green-50 border border-emerald-200">
              <div className="text-2xl font-bold text-emerald-700 mb-2">3 Credits</div>
              <div className="text-emerald-700 mb-4">High-Res Export</div>
              <div className="text-sm text-emerald-600">PNG, SVG, PDF formats</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
