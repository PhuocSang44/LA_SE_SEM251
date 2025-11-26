import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, User, Users, Clock, BookOpen, Plus, CheckCircle2, MessageSquare, Star, Pencil, X, FileText, Download, Trash2 } from "lucide-react";
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
import { listSessionsByClass, listAllSessions, listSessionsByUser } from "@/lib/sessionApi";
import { Toaster } from "@/components/ui/sonner";
import { set } from "date-fns";
import { all } from "axios";

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
            // Prefer the class-level custom name when present, otherwise fall back to canonical course name
            name: found.customClassName || found.courseName,
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
  const [joinedSessionId, setJoinedSessionId] = useState<any[]>([]);

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
  const [showFeedbackExistsDialog, setShowFeedbackExistsDialog] = useState(false);

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
  const [sessionMaterials, setSessionMaterials] = useState<any[]>([]);
  const [loadingMaterials, setLoadingMaterials] = useState(false);
  const [materialsError, setMaterialsError] = useState<string | null>(null);
  const [showExternalUrlDialog, setShowExternalUrlDialog] = useState(false);
  const [externalUrlTitle, setExternalUrlTitle] = useState("");
  const [externalUrlDescription, setExternalUrlDescription] = useState("");
  const [externalUrl, setExternalUrl] = useState("");
  const [isAddingMaterial, setIsAddingMaterial] = useState(false);
  const [showFileUploadDialog, setShowFileUploadDialog] = useState(false);
  const [uploadFileTitle, setUploadFileTitle] = useState("");
  const [uploadFileDescription, setUploadFileDescription] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploadingFile, setIsUploadingFile] = useState(false);
  const [showLibrarySelectDialog, setShowLibrarySelectDialog] = useState(false);
  const [selectedLibraryItems, setSelectedLibraryItems] = useState<Set<number>>(new Set());
  const [isAddingLibraryItems, setIsAddingLibraryItems] = useState(false);
  const [showViewAllLibraryDialog, setShowViewAllLibraryDialog] = useState(false);
  const [showViewAllMaterialsDialog, setShowViewAllMaterialsDialog] = useState(false);

  // Student list and evaluation states
  const [enrolledStudents, setEnrolledStudents] = useState<any[]>([]);
  const [loadingStudents, setLoadingStudents] = useState(false);
  const [showEvaluationDialog, setShowEvaluationDialog] = useState(false);
  const [selectedStudentForEval, setSelectedStudentForEval] = useState<any | null>(null);
  const [evaluationCriteria, setEvaluationCriteria] = useState([
    { criterion: "Attendance", ratingValue: 0, maxRating: 5 },
    { criterion: "Participation", ratingValue: 0, maxRating: 5 },
    { criterion: "Assignment Quality", ratingValue: 0, maxRating: 5 },
    { criterion: "Understanding of Concepts", ratingValue: 0, maxRating: 5 },
  ]);
  const [evaluationComment, setEvaluationComment] = useState("");
  const [isSubmittingEvaluation, setIsSubmittingEvaluation] = useState(false);

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

  // Fetch enrolled students for tutor view
  useEffect(() => {
    if (!isOwner || !course?.id) {
      setEnrolledStudents([]);
      return;
    }

    const fetchEnrolledStudents = async () => {
      setLoadingStudents(true);
      try {
        const res = await fetch(`${apiBase}/api/evaluation/class/${course.id}/students`, {
          credentials: 'include'
        });

        if (res.ok) {
          const data = await res.json();
          setEnrolledStudents(Array.isArray(data) ? data : []);
        } else {
          console.error('Failed to fetch enrolled students');
          setEnrolledStudents([]);
        }
      } catch (error) {
        console.error('Error fetching enrolled students:', error);
        setEnrolledStudents([]);
      } finally {
        setLoadingStudents(false);
      }
    };

    fetchEnrolledStudents();
  }, [apiBase, course?.id, isOwner]);



  useEffect(() => {
    (async () => {
      if (!course?.id) return;
      setLoadingSessions(true);
      try {
        const res = await fetch(`${apiBase}/api/sessions/${course.id}`, { credentials:'include' });
        const res1 = await listSessionsByUser();
        console.log("DEBUG: All sessions for user:", res1);
        console.log("DEBUG: Fetching sessions from:", `${apiBase}/api/sessions/${course.id}`);
        if (res.ok) {
          const list = await res.json();
          const Scheduled = Array.isArray(list) ? list.filter(s => s.status && s.status.toLowerCase() === 'scheduled') : [];
          setSessions(Scheduled);
        } else {
          setSessions([]); // fallback
        }
        const allSessions = res1 || [];

        // Normalize helper: return canonical id + start time
        
        setJoinedSessionId(allSessions);
        console.log("DEBUG: Joined session ids:", allSessions);
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
    const url = `${libraryApiBase}/api/library/items?courseCode=${encodeURIComponent(courseCode)}`;
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
  }, [libraryApiBase, courseCode]);

  // Fetch session materials (course-specific materials)
  useEffect(() => {
    if (!course?.id) {
      setSessionMaterials([]);
      return;
    }
    setLoadingMaterials(true);
    setMaterialsError(null);
    const controller = new AbortController();
    const url = `${apiBase}/api/courses/${course.id}/materials`;
    fetch(url, { credentials: 'include', signal: controller.signal })
      .then(res => {
        if (!res.ok) {
          throw new Error('Failed to fetch course materials');
        }
        return res.json();
      })
      .then((data) => {
        setSessionMaterials(Array.isArray(data) ? data : []);
      })
      .catch((error) => {
        if (error.name === 'AbortError') return;
        console.error('Failed to fetch course materials', error);
        setSessionMaterials([]);
        setMaterialsError('Unable to load course materials');
      })
      .finally(() => setLoadingMaterials(false));
    return () => controller.abort();
  }, [apiBase, course?.id]);

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
    console.log("DEBUG: Selected session to join:", selectedSession);
    console.log("DEBUG: Sessions available:", sessions);
    const s = sessions.find(s => s.sessionId.toString() === selectedSession);
    if (!s) return;
    setJoinSessionStatus('waiting');
    try {
      // hypothetical endpoint
      console.log("DEBUG: Enrolling in session id:", s.sessionId);
      const res = await fetch(`${apiBase}/api/sessions/enroll`, { method:'POST', credentials:'include', headers:{ 'Content-Type':'application/json' }, body:JSON.stringify({ sessionId: s.sessionId, userId: Number(user?.officialId) }) });
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
        name: updatedData.customClassName || updatedData.courseName,
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

        // Special handling for "already submitted" error
        if (errorMessage.toLowerCase().includes('already submitted')) {
          setShowFeedbackDialog(false);
          setShowFeedbackExistsDialog(true);
          return;
        }

        throw new Error(errorMessage);
      }
    } catch (err: any) {
      console.error("DEBUG: Fetch error:", err);
      const errorMsg = err.message || String(err);

      // Don't show toast if we already handled the "already submitted" case
      if (!errorMsg.toLowerCase().includes('already submitted')) {
        toast({
          title: "Failed to submit feedback",
          description: errorMsg,
          variant: "destructive"
        });
      }
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

  // Evaluation handlers
  const handleEvaluateStudent = (student: any) => {
    setSelectedStudentForEval(student);
    setShowEvaluationDialog(true);
    // Reset evaluation form
    setEvaluationCriteria([
      { criterion: "Attendance", ratingValue: 0, maxRating: 5 },
      { criterion: "Participation", ratingValue: 0, maxRating: 5 },
      { criterion: "Assignment Quality", ratingValue: 0, maxRating: 5 },
      { criterion: "Understanding of Concepts", ratingValue: 0, maxRating: 5 },
    ]);
    setEvaluationComment("");
  };

  const handleEvaluationRatingChange = (index: number, value: number) => {
    const updated = [...evaluationCriteria];
    updated[index].ratingValue = value;
    setEvaluationCriteria(updated);
  };

  const handleSubmitEvaluation = async () => {
    // Validation
    const allRated = evaluationCriteria.every(c => c.ratingValue > 0);
    if (!allRated) {
      toast({
        title: "Please select rating stars",
        description: "All criteria must have a rating value",
        variant: "destructive"
      });
      return;
    }

    if (!selectedStudentForEval || !course) {
      toast({
        title: "Error",
        description: "Missing student or course information",
        variant: "destructive"
      });
      return;
    }

    setIsSubmittingEvaluation(true);

    const payload = {
      courseId: course.courseId || course.id,
      classId: course.classId || course.id,
      studentId: selectedStudentForEval.studentId,
      comment: evaluationComment || null,
      evaluationItems: evaluationCriteria.filter(c => c.ratingValue > 0)
    };

    try {
      const res = await fetch(`${apiBase}/api/evaluation/submit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        toast({
          title: "Evaluation submitted successfully",
          description: `Evaluation for ${selectedStudentForEval.studentName} has been saved`
        });
        setShowEvaluationDialog(false);
        setSelectedStudentForEval(null);
      } else {
        const error = await res.json();
        toast({
          title: "Error",
          description: error.error || "Failed to submit evaluation",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Failed to submit evaluation:', error);
      toast({
        title: "Error",
        description: "Failed to submit evaluation",
        variant: "destructive"
      });
    } finally {
      setIsSubmittingEvaluation(false);
    }
  };

  const handleAddExternalMaterial = async () => {
    if (!externalUrl || !externalUrlTitle) {
      toast({
        title: "Missing information",
        description: "Please provide both title and URL",
        variant: "destructive"
      });
      return;
    }

    if (!externalUrl.startsWith('http://') && !externalUrl.startsWith('https://')) {
      toast({
        title: "Invalid URL",
        description: "URL must start with http:// or https://",
        variant: "destructive"
      });
      return;
    }

    setIsAddingMaterial(true);
    try {
      const res = await fetch(`${apiBase}/api/courses/${course?.id}/materials/add-external`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          title: externalUrlTitle,
          description: externalUrlDescription,
          externalUrl: externalUrl
        })
      });

      if (res.ok) {
        toast({
          title: "Material added successfully",
          description: "External URL has been added to course materials"
        });
        setShowExternalUrlDialog(false);
        setExternalUrlTitle("");
        setExternalUrlDescription("");
        setExternalUrl("");
        // Refresh materials
        const refreshRes = await fetch(`${apiBase}/api/courses/${course?.id}/materials`, { credentials: 'include' });
        if (refreshRes.ok) {
          const data = await refreshRes.json();
          setSessionMaterials(Array.isArray(data) ? data : []);
        }
      } else {
        const errorText = await res.text();
        throw new Error(errorText || 'Failed to add material');
      }
    } catch (err: any) {
      toast({
        title: "Failed to add material",
        description: err.message || String(err),
        variant: "destructive"
      });
    } finally {
      setIsAddingMaterial(false);
    }
  };

  const handleUploadFile = async () => {
    if (!selectedFile) {
      toast({
        title: "No file selected",
        description: "Please select a file to upload",
        variant: "destructive"
      });
      return;
    }

    if (!uploadFileTitle) {
      toast({
        title: "Missing title",
        description: "Please provide a title for the file",
        variant: "destructive"
      });
      return;
    }

    setIsUploadingFile(true);
    try {
      const formData = new FormData();
      formData.append('file', selectedFile);
      formData.append('title', uploadFileTitle);
      if (uploadFileDescription) {
        formData.append('description', uploadFileDescription);
      }

      const res = await fetch(`${apiBase}/api/courses/${course?.id}/materials/upload`, {
        method: 'POST',
        credentials: 'include',
        body: formData
      });

      if (res.ok) {
        toast({
          title: "File uploaded successfully",
          description: "File has been added to course materials"
        });
        setShowFileUploadDialog(false);
        setUploadFileTitle("");
        setUploadFileDescription("");
        setSelectedFile(null);
        // Refresh materials
        const refreshRes = await fetch(`${apiBase}/api/courses/${course?.id}/materials`, { credentials: 'include' });
        if (refreshRes.ok) {
          const data = await refreshRes.json();
          setSessionMaterials(Array.isArray(data) ? data : []);
        }
      } else {
        const errorText = await res.text();
        throw new Error(errorText || 'Failed to upload file');
      }
    } catch (err: any) {
      toast({
        title: "Failed to upload file",
        description: err.message || String(err),
        variant: "destructive"
      });
    } finally {
      setIsUploadingFile(false);
    }
  };

  const handleAddLibraryItems = async () => {
    if (selectedLibraryItems.size === 0) {
      toast({
        title: "No items selected",
        description: "Please select at least one library item",
        variant: "destructive"
      });
      return;
    }

    setIsAddingLibraryItems(true);
    let successCount = 0;
    let failCount = 0;

    try {
      for (const itemId of selectedLibraryItems) {
        try {
          const libraryItem = libraryItems.find(item => item.id === itemId);
          if (!libraryItem) continue;

          const res = await fetch(`${apiBase}/api/courses/${course?.id}/materials/add-library-ref`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify({
              libraryItemId: itemId,
              title: libraryItem.title || libraryItem.originalName || `Library item #${itemId}`,
              description: libraryItem.description || ''
            })
          });

          if (res.ok) {
            successCount++;
          } else {
            failCount++;
          }
        } catch (err) {
          console.error(`Failed to add library item ${itemId}:`, err);
          failCount++;
        }
      }

      if (successCount > 0) {
        toast({
          title: "Library items added",
          description: `Successfully added ${successCount} item(s) to course materials`
        });

        // Refresh materials
        const refreshRes = await fetch(`${apiBase}/api/courses/${course?.id}/materials`, { credentials: 'include' });
        if (refreshRes.ok) {
          const data = await refreshRes.json();
          setSessionMaterials(Array.isArray(data) ? data : []);
        }
      }

      if (failCount > 0) {
        toast({
          title: "Some items failed",
          description: `Failed to add ${failCount} item(s)`,
          variant: "destructive"
        });
      }

      setShowLibrarySelectDialog(false);
      setSelectedLibraryItems(new Set());
    } catch (err: any) {
      toast({
        title: "Failed to add library items",
        description: err.message || String(err),
        variant: "destructive"
      });
    } finally {
      setIsAddingLibraryItems(false);
    }
  };

  const handleDeleteMaterial = async (materialId: number, materialTitle: string) => {
    if (!confirm(`Delete this material?\n\n"${materialTitle}"\n\nThis action cannot be undone.`)) {
      return;
    }

    try {
      console.log('Deleting material:', materialId, materialTitle);
      const res = await fetch(`${apiBase}/api/materials/${materialId}`, {
        method: 'DELETE',
        credentials: 'include'
      });

      console.log('Delete response status:', res.status);

      if (res.ok || res.status === 204) {
        toast({
          title: "Material deleted",
          description: "Material has been removed successfully"
        });

        // Refresh materials
        const refreshRes = await fetch(`${apiBase}/api/courses/${course?.id}/materials`, { credentials: 'include' });
        if (refreshRes.ok) {
          const data = await refreshRes.json();
          setSessionMaterials(Array.isArray(data) ? data : []);
        }
      } else {
        let errorText = '';
        try {
          errorText = await res.text();
        } catch (e) {
          errorText = `HTTP ${res.status} ${res.statusText}`;
        }
        console.error('Delete failed:', res.status, errorText);
        throw new Error(errorText || `Failed to delete material (HTTP ${res.status})`);
      }
    } catch (err: any) {
      console.error('Delete material error:', err);
      toast({
        title: "Failed to delete material",
        description: err.message || String(err),
        variant: "destructive"
      });
    }
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
                {(Array.isArray(course?.sessions) ? course.sessions.length : Number(course?.sessions ?? 0))} sessions total
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

                        {/* Enrolled Students Card - Only visible to tutors */}
                        {isOwner && (
                          <Card className="rounded-xl shadow-md">
                            <CardHeader>
                              <CardTitle className="text-xl flex items-center gap-2">
                                <Users className="h-5 w-5 text-muted-foreground" />
                                Enrolled Students
                              </CardTitle>
                            </CardHeader>
                            <CardContent>
                              {loadingStudents && (
                                <div className="text-sm text-muted-foreground">Loading students...</div>
                              )}
                              {!loadingStudents && enrolledStudents.length === 0 && (
                                <div className="text-sm text-muted-foreground">No students enrolled yet.</div>
                              )}
                              {!loadingStudents && enrolledStudents.length > 0 && (
                                <div className="space-y-3">
                                  {enrolledStudents.map((student) => (
                                    <div key={student.studentId} className="p-3 rounded-lg border bg-muted/40 flex justify-between items-start gap-3">
                                      <div className="flex-1 min-w-0">
                                        <p className="font-medium text-sm truncate">{student.studentName}</p>
                                        <p className="text-xs text-muted-foreground mt-1">{student.studentId}</p>
                                        {student.major && (
                                          <p className="text-xs text-muted-foreground">{student.major}</p>
                                        )}
                                      </div>
                                      <Button
                                        size="sm"
                                        variant="outline"
                                        className="flex-shrink-0 text-xs"
                                        onClick={() => handleEvaluateStudent(student)}
                                      >
                                        <Star className="h-3 w-3 mr-1" />
                                        Evaluate
                                      </Button>
                                    </div>
                                  ))}
                                  {enrolledStudents.length > 5 && (
                                    <p className="text-xs text-muted-foreground text-center pt-2">
                                      Showing {enrolledStudents.length} student{enrolledStudents.length > 1 ? 's' : ''}
                                    </p>
                                  )}
                                </div>
                              )}
                            </CardContent>
                          </Card>
                        )}

                        {/* Library Materials Card - Only visible to tutors */}
                        {isOwner && (
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
                                <div className="text-sm text-muted-foreground">No library materials available for this course.</div>
                              )}
                              {!loadingLibrary && !libraryError && libraryItems.length > 0 && (
                                <div className="space-y-3">
                                  {libraryItems.slice(0, 2).map((item) => (
                                    <div key={item.id} className="p-3 rounded-lg border bg-muted/40 flex justify-between items-start gap-3">
                                      <div className="flex-1 min-w-0">
                                        <p className="font-medium text-sm truncate">{item.title || item.originalName || `Library item #${item.id}`}</p>
                                        {item.description && (
                                          <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{item.description}</p>
                                        )}
                                        <p className="text-xs text-muted-foreground mt-1">
                                          {item.originalName || 'Unnamed file'} • {formatFileSize(item.sizeBytes)}
                                        </p>
                                      </div>
                                      <Button size="icon" variant="ghost" className="flex-shrink-0" asChild>
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
                              {!loadingLibrary && !libraryError && libraryItems.length > 2 && (
                                <Button
                                  variant="outline"
                                  className="w-full mt-2"
                                  onClick={() => setShowViewAllLibraryDialog(true)}
                                >
                                  View All Library Files ({libraryItems.length})
                                </Button>
                              )}
                            </CardContent>
                          </Card>
                        )}

                        {/* Session Materials Card */}
                        <Card className="rounded-xl shadow-md">
                          <CardHeader>
                            <div className="space-y-3">
                              <CardTitle className="text-xl flex items-center gap-2">
                                <BookOpen className="h-5 w-5 text-muted-foreground" />
                                Course Materials
                              </CardTitle>
                              {isOwner && (
                                <div className="flex flex-wrap gap-2">
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => setShowLibrarySelectDialog(true)}
                                    className="text-xs"
                                  >
                                    <Plus className="h-3 w-3 mr-1" />
                                    From Library
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => setShowFileUploadDialog(true)}
                                    className="text-xs"
                                  >
                                    <Plus className="h-3 w-3 mr-1" />
                                    Upload File
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => setShowExternalUrlDialog(true)}
                                    className="text-xs"
                                  >
                                    <Plus className="h-3 w-3 mr-1" />
                                    Add Link
                                  </Button>
                                </div>
                              )}
                            </div>
                          </CardHeader>
                          <CardContent>
                            {loadingMaterials && (
                              <div className="text-sm text-muted-foreground">Loading course materials...</div>
                            )}
                            {!loadingMaterials && materialsError && (
                              <div className="text-sm text-destructive">{materialsError}</div>
                            )}
                            {!loadingMaterials && !materialsError && sessionMaterials.length === 0 && (
                              <div className="text-sm text-muted-foreground">
                                No course materials yet.
                                {isOwner && " Add materials to help students learn!"}
                              </div>
                            )}
                            {!loadingMaterials && !materialsError && sessionMaterials.length > 0 && (
                              <div className="space-y-3">
                                {sessionMaterials.slice(0, 2).map((material) => (
                                  <div key={material.id} className="p-3 rounded-lg border bg-muted/40 flex justify-between items-start gap-3">
                                    <div className="flex-1 min-w-0">
                                      <div className="flex items-start gap-2 flex-wrap">
                                        {material.sourceType === 'EXTERNAL_URL' && (
                                          <span className="text-xs bg-blue-100 text-blue-800 px-2 py-0.5 rounded">🔗 Link</span>
                                        )}
                                        {material.sourceType === 'LIBRARY_REF' && (
                                          <span className="text-xs bg-green-100 text-green-800 px-2 py-0.5 rounded">📚 Library</span>
                                        )}
                                        {material.sourceType === 'LOCAL_FILE' && (
                                          <span className="text-xs bg-purple-100 text-purple-800 px-2 py-0.5 rounded">📄 File</span>
                                        )}
                                      </div>
                                      <p className="font-medium text-sm mt-1 truncate">{material.title}</p>
                                      {material.description && (
                                        <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{material.description}</p>
                                      )}
                                      {material.originalName && material.sourceType === 'LOCAL_FILE' && (
                                        <p className="text-xs text-muted-foreground mt-1 truncate">
                                          {material.originalName}
                                        </p>
                                      )}
                                      {material.sizeBytes && (
                                        <p className="text-xs text-muted-foreground mt-1">
                                          Size: {formatFileSize(material.sizeBytes)}
                                        </p>
                                      )}
                                    </div>
                                    <div className="flex gap-1 flex-shrink-0">
                                      {material.sourceType === 'EXTERNAL_URL' && material.externalUrl && (
                                        <Button
                                          size="icon"
                                          variant="ghost"
                                          onClick={() => {
                                            if (confirm(`Open external link?\n\n${material.externalUrl}\n\nThis will open in a new tab.`)) {
                                              window.open(material.externalUrl, '_blank', 'noopener,noreferrer');
                                            }
                                          }}
                                          title="Open external link"
                                        >
                                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                                          </svg>
                                        </Button>
                                      )}
                                      {material.sourceType === 'LOCAL_FILE' && material.downloadUrl && (
                                        <Button size="icon" variant="ghost" asChild>
                                          <a
                                            href={`${apiBase}${material.downloadUrl}`}
                                            download
                                            title="Download file"
                                          >
                                            <Download className="h-4 w-4" />
                                          </a>
                                        </Button>
                                      )}
                                      {material.sourceType === 'LIBRARY_REF' && material.downloadUrl && (
                                        <Button size="icon" variant="ghost" asChild>
                                          <a
                                            href={material.downloadUrl}
                                            target="_blank"
                                            rel="noreferrer"
                                            title="Download file"
                                          >
                                            <Download className="h-4 w-4" />
                                          </a>
                                        </Button>
                                      )}
                                      {isOwner && (
                                        <Button
                                          size="icon"
                                          variant="ghost"
                                          onClick={() => handleDeleteMaterial(material.id, material.title)}
                                          title="Delete material"
                                          className="text-destructive hover:text-destructive hover:bg-destructive/10"
                                        >
                                          <Trash2 className="h-4 w-4" />
                                        </Button>
                                      )}
                                    </div>
                                  </div>
                                ))}
                              </div>
                            )}
                            {!loadingMaterials && !materialsError && sessionMaterials.length > 2 && (
                              <Button
                                variant="outline"
                                className="w-full mt-2"
                                onClick={() => setShowViewAllMaterialsDialog(true)}
                              >
                                View All Materials ({sessionMaterials.length})
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
                        {sessions.map((session) => {
                          // joinedSessionId may be an array of session objects (or ids). Normalize to an array of string ids.
                          const joinedIds: string[] = Array.isArray(joinedSessionId)
                            ? joinedSessionId.map(j => {
                                if (j == null) return "";
                                return typeof j === "object" ? String(j.sessionId ?? j.id ?? "") : String(j);
                              })
                            : (joinedSessionId && typeof joinedSessionId === "object"
                                ? [String(joinedSessionId.sessionId ?? joinedSessionId.id ?? "")]
                                : [String(joinedSessionId ?? "")]);

                          const isJoined = joinedIds.includes(String(session.sessionId));
                          console.log("DEBUG: Session", session.sessionId, "isJoined:", isJoined, "joinedIds:", joinedIds);

                          return (
                            <div
                              key={session.sessionId}
                              className={`flex items-start space-x-3 space-y-0 rounded-lg border p-4 transition-colors ${
                                isJoined ? "opacity-60 cursor-not-allowed" : "hover:bg-accent/50"
                              }`}
                              aria-disabled={isJoined}
                            >
                              {/* disable radio for joined sessions so they cannot be selected */}
                              <RadioGroupItem
                                value={session.sessionId.toString()}
                                id={`session-${session.sessionId}`}
                                disabled={isJoined}
                              />
                              <Label
                                htmlFor={`session-${session.sessionId}`}
                                className={`flex-1 cursor-pointer ${isJoined ? "cursor-not-allowed" : ""}`}
                              >
                                <div className="flex justify-between items-start">
                                  <div>
                                    <div className="font-medium">{session.sessionTitle}</div>
                                    <div className="text-sm text-muted-foreground flex items-center gap-2 mt-1">
                                      <Calendar className="h-3 w-3" />
                                      {formatRange(session)}
                                    </div>
                                    <div className="text-xs text-muted-foreground flex items-center gap-2 mt-1">
                                      Status: {session.status}
                                    </div>
                                  </div>

                                  {isJoined && (
                                    <div className="ml-4 flex items-center">
                                      <span className="text-xs font-semibold text-green-700 bg-green-100 px-2 py-1 rounded">JOINED</span>
                                    </div>
                                  )}
                                </div>
                              </Label>
                            </div>
                          );
                        })}
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

          {/* Feedback Already Exists Dialog */}
          <Dialog open={showFeedbackExistsDialog} onOpenChange={setShowFeedbackExistsDialog}>
            <DialogContent className="sm:max-w-md">
              <DialogHeader className="space-y-4">
                <div className="flex items-center justify-center">
                  <div className="h-16 w-16 rounded-full bg-gradient-to-br from-blue-100 to-blue-50 flex items-center justify-center shadow-sm">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                </div>
                <DialogTitle className="text-center text-xl">
                  Feedback Already Submitted
                </DialogTitle>
                <DialogDescription className="text-center space-y-4 pt-2">
                  <p className="text-base text-gray-700">
                    You have already submitted feedback for this class.
                  </p>
                  <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-4 space-y-2 text-left">
                    <div className="flex items-start gap-2">
                      <span className="text-xl">📝</span>
                      <div className="space-y-1">
                        <p className="text-sm font-semibold text-blue-900">Current Policy</p>
                        <p className="text-sm text-blue-800 leading-relaxed">
                          Each student can submit feedback only once per class to ensure fairness and maintain the authenticity of reviews.
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
                    <p className="text-sm text-amber-900">
                      💡 <span className="font-medium">Need to update your feedback?</span><br/>
                      <span className="text-amber-800">Please contact your instructor or the administration for assistance.</span>
                    </p>
                  </div>
                </DialogDescription>
              </DialogHeader>
              <div className="flex justify-center pt-2">
                <Button
                  variant="default"
                  onClick={() => setShowFeedbackExistsDialog(false)}
                  className="min-w-[120px]"
                >
                  Got it
                </Button>
              </div>
            </DialogContent>
          </Dialog>

          {/* Evaluation Dialog - Tutor evaluates student */}
          <Dialog open={showEvaluationDialog} onOpenChange={(open) => !open && setShowEvaluationDialog(false)}>
            <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Evaluate Student Performance</DialogTitle>
                <DialogDescription>
                  {selectedStudentForEval && (
                    <>Evaluate {selectedStudentForEval.studentName} ({selectedStudentForEval.studentId}) in {course?.name}</>
                  )}
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-6">
                {/* Evaluation Criteria */}
                <div className="space-y-4">
                  <h3 className="font-semibold">Evaluation Criteria <span className="text-red-500">*</span></h3>
                  {evaluationCriteria.map((criterion, index) => (
                    <div key={index} className="border rounded-lg p-4 space-y-3">
                      <label className="text-sm font-medium">{criterion.criterion}</label>
                      <div className="flex gap-2 items-center">
                        {Array.from({ length: criterion.maxRating }, (_, i) => i + 1).map((value) => (
                          <button
                            key={value}
                            type="button"
                            onClick={() => handleEvaluationRatingChange(index, value)}
                            className={`p-2 transition-colors ${
                              criterion.ratingValue >= value 
                                ? 'text-yellow-500' 
                                : 'text-gray-300 hover:text-yellow-400'
                            }`}
                          >
                            <Star className="h-8 w-8 fill-current" />
                          </button>
                        ))}
                        <span className="ml-2 text-sm text-muted-foreground">
                          {criterion.ratingValue > 0
                            ? `${criterion.ratingValue} / ${criterion.maxRating}`
                            : 'Not rated'}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Comments */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">Comments (Optional)</label>
                  <textarea
                    placeholder="Provide additional feedback about the student's performance..."
                    value={evaluationComment}
                    onChange={(e) => setEvaluationComment(e.target.value)}
                    className="w-full border rounded-md p-3 min-h-[120px] resize-y"
                  />
                </div>

                {/* Action Buttons */}
                <div className="flex gap-2 justify-end pt-4 border-t">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setShowEvaluationDialog(false);
                      setSelectedStudentForEval(null);
                    }}
                    disabled={isSubmittingEvaluation}
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleSubmitEvaluation}
                    disabled={isSubmittingEvaluation || evaluationCriteria.some(c => c.ratingValue === 0)}
                  >
                    {isSubmittingEvaluation ? 'Submitting...' : 'Submit Evaluation'}
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>

          {/* Add External URL Material Dialog */}
          <Dialog open={showExternalUrlDialog} onOpenChange={setShowExternalUrlDialog}>
            <DialogContent className="sm:max-w-lg">
              <DialogHeader>
                <DialogTitle>Add External Link Material</DialogTitle>
                <DialogDescription>
                  Add a link to external resources (e.g., Google Docs, YouTube, e-books)
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Title <span className="text-red-500">*</span></label>
                  <input
                    type="text"
                    placeholder="e.g., Course Syllabus, Lecture Recording"
                    value={externalUrlTitle}
                    onChange={(e) => setExternalUrlTitle(e.target.value)}
                    className="w-full border rounded-md p-2"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Description (Optional)</label>
                  <textarea
                    placeholder="Brief description of the material..."
                    value={externalUrlDescription}
                    onChange={(e) => setExternalUrlDescription(e.target.value)}
                    className="w-full border rounded-md p-2 min-h-[80px]"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">URL <span className="text-red-500">*</span></label>
                  <input
                    type="url"
                    placeholder="https://example.com/resource"
                    value={externalUrl}
                    onChange={(e) => setExternalUrl(e.target.value)}
                    className="w-full border rounded-md p-2"
                  />
                  <p className="text-xs text-muted-foreground">Must start with http:// or https://</p>
                </div>
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                  <p className="text-xs text-blue-900">
                    ℹ️ Students will be asked for confirmation before opening external links
                  </p>
                </div>
                <div className="flex gap-2 justify-end">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setShowExternalUrlDialog(false);
                      setExternalUrlTitle("");
                      setExternalUrlDescription("");
                      setExternalUrl("");
                    }}
                    disabled={isAddingMaterial}
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleAddExternalMaterial}
                    disabled={isAddingMaterial || !externalUrlTitle || !externalUrl}
                  >
                    {isAddingMaterial ? 'Adding...' : 'Add Material'}
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>

          {/* File Upload Material Dialog */}
          <Dialog open={showFileUploadDialog} onOpenChange={setShowFileUploadDialog}>
            <DialogContent className="sm:max-w-lg">
              <DialogHeader>
                <DialogTitle>Upload File Material</DialogTitle>
                <DialogDescription>
                  Upload PDF, Word documents, or other files for students
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Title <span className="text-red-500">*</span></label>
                  <input
                    type="text"
                    placeholder="e.g., Lecture Slides Week 1"
                    value={uploadFileTitle}
                    onChange={(e) => setUploadFileTitle(e.target.value)}
                    className="w-full border rounded-md p-2"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Description (Optional)</label>
                  <textarea
                    placeholder="Brief description of the file..."
                    value={uploadFileDescription}
                    onChange={(e) => setUploadFileDescription(e.target.value)}
                    className="w-full border rounded-md p-2 min-h-[80px]"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">File <span className="text-red-500">*</span></label>
                  <input
                    type="file"
                    accept=".pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx,.txt,.zip,.rar"
                    onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                    className="w-full border rounded-md p-2 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                  />
                  {selectedFile && (
                    <p className="text-sm text-muted-foreground">
                      Selected: {selectedFile.name} ({(selectedFile.size / 1024 / 1024).toFixed(2)} MB)
                    </p>
                  )}
                  <p className="text-xs text-muted-foreground">
                    Supported: PDF, Word, PowerPoint, Excel, Text, ZIP
                  </p>
                </div>
                <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                  <p className="text-xs text-green-900">
                    ℹ️ Files will be securely stored and available for download by students
                  </p>
                </div>
                <div className="flex gap-2 justify-end">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setShowFileUploadDialog(false);
                      setUploadFileTitle("");
                      setUploadFileDescription("");
                      setSelectedFile(null);
                    }}
                    disabled={isUploadingFile}
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleUploadFile}
                    disabled={isUploadingFile || !uploadFileTitle || !selectedFile}
                  >
                    {isUploadingFile ? 'Uploading...' : 'Upload File'}
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>

          {/* Library Selection Dialog */}
          <Dialog open={showLibrarySelectDialog} onOpenChange={setShowLibrarySelectDialog}>
            <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
              <DialogHeader>
                <DialogTitle>Add from Course Library</DialogTitle>
                <DialogDescription>
                  Select PDF files from the library to add to your course materials
                </DialogDescription>
              </DialogHeader>
              <div className="flex-1 overflow-y-auto space-y-3">
                {loadingLibrary && (
                  <div className="text-sm text-muted-foreground p-4">Loading library items...</div>
                )}
                {!loadingLibrary && libraryError && (
                  <div className="text-sm text-destructive p-4">{libraryError}</div>
                )}
                {!loadingLibrary && !libraryError && libraryItems.length === 0 && (
                  <div className="text-sm text-muted-foreground p-4">
                    No library materials found for course code: {courseCode}
                  </div>
                )}
                {!loadingLibrary && !libraryError && libraryItems.length > 0 && (
                  <div className="space-y-2">
                    {libraryItems.map((item) => {
                      const isSelected = selectedLibraryItems.has(item.id);
                      return (
                        <div
                          key={item.id}
                          onClick={() => {
                            const newSelected = new Set(selectedLibraryItems);
                            if (isSelected) {
                              newSelected.delete(item.id);
                            } else {
                              newSelected.add(item.id);
                            }
                            setSelectedLibraryItems(newSelected);
                          }}
                          className={`p-4 rounded-lg border cursor-pointer transition-all ${
                            isSelected 
                              ? 'border-blue-500 bg-blue-50' 
                              : 'border-gray-200 bg-white hover:border-blue-300 hover:bg-blue-50/50'
                          }`}
                        >
                          <div className="flex items-start gap-3">
                            <div className={`mt-1 h-5 w-5 rounded border-2 flex items-center justify-center ${
                              isSelected 
                                ? 'border-blue-500 bg-blue-500' 
                                : 'border-gray-300 bg-white'
                            }`}>
                              {isSelected && (
                                <CheckCircle2 className="h-4 w-4 text-white" />
                              )}
                            </div>
                            <div className="flex-1">
                              <p className="font-medium text-sm">{item.title || item.originalName || `Library item #${item.id}`}</p>
                              {item.description && (
                                <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{item.description}</p>
                              )}
                              <p className="text-xs text-muted-foreground mt-1">
                                {item.originalName || 'Unnamed file'} • {formatFileSize(item.sizeBytes)}
                              </p>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
              <div className="border-t pt-4 flex items-center justify-between">
                <div className="text-sm text-muted-foreground">
                  {selectedLibraryItems.size} item(s) selected
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setShowLibrarySelectDialog(false);
                      setSelectedLibraryItems(new Set());
                    }}
                    disabled={isAddingLibraryItems}
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleAddLibraryItems}
                    disabled={isAddingLibraryItems || selectedLibraryItems.size === 0}
                  >
                    {isAddingLibraryItems ? 'Adding...' : `Add ${selectedLibraryItems.size} item(s)`}
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

          {/* View All Library Files Dialog */}
          <Dialog open={showViewAllLibraryDialog} onOpenChange={setShowViewAllLibraryDialog}>
            <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
              <DialogHeader>
                <DialogTitle>All Library Files</DialogTitle>
                <DialogDescription>
                  All files available in the library for {courseCode}
                </DialogDescription>
              </DialogHeader>
              <div className="flex-1 overflow-y-auto">
                {loadingLibrary && (
                  <div className="text-sm text-muted-foreground p-4">Loading library resources...</div>
                )}
                {!loadingLibrary && libraryError && (
                  <div className="text-sm text-destructive p-4">{libraryError}</div>
                )}
                {!loadingLibrary && !libraryError && libraryItems.length === 0 && (
                  <div className="text-sm text-muted-foreground p-4">No library materials available for this course.</div>
                )}
                {!loadingLibrary && !libraryError && libraryItems.length > 0 && (
                  <div className="space-y-3">
                    {libraryItems.map((item) => (
                      <div key={item.id} className="p-4 rounded-lg border bg-muted/40 flex justify-between items-start gap-3">
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-sm">{item.title || item.originalName || `Library item #${item.id}`}</p>
                          {item.description && (
                            <p className="text-xs text-muted-foreground mt-1">{item.description}</p>
                          )}
                          <p className="text-xs text-muted-foreground mt-1">
                            {item.originalName || 'Unnamed file'} • {formatFileSize(item.sizeBytes)}
                          </p>
                        </div>
                        <Button size="icon" variant="ghost" className="flex-shrink-0" asChild>
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
              </div>
              <div className="border-t pt-4">
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => setShowViewAllLibraryDialog(false)}
                >
                  Close
                </Button>
              </div>
            </DialogContent>
          </Dialog>

          {/* View All Materials Dialog */}
          <Dialog open={showViewAllMaterialsDialog} onOpenChange={setShowViewAllMaterialsDialog}>
            <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
              <DialogHeader>
                <DialogTitle>All Course Materials</DialogTitle>
                <DialogDescription>
                  All materials added to this course
                </DialogDescription>
              </DialogHeader>
              <div className="flex-1 overflow-y-auto">
                {loadingMaterials && (
                  <div className="text-sm text-muted-foreground p-4">Loading course materials...</div>
                )}
                {!loadingMaterials && materialsError && (
                  <div className="text-sm text-destructive p-4">{materialsError}</div>
                )}
                {!loadingMaterials && !materialsError && sessionMaterials.length === 0 && (
                  <div className="text-sm text-muted-foreground p-4">No course materials yet.</div>
                )}
                {!loadingMaterials && !materialsError && sessionMaterials.length > 0 && (
                  <div className="space-y-3">
                    {sessionMaterials.map((material) => (
                      <div key={material.id} className="p-4 rounded-lg border bg-muted/40 flex justify-between items-start gap-3">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start gap-2 flex-wrap mb-2">
                            {material.sourceType === 'EXTERNAL_URL' && (
                              <span className="text-xs bg-blue-100 text-blue-800 px-2 py-0.5 rounded">🔗 Link</span>
                            )}
                            {material.sourceType === 'LIBRARY_REF' && (
                              <span className="text-xs bg-green-100 text-green-800 px-2 py-0.5 rounded">📚 Library</span>
                            )}
                            {material.sourceType === 'LOCAL_FILE' && (
                              <span className="text-xs bg-purple-100 text-purple-800 px-2 py-0.5 rounded">📄 File</span>
                            )}
                          </div>
                          <p className="font-medium text-sm">{material.title}</p>
                          {material.description && (
                            <p className="text-xs text-muted-foreground mt-1">{material.description}</p>
                          )}
                          {material.originalName && material.sourceType === 'LOCAL_FILE' && (
                            <p className="text-xs text-muted-foreground mt-1">
                              {material.originalName}
                            </p>
                          )}
                          {material.sizeBytes && (
                            <p className="text-xs text-muted-foreground mt-1">
                              Size: {formatFileSize(material.sizeBytes)}
                            </p>
                          )}
                        </div>
                        <div className="flex gap-1 flex-shrink-0">
                          {material.sourceType === 'EXTERNAL_URL' && material.externalUrl && (
                            <Button
                              size="icon"
                              variant="ghost"
                              onClick={() => {
                                if (confirm(`Open external link?\n\n${material.externalUrl}\n\nThis will open in a new tab.`)) {
                                  window.open(material.externalUrl, '_blank', 'noopener,noreferrer');
                                }
                              }}
                              title="Open external link"
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                              </svg>
                            </Button>
                          )}
                          {material.sourceType === 'LOCAL_FILE' && material.downloadUrl && (
                            <Button size="icon" variant="ghost" asChild>
                              <a
                                href={`${apiBase}${material.downloadUrl}`}
                                download
                                title="Download file"
                              >
                                <Download className="h-4 w-4" />
                              </a>
                            </Button>
                          )}
                          {material.sourceType === 'LIBRARY_REF' && material.downloadUrl && (
                            <Button size="icon" variant="ghost" asChild>
                              <a
                                href={material.downloadUrl}
                                target="_blank"
                                rel="noreferrer"
                                title="Download file"
                              >
                                <Download className="h-4 w-4" />
                              </a>
                            </Button>
                          )}
                          {isOwner && (
                            <Button
                              size="icon"
                              variant="ghost"
                              onClick={() => handleDeleteMaterial(material.id, material.title)}
                              title="Delete material"
                              className="text-destructive hover:text-destructive hover:bg-destructive/10"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <div className="border-t pt-4">
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => setShowViewAllMaterialsDialog(false)}
                >
                  Close
                </Button>
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
