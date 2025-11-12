import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import CalendarView from "@/components/CalendarView";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";

const Dashboard = () => {
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
            <Link to="/register-subject">
              <Button className="rounded-lg shadow-md">
                <Plus className="h-5 w-5 mr-2" />
                Register a Subject
              </Button>
            </Link>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
            <Card className="rounded-xl shadow-md">
              <CardContent className="p-6">
                <div className="text-sm text-muted-foreground mb-1">Total Sessions</div>
                <div className="text-3xl font-bold text-foreground">12</div>
                <div className="text-xs text-green-600 mt-2">+3 this month</div>
              </CardContent>
            </Card>
            
            <Card className="rounded-xl shadow-md">
              <CardContent className="p-6">
                <div className="text-sm text-muted-foreground mb-1">Active Subjects</div>
                <div className="text-3xl font-bold text-foreground">4</div>
                <div className="text-xs text-muted-foreground mt-2">Math, Physics, CS, Chemistry</div>
              </CardContent>
            </Card>
            
            <Card className="rounded-xl shadow-md">
              <CardContent className="p-6">
                <div className="text-sm text-muted-foreground mb-1">Next Session</div>
                <div className="text-xl font-bold text-foreground">Today, 2:00 PM</div>
                <div className="text-xs text-muted-foreground mt-2">Physics with Dr. Tran</div>
              </CardContent>
            </Card>
          </div>

          <CalendarView />
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Dashboard;
