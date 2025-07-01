
import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Mic, Square, Pause, Play, FileText } from "lucide-react";
import { getAllTemplates } from "@/lib/templates";
import { useToast } from "@/hooks/use-toast";

const LiveMeeting = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  
  // Meeting state
  const [title, setTitle] = useState("");
  const [notes, setNotes] = useState("");
  const [isRecording, setIsRecording] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [transcript, setTranscript] = useState("");
  
  // AI Enhancement state
  const [selectedTemplateId, setSelectedTemplateId] = useState("");
  const [customPrompt, setCustomPrompt] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [showEnhancement, setShowEnhancement] = useState(false);
  
  // Audio recording
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null);
  const [audioChunks, setAudioChunks] = useState<Blob[]>([]);
  const transcriptRef = useRef<HTMLDivElement>(null);
  
  const templates = getAllTemplates();

  // Timer effect
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isRecording && !isPaused) {
      interval = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isRecording, isPaused]);

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
        const audioBlob = new Blob(chunks, { type: 'audio/webm' });
        // Simulate transcription
        simulateTranscription(audioBlob);
        stream.getTracks().forEach(track => track.stop());
      };

      setMediaRecorder(recorder);
      setAudioChunks(chunks);
      recorder.start(1000); // Record in 1-second chunks for real-time processing
      setIsRecording(true);
      setRecordingTime(0);
      
      toast({
        title: "Recording started",
        description: "Your meeting is being recorded and transcribed.",
      });
    } catch (error) {
      toast({
        title: "Recording failed",
        description: "Could not access microphone. Please check permissions.",
        variant: "destructive",
      });
    }
  };

  const pauseRecording = () => {
    if (mediaRecorder && isRecording) {
      if (isPaused) {
        mediaRecorder.resume();
        setIsPaused(false);
      } else {
        mediaRecorder.pause();
        setIsPaused(true);
      }
    }
  };

  const stopRecording = () => {
    if (mediaRecorder && isRecording) {
      mediaRecorder.stop();
      setIsRecording(false);
      setIsPaused(false);
      setShowEnhancement(true);
      
      toast({
        title: "Recording stopped",
        description: "Ready to enhance your notes with AI.",
      });
    }
  };

  const simulateTranscription = (audioBlob: Blob) => {
    // Simulate real-time transcription
    const mockTranscripts = [
      "Welcome everyone to today's meeting.",
      "Let's start by reviewing our quarterly goals.",
      "The main priority for Q2 is improving our conversion rate.",
      "We need to focus on user experience and reducing friction.",
      "John, can you share the latest analytics data?",
      "Our current conversion rate is at 3.2%, up from 2.8% last quarter.",
      "That's great progress, but we're aiming for 4% by end of Q2.",
    ];

    let index = 0;
    const interval = setInterval(() => {
      if (index < mockTranscripts.length && isRecording && !isPaused) {
        setTranscript(prev => prev + (prev ? " " : "") + mockTranscripts[index]);
        index++;
      } else {
        clearInterval(interval);
      }
    }, 3000);

    return () => clearInterval(interval);
  };

  const enhanceNotes = async () => {
    setIsProcessing(true);
    
    // Simulate AI enhancement
    setTimeout(() => {
      const enhancedContent = generateEnhancedNotes();
      const meetingId = `meeting-${Date.now()}`;
      
      // Save meeting data (would normally go to database)
      localStorage.setItem(`meeting-${meetingId}`, JSON.stringify({
        id: meetingId,
        title: title || "Untitled Meeting",
        notes,
        transcript,
        enhancedNotes: enhancedContent,
        duration: recordingTime,
        createdAt: new Date(),
        templateId: selectedTemplateId
      }));
      
      setIsProcessing(false);
      
      toast({
        title: "Notes enhanced successfully",
        description: "Your meeting notes have been processed with AI.",
      });
      
      navigate(`/meeting/${meetingId}`);
    }, 3000);
  };

  const generateEnhancedNotes = () => {
    const selectedTemplate = templates.find(t => t.id === selectedTemplateId);
    
    if (selectedTemplate) {
      return {
        "Key Discussion Points": "Quarterly goal review focusing on conversion rate improvement from 2.8% to target 4% by Q2 end.",
        "Current Metrics": "Conversion rate currently at 3.2%, showing positive progress from previous quarter.",
        "Action Items": "• John to provide detailed analytics breakdown\n• Team to focus on UX improvements\n• Reduce friction in user journey",
        "Next Steps": "Continue monitoring conversion metrics and implement UX optimizations for Q2 target achievement."
      };
    } else if (customPrompt) {
      return {
        "AI Summary": "Meeting focused on quarterly performance review with emphasis on conversion rate optimization and user experience improvements."
      };
    } else {
      return {
        "Summary": "Meeting discussion covered quarterly goals, current metrics, and action items for Q2 objectives."
      };
    }
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Simple Header */}
      <div className="border-b border-gray-100 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="h-8 w-8 bg-green-500 rounded-lg flex items-center justify-center">
              <FileText className="h-4 w-4 text-white" />
            </div>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Meeting title..."
              className="text-lg font-medium border-none shadow-none px-0 focus-visible:ring-0"
            />
          </div>
          
          {/* Recording Controls */}
          <div className="flex items-center gap-3">
            <div className="text-sm text-gray-500 font-mono">
              {formatTime(recordingTime)}
            </div>
            
            {!isRecording ? (
              <Button onClick={startRecording} size="sm" className="bg-green-500 hover:bg-green-600">
                <Mic className="h-4 w-4 mr-2" />
                Start Recording
              </Button>
            ) : (
              <div className="flex gap-2">
                <Button onClick={pauseRecording} variant="outline" size="sm">
                  {isPaused ? <Play className="h-4 w-4" /> : <Pause className="h-4 w-4" />}
                </Button>
                <Button onClick={stopRecording} variant="outline" size="sm">
                  <Square className="h-4 w-4" />
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 h-[calc(100vh-80px)]">
        {/* Left: Notes Taking */}
        <div className="p-6 border-r border-gray-100">
          <div className="mb-4">
            <h2 className="text-lg font-medium mb-2">Your Notes</h2>
            {isRecording && (
              <div className="flex items-center gap-2 text-sm text-green-600 mb-3">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                Recording & transcribing...
              </div>
            )}
          </div>
          
          <Textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Take notes during your meeting..."
            className="min-h-[400px] resize-none border-gray-200 text-base leading-relaxed"
          />
        </div>

        {/* Right: Live Transcript & AI Enhancement */}
        <div className="p-6 bg-gray-50">
          {!showEnhancement ? (
            // Live Transcript
            <div>
              <h2 className="text-lg font-medium mb-4">Live Transcript</h2>
              <div 
                ref={transcriptRef}
                className="bg-white rounded-lg p-4 min-h-[400px] max-h-[500px] overflow-y-auto text-sm leading-relaxed border"
              >
                {transcript || (
                  <p className="text-gray-400 italic">
                    Start recording to see live transcription...
                  </p>
                )}
              </div>
            </div>
          ) : (
            // AI Enhancement Options
            <div className="space-y-6">
              <h2 className="text-lg font-medium">Enhance with AI</h2>
              
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Choose Enhancement Method</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <label className="text-sm font-medium">Use Template</label>
                    <Select value={selectedTemplateId} onValueChange={setSelectedTemplateId}>
                      <SelectTrigger className="mt-1">
                        <SelectValue placeholder="Select a template..." />
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
                  
                  <div className="text-center text-sm text-gray-500">or</div>
                  
                  <div>
                    <label className="text-sm font-medium">Custom Enhancement Prompt</label>
                    <Textarea
                      value={customPrompt}
                      onChange={(e) => setCustomPrompt(e.target.value)}
                      placeholder="Tell AI how you want your notes structured..."
                      className="mt-1"
                      rows={3}
                    />
                  </div>
                  
                  <Button 
                    onClick={enhanceNotes}
                    disabled={isProcessing || (!selectedTemplateId && !customPrompt)}
                    className="w-full bg-purple-600 hover:bg-purple-700"
                  >
                    {isProcessing ? "Processing..." : "Enhance Notes with AI"}
                  </Button>
                </CardContent>
              </Card>
              
              {/* Preview of what will be enhanced */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Content to Enhance</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-sm text-gray-600 space-y-2">
                    <div><strong>Your Notes:</strong> {notes.length} characters</div>
                    <div><strong>Transcript:</strong> {transcript.length} characters</div>
                    <div><strong>Duration:</strong> {formatTime(recordingTime)}</div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default LiveMeeting;
