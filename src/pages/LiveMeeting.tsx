
import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Mic, Square, Pause, Play, FileText, Loader2 } from "lucide-react";
import { getAllTemplates } from "@/lib/templates";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

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
  const [isTranscribing, setIsTranscribing] = useState(false);
  
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
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          sampleRate: 44100,
          channelCount: 1,
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        }
      });
      
      const recorder = new MediaRecorder(stream, {
        mimeType: 'audio/webm;codecs=opus'
      });
      
      const chunks: Blob[] = [];
      setAudioChunks(chunks);

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunks.push(e.data);
        }
      };

      recorder.onstop = async () => {
        console.log('Recording stopped, processing audio...');
        const audioBlob = new Blob(chunks, { type: 'audio/webm' });
        await transcribeAudio(audioBlob);
        stream.getTracks().forEach(track => track.stop());
      };

      setMediaRecorder(recorder);
      recorder.start();
      setIsRecording(true);
      setRecordingTime(0);
      
      toast({
        title: "开始录音",
        description: "正在录制会议音频...",
      });
    } catch (error) {
      console.error('Recording error:', error);
      toast({
        title: "录音失败",
        description: "无法访问麦克风，请检查权限设置。",
        variant: "destructive",
      });
    }
  };

  const pauseRecording = () => {
    if (mediaRecorder && isRecording) {
      if (isPaused) {
        mediaRecorder.resume();
        setIsPaused(false);
        toast({
          title: "继续录音",
          description: "录音已恢复。",
        });
      } else {
        mediaRecorder.pause();
        setIsPaused(true);
        toast({
          title: "暂停录音",
          description: "录音已暂停。",
        });
      }
    }
  };

  const stopRecording = () => {
    if (mediaRecorder && isRecording) {
      mediaRecorder.stop();
      setIsRecording(false);
      setIsPaused(false);
      
      toast({
        title: "录音结束",
        description: "正在处理音频并生成转录...",
      });
    }
  };

  const transcribeAudio = async (audioBlob: Blob) => {
    setIsTranscribing(true);
    try {
      console.log('Converting audio to base64...');
      
      // Convert blob to base64
      const reader = new FileReader();
      const base64Promise = new Promise<string>((resolve, reject) => {
        reader.onload = () => {
          const result = reader.result as string;
          // Remove data URL prefix
          const base64 = result.split(',')[1];
          resolve(base64);
        };
        reader.onerror = reject;
      });
      
      reader.readAsDataURL(audioBlob);
      const audioBase64 = await base64Promise;

      console.log('Sending audio for transcription...');
      
      const { data, error } = await supabase.functions.invoke('transcribe-audio', {
        body: { audio: audioBase64 }
      });

      if (error) {
        console.error('Transcription error:', error);
        throw new Error(error.message || 'Transcription failed');
      }

      if (data?.text) {
        setTranscript(data.text);
        setShowEnhancement(true);
        toast({
          title: "转录完成",
          description: "音频已成功转换为文字，可以开始AI增强。",
        });
      } else {
        throw new Error('No transcription text received');
      }
    } catch (error) {
      console.error('Transcription failed:', error);
      toast({
        title: "转录失败",
        description: error instanceof Error ? error.message : "音频转录过程中出现错误。",
        variant: "destructive",
      });
    } finally {
      setIsTranscribing(false);
    }
  };

  const enhanceNotes = async () => {
    setIsProcessing(true);
    
    try {
      const selectedTemplate = templates.find(t => t.id === selectedTemplateId);
      
      const { data, error } = await supabase.functions.invoke('enhance-notes', {
        body: {
          transcript,
          notes,
          templatePrompt: selectedTemplate?.prompt,
          customPrompt: customPrompt
        }
      });

      if (error) {
        throw new Error(error.message || 'Enhancement failed');
      }

      if (data?.summary) {
        const meetingId = `meeting-${Date.now()}`;
        
        // Save meeting data to localStorage
        const meetingData = {
          id: meetingId,
          title: title || "未命名会议",
          transcript,
          aiSummary: data.summary,
          duration: recordingTime,
          createdAt: new Date(),
          updatedAt: new Date(),
          status: 'completed',
          templateId: selectedTemplateId || 'custom'
        };
        
        localStorage.setItem(`meeting-${meetingId}`, JSON.stringify(meetingData));
        
        toast({
          title: "AI增强完成",
          description: "会议纪要已生成完成。",
        });
        
        navigate(`/meeting/${meetingId}`);
      } else {
        throw new Error('No summary received');
      }
    } catch (error) {
      console.error('Enhancement error:', error);
      toast({
        title: "AI增强失败",
        description: error instanceof Error ? error.message : "生成会议纪要时出现错误。",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="border-b border-gray-100 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="h-8 w-8 bg-green-500 rounded-lg flex items-center justify-center">
              <FileText className="h-4 w-4 text-white" />
            </div>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="会议标题..."
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
                开始录音
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
            <h2 className="text-lg font-medium mb-2">您的笔记</h2>
            {isRecording && (
              <div className="flex items-center gap-2 text-sm text-green-600 mb-3">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                正在录音中...
              </div>
            )}
          </div>
          
          <Textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="在会议过程中记录您的笔记..."
            className="min-h-[400px] resize-none border-gray-200 text-base leading-relaxed"
          />
        </div>

        {/* Right: Live Transcript & AI Enhancement */}
        <div className="p-6 bg-gray-50">
          {!showEnhancement ? (
            // Live Transcript
            <div>
              <div className="flex items-center gap-2 mb-4">
                <h2 className="text-lg font-medium">实时转录</h2>
                {isTranscribing && (
                  <Loader2 className="h-4 w-4 animate-spin text-blue-500" />
                )}
              </div>
              <div 
                ref={transcriptRef}
                className="bg-white rounded-lg p-4 min-h-[400px] max-h-[500px] overflow-y-auto text-sm leading-relaxed border"
              >
                {transcript ? (
                  <p className="whitespace-pre-wrap">{transcript}</p>
                ) : (
                  <p className="text-gray-400 italic">
                    {isTranscribing ? "正在转录音频..." : "开始录音后将显示实时转录..."}
                  </p>
                )}
              </div>
            </div>
          ) : (
            // AI Enhancement Options
            <div className="space-y-6">
              <h2 className="text-lg font-medium">AI 增强</h2>
              
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">选择增强方式</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <label className="text-sm font-medium">使用模板</label>
                    <Select value={selectedTemplateId} onValueChange={setSelectedTemplateId}>
                      <SelectTrigger className="mt-1">
                        <SelectValue placeholder="选择一个模板..." />
                      </SelectTrigger>
                      <SelectContent>
                        {templates.map((template) => (
                          <SelectItem key={template.id} value={template.id}>
                            <div className="flex items-center gap-2">
                              {template.name}
                              {template.isSystemTemplate && (
                                <Badge variant="secondary" className="text-xs">系统</Badge>
                              )}
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="text-center text-sm text-gray-500">或</div>
                  
                  <div>
                    <label className="text-sm font-medium">自定义增强指令</label>
                    <Textarea
                      value={customPrompt}
                      onChange={(e) => setCustomPrompt(e.target.value)}
                      placeholder="告诉AI如何处理您的会议内容..."
                      className="mt-1"
                      rows={3}
                    />
                  </div>
                  
                  <Button 
                    onClick={enhanceNotes}
                    disabled={isProcessing || (!selectedTemplateId && !customPrompt)}
                    className="w-full bg-purple-600 hover:bg-purple-700"
                  >
                    {isProcessing ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        处理中...
                      </>
                    ) : (
                      "使用 AI 增强笔记"
                    )}
                  </Button>
                </CardContent>
              </Card>
              
              {/* Preview of what will be enhanced */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">待增强内容</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-sm text-gray-600 space-y-2">
                    <div><strong>您的笔记:</strong> {notes.length} 字符</div>
                    <div><strong>转录内容:</strong> {transcript.length} 字符</div>
                    <div><strong>录音时长:</strong> {formatTime(recordingTime)}</div>
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
