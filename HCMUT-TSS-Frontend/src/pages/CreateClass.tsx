import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useEffect, useState, useRef } from "react";
import { toast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";

const CreateClass = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  // form state
  const [courseCode, setCourseCode] = useState("");
  const [courseName, setCourseName] = useState("");
  const [courseDescription, setCourseDescription] = useState("");
  const [semester, setSemester] = useState("");
  const [capacity, setCapacity] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);

  // autocomplete state
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const debounceRef = useRef<number | null>(null as any);

  // my classes
  const [myClasses, setMyClasses] = useState<any[]>([]);
  const [expandedClassId, setExpandedClassId] = useState<number | null>(null);

  const apiBase = import.meta.env.VITE_API_BASE || "http://localhost:10001";

  // Map backend ClassResponse to frontend course model (consistent with MyCourses.tsx)
  const mapResponseToCourse = (c: any) => {
    return {
      id: c.classId,
      name: c.courseName,
      code: c.courseCode,
      tutor: c.tutorName,
      tutorId: c.tutorId,
      semester: c.semester,
      sessions: 1,
      color: 'bg-blue-500',
      progress: 0
    };
  };

  useEffect(() => {
    // load tutor's classes
    fetch(`${apiBase}/api/classes/my-classes`, { credentials: 'include' })
      .then(res => res.ok ? res.json() : Promise.reject(res))
      .then((data: any[]) => setMyClasses(data.map(mapResponseToCourse)))
      .catch(err => console.error('Failed to load my classes', err));
  }, [apiBase]);

  const fetchSuggestions = (q: string) => {
    if (!q || q.trim().length < 1) {
      setSuggestions([]);
      return;
    }
    fetch(`${apiBase}/api/courses?q=${encodeURIComponent(q)}`, { credentials: 'include' })
      .then(res => res.ok ? res.json() : Promise.reject(res))
      .then((list: any[]) => setSuggestions(list || []))
      .catch(err => console.error('Failed to fetch course suggestions', err));
  };

  const onCourseCodeChange = (value: string) => {
    setCourseCode(value);
    setShowSuggestions(true);
    if (debounceRef.current) window.clearTimeout(debounceRef.current as any);
    debounceRef.current = window.setTimeout(() => fetchSuggestions(value), 250) as any;
  };

  const selectSuggestion = (s: any) => {
    setCourseCode(s.code);
    setCourseName(s.name);
    setShowSuggestions(false);
    setSuggestions([]);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!courseCode || !courseName || !semester) {
      toast({ title: "Missing fields", description: "Please fill course code, name and semester", variant: "destructive" });
      return;
    }
    setLoading(true);
    try {
      const payload = {
        courseCode,
        courseName,
        courseDescription,
        semester,
        capacity
      };
      const res = await fetch(`${apiBase}/api/classes`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (!res.ok) {
        const text = await res.text();
        throw new Error(text || 'Failed to create class');
      }
      const data = await res.json();
      toast({ title: 'Class created', description: `${data.courseName} (${data.courseCode}) created` });
      // refresh my classes
      setMyClasses(prev => [mapResponseToCourse(data), ...prev]);
      // clear
      setCourseCode("");
      setCourseName("");
      setCourseDescription("");
      setSemester("");
      setCapacity(null);
    } catch (err: any) {
      console.error(err);
      toast({ title: 'Error', description: String(err), variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 bg-muted/30">
        <div className="container mx-auto px-4 py-8">
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-1">My Class</h1>
              <p className="text-sm text-muted-foreground">Create and manage the classes you teach</p>
            </div>
            <div>
              <Button onClick={() => navigate('/my-courses')}>Go to My Courses</Button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Create panel (left) */}
            <Card className="lg:col-span-1">
              <CardHeader>
                <CardTitle className="text-lg">Create Class</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <Label htmlFor="courseCode">Course Code or Name</Label>
                    <Input id="courseCode" value={courseCode} onChange={(e) => onCourseCodeChange(e.target.value)} placeholder="Type code or name to search" />
                    {showSuggestions && suggestions.length > 0 && (
                      <div className="bg-card border rounded mt-2 max-h-48 overflow-auto">
                        {suggestions.map(s => (
                          <div key={s.courseId} className="p-2 hover:bg-muted cursor-pointer" onClick={() => selectSuggestion(s)}>
                            <div className="font-medium">{s.code} — {s.name}</div>
                            <div className="text-xs text-muted-foreground">{s.description}</div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="courseName">Course Name</Label>
                    <Input id="courseName" value={courseName} onChange={(e) => setCourseName(e.target.value)} placeholder="Course name" />
                  </div>

                  <div>
                    <Label htmlFor="courseDescription">Description</Label>
                    <Textarea id="courseDescription" value={courseDescription} onChange={(e) => setCourseDescription(e.target.value)} placeholder="Optional description" />
                  </div>

                  <div>
                    <Label htmlFor="semester">Semester</Label>
                    <Input id="semester" value={semester} onChange={(e) => setSemester(e.target.value)} placeholder="e.g., Fall 2025" />
                  </div>

                  <div>
                    <Label htmlFor="capacity">Capacity (leave empty for unlimited)</Label>
                    <Input id="capacity" value={capacity ?? ''} onChange={(e) => setCapacity(e.target.value === '' ? null : parseInt(e.target.value))} placeholder="e.g., 30" type="number" />
                  </div>

                  <div className="flex gap-2">
                    <Button type="submit" disabled={loading}>{loading ? 'Creating...' : 'Create'}</Button>
                    <Button type="button" variant="outline" onClick={() => { setCourseCode(''); setCourseName(''); setCourseDescription(''); setSemester(''); setCapacity(null); }}>Reset</Button>
                  </div>
                </form>
              </CardContent>
            </Card>

            {/* Classes list (right) */}
            <div className="lg:col-span-2 space-y-4">
              {myClasses.length === 0 && (
                <div className="rounded-lg border p-6 bg-card">You have not created any classes yet.</div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {myClasses.map((c: any) => {
                  const isExpanded = expandedClassId === c.id;
                  return (
                    <Card key={c.id} className="rounded-xl shadow-sm relative">
                        <CardHeader>
                          <div className="flex items-start justify-between w-full">
                            <div>
                              <CardTitle className="text-lg">{c.name}</CardTitle>
                              <div className="text-sm text-muted-foreground">{c.code} • {c.semester}</div>
                            </div>
                          </div>
                        </CardHeader>
                      <CardContent>
                        <div className="mb-3 text-sm text-muted-foreground">Tutor: {c.tutor}</div>

                        {/* Main View button - passes full mapped course object */}
                        <div className="flex">
                          <Button className="w-full rounded-lg" onClick={() => navigate('/course-details', { state: { course: c } })}>
                            View Details
                          </Button>
                        </div>

                        {/* Deleted management buttons per user request; only View Details remains */}
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default CreateClass;
