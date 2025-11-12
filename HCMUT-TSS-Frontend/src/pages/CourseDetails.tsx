import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, User, Clock, BookOpen, Plus, CheckCircle2 } from "lucide-react";
import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { toast } from "@/hooks/use-toast";

const CourseDetails = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const course = location.state?.course;

  const [showJoinSessionDialog, setShowJoinSessionDialog] = useState(false);
  const [selectedSession, setSelectedSession] = useState("");
  const [joinSessionStatus, setJoinSessionStatus] = useState<"idle" | "waiting" | "confirmed">("idle");

  // Mock available sessions for this tutor/course
  const availableSessions = [
    { id: 1, date: "Mon, Nov 4, 2025", time: "9:00 - 10:30", topic: "Introduction to concepts", status: "available" },
    { id: 2, date: "Wed, Nov 6, 2025", time: "14:00 - 15:30", topic: "Advanced techniques", status: "available" },
    { id: 3, date: "Fri, Nov 8, 2025", time: "9:00 - 10:30", topic: "Problem solving", status: "available" },
    { id: 4, date: "Mon, Nov 11, 2025", time: "9:00 - 10:30", topic: "Review and practice", status: "available" },
    { id: 5, date: "Wed, Nov 13, 2025", time: "14:00 - 15:30", topic: "Final concepts", status: "available" }
  ];

  if (!course) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-1 bg-muted/30 flex items-center justify-center">
          <div className="text-center">
            <h2 className="text-2xl font-bold mb-4">Course not found</h2>
            <Button onClick={() => navigate("/my-courses")}>Back to My Courses</Button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const handleJoinSessionClick = () => {
    setShowJoinSessionDialog(true);
    setSelectedSession("");
    setJoinSessionStatus("idle");
  };

  const handleSessionSelect = () => {
    if (!selectedSession) {
      toast({
        title: "Please select a session",
        description: "You must select a session to join",
        variant: "destructive"
      });
      return;
    }
    
    setJoinSessionStatus("waiting");
    
    // Simulate tutor confirmation after 2-3 seconds
    setTimeout(() => {
      setJoinSessionStatus("confirmed");
      const session = availableSessions.find(s => s.id.toString() === selectedSession);
      toast({
        title: "Tutor Confirmed! / Tutor đã xác nhận!",
        description: `Your session on ${session?.date} has been confirmed`,
      });
      
      // Update course schedule (in real app, this would update state/database)
      setTimeout(() => {
        setShowJoinSessionDialog(false);
        navigate("/my-courses");
      }, 2000);
    }, 2500);
  };

  const closeJoinSessionDialog = () => {
    setShowJoinSessionDialog(false);
    setSelectedSession("");
    setJoinSessionStatus("idle");
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 bg-muted/30">
        <div className="container mx-auto px-4 py-8">
          <Button 
            variant="ghost" 
            onClick={() => navigate("/my-courses")}
            className="mb-6"
          >
            ← Back to My Courses
          </Button>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Course Info Card */}
            <div className="lg:col-span-2">
              <Card className="rounded-xl shadow-md">
                <CardHeader>
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <CardTitle className="text-3xl mb-2">{course.name}</CardTitle>
                      <Badge className={`${course.color} text-white border-0`}>
                        {course.sessions} sessions total
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <User className="h-5 w-5 text-muted-foreground" />
                      <div>
                        <p className="text-sm text-muted-foreground">Tutor</p>
                        <p className="font-medium">{course.tutor}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3">
                      <Clock className="h-5 w-5 text-muted-foreground" />
                      <div>
                        <p className="text-sm text-muted-foreground">Schedule</p>
                        <p className="font-medium">
                          {course.schedule || <span className="text-muted-foreground italic">No session joined yet</span>}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <BookOpen className="h-5 w-5 text-muted-foreground" />
                      <div>
                        <p className="text-sm text-muted-foreground">Progress</p>
                        <p className="font-medium">{course.progress}%</p>
                      </div>
                    </div>
                  </div>

                  <div className="pt-4 border-t">
                    <div className="flex justify-between text-sm mb-2">
                      <span className="text-muted-foreground">Course Progress</span>
                      <span className="font-semibold text-foreground">{course.progress}%</span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-3">
                      <div 
                        className={`${course.color} h-3 rounded-full transition-all`}
                        style={{ width: `${course.progress}%` }}
                      />
                    </div>
                  </div>

                  {!course.schedule && (
                    <div className="pt-4">
                      <Button 
                        onClick={handleJoinSessionClick}
                        className="w-full flex items-center justify-center gap-2"
                      >
                        <Plus className="h-4 w-4" />
                        Join a Session / Tham gia buổi học
                      </Button>
                      <p className="text-xs text-muted-foreground text-center mt-2">
                        Join a tutoring session to set your schedule
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Sessions Overview Card */}
            <div className="lg:col-span-1">
              <Card className="rounded-xl shadow-md">
                <CardHeader>
                  <CardTitle className="text-xl">Available Sessions</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {availableSessions.slice(0, 3).map((session) => (
                      <div key={session.id} className="p-3 rounded-lg border bg-accent/30">
                        <p className="font-medium text-sm">{session.topic}</p>
                        <p className="text-xs text-muted-foreground mt-1">{session.date}</p>
                        <p className="text-xs text-muted-foreground">{session.time}</p>
                      </div>
                    ))}
                    <Button 
                      variant="outline" 
                      className="w-full mt-2"
                      onClick={handleJoinSessionClick}
                    >
                      View All Sessions
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Join Session Dialog */}
          <Dialog open={showJoinSessionDialog} onOpenChange={(open) => !open && closeJoinSessionDialog()}>
            <DialogContent className="sm:max-w-lg">
              <DialogHeader>
                <DialogTitle>Join a Session / Tham gia buổi học</DialogTitle>
                <DialogDescription>
                  Select a tutoring session with {course.tutor}
                </DialogDescription>
              </DialogHeader>

              {joinSessionStatus === "idle" && (
                <div className="space-y-4">
                  <div>
                    <h4 className="text-sm font-medium mb-3">Available Sessions / Các buổi học có sẵn:</h4>
                    <RadioGroup value={selectedSession} onValueChange={setSelectedSession}>
                      <div className="space-y-2 max-h-[400px] overflow-y-auto">
                        {availableSessions.map((session) => (
                          <div key={session.id} className="flex items-start space-x-3 space-y-0 rounded-lg border p-4 hover:bg-accent/50 transition-colors">
                            <RadioGroupItem value={session.id.toString()} id={`session-${session.id}`} />
                            <Label htmlFor={`session-${session.id}`} className="flex-1 cursor-pointer">
                              <div className="font-medium">{session.topic}</div>
                              <div className="text-sm text-muted-foreground flex items-center gap-2 mt-1">
                                <Calendar className="h-3 w-3" />
                                {session.date}
                              </div>
                              <div className="text-xs text-muted-foreground flex items-center gap-2 mt-1">
                                <Clock className="h-3 w-3" />
                                {session.time}
                              </div>
                            </Label>
                          </div>
                        ))}
                      </div>
                    </RadioGroup>
                  </div>
                  
                  <Button onClick={handleSessionSelect} className="w-full">
                    Join Session / Tham gia
                  </Button>
                </div>
              )}

              {joinSessionStatus === "waiting" && (
                <div className="flex flex-col items-center justify-center py-8 space-y-4">
                  <Clock className="h-12 w-12 text-primary animate-pulse" />
                  <div className="text-center">
                    <p className="font-medium">Waiting for tutor confirmation...</p>
                    <p className="text-sm text-muted-foreground">Đang chờ xác nhận từ tutor...</p>
                  </div>
                </div>
              )}

              {joinSessionStatus === "confirmed" && (
                <div className="flex flex-col items-center justify-center py-8 space-y-4">
                  <CheckCircle2 className="h-12 w-12 text-green-600" />
                  <div className="text-center">
                    <p className="font-medium text-green-600">Tutor Confirmed!</p>
                    <p className="text-sm text-muted-foreground">Tutor đã xác nhận!</p>
                    <p className="text-sm text-muted-foreground mt-2">
                      Your schedule has been updated
                    </p>
                  </div>
                </div>
              )}
            </DialogContent>
          </Dialog>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default CourseDetails;
