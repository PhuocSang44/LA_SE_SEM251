// ...existing code...
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import CalendarView from "@/components/CalendarView";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { useEffect, useState } from "react";
import { listSessionsByUser } from "@/lib/sessionApi";
import { useAuth } from "@/contexts/AuthContext";

const Dashboard = () => {
  const { user } = useAuth();
  const [sessions, setSessions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [classesById, setClassesById] = useState<Record<number, any>>({});
  const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:10001";

  useEffect(() => {
    setLoading(true);
    listSessionsByUser()
      .then((data) => setSessions(data || []))
      .catch(() => setSessions([]))
      .finally(() => setLoading(false));
  }, []);

  // Load class details for all classIds referenced by sessions
  useEffect(() => {
    const ids = Array.from(
      new Set(
        sessions
          .map((s) => {
            const id = s?.classId ?? s?.class?.id ?? s?.classIdString;
            return id == null ? null : Number(id);
          })
          .filter(Boolean)
      )
    );
    if (!ids.length) return;
    let cancelled = false;

    (async () => {
      try {
        const results = await Promise.allSettled(
          ids.map(async (id) => {
            const res = await fetch(`${API_BASE}/api/classes/${id}`, { credentials: "include" });
            if (!res.ok) return [id, null] as const;
            const json = await res.json();
            return [id, json] as const;
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
        // ignore - keep existing classesById
        console.error("Failed loading classes for dashboard", e);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [sessions, API_BASE]);

  const getSubjectNameFromSession = (s: any) => {
    if (!s) return "Unknown";
    const classId = s?.classId ?? s?.class?.id ?? s?.classIdString;
    const cls = classId != null ? classesById[Number(classId)] : null;
    return (
      cls?.courseName ||
      cls?.courseCode ||
      s?.subject ||
      s?.courseName ||
      s?.courseCode ||
      (cls?.name ?? "Unknown")
    );
  };

  const totalSessions = sessions.length;
  const activeSubjects = Array.from(
    new Set(
      sessions
        .map((s) => getSubjectNameFromSession(s))
        .filter((name) => !!name && name !== "Unknown")
    )
  );

  const upcoming = sessions
    .filter((s) => {
      const dt = new Date(s.startTime);
      return !isNaN(dt.getTime()) && dt > new Date();
    })
    .sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime());

  const nextSession = upcoming[0] ?? null;

  const isSameDay = (a: Date, b: Date) =>
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate();

  const formatNext = (s: any) => {
    if (!s) return "No upcoming";
    const dt = new Date(s.startTime);
    if (isNaN(dt.getTime())) return "No upcoming";
    const today = new Date();
    const timeOnly = dt.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    if (isSameDay(dt, today)) {
      return `Today, ${timeOnly}`;
    }
    return `${dt.toLocaleDateString()} ${timeOnly}`;
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 bg-muted/30">
        <div className="container mx-auto px-4 py-8">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-2">My Dashboard</h1>
              <p className="text-muted-foreground">Manage your tutoring sessions and schedule</p>
            </div>
            {user?.role === 'tutor' && (
              <Link to="/create-session">
                <Button className="rounded-lg shadow-md">
                  <Plus className="h-5 w-5 mr-2" />
                  Create Session
                </Button>
              </Link>
            )}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
            <Card className="rounded-xl shadow-md">
              <CardContent className="p-6">
                <div className="text-sm text-muted-foreground mb-1">Total Sessions</div>
                <div className="text-3xl font-bold text-foreground">{loading ? "..." : totalSessions}</div>
                <div className="text-xs text-green-600 mt-2">
                  {loading
                    ? ""
                    : `+${sessions.filter((s) => {
                        const dt = new Date(s.startTime);
                        return !isNaN(dt.getTime()) && dt > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
                      }).length} this month`}
                </div>
              </CardContent>
            </Card>

            <Card className="rounded-xl shadow-md">
              <CardContent className="p-6">
                <div className="text-sm text-muted-foreground mb-1">Active Subjects</div>
                <div className="text-3xl font-bold text-foreground">{loading ? "..." : activeSubjects.length}</div>
                <div className="text-xs text-muted-foreground mt-2">
                  {loading ? "" : activeSubjects.join(", ")}
                </div>
              </CardContent>
            </Card>

            <Card className="rounded-xl shadow-md">
              <CardContent className="p-6">
                <div className="text-sm text-muted-foreground mb-1">Next Session</div>
                <div className="text-xl font-bold text-foreground">{loading ? "..." : formatNext(nextSession)}</div>
                <div className="text-xs text-muted-foreground mt-2">
                  {loading
                    ? ""
                    : nextSession
                    ? `${getSubjectNameFromSession(nextSession)}`
                    : ""}
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Calendar Section - Takes 2 columns */}
            <div className="lg:col-span-2">
              <CalendarView />
            </div>

            {/* Upcoming Sessions Section - Takes 1 column */}
            <div className="lg:col-span-1">
              <Card className="rounded-xl shadow-md">
                <CardContent className="p-6">
                  <h2 className="text-xl font-bold text-foreground mb-4">Upcoming Sessions</h2>
                  
                  {loading ? (
                    <div className="text-center py-8 text-muted-foreground">Loading sessions...</div>
                  ) : upcoming.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">No upcoming sessions</div>
                  ) : (
                    <div className="space-y-3 mb-4">
                      {upcoming.slice(0, 5).map((session) => {
                        const startDate = new Date(session.startTime);
                        const endDate = new Date(session.endTime);
                        const subjectName = getSubjectNameFromSession(session);
                        
                        return (
                          <div
                            key={session.sessionId}
                            className="p-3 rounded-lg border bg-muted/40 hover:bg-muted/60 transition-colors cursor-pointer"
                          >
                            <div className="flex items-start justify-between gap-2">
                              <div className="flex-1 min-w-0">
                                <p className="font-medium text-sm truncate">{session.sessionTitle || subjectName}</p>
                                <p className="text-xs text-muted-foreground mt-1">
                                  {startDate.toLocaleDateString(undefined, { 
                                    month: 'short', 
                                    day: 'numeric',
                                    year: 'numeric'
                                  })}
                                </p>
                                <p className="text-xs text-muted-foreground">
                                  {startDate.toLocaleTimeString(undefined, { 
                                    hour: '2-digit', 
                                    minute: '2-digit' 
                                  })} - {endDate.toLocaleTimeString(undefined, { 
                                    hour: '2-digit', 
                                    minute: '2-digit' 
                                  })}
                                </p>
                              </div>
                              <div className="flex-shrink-0">
                                <span className={`text-xs px-2 py-1 rounded ${
                                  session.status === 'SCHEDULED' ? 'bg-blue-100 text-blue-700' :
                                  session.status === 'CONFIRMED' ? 'bg-green-100 text-green-700' :
                                  session.status === 'CANCELLED' ? 'bg-red-100 text-red-700' :
                                  'bg-gray-100 text-gray-700'
                                }`}>
                                  {session.status || 'N/A'}
                                </span>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {!loading && upcoming.length > 0 && (
                    <Link to="/my-courses">
                      <Button variant="outline" className="w-full">
                        View All Sessions
                      </Button>
                    </Link>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Dashboard;
// ...existing code...