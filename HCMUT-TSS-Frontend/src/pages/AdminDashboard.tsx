import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, BookOpen, Settings, BarChart } from 'lucide-react';
import { Button } from '@/components/ui/button';

const AdminDashboard = () => {
  const { user } = useAuth();

  const adminStats = [
    {
      title: 'Total Users',
      value: '1,234',
      description: 'Active users in system',
      icon: Users,
      color: 'text-blue-500',
    },
    {
      title: 'Total Courses',
      value: '156',
      description: 'Available courses',
      icon: BookOpen,
      color: 'text-green-500',
    },
    {
      title: 'System Health',
      value: '99.9%',
      description: 'Uptime this month',
      icon: BarChart,
      color: 'text-purple-500',
    },
    {
      title: 'Pending Reviews',
      value: '23',
      description: 'Require attention',
      icon: Settings,
      color: 'text-orange-500',
    },
  ];

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Admin Dashboard</h1>
          <p className="text-muted-foreground">
            Welcome back, {user?.name}! Here's what's happening in your system.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {adminStats.map((stat, index) => (
            <Card key={index}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  {stat.title}
                </CardTitle>
                <stat.icon className={`h-4 w-4 ${stat.color}`} />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
                <p className="text-xs text-muted-foreground">
                  {stat.description}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>User Management</CardTitle>
              <CardDescription>
                Manage all users, tutors, and students
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Button className="w-full" variant="outline">
                  View All Users
                </Button>
                <Button className="w-full" variant="outline">
                  Approve Tutor Applications
                </Button>
                <Button className="w-full" variant="outline">
                  User Reports
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Course Management</CardTitle>
              <CardDescription>
                Manage courses and subjects
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Button className="w-full" variant="outline">
                  View All Courses
                </Button>
                <Button className="w-full" variant="outline">
                  Add New Course
                </Button>
                <Button className="w-full" variant="outline">
                  Course Analytics
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>System Settings</CardTitle>
              <CardDescription>
                Configure system parameters
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Button className="w-full" variant="outline">
                  General Settings
                </Button>
                <Button className="w-full" variant="outline">
                  Email Configuration
                </Button>
                <Button className="w-full" variant="outline">
                  Security Settings
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Reports & Analytics</CardTitle>
              <CardDescription>
                View system reports and analytics
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Button className="w-full" variant="outline">
                  Usage Statistics
                </Button>
                <Button className="w-full" variant="outline">
                  Financial Reports
                </Button>
                <Button className="w-full" variant="outline">
                  Export Data
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default AdminDashboard;
