
import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Mic, Square, Play, Pause } from "lucide-react";
import { Link } from "react-router-dom";
import { getAllTemplates, getTemplateById } from "@/lib/templates";
import { Template } from "@/types/meeting";
import { useToast } from "@/hooks/use-toast";

const NewMeeting = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [title, setTitle] = useState("");
  const [selectedTemplateId, setSelectedTemplateId] = useState(searchParams.get('template') || "");
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  
  const templates = getAllTemplates();
  const selectedTemplate = getTemplateById(selectedTemplateId);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isRecording) {
      interval = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isRecording]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      const chunks: Blob[] = [];

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunks.push(e.data);
        }
      };

      recorder.onstop = () => {
        const blob = new Blob(chunks, { type: 'audio/webm' });
        setAudioBlob(blob);
        stream.getTracks().forEach(track => track.stop());
      };

      setMediaRecorder(recorder);
      recorder.start();
      setIsRecording(true);
      setRecordingTime(0);
      
      toast({
        title: "Recording started",
        description: "Your meeting is being recorded.",
      });
    } catch (error) {
      toast({
        title: "Recording failed",
        description: "Could not access microphone. Please check permissions.",
        variant: "destructive",
      });
    }
  };

  const stopRecording = () => {
    if (mediaRecorder && isRecording) {
      mediaRecorder.stop();
      setIsRecording(false);
      
      toast({
        title: "Recording stopped",
        description: "Processing your meeting...",
      });
    }
  };

  const handleSave = async () => {
    if (!title.trim()) {
      toast({
        title: "Missing title",
        description: "Please enter a meeting title.",
        variant: "destructive",
      });
      return;
    }

    if (!selectedTemplateId) {
      toast({
        title: "No template selected",
        description: "Please select a template for your meeting.",
        variant: "destructive",
      });
      return;
    }

    if (!audioBlob) {
      toast({
        title: "No recording",
        description: "Please record your meeting first.",
        variant: "destructive",
      });
      return;
    }

    // In a real app, you would:
    // 1. Upload the audio blob to your server
    // 2. Send it to a transcription service (like Whisper)
    // 3. Send the transcript to an AI service (like GPT) with the template prompt
    // 4. Save the meeting data to your database

    // For now, we'll simulate this process
    toast({
      title: "Processing meeting",
      description: "Transcribing audio and generating AI summary...",
    });

    // Simulate API processing delay
    setTimeout(() => {
      const meetingId = `meeting-${Date.now()}`;
      
      toast({
        title: "Meeting saved",
        description: "Your meeting has been processed and saved successfully.",
      });
      
      navigate(`/meeting/${meetingId}`);
    }, 2000);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center gap-4">
            <Link to="/dashboard">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back
              </Button>
            </Link>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">New Meeting</h1>
              <p className="text-gray-600 mt-1">Record and generate AI-powered meeting notes</p>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Meeting Details */}
            <Card>
              <CardHeader>
                <CardTitle>Meeting Details</CardTitle>
                <CardDescription>
                  Set up your meeting information and select a template
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="title">Meeting Title *</Label>
                  <Input
                    id="title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g., Weekly Team Standup"
                    className="mt-1"
                  />
                </div>
                
                <div>
                  <Label htmlFor="template">Template *</Label>
                  <Select value={selectedTemplateId} onValueChange={setSelectedTemplateId}>
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="Choose a template..." />
                    </SelectTrigger>
                    <SelectContent>
                      {templates.map((template) => (
                        <SelectItem key={template.id} value={template.id}>
                          <div className="flex items-center gap-2">
                            {template.name}
                            {template.isSystemTemplate && (
                              <Badge variant="secondary" className="text-xs">System</Badge>
                            )}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            {/* Recording */}
            <Card>
              <CardHeader>
                <CardTitle>Recording</CardTitle>
                <CardDescription>
                  Record your meeting audio for transcription and AI analysis
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Recording Status */}
                <div className="text-center">
                  <div className={`inline-flex items-center justify-center w-24 h-24 rounded-full ${
                    isRecording 
                      ? 'bg-red-100 animate-pulse' 
                      : audioBlob 
                        ? 'bg-green-100' 
                        : 'bg-gray-100'
                  }`}>
                    {isRecording ? (
                      <Mic className="h-8 w-8 text-red-600" />
                    ) : audioBlob ? (
                      <Play className="h-8 w-8 text-green-600" />
                    ) : (
                      <Mic className="h-8 w-8 text-gray-400" />
                    )}
                  </div>
                  
                  <div className="mt-4">
                    <div className="text-2xl font-mono font-bold">
                      {formatTime(recordingTime)}
                    </div>
                    <p className="text-sm text-gray-600 mt-1">
                      {isRecording 
                        ? 'Recording in progress...' 
                        : audioBlob 
                          ? 'Recording complete' 
                          : 'Ready to record'
                      }
                    </p>
                  </div>
                </div>

                {/* Recording Controls */}
                <div className="flex justify-center gap-4">
                  {!isRecording && !audioBlob && (
                    <Button 
                      onClick={startRecording}
                      className="bg-red-600 hover:bg-red-700"
                    >
                      <Mic className="h-4 w-4 mr-2" />
                      Start Recording
                    </Button>
                  )}
                  
                  {isRecording && (
                    <Button 
                      onClick={stopRecording}
                      variant="outline"
                      className="border-red-600 text-red-600 hover:bg-red-50"
                    >
                      <Square className="h-4 w-4 mr-2" />
                      Stop Recording
                    </Button>
                  )}
                  
                  {audioBlob && !isRecording && (
                    <div className="flex gap-2">
                      <Button 
                        onClick={() => {
                          setAudioBlob(null);
                          setRecordingTime(0);
                        }}
                        variant="outline"
                      >
                        Record Again
                      </Button>
                      <Button 
                        onClick={handleSave}
                        className="bg-purple-600 hover:bg-purple-700"
                      >
                        Process Meeting
                      </Button>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Template Preview */}
            {selectedTemplate && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Template: {selectedTemplate.name}</CardTitle>
                  <CardDescription>{selectedTemplate.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div>
                    <h4 className="font-medium text-sm mb-3">AI will generate:</h4>
                    <div className="space-y-2">
                      {selectedTemplate.sections.map((section, index) => (
                        <div key={index} className="flex items-center gap-2">
                          <div className="w-2 h-2 bg-purple-500 rounded-full" />
                          <span className="text-sm">{section}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Tips */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Recording Tips</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="text-sm space-y-2 text-gray-600">
                  <li>• Ensure good audio quality</li>
                  <li>• Speak clearly and at normal pace</li>
                  <li>• Minimize background noise</li>
                  <li>• Use participant names when possible</li>
                  <li>• Allow processing time after recording</li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NewMeeting;
