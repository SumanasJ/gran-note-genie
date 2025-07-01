
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Plus, Search, Edit, Trash2, Users, Zap, FileText, Brain } from "lucide-react";
import { Link } from "react-router-dom";
import { getAllTemplates, deleteUserTemplate } from "@/lib/templates";
import { Template } from "@/types/meeting";
import { useToast } from "@/hooks/use-toast";

const Templates = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [templates, setTemplates] = useState<Template[]>(getAllTemplates());
  const { toast } = useToast();

  const filteredTemplates = templates.filter(template =>
    template.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    template.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleDeleteTemplate = (templateId: string) => {
    deleteUserTemplate(templateId);
    setTemplates(getAllTemplates());
    toast({
      title: "Template deleted",
      description: "The template has been successfully removed.",
    });
  };

  const getTemplateIcon = (templateId: string) => {
    switch (templateId) {
      case 'one-on-one': return Users;
      case 'sales-pitch': return Zap;
      case 'interview': return FileText;
      case 'project-planning': return Brain;
      default: return FileText;
    }
  };

  const getTemplateColor = (templateId: string) => {
    switch (templateId) {
      case 'one-on-one': return 'bg-green-500';
      case 'sales-pitch': return 'bg-orange-500';
      case 'interview': return 'bg-blue-500';
      case 'project-planning': return 'bg-purple-500';
      default: return 'bg-gray-500';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Templates</h1>
              <p className="text-gray-600 mt-1">Manage your meeting templates</p>
            </div>
            <div className="flex gap-3">
              <Link to="/dashboard">
                <Button variant="outline">
                  Back to Dashboard
                </Button>
              </Link>
              <Link to="/templates/new">
                <Button className="bg-purple-600 hover:bg-purple-700">
                  <Plus className="h-4 w-4 mr-2" />
                  Create Template
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Search and Filter */}
        <div className="mb-8">
          <div className="relative w-full max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Search templates..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* Templates Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTemplates.map((template) => {
            const IconComponent = getTemplateIcon(template.id);
            const colorClass = getTemplateColor(template.id);
            
            return (
              <Card key={template.id} className="hover:shadow-lg transition-shadow">
                <CardHeader className="pb-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className={`h-10 w-10 ${colorClass} rounded-lg flex items-center justify-center`}>
                      <IconComponent className="h-5 w-5 text-white" />
                    </div>
                    <div className="flex items-center gap-2">
                      {template.isSystemTemplate ? (
                        <Badge variant="secondary">System</Badge>
                      ) : (
                        <div className="flex gap-1">
                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="h-8 w-8 p-0 text-red-500 hover:text-red-700"
                            onClick={() => handleDeleteTemplate(template.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                  <CardTitle className="text-lg">{template.name}</CardTitle>
                  <CardDescription className="text-sm">
                    {template.description}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="mb-4">
                    <h4 className="text-sm font-medium text-gray-700 mb-2">Output Sections:</h4>
                    <div className="flex flex-wrap gap-1">
                      {template.sections.slice(0, 3).map((section, index) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          {section}
                        </Badge>
                      ))}
                      {template.sections.length > 3 && (
                        <Badge variant="outline" className="text-xs">
                          +{template.sections.length - 3} more
                        </Badge>
                      )}
                    </div>
                  </div>
                  
                  <Link to={`/meeting/new?template=${template.id}`}>
                    <Button className="w-full" variant="outline">
                      Use Template
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {filteredTemplates.length === 0 && (
          <div className="text-center py-12">
            <FileText className="h-16 w-16 mx-auto mb-4 text-gray-300" />
            <h3 className="text-lg font-semibold text-gray-700 mb-2">No templates found</h3>
            <p className="text-gray-500 mb-6">
              {searchQuery ? "Try adjusting your search" : "Create your first custom template"}
            </p>
            <Link to="/templates/new">
              <Button className="bg-purple-600 hover:bg-purple-700">
                <Plus className="h-4 w-4 mr-2" />
                Create Template
              </Button>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default Templates;
