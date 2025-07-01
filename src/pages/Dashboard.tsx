
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Plus, Mic, Search, Clock, Calendar, FileText } from "lucide-react";
import { Link } from "react-router-dom";
import { Meeting } from "@/types/meeting";

const Dashboard = () => {
  const [searchQuery, setSearchQuery] = useState("");
  
  // Mock meetings data
  const [meetings] = useState<Meeting[]>([
    {
      id: "1",
      title: "Weekly Team Standup",
      transcript: "",
      aiSummary: {},
      templateId: "one-on-one",
      duration: 1800,
      createdAt: new Date(Date.now() - 86400000),
      updatedAt: new Date(Date.now() - 86400000),
      status: "completed"
    },
    {
      id: "2", 
      title: "Client Pitch - TechCorp",
      transcript: "",
      aiSummary: {},
      templateId: "sales-pitch",
      duration: 2700,
      createdAt: new Date(Date.now() - 172800000),
      updatedAt: new Date(Date.now() - 172800000),
      status: "completed"
    },
    {
      id: "3",
      title: "Interview - Senior Developer",
      transcript: "",
      aiSummary: {},
      templateId: "interview", 
      duration: 3600,
      createdAt: new Date(Date.now() - 259200000),
      updatedAt: new Date(Date.now() - 259200000),
      status: "completed"
    }
  ]);

  const filteredMeetings = meetings.filter(meeting => 
    meeting.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const formatDuration = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    return `${minutes} min`;
  };

  const getStatusColor = (status: Meeting['status']) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-700';
      case 'processing': return 'bg-yellow-100 text-yellow-700';
      case 'transcribing': return 'bg-blue-100 text-blue-700';
      case 'recording': return 'bg-red-100 text-red-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
              <p className="text-gray-600 mt-1">Manage your meetings and templates</p>
            </div>
            <div className="flex gap-3">
              <Link to="/templates">
                <Button variant="outline">
                  <FileText className="h-4 w-4 mr-2" />
                  Templates
                </Button>
              </Link>
              <Link to="/meeting/new">
                <Button className="bg-purple-600 hover:bg-purple-700">
                  <Plus className="h-4 w-4 mr-2" />
                  New Meeting
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Quick Actions */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <Link to="/meeting/new">
            <Card className="border-2 border-dashed border-purple-200 hover:border-purple-400 transition-colors cursor-pointer">
              <CardContent className="flex flex-col items-center justify-center p-8 text-center">
                <div className="h-12 w-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
                  <Mic className="h-6 w-6 text-purple-600" />
                </div>
                <h3 className="font-semibold text-lg mb-2">Start Recording</h3>
                <p className="text-gray-600 text-sm">Begin a new meeting session</p>
              </CardContent>
            </Card>
          </Link>

          <Card className="bg-gradient-to-br from-purple-500 to-pink-500 text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="h-8 w-8 bg-white/20 rounded-lg flex items-center justify-center">
                  <Clock className="h-4 w-4" />
                </div>
                <Badge className="bg-white/20 text-white">This Month</Badge>
              </div>
              <h3 className="text-2xl font-bold">{meetings.length}</h3>
              <p className="text-white/80">Total Meetings</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-green-500 to-emerald-500 text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="h-8 w-8 bg-white/20 rounded-lg flex items-center justify-center">
                  <FileText className="h-4 w-4" />
                </div>
                <Badge className="bg-white/20 text-white">Saved</Badge>
              </div>
              <h3 className="text-2xl font-bold">
                {meetings.reduce((total, meeting) => total + meeting.duration, 0) / 3600 | 0}h
              </h3>
              <p className="text-white/80">Total Time</p>
            </CardContent>
          </Card>
        </div>

        {/* Meetings List */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Recent Meetings</CardTitle>
                <CardDescription>
                  Your meeting history and AI-generated summaries
                </CardDescription>
              </div>
              <div className="relative w-64">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search meetings..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {filteredMeetings.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <FileText className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                  <p>No meetings found</p>
                  <p className="text-sm">Start your first meeting to see it here</p>
                </div>
              ) : (
                filteredMeetings.map((meeting) => (
                  <Link key={meeting.id} to={`/meeting/${meeting.id}`}>
                    <Card className="hover:shadow-md transition-shadow cursor-pointer">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <h3 className="font-semibold text-lg">{meeting.title}</h3>
                              <Badge className={getStatusColor(meeting.status)}>
                                {meeting.status}
                              </Badge>
                            </div>
                            <div className="flex items-center gap-4 text-sm text-gray-600">
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
                                {meeting.templateId.replace('-', ' ')}
                              </div>
                            </div>
                          </div>
                          <div className="text-right">
                            <Button variant="ghost" size="sm">
                              View Details
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;
