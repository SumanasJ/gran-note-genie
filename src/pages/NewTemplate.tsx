
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Plus, X, ArrowLeft } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { saveUserTemplate } from "@/lib/templates";
import { useToast } from "@/hooks/use-toast";

const NewTemplate = () => {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [prompt, setPrompt] = useState("");
  const [sections, setSections] = useState<string[]>(["Key Takeaways", "Action Items"]);
  const [newSection, setNewSection] = useState("");
  const navigate = useNavigate();
  const { toast } = useToast();

  const addSection = () => {
    if (newSection.trim() && !sections.includes(newSection.trim())) {
      setSections([...sections, newSection.trim()]);
      setNewSection("");
    }
  };

  const removeSection = (index: number) => {
    setSections(sections.filter((_, i) => i !== index));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name.trim() || !description.trim() || !prompt.trim() || sections.length === 0) {
      toast({
        title: "Missing required fields",
        description: "Please fill in all required fields and add at least one section.",
        variant: "destructive",
      });
      return;
    }

    try {
      saveUserTemplate({
        name: name.trim(),
        description: description.trim(),
        prompt: prompt.trim(),
        sections: sections,
        userId: "user-1",
        isSystemTemplate: false
      });

      toast({
        title: "Template created",
        description: "Your template has been saved successfully.",
      });

      navigate("/templates");
    } catch (error) {
      toast({
        title: "Error creating template",
        description: "There was an error saving your template. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center gap-4">
            <Link to="/templates">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back
              </Button>
            </Link>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Create Template</h1>
              <p className="text-gray-600 mt-1">Design a custom template for your meetings</p>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle>Basic Information</CardTitle>
              <CardDescription>
                Give your template a name and description
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="name">Template Name *</Label>
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g., Customer Discovery Call"
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="description">Description *</Label>
                <Textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Describe when and how this template should be used"
                  className="mt-1"
                />
              </div>
            </CardContent>
          </Card>

          {/* Output Sections */}
          <Card>
            <CardHeader>
              <CardTitle>Output Sections</CardTitle>
              <CardDescription>
                Define the sections that AI will generate in the meeting summary
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-wrap gap-2 mb-4">
                {sections.map((section, index) => (
                  <Badge key={index} variant="secondary" className="flex items-center gap-2">
                    {section}
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="h-4 w-4 p-0 hover:bg-transparent"
                      onClick={() => removeSection(index)}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </Badge>
                ))}
              </div>
              
              <div className="flex gap-2">
                <Input
                  value={newSection}
                  onChange={(e) => setNewSection(e.target.value)}
                  placeholder="Add new section (e.g., Decision Points)"
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addSection())}
                />
                <Button type="button" onClick={addSection} variant="outline">
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              
              <p className="text-sm text-gray-600">
                Common sections: Key Takeaways, Action Items, Decisions Made, Next Steps, 
                Challenges Discussed, Goals & Objectives
              </p>
            </CardContent>
          </Card>

          {/* AI Prompt */}
          <Card>
            <CardHeader>
              <CardTitle>AI Prompt Template</CardTitle>
              <CardDescription>
                Define how AI should analyze and structure the meeting content
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="prompt">Prompt Template *</Label>
                <Textarea
                  id="prompt"
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder="You are a meeting assistant. Create a structured summary from this meeting transcript. Include:&#10;&#10;- Section 1&#10;- Section 2&#10;- Section 3&#10;&#10;Meeting transcript:&#10;{{transcript}}"
                  className="mt-1 min-h-[200px] font-mono text-sm"
                />
              </div>
              
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h4 className="font-medium text-blue-900 mb-2">Template Variables</h4>
                <p className="text-sm text-blue-700 mb-2">
                  Use these variables in your prompt:
                </p>
                <ul className="text-sm text-blue-700 space-y-1">
                  <li><code className="bg-blue-100 px-2 py-1 rounded">{"{{transcript}}"}</code> - The meeting transcript</li>
                  <li><code className="bg-blue-100 px-2 py-1 rounded">{"{{duration}}"}</code> - Meeting duration</li>
                  <li><code className="bg-blue-100 px-2 py-1 rounded">{"{{title}}"}</code> - Meeting title</li>
                </ul>
              </div>
            </CardContent>
          </Card>

          {/* Preview */}
          <Card>
            <CardHeader>
              <CardTitle>Preview</CardTitle>
              <CardDescription>
                This is how your template will appear
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                <div className="flex items-center gap-3">
                  <div className="h-8 w-8 bg-purple-500 rounded-lg flex items-center justify-center">
                    <span className="text-white text-sm font-bold">
                      {name.charAt(0).toUpperCase() || "T"}
                    </span>
                  </div>
                  <div>
                    <h3 className="font-semibold">{name || "Template Name"}</h3>
                    <p className="text-sm text-gray-600">{description || "Template description"}</p>
                  </div>
                </div>
                
                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-2">Output Sections:</h4>
                  <div className="flex flex-wrap gap-1">
                    {sections.map((section, index) => (
                      <Badge key={index} variant="outline" className="text-xs">
                        {section}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Actions */}
          <div className="flex gap-4 justify-end">
            <Link to="/templates">
              <Button variant="outline">Cancel</Button>
            </Link>
            <Button type="submit" className="bg-purple-600 hover:bg-purple-700">
              Create Template
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default NewTemplate;
