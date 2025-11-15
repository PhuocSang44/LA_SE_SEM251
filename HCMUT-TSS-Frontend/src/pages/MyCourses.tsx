import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Calendar, User, Clock, Plus, CheckCircle2 } from "lucide-react";
import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
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

const MyCourses = () => {
  const navigate = useNavigate();
  
  const { user } = useAuth();

  const apiBase = import.meta.env.VITE_API_BASE || "http://localhost:10001";

  // Numeric user id for ownership checks: use datacore `officialId` (frontend `User` doesn't expose DB id)
  const numericUserId = user?.officialId ? Number(user.officialId) : null;

  // Join session states
  const [showJoinSessionDialog, setShowJoinSessionDialog] = useState(false);
  const [courseId, setCourseId] = useState("");
  const [selectedSession, setSelectedSession] = useState("");
  const [joinSessionStatus, setJoinSessionStatus] = useState<"idle" | "waiting" | "confirmed">("idle");
  const [foundCourse, setFoundCourse] = useState<any>(null);

  const [courses, setCourses] = useState<any[]>([]);
  const [availableCoursesWithSessions, setAvailableCoursesWithSessions] = useState<any[]>([]);

  const loadCourses = () => {
    // Load only enrolled courses for the current student
    fetch(`${apiBase}/course-registrations/me`, { credentials: 'include' })
      .then(res => res.ok ? res.json() : Promise.reject(res))
      .then((data: any[]) => {
        // data is CourseRegistrationResponse[]
        // Map registration -> course card model
        const mapped = data.map(r => ({
          registrationId: r.registrationId,
          id: r.classId,
          name: r.courseName,
          tutor: r.tutorName || "",
          tutorId: r.tutorId ?? null,
          semester: r.semester || "",
          sessions: 1,
          color: "bg-blue-500",
          progress: 0
        }));
        setCourses(mapped);

        // available sessions still map from all classes for discovery purposes
        // we keep the existing availableCoursesWithSessions logic by calling /api/classes
        fetch(`${apiBase}/api/classes`, { credentials: 'include' })
          .then(res => res.ok ? res.json() : Promise.reject(res))
          .then((all: any[]) => {
            // Remove classes that the user already enrolled in from available sessions
            const enrolledIds = new Set(mapped.map(m => m.id));
            const byCourse: Record<string, any> = {};
            all.forEach(c => {
              if (enrolledIds.has(c.classId)) return; // skip already-enrolled classes
              const key = c.courseCode || c.courseName;
              byCourse[key] = byCourse[key] || { name: c.courseName, code: c.courseCode, category: "", sessions: [] };
              byCourse[key].sessions.push({ id: c.classId, tutor: c.tutorName, date: c.semester, time: "", topic: c.courseName, tutorId: c.tutorId });
            });
            setAvailableCoursesWithSessions(Object.values(byCourse));
          }).catch(() => setAvailableCoursesWithSessions([]));
      }).catch(err => {
        console.error("Failed to load enrolled courses", err);
        setCourses([]);
      });
  };

  useEffect(() => {
    loadCourses();
  }, [user]);

  const handleJoinSessionClick = () => {
    setShowJoinSessionDialog(true);
    setCourseId("");
    setSelectedSession("");
    setJoinSessionStatus("idle");
    setFoundCourse(null);
  };

  const handleSearchCourseById = () => {
    if (!courseId.trim()) {
      toast({
        title: "Please enter a course ID",
        description: "You must enter a course ID to search for available sessions",
        variant: "destructive"
      });
      return;
    }

    const code = courseId.trim();
    fetch(`${import.meta.env.VITE_API_BASE || "http://localhost:10001"}/api/classes/course/${encodeURIComponent(code)}`, { credentials: 'include' })
      .then(res => {
        if (res.ok) return res.json();
        if (res.status === 404) return Promise.resolve([]);
        return Promise.reject(res);
      })
      .then((list: any[]) => {
        if (!list || list.length === 0) {
          toast({ title: "Course not found", description: "No course matches this ID or no sessions available.", variant: "destructive" });
          setFoundCourse(null);
          return;
        }
        // Convert class list into a pseudo-course with sessions
        const courseObj = { name: list[0].courseName, code: list[0].courseCode, category: "", sessions: list.map((cl: any) => ({ id: cl.classId, tutor: cl.tutorName, date: cl.semester, time: "", topic: cl.courseName, tutorId: cl.tutorId })) };
        setFoundCourse(courseObj);
        toast({ title: "Course found!", description: `${courseObj.name} (${courseObj.code}) - ${courseObj.sessions.length} sessions available` });
      }).catch(err => {
        console.error(err);
        toast({ title: "Error", description: "Failed to fetch course info" , variant: "destructive"});
      });
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
    // Ensure user is not trying to join their own class (compare numeric IDs)
    const sessionId = parseInt(selectedSession, 10);
    const sessionOwnerId = foundCourse?.sessions?.find((s: any) => s.id === sessionId)?.tutorId;
        if (sessionOwnerId != null && numericUserId != null && sessionOwnerId === numericUserId) {
      toast({ title: 'Cannot join your own class', description: 'You are the tutor of this class and cannot enroll as a student.', variant: 'destructive' });
      return;
    }

    setJoinSessionStatus("waiting");

    // Call backend to enroll in class (selectedSession holds classId)
    const payload = { classId: parseInt(selectedSession, 10) };
    fetch(`${import.meta.env.VITE_API_BASE || "http://localhost:10001"}/course-registrations/enroll`, {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    }).then(async res => {
      if (res.ok) {
        // Simple success UX: notify and refresh My Courses/available sessions
        toast({ title: "Enrolled", description: "You have been enrolled successfully" });
        loadCourses();
        // close dialog and reset dialog state
        closeJoinSessionDialog();
      } else {
        const text = await res.text();
        throw new Error(text || 'Enrollment failed');
      }
    }).catch(err => {
      console.error(err);
      setJoinSessionStatus("idle");
      toast({ title: "Failed to enroll", description: String(err), variant: "destructive" });
    });
  };

  const closeJoinSessionDialog = () => {
    setShowJoinSessionDialog(false);
    setCourseId("");
    setSelectedSession("");
    setJoinSessionStatus("idle");
    setFoundCourse(null);
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 bg-muted/30">
        <div className="container mx-auto px-4 py-8">
          <div className="mb-8 flex items-start justify-between">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-2">My Courses</h1>
              <p className="text-muted-foreground">Track your enrolled tutoring courses</p>
            </div>
            <Button 
              onClick={handleJoinSessionClick}
              className="flex items-center gap-2"
            >
              <Plus className="h-4 w-4" />
              Join a Session
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {courses.map((course) => (
              <Card key={course.id} className="rounded-xl shadow-md hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-xl mb-2">{course.name}</CardTitle>
                      <Badge className={`${course.color} text-white border-0`}>
                        {course.sessions} sessions
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <User className="h-4 w-4" />
                      <span>{course.tutor}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Clock className="h-4 w-4" />
                      <span>{course.semester || <span className="italic">Not specified</span>}</span>
                    </div>
                  </div>
                  
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span className="text-muted-foreground">Progress</span>
                      <span className="font-semibold text-foreground">{course.progress}%</span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2">
                      <div 
                        className={`${course.color} h-2 rounded-full transition-all`}
                        style={{ width: `${course.progress}%` }}
                      />
                    </div>
                  </div>

                  <Button 
                    variant="outline" 
                    className="w-full rounded-lg"
                    onClick={() => navigate("/course-details", { state: { course } })}
                  >
                    View Details
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Join Session Dialog */}
          <Dialog open={showJoinSessionDialog} onOpenChange={(open) => !open && closeJoinSessionDialog()}>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Join a Session / Tham gia buổi học</DialogTitle>
                <DialogDescription>
                  Enter the course ID to see available tutoring sessions
                </DialogDescription>
              </DialogHeader>

              {joinSessionStatus === "idle" && !foundCourse && (
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="courseId">Course ID / Mã khóa học</Label>
                    <div className="flex gap-2 mt-2">
                      <Input
                        id="courseId"
                        placeholder="e.g., MT1003, CO2003"
                        value={courseId}
                        onChange={(e) => setCourseId(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleSearchCourseById()}
                      />
                      <Button onClick={handleSearchCourseById}>
                        Search / Tìm
                      </Button>
                    </div>
                  </div>
                </div>
              )}

              {joinSessionStatus === "idle" && foundCourse && (
                <div className="space-y-4">
                  <div className="rounded-lg border p-4 bg-accent/30">
                    <h4 className="font-medium mb-1">{foundCourse.name}</h4>
                    <p className="text-sm text-muted-foreground">{foundCourse.code} - {foundCourse.category}</p>
                  </div>
                  
                  <div>
                    <h4 className="text-sm font-medium mb-3">Available Sessions / Các buổi học có sẵn:</h4>
                    <RadioGroup value={selectedSession} onValueChange={setSelectedSession}>
                      {foundCourse.sessions.map((session: any) => {
                        const isOwnClass = numericUserId != null && session.tutorId === numericUserId;
                        return (
                        <div key={session.id} className={`flex items-start space-x-3 space-y-0 rounded-lg border p-4 ${isOwnClass ? '' : 'hover:bg-accent/50'} transition-colors`}>
                          <RadioGroupItem value={session.id.toString()} id={`session-${session.id}`} disabled={isOwnClass} />
                          <Label htmlFor={`session-${session.id}`} className={`flex-1 cursor-pointer ${isOwnClass ? 'opacity-60' : ''}`}>
                            <div className="font-medium">{session.topic} {isOwnClass && <span className="text-xs text-muted-foreground">(Your class)</span>}</div>
                            <div className="text-sm text-muted-foreground flex items-center gap-2 mt-1">
                              <User className="h-3 w-3" />
                              {session.tutor}
                            </div>
                            <div className="text-xs text-muted-foreground flex items-center gap-2 mt-1">
                              <Calendar className="h-3 w-3" />
                              {session.date} • {session.time}
                            </div>
                          </Label>
                        </div>
                      )})}
                    </RadioGroup>
                  </div>
                  
                  <div className="flex gap-2">
                    <Button onClick={() => { setFoundCourse(null); setCourseId(""); }} variant="outline" className="flex-1">
                      Back / Quay lại
                    </Button>
                    <Button onClick={handleSessionSelect} className="flex-1">
                      Join Session / Tham gia
                    </Button>
                  </div>
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
                      You have joined the session for {foundCourse?.name}
                    </p>
                  </div>
                  <Button onClick={closeJoinSessionDialog} variant="outline" className="mt-4">
                    Close / Đóng
                  </Button>
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

export default MyCourses;
