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
import { listSessionsByClass, hasConflict, createSession, updateSession, formatSessionRange, enrollInSession, listSessionsByUser, cancelEnroll } from "@/lib/sessionApi";
import type { Session } from "@/types/session";

const MyCourses = () => {
  const navigate = useNavigate();
  
  const { user } = useAuth();
  const isTutor = user?.role === 'tutor';
  const isStudent = user?.role?.toLowerCase?.() === 'student';

  const apiBase = import.meta.env.VITE_API_BASE || "http://localhost:10001";

  // Numeric user id for ownership checks: use datacore `officialId` (frontend `User` doesn't expose DB id)
  const numericUserId = user?.officialId ? Number(user.officialId) : null;

  // Join session states
  const [showJoinSessionDialog, setShowJoinSessionDialog] = useState(false);
  const [courseId, setCourseId] = useState("");
  const [selectedSession, setSelectedSession] = useState("");
  const [joinSessionStatus, setJoinSessionStatus] = useState<"idle" | "waiting" | "confirmed">("idle");
  const [foundCourse, setFoundCourse] = useState<any>(null);

  const [studentCourses, setStudentCourses] = useState<any[]>([]);
  const [tutorCourses, setTutorCourses] = useState<any[]>([]);
  const [availableCoursesWithSessions, setAvailableCoursesWithSessions] = useState<any[]>([]);
  const [mySessions, setMySessions] = useState<Session[]>([]);
  const [loadingCourses, setLoadingCourses] = useState(false);
  const [joinedSessionIds, setJoinedSessionIds] = useState<Set<number>>(new Set());
  const [sessionDialogOpen, setSessionDialogOpen] = useState(false);
  const [sessionDialogMode, setSessionDialogMode] = useState<'create' | 'edit'>('create');
  const [activeCourse, setActiveCourse] = useState<any | null>(null);
  const [editingSession, setEditingSession] = useState<Session | null>(null);
  const [sessionTopic, setSessionTopic] = useState("");
  const [sessionDate, setSessionDate] = useState("");
  const [sessionStart, setSessionStart] = useState("");
  const [sessionEnd, setSessionEnd] = useState("");
  const [sessionSubmitting, setSessionSubmitting] = useState(false);

  const mergeDateTime = (dateStr: string, timeStr: string) => {
    try {
      const [h, m] = timeStr.split(":").map(Number);
      const date = new Date(dateStr);
      date.setHours(h || 0, m || 0, 0, 0);
      return date.toISOString();
    } catch {
      return new Date().toISOString();
    }
  };

  const loadStudentCourses = async () => {
    setLoadingCourses(true);
    try {
      const res = await fetch(`${apiBase}/course-registrations/me`, { credentials: 'include' });
      if (!res.ok) throw new Error('Không lấy được danh sách khóa học');
      const data = await res.json();
      const baseCourses = data.map((r: any) => ({
        registrationId: r.registrationId,
        id: r.classId,
        name: r.courseName,
        tutor: r.tutorName || "",
        tutorId: r.tutorId ?? null,
        semester: r.semester || "",
        color: "bg-blue-500",
        progress: 0
      }));
      const withSessions = await Promise.all(baseCourses.map(async (course: any) => {
        const sessions = await listSessionsByClass(course.id);
        console.log('Loaded student courses with sessions:', sessions);
        return { ...course, sessions };
      }));
      
      setStudentCourses(withSessions);

      fetch(`${apiBase}/api/classes`, { credentials: 'include' })
        .then(res => res.ok ? res.json() : Promise.reject(res))
        .then((all: any[]) => {
          const enrolledIds = new Set(baseCourses.map(m => m.id));
          const byCourse: Record<string, any> = {};
          all.forEach(c => {
            if (enrolledIds.has(c.classId)) return;
            const key = c.courseCode || c.courseName;
            byCourse[key] = byCourse[key] || { name: c.courseName, code: c.courseCode, category: "", sessions: [] };
            byCourse[key].sessions.push({ id: c.classId, tutor: c.tutorName, date: c.semester, time: "", topic: c.courseName, tutorId: c.tutorId });
          });
          setAvailableCoursesWithSessions(Object.values(byCourse));
        }).catch(() => setAvailableCoursesWithSessions([]));
    } catch (error) {
      console.error('Failed to load enrolled courses', error);
      setStudentCourses([]);
      setAvailableCoursesWithSessions([]);
    } finally {
      setLoadingCourses(false);
    }
  };

  const loadTutorCourses = async () => {
    setLoadingCourses(true);
    try {
      const res = await fetch(`${apiBase}/api/classes`, { credentials: 'include' });
      if (!res.ok) throw new Error('Không lấy được danh sách lớp');
      const list = await res.json();
      const tutorId = user?.officialId ? Number(user.officialId) : null;
      const mine = tutorId == null ? [] : list.filter((cls: any) => cls.tutorId === tutorId);
      const normalized = await Promise.all(mine.map(async (cls: any) => {
        const sessions = await listSessionsByClass(cls.classId);
        return {
          id: cls.classId,
          name: cls.courseName,
          tutor: cls.tutorName,
          tutorId: cls.tutorId,
          semester: cls.semester,
          color: "bg-blue-500",
          progress: 0,
          sessions
        };
      }));
      setTutorCourses(normalized);
    } catch (error) {
      console.error('Failed to load tutor classes', error);
      setTutorCourses([]);
    } finally {
      setLoadingCourses(false);
    }
  };

   useEffect(() => {
   const loadJoined = async () => {
     if (!isStudent) {
       setJoinedSessionIds(new Set());
       return;
     }
     try {
       const data = await listSessionsByUser(numericUserId || 0);
       console.log('Loaded joined sessions:', data);
       const ids = new Set<number>(data.map((s: any) => Number(s.sessionId ?? s.id)));
       setJoinedSessionIds(ids);
     } catch (e) {
       console.error('Failed to load joined sessions', e);
       setJoinedSessionIds(new Set());
     }
   };
   loadJoined();
 }, [isStudent, numericUserId]);

  useEffect(() => {
    if (isStudent) {
      loadStudentCourses();
    } else {
      setStudentCourses([]);
      setAvailableCoursesWithSessions([]);
      setMySessions([]);
    }
  }, [isStudent]);

  useEffect(() => {
    if (isTutor) {
      loadTutorCourses();
    } else {
      setTutorCourses([]);
    }
  }, [isTutor, user?.officialId]);

  useEffect(() => {
    if (isStudent) {
      const aggregated = studentCourses.flatMap((course) => course.sessions || []);
      setMySessions(aggregated);
    }
  }, [studentCourses, isStudent]);

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
    // Conflict check: candidate session times vs mySessions
    const sessionCandidate = foundCourse?.sessions?.find((s: any) => s.id === sessionId);
    if (sessionCandidate && sessionCandidate.startTime && sessionCandidate.endTime) {
      const candidate: Session = { id: sessionId, classId: sessionId, tutorId: sessionOwnerId, title: sessionCandidate.topic || '', startTime: sessionCandidate.startTime, endTime: sessionCandidate.endTime, status: 'scheduled' };
      
      if (hasConflict(mySessions, candidate)) {
        toast({ title:'Schedule conflict', description:'This session overlaps with an existing one', variant:'destructive'});
        setJoinSessionStatus('idle');
        return;
      }
    }
    fetch(`${import.meta.env.VITE_API_BASE || "http://localhost:10001"}/course-registrations/enroll`, {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    }).then(async res => {
      if (res.ok) {
        // Simple success UX: notify and refresh My Courses/available sessions
        toast({ title: "Enrolled", description: "You have been enrolled successfully" });
        loadStudentCourses();
        // close dialog and reset dialog state
        closeJoinSessionDialog();
      } else {
        const text = await res.text();
        let errorMessage = 'Enrollment failed';
        try {
          const err = JSON.parse(text);
          errorMessage = err.error || err.message || text || errorMessage;
        } catch (e) {
          errorMessage = text || errorMessage;
        }
        throw new Error(errorMessage);
      }
    }).catch(err => {
      console.error(err);
      setJoinSessionStatus("idle");
      const errorMsg = err.message || String(err);
      toast({ title: "Failed to enroll", description: errorMsg, variant: "destructive" });
    });
  };

  const closeJoinSessionDialog = () => {
    setShowJoinSessionDialog(false);
    setCourseId("");
    setSelectedSession("");
    setJoinSessionStatus("idle");
    setFoundCourse(null);
  };

  const displayedCourses = isTutor ? tutorCourses : studentCourses;

  const resetSessionForm = () => {
    setSessionTopic("");
    setSessionDate("");
    setSessionStart("");
    setSessionEnd("");
    setEditingSession(null);
    setActiveCourse(null);
  };

  const refreshCourseSessions = async (courseId: number) => {
    const latest = await listSessionsByClass(courseId);
    setTutorCourses((prev) => prev.map((c) => c.id === courseId ? { ...c, sessions: latest } : c));
    setStudentCourses((prev) => prev.map((c) => c.id === courseId ? { ...c, sessions: latest } : c));
  };

  const openSessionDialog = (mode: 'create' | 'edit', course: any, session?: Session) => {
    setSessionDialogMode(mode);
    setActiveCourse(course);
    setEditingSession(session || null);
    setSessionTopic(session?.title || "");
    setSessionDate(session ? new Date(session.startTime).toISOString().substring(0, 10) : "");
    setSessionStart(session ? new Date(session.startTime).toTimeString().substring(0, 5) : "");
    setSessionEnd(session ? new Date(session.endTime).toTimeString().substring(0, 5) : "");
    setSessionDialogOpen(true);
  };

  const handleSessionDialogSubmit = async () => {
    if (!activeCourse) {
      toast({ title: "Haven't selected a class yet", description: 'Please select a class to proceed', variant: 'destructive' });
      return;
    }
    if (!sessionTopic.trim() || !sessionDate || !sessionStart || !sessionEnd) {
      toast({ title: 'Missing information', description: 'Please fill in topic, date, and time', variant: 'destructive' });
      return;
    }
    const startIso = mergeDateTime(sessionDate, sessionStart);
    const endIso = mergeDateTime(sessionDate, sessionEnd);
    if (new Date(startIso) >= new Date(endIso)) {
      toast({ title: 'Invalid time range', description: 'End time must be after start time', variant: 'destructive' });
      return;
    }
    setSessionSubmitting(true);
    try {
      if (sessionDialogMode === 'create') {
        const created = await createSession({ classId: activeCourse.id, topic: sessionTopic.trim(), startTime: startIso, endTime: endIso });
        if (!created) throw new Error('Failed to create session');
        toast({ title: 'Session created', description: `${created.topic} • ${new Date(created.startTime).toLocaleString()}` });
      } else if (editingSession) {
        const ok = await updateSession(editingSession.id, { topic: sessionTopic.trim(), startTime: startIso, endTime: endIso });
        if (!ok) throw new Error('Failed to update session');
        toast({ title: 'Session updated', description: sessionTopic });
      }
      await refreshCourseSessions(activeCourse.id);
      setSessionDialogOpen(false);
      resetSessionForm();
    } catch (error: any) {
      toast({ title: 'Session operation error', description: String(error?.message || error), variant: 'destructive' });
    } finally {
      setSessionSubmitting(false);
    }
  };

  const cancelEnrollment = async (sessionId: number) => {
    try {
      const ok = await cancelEnroll(sessionId, numericUserId || 0);
      console.log('Cancel enrollment response:', ok);
      if (!ok) throw new Error('Failed to cancel enrollment');
      toast({ title: 'Enrollment cancelled', description: 'You have been unenrolled from the session' });
      await refreshCourseSessions(sessionId);
      setJoinedSessionIds(prev => {
        const newSet = new Set(prev);
        newSet.delete(sessionId);
        return newSet;
      });
    } catch (error: any) {
      toast({ title: 'Failed to cancel enrollment', description: String(error?.message || error), variant: 'destructive' });
    }
  };

  const handleCancelSession = async (courseId: number, sessionId: number) => {
    try {
      const ok = await updateSession(sessionId, { status: 'cancelled' });
      if (!ok) throw new Error('Failed to cancel session');
      toast({ title: 'Session cancelled', description: 'The session has been marked as cancelled' });
      await refreshCourseSessions(courseId);
    } catch (error: any) {
      toast({ title: 'Failed to cancel session', description: String(error?.message || error), variant: 'destructive' });
    }
  };

  const handleJoinSessionDirect = async (session: Session) => {
    console.log('Attempting to join session:', session);
    if (session.status === 'cancelled') {
      toast({ title: 'Session cancelled', description: 'Cannot join a cancelled session', variant: 'destructive' });
      console.log('Session is cancelled, cannot join.');
      return;
    }
    // if (hasConflict(mySessions, session)) {
    //   toast({ title: 'Schedule conflict', description: 'This session conflicts with your existing schedule', variant: 'destructive' });
    //   console.log('Schedule conflict detected, cannot join.');
    //   return;
    // }
    try {
      const payload = { sessionId: session.sessionId, UserID: numericUserId || 0 };
      console.log('Joining session with payload:', payload);
      const ok = await enrollInSession(payload);
      if (!ok) throw new Error('Failed to join session');
      toast({ title: 'Joined session', description: session.sessionTitle });
      await refreshCourseSessions(session.classId);
      setMySessions((prev) => [...prev, session]);
      const sid  = Number(session.sessionId ?? session.id);
      setJoinedSessionIds(prev => {
        const newSet = new Set(prev);
        newSet.add(sid);
        return newSet;
      });
    } catch (error: any) {
      toast({ title: 'Failed to join session', description: String(error?.message || error), variant: 'destructive' });
    }
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
            {isStudent && (
              <Button 
                onClick={handleJoinSessionClick}
                className="flex items-center gap-2"
              >
                <Plus className="h-4 w-4" />
                Join a Session
              </Button>
            )}
          </div>

          {loadingCourses && <p className="text-sm text-muted-foreground mb-4">Loading courses...</p>}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {displayedCourses.length === 0 && !loadingCourses ? (
              <Card className="rounded-xl shadow-sm">
                <CardContent className="py-10 text-center text-muted-foreground">
                  No courses to display.
                </CardContent>
              </Card>
            ) : (
              displayedCourses.map((course) => {
                const sessionList: Session[] = Array.isArray(course.sessions) ? course.sessions : [];
                console.log('Rendering course with sessions:', course.name, sessionList);
                const visibleSessions = sessionList.slice(0, 10);
                return (
                  <Card key={course.id} className="rounded-xl shadow-md hover:shadow-lg transition-shadow">
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <CardTitle className="text-xl mb-2">{course.name}</CardTitle>
                          <Badge className={`${course.color} text-white border-0`}>
                            {sessionList.length} sessions
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

                      {isTutor && (
                        <div className="space-y-3 border-t pt-4">
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-semibold">Sessions</span>
                            <Button size="sm" onClick={() => openSessionDialog('create', course)}>
                              <Plus className="h-4 w-4 mr-1" /> New Session
                            </Button>
                          </div>
                          {visibleSessions.length === 0 && (
                            <p className="text-sm text-muted-foreground">No sessions available.</p>
                          )}
                          {visibleSessions.map((session) => (
                            <div key={session.id} className="border rounded-lg p-3 text-sm flex items-start justify-between gap-3">
                              <div>
                                <p className="font-medium">{session.sessionTitle}</p>
                                <p className="text-xs text-muted-foreground">{formatSessionRange(session)}</p>
                                <p className="text-xs text-muted-foreground">Status: {session.status}</p>
                              </div>
                              <div className="flex flex-col gap-2">
                                <Button size="sm" variant="outline" onClick={() => openSessionDialog('edit', course, session)}>Reschedule</Button>
                                <Button size="sm" variant="destructive" onClick={() => handleCancelSession(course.id, session.id)}>Cancel</Button>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}

                      {isStudent && (
                        <div className="space-y-3 border-t pt-4">
                          <span className="text-sm font-semibold">Upcoming Sessions</span>
                          {visibleSessions.length === 0 && (
                            <p className="text-sm text-muted-foreground">Tutor has not created any sessions.</p>
                          )}
                          {visibleSessions.map((session) => (
                            <div key={session.id} className="border rounded-lg p-3 text-sm flex items-center gap-3 justify-between">
                              <div>
                                <p className="font-medium">{session.sessionTitle}</p>
                                <p className="text-xs text-muted-foreground">{formatSessionRange(session)}</p>
                                <p className="text-xs text-muted-foreground">Status: {session.status}</p>
                              </div>
                              
                              {(() => {
                                const sid = Number(session.sessionId ?? session.id);
                                const joined = joinedSessionIds.has(sid);
                                return (
                                  <div className="flex items-center gap-2">
                                    <Button
                                      size="sm"
                                      disabled={session.status === 'cancelled' || joined}
                                      onClick={() => { if (!joined) handleJoinSessionDirect(session); }}
                                    >
                                      {joined ? 'Joined' : 'Join'}
                                    </Button>

                                    {joined && (
                                      <Button size="sm" variant="destructive" onClick={() => cancelEnrollment(sid)}>
                                        Cancel
                                      </Button>
                                    )}
                                  </div>
                                );
                              })()}
                            </div>
                          ))}
                        </div>
                      )}

                      <Button 
                        variant="outline" 
                        className="w-full rounded-lg"
                        onClick={() => navigate("/courseDetails", { state: { course } })}
                      >
                        View Details
                      </Button>
                    </CardContent>
                  </Card>
                );
              })
            )}
          </div>

          {/* Join Session Dialog */}
          <Dialog open={showJoinSessionDialog} onOpenChange={(open) => !open && closeJoinSessionDialog()}>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Join a Session</DialogTitle>
                <DialogDescription>
                  Enter the course ID to see available tutoring sessions
                </DialogDescription>
              </DialogHeader>

              {joinSessionStatus === "idle" && !foundCourse && (
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="courseId">Course ID</Label>
                    <div className="flex gap-2 mt-2">
                      <Input
                        id="courseId"
                        placeholder="e.g., MT1003, CO2003"
                        value={courseId}
                        onChange={(e) => setCourseId(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleSearchCourseById()}
                      />
                      <Button onClick={handleSearchCourseById}>
                        Search
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
                    <h4 className="text-sm font-medium mb-3">Available Sessions:</h4>
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
                      Back
                    </Button>
                    <Button onClick={handleSessionSelect} className="flex-1">
                      Join Session
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

          <Dialog open={sessionDialogOpen} onOpenChange={(open) => {
            setSessionDialogOpen(open);
            if (!open) resetSessionForm();
          }}>
            <DialogContent className="sm:max-w-lg">
              <DialogHeader>
                <DialogTitle>{sessionDialogMode === 'create' ? 'Create new session' : 'Reschedule session'}</DialogTitle>
                <DialogDescription>
                  {activeCourse ? `Class: ${activeCourse.name}` : 'Select a class to proceed'}
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label>Topic</Label>
                  <Input value={sessionTopic} onChange={(e) => setSessionTopic(e.target.value)} placeholder="e.g., Review Chapter 3" />
                </div>
                <div className="grid grid-cols-3 gap-3">
                  <div className="col-span-1">
                    <Label>Date</Label>
                    <Input type="date" value={sessionDate} onChange={(e) => setSessionDate(e.target.value)} />
                  </div>
                  <div>
                    <Label>Start Time</Label>
                    <Input type="time" value={sessionStart} onChange={(e) => setSessionStart(e.target.value)} />
                  </div>
                  <div>
                    <Label>End Time</Label>
                    <Input type="time" value={sessionEnd} onChange={(e) => setSessionEnd(e.target.value)} />
                  </div>
                </div>
                <div className="flex gap-2 justify-end">
                  <Button variant="outline" onClick={() => { setSessionDialogOpen(false); resetSessionForm(); }} disabled={sessionSubmitting}>Cancel</Button>
                  <Button onClick={handleSessionDialogSubmit} disabled={sessionSubmitting}>
                    {sessionSubmitting ? 'Saving...' : (sessionDialogMode === 'create' ? 'Create Session' : 'Save Changes')}
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default MyCourses;
