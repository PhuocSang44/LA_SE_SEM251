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

const AvailableCourses = () => {
  const [searchQuery, setSearchQuery] = useState("");
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

  useEffect(() => {
    // Load classes from backend and group by course
    fetch(`${import.meta.env.VITE_API_BASE || "http://localhost:10001"}/api/classes`, { credentials: 'include' })
      .then(res => res.ok ? res.json() : Promise.reject(res))
      .then((data: any[]) => {
        const byCourse: Record<string, any> = {};
        data.forEach(c => {
          const key = c.courseCode || c.courseName;
          if (!byCourse[key]) {
            byCourse[key] = {
              id: key,
              name: c.courseName,
              code: c.courseCode,
              category: "",
              prerequisites: "",
              description: "",
              color: "bg-blue-500",
              tutors: []
            };
          }
          byCourse[key].tutors.push({ id: c.classId, name: c.tutorName, tutorId: c.tutorId, capacity: c.capacity, enrolledCount: c.enrolledCount });
        });
        setAvailableCourses(Object.values(byCourse));
      }).catch(err => console.error('Failed to load available courses', err));
  }, []);

  const handleEnrollClick = (course: any) => {
    setSelectedCourse(course);
    setSelectedTutor("");
    setEnrollmentStatus("idle");
  };

  const handleTutorSelect = () => {
    if (!selectedTutor) {
      toast({
        title: "Please select a tutor",
        description: "You must select a tutor to proceed with enrollment",
        variant: "destructive"
      });
      return;
    }
    
    setEnrollmentStatus("waiting");
    
    // Simulate tutor confirmation after 2 seconds
    setTimeout(() => {
      setEnrollmentStatus("confirmed");
      toast({
        title: "Enrollment Confirmed! / Đã xác nhận đăng ký!",
        description: "Your tutor has confirmed the enrollment",
      });
    }, 2000);
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
        const courseObj = { name: list[0].courseName, code: list[0].courseCode, category: "", description: "", tutors: list.map((cl: any) => ({ id: cl.classId, name: cl.tutorName, tutorId: cl.tutorId })) };
        setFoundCourse(courseObj);
        toast({ title: "Course found!", description: `${courseObj.name} (${courseObj.code})` });
      }).catch(err => { console.error(err); toast({ title: "Error", description: "Failed to fetch course info", variant: "destructive" }); });
  };

  const handleJoinTutorSelect = () => {
    if (!joinSelectedTutor) {
      toast({
        title: "Please select a tutor",
        description: "You must select a tutor to proceed with enrollment",
        variant: "destructive"
      });
      return;
    }
    
    setJoinEnrollmentStatus("waiting");
    // call backend enroll API using classId stored in joinSelectedTutor
    const payload = { classId: parseInt(joinSelectedTutor, 10) };
    fetch(`${import.meta.env.VITE_API_BASE || "http://localhost:10001"}/course-registrations/enroll`, {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    }).then(async res => {
      if (res.ok) {
        setJoinEnrollmentStatus("confirmed");
        toast({ title: "Enrollment Confirmed! / Đã xác nhận đăng ký!", description: "Your tutor has confirmed the enrollment" });
      } else {
        const text = await res.text();
        throw new Error(text || 'Enrollment failed');
      }
    }).catch(err => { console.error(err); setJoinEnrollmentStatus("idle"); toast({ title: "Failed to enroll", description: String(err), variant: "destructive" }); });
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
                    <div className="flex items-start gap-2 text-sm">
                      <BookOpen className="h-4 w-4 mt-0.5 text-muted-foreground" />
                      <div>
                        <p className="font-medium text-foreground">Prerequisites / Yêu cầu:</p>
                        <p className="text-muted-foreground">{course.prerequisites}</p>
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground pt-2">
                      {course.description}
                    </p>
                  </div>

                  <div className="pt-2 border-t">
                    <div className="flex items-center justify-between text-sm mb-2">
                      <span className="text-muted-foreground">Seats</span>
                      <span className="font-semibold text-foreground">
                        {(() => {
                          // compute total seats left across tutors; if any tutor has null capacity show "Unlimited"
                          const tutors = course.tutors || [];
                          if (tutors.some((t: any) => t.capacity === null || t.capacity === undefined)) return 'Unlimited';
                          const totalLeft = tutors.reduce((acc: number, t: any) => acc + Math.max(0, (t.capacity || 0) - (t.enrolledCount || 0)), 0);
                          return `${totalLeft} seats left`;
                        })()}
                      </span>
                    </div>
                    <Button 
                      className="w-full rounded-lg"
                      onClick={() => handleEnrollClick(course)}
                    >
                      Enroll / Đăng ký
                    </Button>
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
                    <h4 className="text-sm font-medium mb-3">Available Tutors / Danh sách Tutor:</h4>
                    <RadioGroup value={selectedTutor} onValueChange={setSelectedTutor}>
                      {selectedCourse?.tutors.map((tutor: any) => (
                        <div key={tutor.id} className="flex items-start space-x-3 space-y-0 rounded-lg border p-4 hover:bg-accent/50 transition-colors">
                          <RadioGroupItem value={tutor.id.toString()} id={`tutor-${tutor.id}`} />
                          <Label htmlFor={`tutor-${tutor.id}`} className="flex-1 cursor-pointer">
                            <div className="font-medium">{tutor.name}</div>
                            <div className="text-sm text-muted-foreground">{tutor.department}</div>
                            <div className="text-xs text-muted-foreground mt-1">Specialization: {tutor.specialization}</div>
                            <div className="text-xs text-muted-foreground mt-2">Seats left: {tutor.capacity == null ? 'Unlimited' : Math.max(0, (tutor.capacity || 0) - (tutor.enrolledCount || 0))}/{tutor.capacity}</div>
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
