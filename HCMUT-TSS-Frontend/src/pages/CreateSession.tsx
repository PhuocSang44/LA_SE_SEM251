import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useLocation, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { toast } from "@/hooks/use-toast";
import { createSession } from "@/lib/sessionApi";
import type { CreateSessionPayload } from "@/types/session";
import { useAuth } from "@/contexts/AuthContext";

// Simple date+time merger
function mergeDateTime(dateStr: string, timeStr: string): string {
  try {
    const [h,m] = timeStr.split(":").map(Number);
    const d = new Date(dateStr);
    d.setHours(h || 0, m || 0, 0, 0);
    return d.toISOString();
  } catch { return new Date().toISOString(); }
}

const CreateSession = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const apiBase = import.meta.env.VITE_API_BASE || "http://localhost:10001";
  // course passed in state
  const course = location.state?.course || null;
  const presetDate: string | undefined = location.state?.presetDate;

  const [title, setTitle] = useState("");
  const [date, setDate] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [sessionLocation, setSessionLocation] = useState("");
  const [sessionType, setSessionType] = useState("");
  const [capacity, setCapacity] = useState("");
  const [description, setDescription] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [classOptions, setClassOptions] = useState<any[]>([]);
  const [selectedClassId, setSelectedClassId] = useState<number | null>(course?.id ?? null);
  const [loadingClasses, setLoadingClasses] = useState(false);
  const resetForm = () => {
    setTitle("");
    setDate(presetDate || "");
    setStartTime("");
    setEndTime("");
    setSessionLocation("");
    setSessionType("");
    setCapacity("");
    setDescription("");
    if (!course) {
      setSelectedClassId(null);
    }
  };


  useEffect(() => {
    if (presetDate && !date) {
      setDate(presetDate);
    }
  }, [presetDate, date]);

  useEffect(() => {
    if (course || user?.role !== 'tutor') return;
    setLoadingClasses(true);
    fetch(`${apiBase}/api/classes`, { credentials: 'include' })
      .then(res => res.ok ? res.json() : Promise.reject(res))
      .then((list: any[]) => {
        const tutorId = user?.officialId ? Number(user.officialId) : null;
        const mine = tutorId == null ? [] : list.filter(cls => cls.tutorId === tutorId);
        setClassOptions(mine);
        if (!selectedClassId && mine.length === 1) {
          setSelectedClassId(mine[0].classId);
        }
      }).catch((err) => {
        console.error('Unable to load class list', err);
        toast({ title: 'Unable to load classes', description: 'Check your connection or access rights', variant: 'destructive' });
      }).finally(() => setLoadingClasses(false));
  }, [apiBase, course, selectedClassId, user?.officialId, user?.role]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const classId = course?.id ?? selectedClassId;
    if (!classId) {
      toast({ title: "Missing class", description: "Please select a class before creating a session", variant: "destructive" });
      return;
    }
    if (!title || !date || !startTime || !endTime) {
      toast({ title: "Missing fields", description: "Please fill topic, date, start/end time", variant: "destructive" });
      return;
    }
    const startIso = mergeDateTime(date, startTime);
    const endIso = mergeDateTime(date, endTime);
    if (new Date(startIso) >= new Date(endIso)) {
      toast({ title: "Invalid time range", description: "End time must be after start time", variant: "destructive" });
      return;
    }
    setSubmitting(true);
    const payload: CreateSessionPayload = {
      classId,
      title,
      startTime: startIso,
      endTime: endIso,
      location: sessionLocation || undefined,
      sessionType: sessionType || undefined,
      capacity: capacity ? parseInt(capacity) : undefined,
      description: description || undefined,
    };
    const created = await createSession(payload);
    if (created) {
      toast({ title: "Session created", description: `${title} on ${date}` });
      if (course) {
        navigate('/course-details', { state: { course } });
      } else {
        resetForm();
      }
    } else {
      toast({ title: "Failed", description: "Could not create session (endpoint missing?)", variant: 'destructive' });
    }
    setSubmitting(false);
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 bg-muted/30">
        <div className="container mx-auto px-4 py-8">
          <div className="mb-6 flex items-center justify-between">
            <h1 className="text-3xl md:text-4xl font-bold">Create Session</h1>
            <Button variant="outline" onClick={() => navigate(-1)}>Back</Button>
          </div>
          <Card className="max-w-xl mx-auto">
            <CardHeader>
              <CardTitle>New Tutoring Session</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label>Class</Label>
                  {course ? (
                    <Input value={course?.name || ''} disabled />
                  ) : (
                    <Select value={selectedClassId ? String(selectedClassId) : undefined} onValueChange={(val) => setSelectedClassId(Number(val))} disabled={loadingClasses || !classOptions.length}>
                      <SelectTrigger>
                        <SelectValue placeholder={loadingClasses ? 'Loading...' : 'Select a class'} />
                      </SelectTrigger>
                      <SelectContent>
                        {classOptions.map((cls) => (
                          <SelectItem key={cls.classId} value={String(cls.classId)}>
                            {cls.courseName} ({cls.courseCode})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                  {!course && !classOptions.length && !loadingClasses && (
                    <p className="text-xs text-muted-foreground mt-1">You don't have any classes yet</p>
                  )}
                </div>
                <div>
                  <Label htmlFor="topic">Topic</Label>
                  <Input id="topic" value={title} onChange={e => setTitle(e.target.value)} placeholder="e.g. Chapter 3 Review" />
                </div>
                <div>
                  <Label htmlFor="date">Date</Label>
                  <Input type="date" id="date" value={date} onChange={e => setDate(e.target.value)} />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="startTime">Start Time</Label>
                    <Input type="time" id="startTime" value={startTime} onChange={e => setStartTime(e.target.value)} />
                  </div>
                  <div>
                    <Label htmlFor="endTime">End Time</Label>
                    <Input type="time" id="endTime" value={endTime} onChange={e => setEndTime(e.target.value)} />
                  </div>
                </div>
                <div>
                  <Label htmlFor="location">Location (optional)</Label>
                  <Input id="location" value={sessionLocation} onChange={e => setSessionLocation(e.target.value)} placeholder="e.g. Room 101 or Zoom link" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="sessionType">Session Type (optional)</Label>
                    <Select value={sessionType} onValueChange={setSessionType}>
                      <SelectTrigger id="sessionType">
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="LECTURE">Lecture</SelectItem>
                        <SelectItem value="LAB">Lab</SelectItem>
                        <SelectItem value="TUTORIAL">Tutorial</SelectItem>
                        <SelectItem value="DISCUSSION">Discussion</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="capacity">Capacity (optional, default: 30)</Label>
                    <Input type="number" id="capacity" value={capacity} onChange={e => setCapacity(e.target.value)} placeholder="30" min="1" />
                  </div>
                </div>
                <div>
                  <Label htmlFor="description">Description (optional)</Label>
                  <Input id="description" value={description} onChange={e => setDescription(e.target.value)} placeholder="Additional notes or requirements" />
                </div>
                <div className="flex gap-2">
                  <Button type="submit" disabled={submitting}>{submitting ? 'Creating...' : 'Create'}</Button>
                  <Button type="button" variant="outline" onClick={() => { setTitle(''); setDate(''); setStartTime(''); setEndTime(''); }}>Reset</Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default CreateSession;
