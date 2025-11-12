import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, Clock } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface TutoringSession {
  id: string;
  title: string;
  time: string;
  tutor: string;
  subject: string;
  color: string;
}

const CalendarView = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  
  // Mock data for tutoring sessions
  const sessions: { [key: string]: TutoringSession[] } = {
    "2025-10-15": [
      { id: "1", title: "Calculus 1", time: "09:00 - 10:30", tutor: "Dr. Nguyen", subject: "Math", color: "bg-blue-500" },
      { id: "2", title: "Physics", time: "14:00 - 15:30", tutor: "Dr. Tran", subject: "Physics", color: "bg-purple-500" },
    ],
    "2025-10-17": [
      { id: "3", title: "Programming", time: "10:00 - 11:30", tutor: "Dr. Le", subject: "CS", color: "bg-green-500" },
    ],
    "2025-10-18": [
      { id: "4", title: "Chemistry", time: "13:00 - 14:30", tutor: "Dr. Pham", subject: "Chemistry", color: "bg-orange-500" },
    ],
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
          const daySessions = sessions[dateKey] || [];
          const isToday = 
            day === new Date().getDate() && 
            currentDate.getMonth() === new Date().getMonth() &&
            currentDate.getFullYear() === new Date().getFullYear();

          return (
            <div
              key={day}
              className={`aspect-square border rounded-lg p-2 hover:shadow-md transition-shadow ${
                isToday ? "border-primary border-2 bg-primary/5" : "border-border"
              }`}
            >
              <div className="text-sm font-medium mb-1 text-foreground">{day}</div>
              <div className="space-y-1">
                {daySessions.map((session) => (
                  <div
                    key={session.id}
                    className={`${session.color} text-white text-xs p-1 rounded truncate`}
                    title={`${session.title} - ${session.time}`}
                  >
                    <div className="font-medium">{session.title}</div>
                    <div className="flex items-center gap-1 opacity-90">
                      <Clock className="h-2.5 w-2.5" />
                      <span>{session.time.split(" - ")[0]}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-6 pt-6 border-t">
        <h3 className="font-semibold mb-3 text-foreground">Legend</h3>
        <div className="flex flex-wrap gap-3">
          <Badge variant="secondary" className="bg-blue-500 text-white">Math</Badge>
          <Badge variant="secondary" className="bg-purple-500 text-white">Physics</Badge>
          <Badge variant="secondary" className="bg-green-500 text-white">Computer Science</Badge>
          <Badge variant="secondary" className="bg-orange-500 text-white">Chemistry</Badge>
        </div>
      </div>
    </Card>
  );
};

export default CalendarView;
