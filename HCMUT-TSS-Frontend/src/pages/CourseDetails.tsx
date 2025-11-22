import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, User, Clock, BookOpen, Plus, CheckCircle2, MessageSquare, Star, Pencil, X, FileText, Download } from "lucide-react";
import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
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
import { listSessionsByClass } from "@/lib/sessionApi";
import { Toaster } from "@/components/ui/sonner";

const CourseDetails = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const initialCourse = location.state?.course;
  console.log("DEBUG: initialCourse from location.state:", initialCourse);
  const { user } = useAuth();

  const [fullCourse, setFullCourse] = useState<any | null>(null);

  // 'course' is the canonical source of truth for this component (fullCourse when available, otherwise initialCourse)
  const course = fullCourse ?? initialCourse;
  const courseCode = course?.code ?? course?.courseCode ?? null;

  const apiBase = import.meta.env.VITE_API_BASE || 'http://localhost:10001';
  const libraryApiBase = import.meta.env.VITE_LIBRARY_BASE || 'http://localhost:10006';

  // Determine ownership using datacore official ID (frontend User does not expose DB id)
  const userOfficialIdNum = user?.officialId ? Number(user.officialId) : null;
  const isTutor = user?.role === 'tutor';
  const isStudent = user?.role?.toLowerCase?.() === 'student';

  // Compute owner status from the (possibly updated) `course` object
  const courseTutorIdNum = course?.tutorId != null ? Number(course.tutorId) : null;
  const isOwner = courseTutorIdNum != null && userOfficialIdNum != null && courseTutorIdNum === userOfficialIdNum;
  // --- DEBUG LOGS: inspect owner check values each render ---
  console.log("--- DEBUG COURSE DETAILS RENDER ---");
  console.log("User (user.officialId):", user?.officialId, "-> userOfficialIdNum:", userOfficialIdNum);
  console.log("Course (course.tutorId):", course?.tutorId, "-> courseTutorIdNum:", courseTutorIdNum);
  console.log("class:", course?.classId);
  console.log("IS OWNER:", isOwner);
  console.log("Current course object:", course);
  console.log("-------------------------------------");

  // If the passed `course` is missing tutorId or tutor name, try to resolve full data from backend
  // by fetching all classes and matching by id or name.
  useEffect(() => {
    (async () => {
      if (!initialCourse) return;
      if (initialCourse.tutorId && initialCourse.tutor) return; // already complete
      try {
        const res = await fetch(`${import.meta.env.VITE_API_BASE || 'http://localhost:10001'}/api/classes`, { credentials: 'include' });
        if (!res.ok) return;
        const list = await res.json();
        // Try to match by known id properties
        const id = initialCourse.id ?? initialCourse.classId ?? null;
        let found = null;
        if (id != null) {
          found = list.find((c: any) => c.classId === id || c.classId === Number(id));
        }
        if (!found) {
          // fallback to match by courseName using initialCourse to avoid loop
          const name = initialCourse.name || initialCourse.courseName;
          found = list.find((c: any) => c.courseName === name || c.courseCode === name);
        }
        if (found) {
          console.log("DEBUG: Fetched full course data:", found);
          // Map backend ClassResponse to the frontend course shape used here
          setFullCourse({
            id: found.classId,
            name: found.courseName,
            tutor: found.tutorName,
            tutorId: found.tutorId,
            semester: found.semester,
            sessions: 1,
            color: 'bg-blue-500',
            progress: 0
          });
        } else {
          console.log(`DEBUG: Could not find full course data for id/name: ${id} / ${initialCourse.name}`);
        }
      } catch (e) {
        console.error("DEBUG: Failed to fetch full course data", e);
      }
    })();
  }, [initialCourse]);

  const [showJoinSessionDialog, setShowJoinSessionDialog] = useState(false);
  const [selectedSession, setSelectedSession] = useState("");
  const [joinSessionStatus, setJoinSessionStatus] = useState<"idle" | "waiting" | "confirmed">("idle");
  const [showRenameDialog, setShowRenameDialog] = useState(false);
  const [renameValue, setRenameValue] = useState("");
  const [renaming, setRenaming] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState("");
  const [deleting, setDeleting] = useState(false);
  // Exit class states (for students)
  const [showExitDialog, setShowExitDialog] = useState(false);
  const [exitConfirmText, setExitConfirmText] = useState("");
  const [isExiting, setIsExiting] = useState(false);

  // Feedback states
  const [showFeedbackDialog, setShowFeedbackDialog] = useState(false);
  const [feedbackComment, setFeedbackComment] = useState("");
  const [feedbackImageUrl, setFeedbackImageUrl] = useState("");
  const [feedbackRatings, setFeedbackRatings] = useState([
    { question: "How would you rate the course content?", ratingValue: 0 },
    { question: "How would you rate the instructor's teaching?", ratingValue: 0 },
    { question: "How would you rate the course difficulty?", ratingValue: 0 }
  ]);
  const [isSubmittingFeedback, setIsSubmittingFeedback] = useState(false);

  // Real sessions state (fetched)
  const [sessions, setSessions] = useState<any[]>([]);
  const [loadingSessions, setLoadingSessions] = useState(false);
  const [editingSessionId, setEditingSessionId] = useState<number | null>(null);
  const [editDate, setEditDate] = useState("");
  const [editStart, setEditStart] = useState("");
  const [editEnd, setEditEnd] = useState("");
  const [editTopic, setEditTopic] = useState("");
  const [libraryItems, setLibraryItems] = useState<any[]>([]);
  const [loadingLibrary, setLoadingLibrary] = useState(false);
  const [libraryError, setLibraryError] = useState<string | null>(null);

  const mergeDateTime = (dateStr: string, timeStr: string) => {
    try { const [h,m] = timeStr.split(':').map(Number); const d = new Date(dateStr); d.setHours(h||0,m||0,0,0); return d.toISOString(); } catch { return new Date().toISOString(); }
  };

  const formatRange = (s: any) => {
    const st = new Date(s.startTime); const en = new Date(s.endTime);
    const datePart = st.toLocaleDateString(undefined, { month:'short', day:'numeric', year:'numeric' });
    const stT = st.toLocaleTimeString(undefined,{hour:'2-digit',minute:'2-digit'});
    const enT = en.toLocaleTimeString(undefined,{hour:'2-digit',minute:'2-digit'});
    return `${datePart} ${stT} - ${enT}`;
  };

  const formatFileSize = (bytes?: number) => {
    if (!bytes || bytes <= 0) return 'Unknown size';
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
    return `${(bytes / (1024 * 1024 * 1024)).toFixed(1)} GB`;
  };

  const toLocalISOString = (isoString: string) => {
  const date = new Date(isoString);
  // Calculate offset (e.g., -420 mins for Vietnam) and convert to ms
  const offsetMs = date.getTimezoneOffset() * 60000;
  // Create a new date that is shifted so toISOString() outputs local numbers
  const localDate = new Date(date.getTime() - offsetMs);
  // Return "YYYY-MM-DDTHH:mm:ss" (No Z, correct local numbers)
  return localDate.toISOString().slice(0, 19);
  };

  useEffect(() => {
    (async () => {
      if (!course?.id) return;
      setLoadingSessions(true);
      try {
        const res = await fetch(`${apiBase}/api/sessions/${course.id}`, { credentials:'include' });
        console.log("DEBUG: Fetching sessions from:", `${apiBase}/api/sessions/${course.id}`);
        if (res.ok) {
          const list = await res.json();
          setSessions(list);
        } else {
          setSessions([]); // fallback
        }
      } catch { setSessions([]); }
      setLoadingSessions(false);
    })();
  }, [course?.id, apiBase]);

  useEffect(() => {
    if (!courseCode) {
      setLibraryItems([]);
      return;
    }
    setLoadingLibrary(true);
    setLibraryError(null);
    const controller = new AbortController();
    const url = `${apiBase}/api/library/search?courseCode=${encodeURIComponent(courseCode)}`;
    fetch(url, { credentials: 'include', signal: controller.signal })
      .then(res => {
        if (!res.ok) {
          throw new Error('Không lấy được tài liệu');
        }
        return res.json();
      })
      .then((data) => {
        setLibraryItems(Array.isArray(data) ? data : []);
      })
      .catch((error) => {
        if (error.name === 'AbortError') return;
        console.error('Failed to fetch library materials', error);
        setLibraryItems([]);
        setLibraryError('Không thể tải tài liệu từ thư viện');
      })
      .finally(() => setLoadingLibrary(false));
    return () => controller.abort();
  }, [apiBase, courseCode]);

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

  const handleSessionSelect = async () => {
    if (!selectedSession) {
      toast({ title: 'Please select a session', description: 'You must select a session to join', variant: 'destructive' });
      return;
    }
    // call backend enroll for session (reuse class enroll if no endpoint yet)
    const s = sessions.find(s => s.id.toString() === selectedSession);
    if (!s) return;
    setJoinSessionStatus('waiting');
    try {
      // hypothetical endpoint
      const res = await fetch(`${apiBase}/api/sessions/${s.id}/enroll`, { method:'POST', credentials:'include' });
      if (!res.ok) throw new Error(await res.text() || 'Enroll failed');
      setJoinSessionStatus('confirmed');
      toast({ title:'Enrolled', description:`${s.topic} ${formatRange(s)}` });
      setTimeout(()=>{ setShowJoinSessionDialog(false); navigate('/my-courses'); },1500);
    } catch (e:any) {
      setJoinSessionStatus('idle');
      toast({ title:'Failed', description:String(e.message||e), variant:'destructive'});
    }
  };

  const closeJoinSessionDialog = () => {
    setShowJoinSessionDialog(false);
    setSelectedSession("");
    setJoinSessionStatus("idle");
  };

  const handleRename = async () => {
    if (!course?.id) return;
    if (!renameValue || renameValue.trim().length === 0) {
      toast({ title: 'Name required', description: 'Please enter a class name', variant: 'destructive' });
      return;
    }
    setRenaming(true);
    try {
      const res = await fetch(`${apiBase}/api/classes/${course.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ courseName: renameValue })
      });

      if (!res.ok) {
        const errorText = await res.text();
        throw new Error(errorText || 'Rename failed');
      }

      const updatedData = await res.json();

      const baseCourse = fullCourse ?? initialCourse; 
      setFullCourse({
        id: updatedData.classId,
        name: updatedData.courseName,
        tutor: updatedData.tutorName,
        tutorId: updatedData.tutorId,
        semester: updatedData.semester,
        sessions: course?.sessions ?? 1,
        color: course?.color || 'bg-blue-500',
        progress: course?.progress ?? 0
      });

      toast({ title: 'Renamed', description: 'Class renamed successfully' });
      setShowRenameDialog(false);
      // stay on the same page and update state in-place
    } catch (e: any) {
      console.error('Rename failed:', e);
      toast({ title: 'Error', description: String(e.message || e), variant: 'destructive' });
    } finally {
      setRenaming(false);
    }
  };

  const handleDelete = async () => {
    if (!course?.id) return;
    if (deleteConfirmText !== (course.name || '')) {
      toast({ title: 'Confirmation mismatch', description: 'Type the class name exactly to confirm', variant: 'destructive' });
      return;
    }
    setDeleting(true);
    try {
      const res = await fetch(`${apiBase}/api/classes/${course.id}`, {
        method: 'DELETE',
        credentials: 'include'
      });
      if (!res.ok) throw new Error('Delete failed');
      toast({ title: 'Deleted', description: 'Class deleted successfully' });
      setShowDeleteDialog(false);
      navigate('/create-class');
    } catch (e) {
      toast({ title: 'Error', description: String(e), variant: 'destructive' });
    } finally {
      setDeleting(false);
    }
  };

  const handleSubmitFeedback = async () => {
    // Validate required ratings
    const hasInvalidRating = feedbackRatings.some(r => r.ratingValue < 1 || r.ratingValue > 5);
    if (hasInvalidRating) {
      toast({
        title: "Please select rating stars",
        description: "All rating questions must have a value between 1-5 stars",
        variant: "destructive"
      });
      return;
    }

    setIsSubmittingFeedback(true);

    // Better courseId and classId resolution
    const courseIdToUse = course?.courseId || course?.id;
    const classIdToUse = course?.classId || course?.id;

    console.log("DEBUG: Submitting feedback with:", {
      courseId: courseIdToUse,
      classId: classIdToUse,
      course: course
    });

    const payload = {
      courseId: courseIdToUse,
      classId: classIdToUse,
      comment: feedbackComment || null,
      imageUrl: feedbackImageUrl || null,
      ratings: feedbackRatings.filter(r => r.ratingValue > 0)
    };

    console.log("DEBUG: Feedback payload:", payload);

    try {
      const res = await fetch(`${apiBase}/api/feedback/submit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(payload)
      });

      console.log("DEBUG: Response status:", res.status);

      if (res.ok) {
        const result = await res.json();
        console.log("DEBUG: Success response:", result);
        toast({
          title: "Feedback submitted successfully",
          description: "Thank you for your feedback!"
        });
        setShowFeedbackDialog(false);
        // Reset form
        setFeedbackComment("");
        setFeedbackImageUrl("");
        setFeedbackRatings([
          { question: "How would you rate the course content?", ratingValue: 0 },
          { question: "How would you rate the instructor's teaching?", ratingValue: 0 },
          { question: "How would you rate the course difficulty?", ratingValue: 0 }
        ]);
      } else {
        const text = await res.text();
        console.error("DEBUG: Error response:", text);
        let errorMessage = 'Feedback submission failed';
        try {
          const err = JSON.parse(text);
          errorMessage = err.error || err.message || text || errorMessage;
        } catch (e) {
          errorMessage = text || errorMessage;
        }
        throw new Error(errorMessage);
      }
    } catch (err: any) {
      console.error("DEBUG: Fetch error:", err);
      const errorMsg = err.message || String(err);
      toast({
        title: "Failed to submit feedback",
        description: errorMsg,
        variant: "destructive"
      });
    } finally {
      console.log("DEBUG: Setting isSubmittingFeedback to false");
      setIsSubmittingFeedback(false);
    }
  };

  const handleRatingChange = (index: number, value: number) => {
    const newRatings = [...feedbackRatings];
    newRatings[index].ratingValue = value;
    setFeedbackRatings(newRatings);
  };

  const handleExit = async () => {
    if (!course?.id) return;
    if (exitConfirmText !== (course.name || '')) {
      toast({ title: 'Confirmation mismatch', description: 'Type the class name exactly to confirm', variant: 'destructive' });
      return;
    }
    setIsExiting(true);
    try {
      // Resolve registrationId if missing
      if (!course?.registrationId) {
        try {
          const me = await fetch(`${apiBase}/course-registrations/me`, { credentials: 'include' });
          if (me.ok) {
            const regs = await me.json();
            const found = regs.find((r: any) => r.classId === course.id || r.classId === course.classId);
            if (found) course.registrationId = found.registrationId;
          }
        } catch (e) { console.error(e); }
      }
      if (!course?.registrationId) {
        toast({ title: 'Error', description: 'Registration id not found', variant: 'destructive' });
        return;
      }

      const res = await fetch(`${apiBase}/course-registrations/${course.registrationId}`, { method: 'DELETE', credentials: 'include' });
      if (!res.ok) {
        const txt = await res.text();
        throw new Error(txt || 'Failed to exit class');
      }
      toast({ title: 'Exited', description: 'You have left the class' });
      setShowExitDialog(false);
      navigate('/my-courses');
    } catch (e: any) {
      console.error(e);
      toast({ title: 'Error', description: String(e.message || e), variant: 'destructive' });
    } finally {
      setIsExiting(false);
      setExitConfirmText('');
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 bg-muted/30">
        <div className="container mx-auto px-4 py-8">
          <Button 
            variant="ghost" 
            onClick={() => {
              // If current user is a tutor -> My Class page
              if (user?.role === 'tutor') {
                navigate('/create-class');
                return;
              }

              // If student -> My Courses
              if (course?.semester) {
                navigate('/my-courses');
                return;
              }

              // Default for other students: go to available courses
              navigate('/available-courses');
            }}
            className="mb-6"
          >
            {user?.role === 'tutor' ? '← Back to My Class' : (course?.semester ? '← Back to My Courses' : '← Back to Available Courses')}
          </Button>
            {}
            {/*Title*/}
            <div className="flex justify-between items-start mb-6">
              {/* Class + badge */}
              <div>
                <h1 className="text-3xl md:text-4xl font-bold text-gray-900">{course?.name}</h1>
                <Badge className={`${course?.color || 'bg-blue-500'} text-white border-0 mt-2`}>
                  {course?.sessions ?? 0} sessions total
                </Badge>
              </div>
              {}
            </div>
            
            {/* main pannel */}
            <div className="grid lg:grid-cols-3 gap-6 items-start">
              <div className="lg:col-span-2">
                <Card className="rounded-xl shadow-md relative">
                  {/* action panel*/}
                  {isOwner && (
                    <div className="absolute top-4 right-4">
                      <div className="bg-white shadow-sm rounded-md p-2 flex items-center gap-2">
                        <Button size="sm" className="bg-blue-600 text-white hover:bg-blue-700 rounded-md px-3 py-1" onClick={() => navigate('/create-quiz', { state: { course } })}>
                          Create Quiz
                        </Button>
                        <Button size="sm" className="bg-blue-600 text-white hover:bg-blue-700 rounded-md px-3 py-1" onClick={() => toast({ title: 'Upload Materials', description: 'Upload materials coming soon' })}>
                          Upload
                        </Button>
                        <Button size="sm" variant="outline" className="bg-white text-blue-600 border-blue-500 hover:bg-blue-50 rounded-md px-3 py-1" onClick={() => { setRenameValue(course?.name || ''); setShowRenameDialog(true); }}>
                          Rename
                        </Button>
                        <Button size="sm" variant="outline" className="bg-white text-blue-600 border-blue-500 hover:bg-blue-50 rounded-md px-3 py-1" onClick={() => navigate('/create-session', { state: { course } })}>
                          New Session
                        </Button>
                      </div>
                    </div>
                  )}

                  {/* <CardHeader>  */}
                  <CardContent className="pt-6 space-y-6"> 
                    <div className="space-y-4">
                              <div className="flex items-center gap-3">
                                <User className="h-5 w-5 text-muted-foreground" />
                                <div>
                                  <p className="text-sm text-muted-foreground">Tutor</p>
                                  <p className="font-medium">{course?.tutor}</p>
                                </div>
                              </div>

                              <div className="flex items-center gap-3">
                                <Clock className="h-5 w-5 text-muted-foreground" />
                                <div>
                                  <p className="text-sm text-muted-foreground">Semester</p>
                                  <p className="font-medium">
                                    {course?.semester || <span className="text-muted-foreground italic">Not specified</span>}
                                  </p>
                                </div>
                              </div>

                              <div className="flex items-center gap-3">
                                <BookOpen className="h-5 w-5 text-muted-foreground" />
                                <div>
                                  <p className="text-sm text-muted-foreground">Progress</p>
                                  <p className="font-medium">{course?.progress ?? 0}%</p>
                                </div>
                              </div>
                            </div>

                            <div className="pt-4 border-t">
                              <div className="flex justify-between text-sm mb-2">
                                <span className="text-muted-foreground">Course Progress</span>
                                <span className="font-semibold text-foreground">{course?.progress ?? 0}%</span>
                              </div>
                              <div className="w-full bg-muted rounded-full h-3">
                                <div 
                                  className={`${course?.color || 'bg-blue-500'} h-3 rounded-full transition-all`}
                                  style={{ width: `${course?.progress ?? 0}%` }}
                                />
                              </div>
                            </div>

                            {isOwner && (
                              <div className="pt-4">
                               
                                <div className="text-sm text-muted-foreground">Danger Zone</div>
                                <Button variant="destructive" className="mt-2 rounded-md px-3 py-1" onClick={() => setShowDeleteDialog(true)}>
                                  Delete Class
                                </Button>
                                <p className="text-xs text-muted-foreground mt-2">Deleting a class is permanent. This action is restricted.</p>
                              </div>
                            )}
                            {/* For students Show join button + danger zone exit */}
                            {!isOwner && (
                              <div className="pt-4">
                                <Button 
                                  onClick={handleJoinSessionClick}
                                  className="w-full flex items-center justify-center gap-2 mb-3"
                                >
                                  <Plus className="h-4 w-4" />
                                  Join a Session / Tham gia buổi học
                                </Button>
                                <p className="text-xs text-muted-foreground text-center mb-4">
                                  Join a tutoring session to sign up for sessions
                                </p>

                                {/* Submit Feedback Button */}
                                {user?.role?.toLowerCase?.() === 'student' && course?.registrationId && (
                                  <Button
                                    onClick={() => setShowFeedbackDialog(true)}
                                    variant="outline"
                                    className="w-full flex items-center justify-center gap-2 mb-4"
                                  >
                                    <MessageSquare className="h-4 w-4" />
                                    Submit Feedback / Gửi đánh giá
                                  </Button>
                                )}

                                <div className="mt-6 text-sm text-muted-foreground">Danger Zone</div>
                                {user?.role?.toLowerCase?.() === 'student' && course?.registrationId && (
                                  <div>
                                    <Button variant="destructive" className="mt-2 rounded-md px-3 py-1" onClick={() => setShowExitDialog(true)}>
                                      Exit Class
                                    </Button>
                                    <p className="text-xs text-muted-foreground mt-2">Leaving a class will remove your registration.</p>
                                  </div>
                                )}
                              </div>
                            )}
                          </CardContent>
                        </Card>
                      </div>

                      {/* Sessions Overview Card */}
                      <div className="lg:col-span-1 space-y-6">
                        <Card className="rounded-xl shadow-md">
                          <CardHeader>
                            <CardTitle className="text-xl">Available Sessions</CardTitle>
                          </CardHeader>
                          <CardContent>
                            <div className="space-y-3">
                              {loadingSessions && <div className="text-sm text-muted-foreground">Loading sessions...</div>}
                              {!loadingSessions && sessions.slice(0,8).map(s => (
                                <div key={s.sessionId} className="p-3 rounded-lg border bg-accent/30 flex justify-between items-start">
                                  <div>
                                    <p className="font-medium text-sm">{s.sessionTitle}</p>
                                    <p className="text-xs text-muted-foreground mt-1">{formatRange(s)}</p>
                                    <p className="text-xs text-muted-foreground">Status: {s.status}</p>
                                  </div>
                                  {isOwner && (
                                    <Button size="sm" variant="ghost" onClick={() => { setEditingSessionId(s.sessionId); setEditTopic(s.sessionTitle); setEditDate(new Date(s.startTime).toISOString().substring(0,10)); setEditStart(new Date(s.startTime).toTimeString().substring(0,5)); setEditEnd(new Date(s.endTime).toTimeString().substring(0,5)); }}>
                                      <Pencil className="h-4 w-4" />
                                    </Button>
                                  )}
                                </div>
                              ))}
                              <Button variant="outline" className="w-full mt-2" onClick={handleJoinSessionClick}>View All Sessions</Button>
                            </div>
                          </CardContent>
                        </Card>

                        {/* Library Materials Card */}
                        <Card className="rounded-xl shadow-md">
                          <CardHeader>
                            <CardTitle className="text-xl flex items-center gap-2">
                              <FileText className="h-5 w-5 text-muted-foreground" />
                              Course Library
                            </CardTitle>
                          </CardHeader>
                          <CardContent>
                            {loadingLibrary && (
                              <div className="text-sm text-muted-foreground">Loading library resources...</div>
                            )}
                            {!loadingLibrary && libraryError && (
                              <div className="text-sm text-destructive">{libraryError}</div>
                            )}
                            {!loadingLibrary && !libraryError && libraryItems.length === 0 && (
                              <div className="text-sm text-muted-foreground">No library materials linked to this course yet.</div>
                            )}
                            {!loadingLibrary && !libraryError && libraryItems.length > 0 && (
                              <div className="space-y-3">
                                {libraryItems.slice(0, 5).map((item) => (
                                  <div key={item.id} className="p-3 rounded-lg border bg-muted/40 flex justify-between items-start gap-3">
                                    <div>
                                      <p className="font-medium text-sm">{item.title || item.originalName || `Library item #${item.id}`}</p>
                                      {item.description && (
                                        <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{item.description}</p>
                                      )}
                                      <p className="text-xs text-muted-foreground mt-1">
                                        {item.originalName || 'Unnamed file'} • {formatFileSize(item.sizeBytes)}
                                      </p>
                                    </div>
                                    <Button size="icon" variant="ghost" asChild>
                                      <a
                                        href={`${libraryApiBase}/api/library/items/${item.id}/download`}
                                        target="_blank"
                                        rel="noreferrer"
                                        title="Download file"
                                      >
                                        <Download className="h-4 w-4" />
                                      </a>
                                    </Button>
                                  </div>
                                ))}
                              </div>
                            )}
                            {!loadingLibrary && !libraryError && libraryItems.length > 5 && (
                              <Button
                                variant="outline"
                                className="w-full mt-3"
                                onClick={() => {
                                  if (!courseCode || typeof window === 'undefined') return;
                                  const viewUrl = `${libraryApiBase}/api/library/items?courseCode=${encodeURIComponent(courseCode)}`;
                                  window.open(viewUrl, '_blank');
                                }}
                              >
                                View all library files
                              </Button>
                            )}
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
                  Select a tutoring session with {course?.tutor}
                </DialogDescription>
              </DialogHeader>

              {joinSessionStatus === "idle" && (
                <div className="space-y-4">
                  <div>
                    <h4 className="text-sm font-medium mb-3">Available Sessions / Các buổi học có sẵn:</h4>
                    <RadioGroup value={selectedSession} onValueChange={setSelectedSession}>
                      <div className="space-y-2 max-h-[400px] overflow-y-auto">
                        {sessions.map((session) => (
                          <div key={session.sessionId} className="flex items-start space-x-3 space-y-0 rounded-lg border p-4 hover:bg-accent/50 transition-colors">
                            <RadioGroupItem value={session.sessionId.toString()} id={`session-${session.sessionId}`} />
                            <Label htmlFor={`session-${session.sessionId}`} className="flex-1 cursor-pointer">
                              <div className="font-medium">{session.sessionTitle}</div>
                              <div className="text-sm text-muted-foreground flex items-center gap-2 mt-1">
                                <Calendar className="h-3 w-3" />
                                {formatRange(session)}
                              </div>
                              <div className="text-xs text-muted-foreground flex items-center gap-2 mt-1">
                                Status: {session.status}
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
                      Your semester has been updated
                    </p>
                  </div>
                </div>
              )}
            </DialogContent>
          </Dialog>

          {/* Edit Session Dialog */}
          <Dialog open={editingSessionId !== null} onOpenChange={(open) => !open && setEditingSessionId(null)}>
            <DialogContent className="sm:max-w-lg">
              <DialogHeader>
                <DialogTitle>Edit Session</DialogTitle>
                <DialogDescription>Reschedule or update topic</DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <input className="w-full border rounded p-2" placeholder="Topic" value={editTopic} onChange={e => setEditTopic(e.target.value)} />
                <div className="grid grid-cols-3 gap-2">
                  <input type="date" className="border rounded p-2" value={editDate} onChange={e=>setEditDate(e.target.value)} />
                  <input type="time" className="border rounded p-2" value={editStart} onChange={e=>setEditStart(e.target.value)} />
                  <input type="time" className="border rounded p-2" value={editEnd} onChange={e=>setEditEnd(e.target.value)} />
                </div>
                <div className="flex gap-2">
                  <Button onClick={async () => {
                  console.log("DEBUG: Save edit clicked");
                  
                  if (editingSessionId == null) return;
                  
                  if (!editDate || !editStart || !editEnd) {
                      toast({ title: 'Missing', description: 'Date & time required', variant: 'destructive' });
                      return;
                  }

                  const startIso = mergeDateTime(editDate, editStart);
                  const endIso = mergeDateTime(editDate, editEnd);
                  const cleanStart = toLocalISOString(startIso).slice(0,19);
                  const cleanEnd = toLocalISOString(endIso).slice(0,19);
                  console.log("DEBUG: Merged start:", cleanStart, "end:", cleanEnd);

                  if (new Date(startIso) >= new Date(endIso)) {
                      toast({ title: 'Invalid range', description: 'End must be after start', variant: 'destructive' });
                      return;
                  }

                  // --- 1. MATCH DTO KEYS EXACTLY ---
                  const payload = {
                      sessionId: editingSessionId,       // Matches Long sessionId
                      newSessionTitle: editTopic,        // Matches String newSessionTitle
                      newStartTime: cleanStart,            // Matches String newStartTime
                      newEndTime: cleanEnd                 // Matches String newEndTime
                  };
                  console.log("DEBUG: Payload for update:", payload);

                  // --- 2. REMOVE ID FROM URL ---
                  let res: Response | null = null;
                  try {
                  res = await fetch(`${apiBase}/api/sessions`, { 
                      method: 'PATCH', 
                      credentials: 'include', 
                      headers: { 'Content-Type': 'application/json' }, 
                      body: JSON.stringify(payload) 
                  });
                  } catch (err) {
                    console.error('Failed to update session', err);
                    toast({ title: 'Error', description: String(err), variant: 'destructive' });
                    return;
                  }

                  if (res.ok) {
                      toast({ title: 'Updated', description: 'Session updated' });
                      
                      // --- 3. DO NOT CALL res.json() ---
                      // The backend returns Void, so res.json() would crash. 
                      // We manually update the local list using the data we just sent.
                          setSessions(prev => prev.map(p => 
                              p.id === editingSessionId 
                                  ? { ...p, topic: editTopic, startTime: startIso, endTime: endIso } 
                                  : p
                          ));
                      
                      setEditingSessionId(null);

                      try {
                        if (course?.id && typeof listSessionsByClass === 'function') {
                          setLoadingSessions(true);
                          const fresh = await listSessionsByClass(course.id);
                          if (Array.isArray(fresh)) setSessions(fresh);
                        }
                      } catch (err) {
                        console.error('Failed to refresh sessions after update', err);
                      } finally {
                        setLoadingSessions(false);
                      }
                      
                  } else {
                     let errorMessage = 'Update failed';
                    try {
                        const errorData = await res.json();
                        // 2. Extract the specific message from Backend
                        errorMessage = errorData.message || errorData.error || 'Unknown error';
                    } catch (e) {
                        // Fallback if backend sent plain text instead of JSON
                        errorMessage = await res.text(); 
                    }

                    // 3. Show the specific message in the Toast
                    toast({ 
                        title: 'Failed', 
                        description: errorMessage, 
                        variant: 'destructive' 
                    });
                  }
              }}>Save</Button>
                  <Button variant="outline" onClick={()=>setEditingSessionId(null)}>Cancel</Button>
                 <Button variant="destructive" onClick={async () => {
                  if (editingSessionId == null) return;
                  console.log("DEBUG: Cancel session clicked for id:", editingSessionId);
                  try {
                    const res = await fetch(`${apiBase}/api/sessions/cancelSession`, {
                      method: 'PATCH',
                      credentials: 'include',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify(editingSessionId)
                    });
                    if (!res.ok) {
                      const txt = await res.text();
                      throw new Error(txt || 'Cancel failed');
                    }
                    toast({ title: 'Cancelled', description: 'Session cancelled' });
                    setEditingSessionId(null);
                    if (course?.id) {
                      setLoadingSessions(true);
                      try {
                        const fresh = await listSessionsByClass(course.id);
                        if (Array.isArray(fresh)) setSessions(fresh);
                      } finally {
                        setLoadingSessions(false);
                      }
                    }
                  } catch (e: any) {
                    console.error('Cancel failed:', e);
                    toast({ title: 'Failed', description: String(e.message || e), variant: 'destructive' });
                  }
                }}>Cancel Session</Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>

          {/* Feedback Dialog */}
          <Dialog open={showFeedbackDialog} onOpenChange={(open) => !open && setShowFeedbackDialog(false)}>
            <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Submit Feedback / Gửi đánh giá</DialogTitle>
                <DialogDescription>
                  Share your feedback about {course?.name}
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-6">
                {/* Rating Questions */}
                <div className="space-y-4">
                  {feedbackRatings.map((rating, index) => (
                    <div key={index} className="space-y-2">
                      <label className="text-sm font-medium">{rating.question} <span className="text-red-500">*</span></label>
                      <div className="flex gap-2">
                        {[1, 2, 3, 4, 5].map((value) => (
                          <button
                            key={value}
                            type="button"
                            onClick={() => handleRatingChange(index, value)}
                            className={`p-2 transition-colors ${
                              rating.ratingValue >= value 
                                ? 'text-yellow-500' 
                                : 'text-gray-300 hover:text-yellow-400'
                            }`}
                          >
                            <Star className="h-8 w-8 fill-current" />
                          </button>
                        ))}
                        <span className="ml-2 text-sm text-muted-foreground self-center">
                          {rating.ratingValue > 0 ? `${rating.ratingValue} stars` : 'Not rated'}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Comment (Optional) */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">Additional Comments (Optional)</label>
                  <textarea
                    placeholder="Share your thoughts about the course..."
                    value={feedbackComment}
                    onChange={(e) => setFeedbackComment(e.target.value)}
                    className="w-full border rounded-md p-3 min-h-[100px] resize-y"
                  />
                </div>

                {/* Image URL (Optional) */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">Image URL (Optional)</label>
                  <input
                    type="text"
                    placeholder="https://example.com/image.jpg"
                    value={feedbackImageUrl}
                    onChange={(e) => setFeedbackImageUrl(e.target.value)}
                    className="w-full border rounded-md p-2"
                  />
                  <p className="text-xs text-muted-foreground">Provide a URL to an image related to your feedback</p>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-2 justify-end pt-4 border-t">
                  <Button
                    variant="outline"
                    onClick={() => setShowFeedbackDialog(false)}
                    disabled={isSubmittingFeedback}
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleSubmitFeedback}
                    disabled={isSubmittingFeedback || feedbackRatings.some(r => r.ratingValue === 0)}
                  >
                    {isSubmittingFeedback ? 'Submitting...' : 'Submit Feedback'}
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>

          {/* Exit Confirmation Dialog (Student) */}
          <Dialog open={showExitDialog} onOpenChange={(open) => !open && setShowExitDialog(false)}>
            <DialogContent className="sm:max-w-lg">
              <DialogHeader>
                <DialogTitle>Exit Class</DialogTitle>
                <DialogDescription>This will remove your registration for this class. Type the class name to confirm.</DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <input className="w-full border rounded p-2" placeholder="Type class name to confirm" value={exitConfirmText} onChange={(e) => setExitConfirmText(e.target.value)} />
                <div className="flex gap-2">
                  <Button variant="destructive" onClick={handleExit} disabled={isExiting || exitConfirmText !== (course?.name || '')}>{isExiting ? 'Leaving...' : 'Exit Class'}</Button>
                  <Button variant="outline" onClick={() => setShowExitDialog(false)}>Cancel</Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>

          {/* Rename Dialog (Tutor) */}
          <Dialog open={showRenameDialog} onOpenChange={(open) => !open && setShowRenameDialog(false)}>
            <DialogContent className="sm:max-w-lg">
              <DialogHeader>
                <DialogTitle>Rename Class</DialogTitle>
                <DialogDescription>Enter a new name for the class</DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <input className="w-full border rounded p-2" value={renameValue} onChange={(e) => setRenameValue(e.target.value)} />
                <div className="flex gap-2">
                  <Button onClick={handleRename} disabled={renaming}>{renaming ? 'Renaming...' : 'Save'}</Button>
                  <Button variant="outline" onClick={() => setShowRenameDialog(false)}>Cancel</Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>

          {/* Delete Confirmation Dialog (Tutor, destructive) */}
          <Dialog open={showDeleteDialog} onOpenChange={(open) => !open && setShowDeleteDialog(false)}>
            <DialogContent className="sm:max-w-lg">
              <DialogHeader>
                <DialogTitle>Delete Class</DialogTitle>
                <DialogDescription>This action cannot be undone. Type the class name to confirm.</DialogDescription>
              </DialogHeader>
                <div className="space-y-4">
                <input className="w-full border rounded p-2" placeholder="Type class name to confirm" value={deleteConfirmText} onChange={(e) => setDeleteConfirmText(e.target.value)} />
                <div className="flex gap-2">
                  <Button variant="destructive" onClick={handleDelete} disabled={deleting || deleteConfirmText !== (course?.name || '')}>{deleting ? 'Deleting...' : 'Delete Class'}</Button>
                  <Button variant="outline" onClick={() => setShowDeleteDialog(false)}>Cancel</Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </main>
      <Footer />
      <Toaster  />
    </div>
  );
};

export default CourseDetails;
