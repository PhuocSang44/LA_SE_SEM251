import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ChevronLeft, ChevronRight, Clock } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import {  formatSessionRange, createSession } from "@/lib/sessionApi";
import { listSessionsByUser } from "@/lib/sessionApi";
import type { Session } from "@/types/session";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { t } from "@/lib/translations";

// Merge a date string (YYYY-MM-DD) and time string (HH:mm) into a local ISO-like string with timezone offset
const mergeDateTime = (dateStr: string, timeStr: string): string => {
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
    const offsetMinutes = -d.getTimezoneOffset();
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
};

const CalendarView = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [allSessions, setAllSessions] = useState<Session[]>([]);
  const [ownedClasses, setOwnedClasses] = useState<any[]>([]);
  const [classesById, setClassesById] = useState<Record<number, any>>({});
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
  const { language } = useLanguage();
  const apiBase = import.meta.env.VITE_API_BASE_URL || "http://localhost:10001";
  const numericUserId: number | null = user?.officialId ? Number(user.officialId) : null;
  const refreshSessions = async () => {
    try {
      const data = await listSessionsByUser();
      console.log("Loaded sessions:", data);
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
          ? list.map((cls) => {
              const displayName = cls.customClassName && cls.customClassName.trim() !== '' 
                ? cls.customClassName 
                : cls.courseName;
              return {
                classId: cls.classId ?? cls.id,
                displayName: displayName,
                courseName: cls.courseName ?? cls.name,
                courseCode: cls.courseCode ?? cls.code,
                customClassName: cls.customClassName,
                semester: cls.semester,
              };
            })
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
                .map((cls: any) => {
                  const displayName = cls.customClassName && cls.customClassName.trim() !== '' 
                    ? cls.customClassName 
                    : cls.courseName;
                  return {
                    classId: cls.classId ?? cls.id,
                    displayName: displayName,
                    courseName: cls.courseName ?? cls.name,
                    courseCode: cls.courseCode ?? cls.code,
                    customClassName: cls.customClassName,
                    semester: cls.semester,
                  };
                });
          setOwnedClasses(mine);
        } catch (fallbackError) {
          console.error('Unable to load class list', fallbackError);
        }
      }
    };
    loadClasses();
  }, [apiBase, user?.role, user?.officialId]);

  // Load class details for sessions so we can render subject/course name on each session block
  useEffect(() => {
    const ids = Array.from(
      new Set(
        allSessions
          .map((s) => s?.classId?? null)
          .filter((id) => id != null)
          .map((id) => Number(id))
      )
    );
    if (!ids.length) return;
    let cancelled = false;

    (async () => {
      try {
        const results = await Promise.allSettled(
          ids.map(async (id) => {
            try {
              const res = await fetch(`${apiBase}/api/classes/${id}`, { credentials: 'include' });
              if (!res.ok) return [id, null] as const;
              const json = await res.json();
              return [id, json] as const;
            } catch (err) {
              return [id, null] as const;
            }
          })
        );

        if (cancelled) return;

        setClassesById((prev) => {
          const next = { ...prev };
          for (const r of results) {
            if (r.status === "fulfilled") {
              const [id, cls] = r.value as readonly [number, any];
              if (cls) next[Number(id)] = cls;
            }
          }
          return next;
        });
      } catch (e) {
        console.error("Failed to load classes for calendar", e);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [allSessions, apiBase]);

  const getSubjectNameFromSession = (s: any) => {
    if (!s) return "Unknown";
    const classId = s?.classId ?? s?.class?.id ?? null;
    const cls = classId != null ? classesById[Number(classId)] : null;
    return (
      (cls?.customClassName && cls.customClassName.trim() !== '' ? cls.customClassName : null) ||
      cls?.courseName ||
      cls?.courseCode ||
      s?.subject ||
      s?.courseName ||
      s?.courseCode ||
      (cls?.name ?? "Unknown")
    );
  };

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
  const monthNames = [
    t(language, 'calendar.monthJan'), t(language, 'calendar.monthFeb'), t(language, 'calendar.monthMar'),
    t(language, 'calendar.monthApr'), t(language, 'calendar.monthMay'), t(language, 'calendar.monthJun'),
    t(language, 'calendar.monthJul'), t(language, 'calendar.monthAug'), t(language, 'calendar.monthSep'),
    t(language, 'calendar.monthOct'), t(language, 'calendar.monthNov'), t(language, 'calendar.monthDec')
  ];
  const dayNames = [
    t(language, 'calendar.sun'), t(language, 'calendar.mon'), t(language, 'calendar.tue'),
    t(language, 'calendar.wed'), t(language, 'calendar.thu'), t(language, 'calendar.fri'),
    t(language, 'calendar.sat')
  ];
  
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
        {dayNames.map((day, idx) => (
          <div key={idx} className="text-center font-semibold text-sm text-muted-foreground py-2">
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
          
          // Check if this date is in the past
          const cellDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
          const today = new Date();
          today.setHours(0, 0, 0, 0);
          const isPastDate = cellDate < today;

          return (
            <div
              key={day}
              className={`aspect-square border rounded-lg p-2 ${
                isPastDate && user?.role === 'tutor' ? 'cursor-not-allowed opacity-60' : 'hover:shadow-md transition-shadow cursor-pointer'
              } ${
                isToday ? "border-primary border-2 bg-primary/5" : "border-border"
              }`}
              onClick={() => {
                if (user?.role === 'tutor' && !isPastDate) {
                  setSelectedDate(dateKey);
                  setShowScheduler(true);
                } else if (user?.role === 'tutor' && isPastDate) {
                  toast({
                    title: t(language, 'calendar.cannotCreate'),
                    description: t(language, 'calendar.pastDate'),
                    variant: "destructive"
                  });
                }
              }}
            >
              <div className="text-sm font-medium mb-1 text-foreground">{day}</div>
              <div className="space-y-1">
                {daySessions.map((session) => {
                  const range = formatSessionRange(session);
                  const subject = getSubjectNameFromSession(session);
                  return (
                    <div
                      key={session.id}
                      className={`bg-blue-600 text-white text-xs p-1 rounded truncate`}
                      title={ `${session.title}${subject ? ` — ${subject}` : ""} - ${range}` }
                    >
                      <div className="font-medium flex items-center justify-between">
                        <span className="truncate">{session.title}</span>
                      </div>

                      {/* subject line */}
                      <div className="text-xxs opacity-90 mt-0.5">
                        <em className="text-[11px] opacity-90">{subject}</em>
                      </div>

                      <div className="flex items-center gap-1 opacity-90 mt-1">
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
        <h3 className="font-semibold mb-3 text-foreground">{t(language, 'calendar.legend')}</h3>
        <div className="text-xs text-muted-foreground space-y-1">
          <p>{t(language, 'calendar.blueBlocks')}</p>
          {user?.role === 'tutor' && <p>{t(language, 'calendar.clickDate')}</p>}
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
            <DialogTitle>{t(language, 'calendar.createSession')}</DialogTitle>
            <DialogDescription>{t(language, 'calendar.selectedDate')}: {selectedDate || 'None'}</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="calendar-class">{t(language, 'calendar.class')}</Label>
              <Select value={selectedClassId} onValueChange={setSelectedClassId}>
                <SelectTrigger id="calendar-class">
                  <SelectValue placeholder={ownedClasses.length ? t(language, 'calendar.selectClass') : t(language, 'calendar.noClasses')} />
                </SelectTrigger>
                <SelectContent>
                  {ownedClasses.map((cls) => (
                    <SelectItem key={cls.classId} value={String(cls.classId)}>
                      {cls.displayName} ({cls.courseCode}){cls.semester ? ` - ${cls.semester}` : ''}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="calendar-topic">{t(language, 'calendar.topic')}</Label>
              <Input id="calendar-topic" value={title} onChange={(e) => setTitle(e.target.value)} placeholder={t(language, 'calendar.topicPlaceholder')} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="calendar-start">{t(language, 'calendar.startTime')}</Label>
                <Input type="time" id="calendar-start" value={startTime} onChange={(e) => setStartTime(e.target.value)} />
              </div>
              <div>
                <Label htmlFor="calendar-end">{t(language, 'calendar.endTime')}</Label>
                <Input type="time" id="calendar-end" value={endTime} onChange={(e) => setEndTime(e.target.value)} />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="calendar-location">{t(language, 'courses.location')}</Label>
              <Input id="calendar-location" value={sessionLocation} onChange={(e) => setSessionLocation(e.target.value)} placeholder={t(language, 'courses.locationPlaceholder')} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="calendar-sessionType">{t(language, 'courses.sessionType')}</Label>
                <Select value={sessionType} onValueChange={setSessionType}>
                  <SelectTrigger id="calendar-sessionType">
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
                <Label htmlFor="calendar-capacity">{t(language, 'courses.capacity')}</Label>
                <Input type="number" id="calendar-capacity" value={capacity} onChange={(e) => setCapacity(e.target.value)} placeholder={t(language, 'courses.capacityPlaceholder')} min="1" />
              </div> */}
            </div>
            <div className="space-y-2">
              <Label htmlFor="calendar-description">{t(language, 'courses.sessionDescription')}</Label>
              <Input id="calendar-description" value={description} onChange={(e) => setDescription(e.target.value)} placeholder={t(language, 'courses.descriptionPlaceholder')} />
            </div>
            <Button disabled={submitting || !ownedClasses.length} onClick={async () => {
              if (!selectedDate || !selectedClassId || !title || !startTime || !endTime) {
                toast({ title: t(language, 'calendar.missingInfo'), description: t(language, 'calendar.fillRequired'), variant: 'destructive' });
                return;
              }
              const startIso = mergeDateTime(selectedDate, startTime);
              const endIso = mergeDateTime(selectedDate, endTime);
              if (new Date(startIso) >= new Date(endIso)) {
                toast({ title: t(language, 'calendar.invalidTime'), description: t(language, 'calendar.endAfterStart'), variant: 'destructive' });
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
                toast({ title: t(language, 'calendar.sessionCreated'), description: `${title} • ${selectedDate}` });
                await refreshSessions();
                setShowScheduler(false);
              } else {
                toast({ title: t(language, 'calendar.failedCreate'), description: t(language, 'calendar.checkApi'), variant: 'destructive' });
              }
              setSubmitting(false);
            }}>
              {submitting ? t(language, 'calendar.creating') : t(language, 'calendar.createSession')}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </Card>
  );
};

export default CalendarView;