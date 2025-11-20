import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ChevronLeft, ChevronRight, Clock } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { listAllSessions, formatSessionRange, createSession } from "@/lib/sessionApi";
import type { Session } from "@/types/session";
import { useAuth } from "@/contexts/AuthContext";

const CalendarView = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [allSessions, setAllSessions] = useState<Session[]>([]);
  const [ownedClasses, setOwnedClasses] = useState<any[]>([]);
  const [showScheduler, setShowScheduler] = useState(false);
  const [selectedDate, setSelectedDate] = useState<string>("");
  const [selectedClassId, setSelectedClassId] = useState<string>("");
  const [title, setTitle] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [sessionLocation, setSessionLocation] = useState("");
  const [sessionType, setSessionType] = useState("");
  const [capacity, setCapacity] = useState("");
  const [description, setDescription] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const { user } = useAuth();
  const apiBase = import.meta.env.VITE_API_BASE || "http://localhost:10001";

  const refreshSessions = async () => {
    try {
      const data = await listAllSessions();
      setAllSessions(data);
    } catch (error) {
      console.error('Cannot load sessions', error);
    }
  };

  useEffect(() => {
    refreshSessions();
  }, []);

  useEffect(() => {
    if (user?.role !== 'tutor') return;
    const loadClasses = async () => {
      try {
        const res = await fetch(`${apiBase}/api/classes/my-classes`, { credentials: 'include' });
        if (!res.ok) {
          throw new Error('my-classes not available');
        }
        const list = await res.json();
        const normalized = Array.isArray(list)
          ? list.map((cls) => ({
              classId: cls.classId ?? cls.id,
              courseName: cls.courseName ?? cls.name,
              courseCode: cls.courseCode ?? cls.code,
            }))
          : [];
        setOwnedClasses(normalized);
      } catch (error) {
        console.warn('Falling back to /api/classes', error);
        try {
          const res = await fetch(`${apiBase}/api/classes`, { credentials: 'include' });
          if (!res.ok) return;
          const list = await res.json();
          const tutorId = user?.officialId ? String(user.officialId) : null;
          const mine = tutorId == null
            ? []
            : list.filter((cls: any) => String(cls.tutorId ?? "") === tutorId)
                .map((cls: any) => ({
                  classId: cls.classId ?? cls.id,
                  courseName: cls.courseName ?? cls.name,
                  courseCode: cls.courseCode ?? cls.code,
                }));
          setOwnedClasses(mine);
        } catch (fallbackError) {
          console.error('Unable to load class list', fallbackError);
        }
      }
    };
    loadClasses();
  }, [apiBase, user?.role, user?.officialId]);

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();
    
    return { daysInMonth, startingDayOfWeek };
  };

  const { daysInMonth, startingDayOfWeek } = getDaysInMonth(currentDate);
  const monthNames = ["January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"];
  
  const previousMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1));
  };
  
  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1));
  };

  const getDateKey = (day: number) => {
    const year = currentDate.getFullYear();
    const month = String(currentDate.getMonth() + 1).padStart(2, '0');
    const dayStr = String(day).padStart(2, '0');
    return `${year}-${month}-${dayStr}`;
  };

  const sessionsByDate: Record<string, Session[]> = allSessions.reduce((acc, s) => {
    const d = new Date(s.startTime);
    const key = `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
    (acc[key] = acc[key] || []).push(s);
    return acc;
  }, {} as Record<string, Session[]>);

  return (
    <Card className="p-6 shadow-md rounded-xl">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-foreground">
          {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
        </h2>
        <div className="flex gap-2">
          <Button variant="outline" size="icon" onClick={previousMonth} className="rounded-lg">
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="icon" onClick={nextMonth} className="rounded-lg">
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-2">
        {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
          <div key={day} className="text-center font-semibold text-sm text-muted-foreground py-2">
            {day}
          </div>
        ))}
        
        {Array.from({ length: startingDayOfWeek }).map((_, index) => (
          <div key={`empty-${index}`} className="aspect-square" />
        ))}
        
        {Array.from({ length: daysInMonth }).map((_, index) => {
          const day = index + 1;
          const dateKey = getDateKey(day);
          const daySessions = sessionsByDate[dateKey] || [];
          const isToday = 
            day === new Date().getDate() && 
            currentDate.getMonth() === new Date().getMonth() &&
            currentDate.getFullYear() === new Date().getFullYear();

          return (
            <div
              key={day}
              className={`aspect-square border rounded-lg p-2 hover:shadow-md transition-shadow cursor-pointer ${
                isToday ? "border-primary border-2 bg-primary/5" : "border-border"
              }`}
              onClick={() => {
                if (user?.role === 'tutor') {
                  setSelectedDate(dateKey);
                  setShowScheduler(true);
                }
              }}
            >
              <div className="text-sm font-medium mb-1 text-foreground">{day}</div>
              <div className="space-y-1">
                {daySessions.map((session) => {
                  const range = formatSessionRange(session);
                  return (
                    <div
                      key={session.id}
                      className={`bg-blue-600 text-white text-xs p-1 rounded truncate`}
                      title={`${session.title} - ${range}`}
                    >
                      <div className="font-medium">{session.title}</div>
                      <div className="flex items-center gap-1 opacity-90">
                        <Clock className="h-2.5 w-2.5" />
                        <span>{range.split(' ').slice(-2)[0]}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-6 pt-6 border-t">
        <h3 className="font-semibold mb-3 text-foreground">Legend / Actions</h3>
        <div className="text-xs text-muted-foreground space-y-1">
          <p>Blue blocks: scheduled sessions.</p>
          {user?.role === 'tutor' && <p>Click on the date to open the session creation box, then select the class and time.</p>}
        </div>
      </div>

      <Dialog open={showScheduler} onOpenChange={(open) => {
        setShowScheduler(open);
        if (!open) {
          setTitle("");
          setStartTime("");
          setEndTime("");
          setSessionLocation("");
          setSessionType("");
          setCapacity("");
          setDescription("");
          setSelectedClassId("");
        }
      }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create Session</DialogTitle>
            <DialogDescription>Selected date: {selectedDate || 'None'}</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="calendar-class">Class</Label>
              <Select value={selectedClassId} onValueChange={setSelectedClassId}>
                <SelectTrigger id="calendar-class">
                  <SelectValue placeholder={ownedClasses.length ? 'Select a class' : 'No classes available'} />
                </SelectTrigger>
                <SelectContent>
                  {ownedClasses.map((cls) => (
                    <SelectItem key={cls.classId} value={String(cls.classId)}>
                      {cls.courseName} ({cls.courseCode})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="calendar-topic">Topic</Label>
              <Input id="calendar-topic" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="E.g: Chapter 3 Review" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="calendar-start">Start Time</Label>
                <Input type="time" id="calendar-start" value={startTime} onChange={(e) => setStartTime(e.target.value)} />
              </div>
              <div>
                <Label htmlFor="calendar-end">End Time</Label>
                <Input type="time" id="calendar-end" value={endTime} onChange={(e) => setEndTime(e.target.value)} />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="calendar-location">Location (optional)</Label>
              <Input id="calendar-location" value={sessionLocation} onChange={(e) => setSessionLocation(e.target.value)} placeholder="e.g. Room 101 or Zoom link" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="calendar-sessionType">Session Type (optional)</Label>
                <Select value={sessionType} onValueChange={setSessionType}>
                  <SelectTrigger id="calendar-sessionType">
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
                <Label htmlFor="calendar-capacity">Capacity (optional, default: 30)</Label>
                <Input type="number" id="calendar-capacity" value={capacity} onChange={(e) => setCapacity(e.target.value)} placeholder="30" min="1" />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="calendar-description">Description (optional)</Label>
              <Input id="calendar-description" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Additional notes or requirements" />
            </div>
            <Button disabled={submitting || !ownedClasses.length} onClick={async () => {
              if (!selectedDate || !selectedClassId || !title || !startTime || !endTime) {
                toast({ title: 'Missing information', description: 'Please fill in class, topic, start/end time', variant: 'destructive' });
                return;
              }
              const startIso = new Date(`${selectedDate}T${startTime}:00`).toISOString();
              const endIso = new Date(`${selectedDate}T${endTime}:00`).toISOString();
              if (new Date(startIso) >= new Date(endIso)) {
                toast({ title: 'Invalid time range', description: 'End time must be after start time', variant: 'destructive' });
                return;
              }
              setSubmitting(true);
              const created = await createSession({ 
                classId: Number(selectedClassId), 
                title, 
                startTime: startIso, 
                endTime: endIso,
                location: sessionLocation || undefined,
                sessionType: sessionType || undefined,
                capacity: capacity ? parseInt(capacity) : undefined,
                description: description || undefined,
              });
              if (created) {
                toast({ title: 'Session created', description: `${title} • ${selectedDate}` });
                await refreshSessions();
                setShowScheduler(false);
              } else {
                toast({ title: 'Failed to create session', description: 'Check API / connection', variant: 'destructive' });
              }
              setSubmitting(false);
            }}>
              {submitting ? 'Creating...' : 'Create Session'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </Card>
  );
};

export default CalendarView;
