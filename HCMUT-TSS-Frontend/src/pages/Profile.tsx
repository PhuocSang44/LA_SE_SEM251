import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Mail, BookOpen, Loader2, UserCheck, UserCircle2 } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext"; 
import { useLanguage } from "@/contexts/LanguageContext";
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { t } from "@/lib/translations";

const Profile = () => {
  const { user, isLoading } = useAuth();
  const navigate = useNavigate();
  const { language } = useLanguage();

  // --- Handle loading and unauthenticated states ---
  useEffect(() => {
    if (!isLoading && !user) {
      navigate('/login');
    }
  }, [isLoading, user, navigate]);

  // Show a loading spinner while auth is being checked
  if (isLoading || !user) {
    return (
        <div className="min-h-screen flex flex-col">
          <Navbar />
          <main className="flex-1 flex items-center justify-center bg-muted/30">
            <Loader2 className="h-16 w-16 animate-spin text-primary" />
          </main>
          <Footer />
        </div>
    );
  }

  // --- Render with user data ---
  return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-1 bg-muted/30">
          <div className="container mx-auto px-4 py-8">
            <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-8">{t(language, 'profile.title')}</h1>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* --- AVATAR CARD --- */}
              <Card className="lg:col-span-1 rounded-xl shadow-md">
                <CardContent className="pt-6">
                  <div className="flex flex-col items-center text-center">
                    <Avatar className="h-32 w-32 mb-4 bg-primary/10">
                      <AvatarFallback className="bg-primary/10">
                        <UserCircle2 className="h-20 w-20 text-primary" />
                      </AvatarFallback>
                    </Avatar>
                    <h2 className="text-2xl font-bold text-foreground mb-1">{user.name}</h2>
                    <p className="text-muted-foreground mb-4">ID: {user.officialId}</p>
                    {/* "Change Avatar" button removed */}
                  </div>
                </CardContent>
              </Card>

              {/* --- PERSONAL INFO CARD --- */}
              <Card className="lg:col-span-2 rounded-xl shadow-md">
                <CardHeader>
                  <CardTitle>{t(language, 'profile.personalInfo')}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="fullName">{t(language, 'profile.fullName')}</Label>
                      <Input id="fullName" defaultValue={user.name} className="rounded-lg" disabled />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="userId">{t(language, 'profile.userId')}</Label>
                      <Input id="userId" defaultValue={user.officialId} disabled className="rounded-lg" />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email">{t(language, 'profile.email')}</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input id="email" type="email" defaultValue={user.email} className="pl-10 rounded-lg" disabled />
                    </div>
                  </div>

                  {/* --- FIELD ADDED --- */}
                  <div className="space-y-2">
                    <Label htmlFor="role">{t(language, 'profile.role')}</Label>
                    <div className="relative">
                      <UserCheck className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                          id="role"
                          // Capitalize the first letter for better display
                          defaultValue={user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                          disabled
                          className="pl-10 rounded-lg"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="faculty">{t(language, 'profile.faculty')}</Label>
                    <div className="relative">
                      <BookOpen className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input id="faculty" defaultValue={user.departmentName} className="pl-10 rounded-lg" disabled />
                    </div>
                  </div>

                  {/* "Phone" field removed */}
                  {/* "Address" field removed */}

                  {/* "Save" and "Cancel" buttons removed */}
                </CardContent>
              </Card>
            </div>

            {/* "Academic Statistics" card removed */}
          </div>
        </main>
        <Footer />
      </div>
  );
};

export default Profile;