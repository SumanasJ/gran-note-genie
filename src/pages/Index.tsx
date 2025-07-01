
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Mic, Brain, FileText, Users, Zap, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";

const Index = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-pink-50">
      {/* Hero Section */}
      <div className="container mx-auto px-4 py-20">
        <div className="text-center mb-16">
          <Badge className="mb-4 bg-purple-100 text-purple-700 hover:bg-purple-200">
            AI-Powered Meeting Intelligence
          </Badge>
          <h1 className="text-5xl font-bold mb-6 bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
            Transform Your Meetings
            <br />
            Into Actionable Insights
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Record, transcribe, and get AI-enhanced structured notes from any meeting. 
            Choose from templates or create your own for perfect meeting summaries.
          </p>
          <div className="flex gap-4 justify-center">
            <Link to="/dashboard">
              <Button size="lg" className="bg-purple-600 hover:bg-purple-700">
                Start Recording <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
            <Link to="/templates">
              <Button variant="outline" size="lg">
                Browse Templates
              </Button>
            </Link>
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
          <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow bg-white/80 backdrop-blur">
            <CardHeader>
              <div className="h-12 w-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
                <Mic className="h-6 w-6 text-purple-600" />
              </div>
              <CardTitle>Smart Recording</CardTitle>
              <CardDescription>
                High-quality audio recording with automatic transcription using advanced AI
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow bg-white/80 backdrop-blur">
            <CardHeader>
              <div className="h-12 w-12 bg-pink-100 rounded-lg flex items-center justify-center mb-4">
                <Brain className="h-6 w-6 text-pink-600" />
              </div>
              <CardTitle>AI Enhancement</CardTitle>
              <CardDescription>
                Transform raw transcripts into structured, actionable meeting summaries
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow bg-white/80 backdrop-blur">
            <CardHeader>
              <div className="h-12 w-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                <FileText className="h-6 w-6 text-blue-600" />
              </div>
              <CardTitle>Custom Templates</CardTitle>
              <CardDescription>
                Choose from pre-built templates or create your own for any meeting type
              </CardDescription>
            </CardHeader>
          </Card>
        </div>

        {/* Template Showcase */}
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4">Built-in Templates</h2>
          <p className="text-gray-600 mb-8">Choose the perfect template for your meeting type</p>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { name: "1-on-1 Meeting", icon: Users, color: "bg-green-500" },
              { name: "Sales Pitch", icon: Zap, color: "bg-orange-500" },
              { name: "Interview", icon: FileText, color: "bg-blue-500" },
              { name: "Project Planning", icon: Brain, color: "bg-purple-500" }
            ].map((template, index) => (
              <Card key={index} className="border-0 shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-1 bg-white/80 backdrop-blur">
                <CardContent className="p-6 text-center">
                  <div className={`h-12 w-12 ${template.color} rounded-lg flex items-center justify-center mx-auto mb-3`}>
                    <template.icon className="h-6 w-6 text-white" />
                  </div>
                  <h3 className="font-semibold">{template.name}</h3>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* CTA Section */}
        <div className="text-center">
          <Card className="border-0 shadow-2xl gradient-animation p-1 max-w-2xl mx-auto">
            <div className="bg-white rounded-lg p-8">
              <h3 className="text-2xl font-bold mb-4">Ready to Transform Your Meetings?</h3>
              <p className="text-gray-600 mb-6">
                Join thousands of professionals who are already using AI to make their meetings more productive.
              </p>
              <Link to="/dashboard">
                <Button size="lg" className="bg-purple-600 hover:bg-purple-700">
                  Get Started Free <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Index;
