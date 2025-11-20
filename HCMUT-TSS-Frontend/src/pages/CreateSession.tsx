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

  const [topic, setTopic] = useState("");
  const [date, setDate] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [classOptions, setClassOptions] = useState<any[]>([]);
  const [selectedClassId, setSelectedClassId] = useState<number | null>(course?.id ?? null);
  const [loadingClasses, setLoadingClasses] = useState(false);
  const resetForm = () => {
    setTopic("");
    setDate(presetDate || "");
    setStartTime("");
    setEndTime("");
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
    if (!topic || !date || !startTime || !endTime) {
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
      topic,
      startTime: startIso,
      endTime: endIso
    };
    const created = await createSession(payload);
    if (created) {
      toast({ title: "Session created", description: `${topic} on ${date}` });
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
                  <Input id="topic" value={topic} onChange={e => setTopic(e.target.value)} placeholder="e.g. Chapter 3 Review" />
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
                <div className="flex gap-2">
                  <Button type="submit" disabled={submitting}>{submitting ? 'Creating...' : 'Create'}</Button>
                  <Button type="button" variant="outline" onClick={() => { setTopic(''); setDate(''); setStartTime(''); setEndTime(''); }}>Reset</Button>
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
