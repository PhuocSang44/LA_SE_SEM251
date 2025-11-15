import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, BookOpen, CheckCircle2, Clock, Plus } from "lucide-react";
import { useEffect, useState } from "react";
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
import { useAuth } from "@/contexts/AuthContext";

const AvailableCourses = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const { user } = useAuth();
  const isStudent = user?.role?.toUpperCase() === 'STUDENT';
  const [selectedCourse, setSelectedCourse] = useState<any>(null);
  const [selectedTutor, setSelectedTutor] = useState("");
  const [enrollmentStatus, setEnrollmentStatus] = useState<"idle" | "waiting" | "confirmed">("idle");
  
  // Join course states
  const [showJoinDialog, setShowJoinDialog] = useState(false);
  const [courseId, setCourseId] = useState("");
  const [joinSelectedTutor, setJoinSelectedTutor] = useState("");
  const [joinEnrollmentStatus, setJoinEnrollmentStatus] = useState<"idle" | "waiting" | "confirmed">("idle");
  const [foundCourse, setFoundCourse] = useState<any>(null);

  const [availableCourses, setAvailableCourses] = useState<any[]>([]);
  const [enrolledClassIds, setEnrolledClassIds] = useState<Set<number>>(new Set());

  // Load courses and exclude classes the user already enrolled in
  const loadAvailableCourses = () => {
    const apiBase = import.meta.env.VITE_API_BASE || "http://localhost:10001";
    return fetch(`${apiBase}/course-registrations/me`, { credentials: 'include' })
      .then(res => res.ok ? res.json() : Promise.resolve([]))
      .then((enrolledList: any[]) => {
        const enrolledIds = new Set(enrolledList.map((r: any) => r.classId));
        setEnrolledClassIds(enrolledIds);
        // Then fetch all classes and group, skipping enrolled class ids
        return fetch(`${apiBase}/api/classes`, { credentials: 'include' })
          .then(res => res.ok ? res.json() : Promise.reject(res))
          .then((data: any[]) => {
            const byCourse: Record<string, any> = {};
            // small canonical map
            const HARDCODED_COURSES: { code: string; name: string }[] = [
              { code: 'MT1003', name: 'Calculus' },
              { code: 'MT1005', name: 'Calculus 2' },
              { code: 'MT1004', name: 'Linear Algebra' },
              { code: 'MT2001', name: 'Discrete Mathematics' },
              { code: 'CS1010', name: 'Intro to Programming' }
            ];
            const getDisplayName = (code: string | null | undefined, fallback: string) => {
              if (!code) return fallback;
              const codeNorm = String(code).trim().toUpperCase();
              const f = HARDCODED_COURSES.find(x => String(x.code).trim().toUpperCase() === codeNorm);
              return f ? f.name : fallback;
            };
            data.forEach(c => {
              if (enrolledIds.has(c.classId)) return; // skip classes already enrolled
              const key = c.courseCode || c.courseName;
              if (!byCourse[key]) {
                byCourse[key] = {
                  id: key,
                  // Prefer canonical course name when available, fall back to tutor's courseName
                  name: getDisplayName(c.courseCode, c.courseName),
                  code: c.courseCode,
                  category: "",
                  prerequisites: "",
                  description: "",
                  color: "bg-blue-500",
                  tutors: []
                };
              }
              // push class-level entry (each class has a tutor and its own display name)
              byCourse[key].tutors.push({ 
                id: c.classId, 
                tutorName: c.tutorName, 
                tutorId: c.tutorId, 
                className: c.courseName, // class display name set by tutor
                capacity: c.capacity, 
                enrolledCount: c.enrolledCount,
                specialization: c.tutorSpecialization,
                department: c.tutorDepartment      
              });
            });
            setAvailableCourses(Object.values(byCourse));
          });
      }).catch(err => console.error('Failed to load available courses', err));
  };

  // Reusable enrollment function
  const performEnrollment = (
    classId: string, 
    setStatus: (status: "idle" | "waiting" | "confirmed") => void,
    onSuccess: () => void
  ) => {
    if (!classId) {
      toast({
        title: "No class selected",
        description: "A class must be selected to enroll.",
        variant: "destructive"
      });
      return;
    }

    setStatus("waiting");

    const payload = { classId: parseInt(classId, 10) };
    const apiBase = import.meta.env.VITE_API_BASE || "http://localhost:10001";

    fetch(`${apiBase}/course-registrations/enroll`, {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    }).then(async res => {
      if (res.ok) {
        setStatus("confirmed");
        toast({ title: "Enrolled", description: "You have been enrolled successfully" });
        loadAvailableCourses();
        setTimeout(onSuccess, 600); // Call the specific success handler (which closes the correct dialog)
      } else {
        const text = await res.text();
        let errorMsg = text || 'Enrollment failed';
        try {
          const err = JSON.parse(text);
          errorMsg = err.message || errorMsg;
        } catch (e) { /* ignore json parse error */ }
        throw new Error(errorMsg);
      }
    }).catch(err => {
      console.error(err);
      setStatus("idle"); // Reset status on failure
      toast({ title: "Failed to enroll", description: String(err.message), variant: "destructive" });
    });
  };

  useEffect(() => {
    loadAvailableCourses();
  }, [user]);

  const handleEnrollClick = (course: any) => {
    setSelectedCourse(course);
    setSelectedTutor("");
    setEnrollmentStatus("idle");
  };

  const handleTutorSelect = () => {
    // Use the reusable enrollment function
    performEnrollment(selectedTutor, setEnrollmentStatus, closeDialog);
  };

  const autoAssignClass = (course: any) => {
    if (!course || !course.tutors || course.tutors.length === 0) return null;

    // Partition limited vs unlimited
    const limited = course.tutors.filter((t: any) => t.capacity != null && t.capacity !== undefined);
    const unlimited = course.tutors.filter((t: any) => t.capacity == null || t.capacity === undefined);

    const occupancy = (t: any) => {
      if (t.capacity == null || t.capacity === undefined || t.capacity <= 0) return 0;
      return (t.enrolledCount || 0) / (t.capacity || 1);
    };

    // Prefer limited classes
    if (limited.length > 0) {
      // pick any class with occupancy < 10% first (most under-filled)
      const under10 = limited.filter((t: any) => occupancy(t) < 0.10);
      if (under10.length > 0) {
        // choose the one with smallest occupancy
        under10.sort((a: any, b: any) => occupancy(a) - occupancy(b));
        return under10[0].id.toString();
      }

      // otherwise choose the class with the most free seats
      limited.sort((a: any, b: any) => ((b.capacity || 0) - (b.enrolledCount || 0)) - ((a.capacity || 0) - (a.enrolledCount || 0)));
      return limited[0].id.toString();
    }

    // If no limited classes, pick the unlimited class with the fewest enrolled students
    if (unlimited.length > 0) {
      unlimited.sort((a: any, b: any) => (a.enrolledCount || 0) - (b.enrolledCount || 0));
      return unlimited[0].id.toString();
    }

    return null;
  };

  const closeDialog = () => {
    setSelectedCourse(null);
    setSelectedTutor("");
    setEnrollmentStatus("idle");
  };

  const handleJoinCourseClick = () => {
    setShowJoinDialog(true);
    setCourseId("");
    setJoinSelectedTutor("");
    setJoinEnrollmentStatus("idle");
    setFoundCourse(null);
  };

  const handleSearchCourseById = () => {
    if (!courseId.trim()) {
      toast({
        title: "Please enter a course ID",
        description: "You must enter a course ID to search",
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
          toast({ title: "Course not found", description: "No course matches this ID.", variant: "destructive" });
          setFoundCourse(null);
          return;
        }

        const filteredList = list.filter((cl: any) => !enrolledClassIds.has(cl.classId));

        if (filteredList.length === 0) {
            toast({ title: "Course Found", description: "You are already enrolled in all available classes for this course.", variant: "default" });
            setFoundCourse(null);
            return;
        }

        const courseObj = { 
          name: filteredList[0].courseName, 
          code: filteredList[0].courseCode, 
          category: "", 
          description: "", 
          tutors: filteredList.map((cl: any) => ({ 
            id: cl.classId, 
            tutorName: cl.tutorName, 
            tutorId: cl.tutorId,
            className: cl.courseName,
            specialization: cl.tutorSpecialization, 
            department: cl.tutorDepartment,
            capacity: cl.capacity,
            enrolledCount: cl.enrolledCount      
          })) 
        };
        setFoundCourse(courseObj);
        toast({ title: "Course found!", description: `${courseObj.name} (${courseObj.code})` });
      }).catch(err => { console.error(err); toast({ title: "Error", description: "Failed to fetch course info", variant: "destructive" }); });
  };

  const handleJoinTutorSelect = () => {
    // Use the reusable enrollment function
    performEnrollment(joinSelectedTutor, setJoinEnrollmentStatus, closeJoinDialog);
  };

  const closeJoinDialog = () => {
    setShowJoinDialog(false);
    setCourseId("");
    setJoinSelectedTutor("");
    setJoinEnrollmentStatus("idle");
    setFoundCourse(null);
  };

  const filteredCourses = availableCourses.filter(course =>
    course.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    course.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 bg-muted/30">
        <div className="container mx-auto px-4 py-8">
          <div className="mb-8 flex items-start justify-between">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-2">Available Courses</h1>
              <p className="text-muted-foreground">Browse and register for tutoring sessions</p>
            </div>
            <Button 
              onClick={handleJoinCourseClick}
              className="flex items-center gap-2"
            >
              <Plus className="h-4 w-4" />
              Join Course
            </Button>
          </div>

          <div className="mb-6">
            <div className="relative max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Search courses..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 rounded-lg"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCourses.map((course) => (
              <Card key={course.id} className="rounded-xl shadow-md hover:shadow-lg transition-shadow">
                <CardHeader>
                    <div className="flex items-start justify-between mb-2">
                    <Badge variant="secondary" className={`${course.color} text-white border-0`}>
                      {course.category}
                    </Badge>
                    <Badge variant="outline" className="rounded-full font-mono">
                      {course.code}
                    </Badge>
                  </div>
                  <CardTitle className="text-xl">{course.name}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    {/* Aggregate seats across all classes (tutors) for this course */}
                    <div className="flex items-center justify-between text-sm mb-2">
                      <span className="text-muted-foreground">Seats</span>
                      <span className="font-semibold text-foreground">
                        {(() => {
                          const tutors = course.tutors || [];
                          if (tutors.length === 0) return 'N/A';
                          // Show Unlimited
                          if (tutors.some((t: any) => t.capacity === null || t.capacity === undefined)) return 'Unlimited';
                          const totalLeft = tutors.reduce((acc: number, t: any) => acc + Math.max(0, (t.capacity || 0) - (t.enrolledCount || 0)), 0);
                          return `${totalLeft} seats left`;
                        })()}
                      </span>
                    </div>
                    <div className="pt-2 border-t">
                      <Button 
                        className="w-full rounded-lg"
                        onClick={() => handleEnrollClick(course)}
                      >
                        Enroll / Đăng ký
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Tutor Selection Dialog */}
          <Dialog open={!!selectedCourse} onOpenChange={(open) => !open && closeDialog()}>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Select Tutor / Chọn Tutor</DialogTitle>
                <DialogDescription>
                  {selectedCourse?.name} ({selectedCourse?.code})
                </DialogDescription>
              </DialogHeader>

              {enrollmentStatus === "idle" && (
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-end mb-2">
                      <Button size="sm" onClick={() => {
                        const assignedClassId = autoAssignClass(selectedCourse);
                        if (assignedClassId) {
                          toast({ title: "Auto-assigning...", description: "Attempting to enroll you in the best available class." });
                          setSelectedTutor(assignedClassId); // Set state so confirmation screen can show correct info if needed
                          performEnrollment(assignedClassId, setEnrollmentStatus, closeDialog);
                        } else {
                          toast({ title: "Auto-assign failed", description: "No suitable class found", variant: 'destructive' });
                        }
                      }}>
                        Auto assign / Tự chọn lớp
                      </Button>
                    </div>
                    <h4 className="text-sm font-medium mb-3">Available Classes / Danh sách lớp:</h4>
                    <RadioGroup value={selectedTutor} onValueChange={setSelectedTutor}>
                      {selectedCourse?.tutors.map((cls: any) => (
                        <div key={cls.id} className="flex items-start space-x-3 space-y-0 rounded-lg border p-4 hover:bg-accent/50 transition-colors">
                          <RadioGroupItem value={cls.id.toString()} id={`class-${cls.id}`} />
                          <Label htmlFor={`class-${cls.id}`} className="flex-1 cursor-pointer">
                            <div className="font-medium">{cls.className}</div>
                            <div className="text-sm text-muted-foreground">Tutor: {cls.tutorName}</div>
                            <div className="text-xs text-muted-foreground mt-1">Specialization: {cls.specialization || '-'}</div>
                            <div className="text-xs text-muted-foreground mt-2">Seats left: {cls.capacity == null ? 'Unlimited' : Math.max(0, (cls.capacity || 0) - (cls.enrolledCount || 0))}/{cls.capacity}</div>
                          </Label>
                        </div>
                      ))}
                    </RadioGroup>
                  </div>
                  <Button onClick={handleTutorSelect} className="w-full">
                    Confirm Selection / Xác nhận
                  </Button>
                </div>
              )}

              {enrollmentStatus === "waiting" && (
                <div className="flex flex-col items-center justify-center py-8 space-y-4">
                  <Clock className="h-12 w-12 text-primary animate-pulse" />
                  <div className="text-center">
                    <p className="font-medium">Waiting for tutor confirmation...</p>
                    <p className="text-sm text-muted-foreground">Đang chờ xác nhận từ tutor...</p>
                  </div>
                </div>
              )}

              {enrollmentStatus === "confirmed" && (
                <div className="flex flex-col items-center justify-center py-8 space-y-4">
                  <CheckCircle2 className="h-12 w-12 text-green-600" />
                  <div className="text-center">
                    <p className="font-medium text-green-600">Tutor Confirmed!</p>
                    <p className="text-sm text-muted-foreground">Tutor đã xác nhận!</p>
                    <p className="text-sm text-muted-foreground mt-2">
                      You have been enrolled in {selectedCourse?.name}
                    </p>
                  </div>
                  <Button onClick={closeDialog} variant="outline" className="mt-4">
                    Close / Đóng
                  </Button>
                </div>
              )}
            </DialogContent>
          </Dialog>

          {/* Join Course Dialog */}
          <Dialog open={showJoinDialog} onOpenChange={(open) => !open && closeJoinDialog()}>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Join Course by ID / Tham gia khóa học bằng ID</DialogTitle>
                <DialogDescription>
                  Enter the course ID to join
                </DialogDescription>
              </DialogHeader>

              {joinEnrollmentStatus === "idle" && !foundCourse && (
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

              {joinEnrollmentStatus === "idle" && foundCourse && (
                <div className="space-y-4">
                  <div className="rounded-lg border p-4 bg-accent/30">
                    <h4 className="font-medium mb-1">{foundCourse.name}</h4>
                    <p className="text-sm text-muted-foreground">{foundCourse.code} - {foundCourse.category}</p>
                    <p className="text-xs text-muted-foreground mt-2">{foundCourse.description}</p>
                  </div>
                  
                  <div>
                    <h4 className="text-sm font-medium mb-3">Available Tutors / Danh sách Tutor:</h4>
                    <RadioGroup value={joinSelectedTutor} onValueChange={setJoinSelectedTutor}>
                      {foundCourse.tutors.map((tutor: any) => (
                        <div key={tutor.id} className="flex items-start space-x-3 space-y-0 rounded-lg border p-4 hover:bg-accent/50 transition-colors">
                          <RadioGroupItem value={tutor.id.toString()} id={`join-tutor-${tutor.id}`} />
                          <Label htmlFor={`join-tutor-${tutor.id}`} className="flex-1 cursor-pointer">
                            <div className="font-medium">{tutor.name}</div>
                            <div className="text-sm text-muted-foreground">{tutor.department}</div>
                            <div className="text-xs text-muted-foreground mt-1">
                              Specialization: {tutor.specialization}
                            </div>
                          </Label>
                        </div>
                      ))}
                    </RadioGroup>
                  </div>
                  
                  <div className="flex gap-2">
                    <Button onClick={() => { setFoundCourse(null); setCourseId(""); }} variant="outline" className="flex-1">
                      Back / Quay lại
                    </Button>
                    <Button onClick={handleJoinTutorSelect} className="flex-1">
                      Confirm Selection / Xác nhận
                    </Button>
                  </div>
                </div>
              )}

              {joinEnrollmentStatus === "waiting" && (
                <div className="flex flex-col items-center justify-center py-8 space-y-4">
                  <Clock className="h-12 w-12 text-primary animate-pulse" />
                  <div className="text-center">
                    <p className="font-medium">Waiting for tutor confirmation...</p>
                    <p className="text-sm text-muted-foreground">Đang chờ xác nhận từ tutor...</p>
                  </div>
                </div>
              )}

              {joinEnrollmentStatus === "confirmed" && (
                <div className="flex flex-col items-center justify-center py-8 space-y-4">
                  <CheckCircle2 className="h-12 w-12 text-green-600" />
                  <div className="text-center">
                    <p className="font-medium text-green-600">Tutor Confirmed!</p>
                    <p className="text-sm text-muted-foreground">Tutor đã xác nhận!</p>
                    <p className="text-sm text-muted-foreground mt-2">
                      You have been enrolled in {foundCourse?.name}
                    </p>
                  </div>
                  <Button onClick={closeJoinDialog} variant="outline" className="mt-4">
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

export default AvailableCourses;