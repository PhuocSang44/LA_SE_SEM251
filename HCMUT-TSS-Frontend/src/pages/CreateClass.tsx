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
  // display value for the code-name field (shows "CODE - Name")
  const [courseDisplay, setCourseDisplay] = useState("");
  // whether a canonical course has been selected (locks the input)
  const [courseSelected, setCourseSelected] = useState(false);
  const [courseDescription, setCourseDescription] = useState("");
  // restored: user-provided display name for the class (optional)
  const [customClassName, setCustomClassName] = useState("");
  const [semester, setSemester] = useState("");
  const [capacity, setCapacity] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);

  // autocomplete state
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const debounceRef = useRef<number | null>(null as any);

  // Hard-coded canonical course list (code + name) for quick suggestions
  const HARDCODED_COURSES = [
    { code: 'MT1003', name: 'Calculus' },
    { code: 'MT1005', name: 'Calculus 2' },
    { code: 'MT1004', name: 'Linear Algebra' },
    { code: 'MT2001', name: 'Discrete Mathematics' },
    { code: 'CS1010', name: 'Intro to Programming' }
  ];

  // my classes
  const [myClasses, setMyClasses] = useState<any[]>([]);
  const [expandedClassId, setExpandedClassId] = useState<number | null>(null);

  const apiBase = import.meta.env.VITE_API_BASE_URL || "http://localhost:10001";

  // Map backend ClassResponse to frontend course model (consistent with MyCourses.tsx)
  const mapResponseToCourse = (c: any) => {
    const codeNorm = String(c.courseCode || '').trim().toUpperCase();
    const canonical = HARDCODED_COURSES.find(x => String(x.code).trim().toUpperCase() === codeNorm);
    let displayName = c.customClassName;     
    if (!displayName || displayName.trim() === '') {
        if (canonical) {
            displayName = canonical.name;
        } else {
            displayName = c.courseName;
        }
    }
    return {
      id: c.classId,
      name: displayName,
      code: c.courseCode,
      tutor: c.tutorName,
      tutorId: c.tutorId,
      semester: c.semester,
      capacity: c.capacity,
      enrolledCount: c.enrolledCount,
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

  // compute a default semester string based on current month/year
  const computeDefaultSemester = () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth() + 1;   
    // Term mapping: Jan-May -> Spring, Jun-Aug -> Summer, Sep-Dec -> Fall
    let term = 'Spring';
    if (month >= 9) term = 'Fall';
    else if (month >= 6) term = 'Summer';
    return `${term} ${year}`;
  };

  // Set default semester on mount if empty
  useEffect(() => {
    if (!semester) setSemester(computeDefaultSemester());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchSuggestions = (q: string) => {
    if (!q || q.trim().length < 1) {
      setSuggestions([]);
      return;
    }
    const up = q.trim().toUpperCase();
    // If user types a prefix like "MT" use the hardcoded list to suggest standard courses
    if (up.startsWith('MT') || up.startsWith('CS') || up.length <= 3) {
      const local = HARDCODED_COURSES.filter(c => (`${c.code} ${c.name}`).toUpperCase().includes(up))
        .map(c => ({ courseId: c.code, code: c.code, name: c.name, description: '' }));
      setSuggestions(local);
      return;
    }

    // fallback to server-side suggestions for other queries
    fetch(`${apiBase}/api/courses?q=${encodeURIComponent(q)}`, { credentials: 'include' })
      .then(res => res.ok ? res.json() : Promise.reject(res))
      .then((list: any[]) => setSuggestions(list || []))
      .catch(err => console.error('Failed to fetch course suggestions', err));
  };

  const onCourseCodeChange = (value: string) => {
    // allow typing a prefix; clear selected courseName when user types
    setCourseCode(value);
    setCourseName("");
    setCourseDisplay(value);
    setShowSuggestions(true);
    if (debounceRef.current) window.clearTimeout(debounceRef.current as any);
    debounceRef.current = window.setTimeout(() => fetchSuggestions(value), 250) as any;
  };

  const selectSuggestion = (s: any) => {
    setCourseCode(s.code);
    setCourseName(s.name);
    setCourseDisplay(`${s.code} - ${s.name}`);
    setShowSuggestions(false);
    setSuggestions([]);
    setCourseSelected(true);
  };

  const onCourseBlur = () => {
    setTimeout(() => {
      if (courseSelected || courseName) return;

      // Enforce selection 
      if (!courseCode) {
        setCourseDisplay("");
        setCourseName("");
        return;
      }

      // try to parse code
      const parsedCode = courseCode.includes(' - ') ? courseCode.split(' - ')[0].trim() : courseCode.trim();
      const found = HARDCODED_COURSES.find(c => c.code === parsedCode) || suggestions.find((s: any) => s.code === parsedCode);
      if (found) {
        setCourseCode(found.code);
        setCourseName(found.name);
        setCourseDisplay(`${found.code} - ${found.name}`);
        setCourseSelected(true);
        return;
      }

      // Not valid → clear and notify
      setCourseCode("");
      setCourseName("");
      setCourseDisplay("");
      setSuggestions([]);
      toast({ title: 'Invalid course', description: 'Please select a course from the list', variant: 'destructive' });
    }, 120);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!capacity || capacity <= 0) {
      toast({ 
        title: "Invalid Capacity", 
        description: "Capacity must be greater than 0 and not empty.", 
        variant: "destructive" 
      });
      return;
    }
    if (!courseCode || !courseName || !semester) {
      toast({ title: "Missing fields", description: "Please pick a valid course and fill semester", variant: "destructive" });
      return;
    }
    setLoading(true);
    try {
        const payload = {
          courseCode,
          courseName,
          customClassName,
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
      // refresh
      setMyClasses(prev => [mapResponseToCourse(data), ...prev]);
      // clear (semester -> default)
      setCourseCode("");
      setCourseName("");
      setCustomClassName("");
      setCourseDescription("");
      setSemester(computeDefaultSemester());
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
                    <Label htmlFor="courseCode">Course (code — name)</Label>
                    <div className="flex items-center gap-2">
                      <Input id="courseCode" value={courseDisplay || courseCode} onChange={(e) => { setCourseSelected(false); onCourseCodeChange(e.target.value); }} onBlur={onCourseBlur} placeholder="Type code or name to search" readOnly={courseSelected} />
                      {courseSelected ? (
                        <Button size="sm" variant="outline" onClick={() => { setCourseSelected(false); setCourseCode(''); setCourseName(''); setCourseDisplay(''); }}>Clear</Button>
                      ) : null}
                    </div>
                    {showSuggestions && suggestions.length > 0 && (
                      <div className="bg-card border rounded mt-2 max-h-48 overflow-auto">
                        {suggestions.map(s => (
                          <div key={s.courseId} className="p-2 hover:bg-muted cursor-pointer" onMouseDown={() => selectSuggestion(s)}>
                            <div className="font-medium">{s.code} — {s.name}</div>
                            <div className="text-xs text-muted-foreground">{s.description}</div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
 

                  <div>
                    <Label htmlFor="customClassName">Class name (optional)</Label>
                    <Input id="customClassName" value={customClassName} onChange={(e) => setCustomClassName(e.target.value)} placeholder="Display name for the class (optional)" />
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
                    <Label htmlFor="capacity">Capacity <span className="text-destructive">*</span></Label>
                    <Input 
                      id="capacity" 
                      type="number"
                      min="1" 
                      required 
                      placeholder="e.g., 40" 
                      value={capacity ?? ''} 
                      onChange={(e) => {
                        const val = e.target.value;
                        setCapacity(val === '' ? null : parseInt(val));
                      }} 
                    />
                    {capacity !== null && capacity <= 0 && (
                      <p className="text-xs text-destructive mt-1">
                        Capacity must be greater than 0.
                      </p>
                    )}
                  </div>

                  <div className="flex gap-2">
                    <Button type="submit" disabled={loading}>{loading ? 'Creating...' : 'Create'}</Button>
                    <Button type="button" variant="outline" onClick={() => { setCourseCode(''); setCourseName(''); setCourseDisplay(''); setCourseSelected(false); setCourseDescription(''); setSemester(computeDefaultSemester()); setCapacity(null); }}>Reset</Button>
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
                    <Card key={c.capacity} className="rounded-xl shadow-sm relative">
                        <CardHeader>
                          <div className="flex items-start justify-between w-full">
                            <div>
                              
                              <CardTitle className="text-lg">{c.name}</CardTitle>
                              <div className="text-sm text-muted-foreground">Capacity: {c.enrolledCount} / {c.capacity}</div>
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
