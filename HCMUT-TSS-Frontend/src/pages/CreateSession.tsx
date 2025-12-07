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
import { useLanguage } from "@/contexts/LanguageContext";
import { t } from "@/lib/translations";
import { Toast } from "@radix-ui/react-toast";
import { Toaster } from "@/components/ui/toaster";

// Simple date+time merger
function mergeDateTime(dateStr: string, timeStr: string): string {
  const pad = (n: number) => String(n).padStart(2, "0");
  try {
    const [h, m] = timeStr.split(":").map(Number);
    const d = new Date(dateStr);
    d.setHours(h || 0, m || 0, 0, 0);
    const Y = d.getFullYear();
    const M = pad(d.getMonth() + 1);
    const D = pad(d.getDate());
    const H = pad(d.getHours());
    const Min = pad(d.getMinutes());
    // compute local offset like +07:00
    const offsetMinutes = -d.getTimezoneOffset(); // e.g. +420 for +07:00
    const sign = offsetMinutes >= 0 ? "+" : "-";
    const offH = pad(Math.floor(Math.abs(offsetMinutes) / 60));
    const offM = pad(Math.abs(offsetMinutes) % 60);
    return `${Y}-${M}-${D}T${H}:${Min}:00${sign}${offH}:${offM}`;
  } catch {
    const now = new Date();
    const Y = now.getFullYear();
    const M = pad(now.getMonth() + 1);
    const D = pad(now.getDate());
    const H = pad(now.getHours());
    const Min = pad(now.getMinutes());
    const offsetMinutes = -now.getTimezoneOffset();
    const sign = offsetMinutes >= 0 ? "+" : "-";
    const offH = pad(Math.floor(Math.abs(offsetMinutes) / 60));
    const offM = pad(Math.abs(offsetMinutes) % 60);
    return `${Y}-${M}-${D}T${H}:${Min}:00${sign}${offH}:${offM}`;
  }
}

