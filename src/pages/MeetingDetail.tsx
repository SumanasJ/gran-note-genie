
import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, Download, Share, Clock, Calendar, FileText, Copy, Check } from "lucide-react";
import { Meeting } from "@/types/meeting";
import { getTemplateById } from "@/lib/templates";
import { useToast } from "@/hooks/use-toast";

const MeetingDetail = () => {
  const { id } = useParams();
  const { toast } = useToast();
  const [copied, setCopied] = useState<string | null>(null);

  // Mock meeting data - in a real app this would come from an API
  const [meeting] = useState<Meeting>({
    id: id || "1",
    title: "Weekly Team Standup",
    transcript: `Sarah: Good morning everyone. Let's start with our weekly standup. John, could you share what you worked on this week?

John: Sure, I completed the user authentication feature and fixed three critical bugs in the payment system. I'm currently working on the dashboard redesign and should have the first mockups ready by Friday.

Sarah: Great work. Any blockers?

John: I need design approval for the new color scheme. The current one doesn't meet accessibility standards.

Sarah: I'll connect you with the design team today. Emma, your update?

Emma: I finished the API documentation and deployed the new search functionality. The performance improvements we discussed are showing a 40% speed increase in search results. Next week I'll focus on the mobile app integration.

Sarah: Excellent. Any concerns?

Emma: We need to discuss the database migration timeline. It's more complex than initially estimated.

Sarah: Let's schedule a separate meeting for that. Mike, your turn.

Mike: I completed user testing for the new onboarding flow. We have great feedback - 85% completion rate compared to 60% before. I'm now working on the analytics dashboard and will have a demo ready by Wednesday.

Sarah: Perfect. Let's wrap up with next week's priorities...`,
    aiSummary: {
      "Key Discussion Points": "Team discussed weekly progress including user authentication completion, API documentation, and user testing results for onboarding flow.",
      "Goals & Objectives": "Complete dashboard redesign mockups, finalize database migration planning, and demo analytics dashboard by Wednesday.",
      "Challenges Discussed": "Design approval needed for accessibility-compliant color scheme, database migration complexity exceeds initial estimates.",
      "Action Items": "• Sarah to connect John with design team for color scheme approval\n• Schedule separate meeting to discuss database migration timeline\n• John to deliver dashboard mockups by Friday\n• Mike to demo analytics dashboard by Wednesday",
      "Next Meeting Topics": "Database migration timeline discussion, dashboard design review, analytics dashboard demo presentation"
    },
    templateId: "one-on-one",
    duration: 1800,
    createdAt: new Date(Date.now() - 86400000),
    updatedAt: new Date(Date.now() - 86400000),
    status: "completed"
  });

  const template = getTemplateById(meeting.templateId);

  const formatDuration = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const hrs = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hrs > 0 ? `${hrs}h ${mins}m` : `${mins}m`;
  };

  const copyToClipboard = async (text: string, section: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(section);
      toast({
        title: "Copied to clipboard",
        description: `${section} content copied successfully.`,
      });
      setTimeout(() => setCopied(null), 2000);
    } catch (err) {
      toast({
        title: "Failed to copy",
        description: "Could not copy content to clipboard.",
        variant: "destructive",
      });
    }
  };

  const exportAsMarkdown = () => {
    const markdown = `# ${meeting.title}

**Date:** ${meeting.createdAt.toLocaleDateString()}
**Duration:** ${formatDuration(meeting.duration)}
**Template:** ${template?.name || 'Unknown'}

## AI Summary

${Object.entries(meeting.aiSummary).map(([section, content]) => `### ${section}\n\n${content}`).join('\n\n')}

## Full Transcript

${meeting.transcript}
`;

    const blob = new Blob([markdown], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${meeting.title.replace(/\s+/g, '-').toLowerCase()}.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    toast({
      title: "Exported successfully",
      description: "Meeting notes exported as Markdown file.",
    });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link to="/dashboard">
                <Button variant="ghost" size="sm">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back
                </Button>
              </Link>
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <h1 className="text-3xl font-bold text-gray-900">{meeting.title}</h1>
                  <Badge className="bg-green-100 text-green-700">
                    {meeting.status}
                  </Badge>
                </div>
                <div className="flex items-center gap-6 text-sm text-gray-600">
                  <div className="flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    {meeting.createdAt.toLocaleDateString()}
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock className="h-4 w-4" />
                    {formatDuration(meeting.duration)}
                  </div>
                  <div className="flex items-center gap-1">
                    <FileText className="h-4 w-4" />
                    {template?.name || 'Unknown Template'}
                  </div>
                </div>
              </div>
            </div>
            <div className="flex gap-3">
              <Button variant="outline" size="sm">
                <Share className="h-4 w-4 mr-2" />
                Share
              </Button>
              <Button variant="outline" size="sm" onClick={exportAsMarkdown}>
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <Tabs defaultValue="summary" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2 max-w-md">
            <TabsTrigger value="summary">AI Summary</TabsTrigger>
            <TabsTrigger value="transcript">Full Transcript</TabsTrigger>
          </TabsList>

          <TabsContent value="summary" className="space-y-6">
            {/* AI Summary Sections */}
            <div className="grid gap-6">
              {Object.entries(meeting.aiSummary).map(([section, content]) => (
                <Card key={section}>
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg">{section}</CardTitle>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0"
                        onClick={() => copyToClipboard(content, section)}
                      >
                        {copied === section ? (
                          <Check className="h-4 w-4 text-green-600" />
                        ) : (
                          <Copy className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="prose prose-sm max-w-none">
                      {content.split('\n').map((line, index) => (
                        <p key={index} className="mb-2 last:mb-0">
                          {line}
                        </p>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="transcript" className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Full Transcript</CardTitle>
                    <CardDescription>
                      Complete recording transcript with speaker identification
                    </CardDescription>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0"
                    onClick={() => copyToClipboard(meeting.transcript, "Transcript")}
                  >
                    {copied === "Transcript" ? (
                      <Check className="h-4 w-4 text-green-600" />
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="prose prose-sm max-w-none bg-gray-50 rounded-lg p-4">
                  {meeting.transcript.split('\n\n').map((paragraph, index) => (
                    <p key={index} className="mb-4 last:mb-0 leading-relaxed">
                      {paragraph.split(':').length > 1 ? (
                        <>
                          <span className="font-semibold text-purple-700">
                            {paragraph.split(':')[0]}:
                          </span>
                          {paragraph.substring(paragraph.indexOf(':') + 1)}
                        </>
                      ) : (
                        paragraph
                      )}
                    </p>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default MeetingDetail;