const CreateSession = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const { language } = useLanguage();
  const apiBase = import.meta.env.VITE_API_BASE_URL || "http://localhost:10001";
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
    fetch(`${apiBase}/api/classes/my-classes`, { credentials: 'include' })
      .then(res => res.ok ? res.json() : Promise.reject(res))
      .then((list: any[]) => {
        // returns class objects with classId, courseCode, courseName, customClassName, semester, etc.
        const mapped = list.map(cls => {
          // Use customClassName if available, otherwise use courseName
          const displayName = cls.customClassName && cls.customClassName.trim() !== '' 
            ? cls.customClassName 
            : cls.courseName;
          
          return {
            classId: cls.classId,
            courseCode: cls.courseCode,
            courseName: cls.courseName,
            customClassName: cls.customClassName,
            displayName: displayName,
            semester: cls.semester,
            tutorId: cls.tutorId
          };
        });
        setClassOptions(mapped);
        if (!selectedClassId && mapped.length === 1) {
          setSelectedClassId(mapped[0].classId);
        }
      }).catch((err) => {
        console.error('Unable to load class list', err);
        toast({ title: t(language, 'common.error'), description: t(language, 'courses.noClasses'), variant: 'destructive' });
      }).finally(() => setLoadingClasses(false));
  }, [apiBase, course, selectedClassId, user?.role, language]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const classId = course?.id ?? selectedClassId;
    if (!classId) {
      toast({ title: t(language, 'courses.missingClass'), description: t(language, 'courses.selectClassFirst'), variant: "destructive" });
      return;
    }
    if (!title || !date || !startTime || !endTime) {
      toast({ title: t(language, 'courses.missingFields'), description: t(language, 'courses.fillRequired'), variant: "destructive" });
      return;
    }
    const startIso = mergeDateTime(date, startTime);
    const endIso = mergeDateTime(date, endTime);
    if (new Date(startIso) >= new Date(endIso)) {
      toast({ title: t(language, 'courses.invalidTime'), description: t(language, 'courses.endAfterStart'), variant: "destructive" });
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
    console.log('Creating session with payload', payload);
    const created = await createSession(payload);
    if (created) {
      toast({ title: t(language, 'courses.sessionCreated'), description: `${title} on ${date}` });
      if (course) {
        navigate('/course-details', { state: { course } });
      } else {
        resetForm();
      }
    } else {
      toast({ title: t(language, 'courses.failed'), description: t(language, 'courses.couldNotCreate'), variant: 'destructive' });
    }
    setSubmitting(false);
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 bg-muted/30">
        <div className="container mx-auto px-4 py-8">
          <div className="mb-6 flex items-center justify-between">
            <h1 className="text-3xl md:text-4xl font-bold">{t(language, 'courses.createSession')}</h1>
            <Button variant="outline" onClick={() => navigate(-1)}>{t(language, 'common.back')}</Button>
          </div>
          <Card className="max-w-xl mx-auto">
            <CardHeader>
              <CardTitle>{t(language, 'courses.createSession')}</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label>{t(language, 'courses.class')}</Label>
                  {course ? (
                    <Input value={course?.name || ''} disabled />
                  ) : (
                    <Select value={selectedClassId ? String(selectedClassId) : undefined} onValueChange={(val) => setSelectedClassId(Number(val))} disabled={loadingClasses || !classOptions.length}>
                      <SelectTrigger>
                        <SelectValue placeholder={loadingClasses ? t(language, 'courses.loading') : t(language, 'courses.selectClass')} />
                      </SelectTrigger>
                      <SelectContent>
                        {classOptions.map((cls) => (
                          <SelectItem key={cls.classId} value={String(cls.classId)}>
                            {cls.displayName} ({cls.courseCode}) - {cls.semester}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                  {!course && !classOptions.length && !loadingClasses && (
                    <p className="text-xs text-muted-foreground mt-1">{t(language, 'courses.noClasses')}</p>
                  )}
                </div>
                <div>
                  <Label htmlFor="topic">{t(language, 'courses.sessionTopic')}</Label>
                  <Input id="topic" value={title} onChange={e => setTitle(e.target.value)} placeholder="e.g. Chapter 3 Review" />
                </div>
                <div>
                  <Label htmlFor="date">{t(language, 'courses.sessionDate')}</Label>
                  <Input type="date" id="date" value={date} onChange={e => setDate(e.target.value)} />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="startTime">{t(language, 'courses.sessionStartTime')}</Label>
                    <Input type="time" id="startTime" value={startTime} onChange={e => setStartTime(e.target.value)} />
                  </div>
                  <div>
                    <Label htmlFor="endTime">{t(language, 'courses.sessionEndTime')}</Label>
                    <Input type="time" id="endTime" value={endTime} onChange={e => setEndTime(e.target.value)} />
                  </div>
                </div>
                <div>
                  <Label htmlFor="location">{t(language, 'courses.location')}</Label>
                  <Input id="location" value={sessionLocation} onChange={e => setSessionLocation(e.target.value)} placeholder={t(language, 'courses.locationPlaceholder')} />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="sessionType">{t(language, 'courses.sessionType')}</Label>
                    <Select value={sessionType} onValueChange={setSessionType}>
                      <SelectTrigger id="sessionType">
                        <SelectValue placeholder={t(language, 'courses.selectType')} />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="LECTURE">{t(language, 'courses.lecture')}</SelectItem>
                        <SelectItem value="LAB">{t(language, 'courses.lab')}</SelectItem>
                        <SelectItem value="TUTORIAL">{t(language, 'courses.tutorial')}</SelectItem>
                        <SelectItem value="DISCUSSION">{t(language, 'courses.discussion')}</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  {/* <div>
                    <Label htmlFor="capacity">{t(language, 'courses.capacity')}</Label>
                    <Input type="number" id="capacity" value={capacity} onChange={e => setCapacity(e.target.value)} placeholder={t(language, 'courses.capacityPlaceholder')} min="1" />
                  </div> */}
                </div>
                <div>
                  <Label htmlFor="description">{t(language, 'courses.description')}</Label>
                  <Input id="description" value={description} onChange={e => setDescription(e.target.value)} placeholder={t(language, 'courses.descriptionPlaceholder')} />
                </div>
                <div className="flex gap-2">
                  <Button type="submit" disabled={submitting}>{submitting ? t(language, 'common.creating') : t(language, 'common.submit')}</Button>
                  <Button type="button" variant="outline" onClick={() => { setTitle(''); setDate(''); setStartTime(''); setEndTime(''); }}>{t(language, 'common.reset')}</Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </main>
      <Footer />
      <Toaster />
    </div>
  );
};

export default CreateSession;
