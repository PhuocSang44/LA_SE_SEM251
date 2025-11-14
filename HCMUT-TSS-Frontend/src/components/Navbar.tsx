import { Link, useLocation, useNavigate } from "react-router-dom";
import { GraduationCap, Globe, LogOut, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext"; // Your AuthContext
import { Badge } from "@/components/ui/badge";
import { UserRole } from "@/contexts/AuthContext"; // <-- Import the UserRole type

const Navbar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [language, setLanguage] = useState<"en" | "vi">("en");

  // --- UPDATED ---
  // Added 'administrator' and 'cooperator' roles
  const navItems = [
    {
      path: "/",
      label: { en: "Home", vi: "Trang chủ" },
      roles: ['administrator', 'tutor', 'student', 'cooperator'] // All roles
    },
    {
      path: "/dashboard",
      label: { en: "Dashboard", vi: "Bảng điều khiển" },
      roles: ['tutor', 'student']
    },
    {
      path: "/create-class",
      label: { en: "My Class", vi: "Lớp của tôi" },
      roles: ['tutor']
    },
    {
      path: "/admin",
      label: { en: "Admin Panel", vi: "Quản lý" },
      roles: ['administrator', 'cooperator'] // <-- Both roles can see this
    },
    {
      path: "/my-courses",
      label: { en: "My Courses", vi: "Môn học của tôi" },
      roles: ['tutor', 'student']
    },
    {
      path: "/available-courses",
      label: { en: "Available Courses", vi: "Môn học khả dụng" },
      roles: ['tutor', 'student']
    },
  ];

  // This filter logic is correct and doesn't need to change
  const filteredNavItems = navItems.filter(item =>
      user && item.roles.includes(user.role)
  );

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // --- UPDATED ---
  // Handles all 4 roles
  const getRoleBadgeColor = (role: UserRole) => {
    switch (role) {
      case 'administrator':
        return 'bg-red-500 hover:bg-red-600';
      case 'cooperator':
        return 'bg-purple-500 hover:bg-purple-600'; // Gave co-op a distinct color
      case 'tutor':
        return 'bg-blue-500 hover:bg-blue-600';
      case 'student':
        return 'bg-green-500 hover:bg-green-600';
      default:
        return 'bg-gray-500 hover:bg-gray-600';
    }
  };

  // --- UPDATED ---
  // Handles all 4 roles
  const getRoleDisplay = (role: UserRole) => {
    const roleMap: Record<UserRole, string> = {
      administrator: 'Administrator',
      cooperator: 'Cooperator',
      tutor: 'Tutor',
      student: 'Student',
    };
    return roleMap[role] || role;
  };

  return (
      <nav className="sticky top-0 z-50 w-full border-b bg-card shadow-sm">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <div className="flex items-center gap-8">
            <Link to="/" className="flex items-center gap-2 text-primary">
              <GraduationCap className="h-8 w-8" />
              <span className="text-xl font-bold">HCMUT TSS</span>
            </Link>

            <div className="hidden md:flex items-center gap-1">
              {filteredNavItems.map((item) => (
                  <Link key={item.path} to={item.path}>
                    <Button
                        variant={location.pathname === item.path ? "default" : "ghost"}
                        className="rounded-lg"
                    >
                      {item.label[language]}
                    </Button>
                  </Link>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-4">
            {/* This section now only shows if the user is logged in */}
            {user ? (
                <>
                  <Badge className={`${getRoleBadgeColor(user.role)} text-white`}>
                    {getRoleDisplay(user.role)}
                  </Badge>

                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="rounded-lg">
                        <Globe className="h-5 w-5" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="bg-popover">
                      <DropdownMenuItem onClick={() => setLanguage("en")}>
                        English
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => setLanguage("vi")}>
                        Tiếng Việt
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>

                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Avatar className="h-9 w-9 cursor-pointer ring-2 ring-transparent hover:ring-primary transition-all">
                        <AvatarImage src="https://github.com/shadcn.png" />
                        <AvatarFallback>
                          {user.name.substring(0, 2).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-56 bg-popover">
                      <div className="flex flex-col space-y-1 p-2">
                        <p className="text-sm font-medium">{user.name}</p>
                        <p className="text-xs text-muted-foreground">{user.email}</p>
                      </div>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={() => navigate('/profile')}>
                        <User className="mr-2 h-4 w-4" />
                        <span>Profile</span>
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={handleLogout} className="text-red-600 focus:text-red-600">
                        <LogOut className="mr-2 h-4 w-4" />
                        <span>Đăng xuất</span>
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </>
            ) : (
                // --- NEW ---
                // Show a login button if the user is not logged in
                <Button onClick={() => navigate('/login')}>Login</Button>
            )}
          </div>
        </div>
      </nav>
  );
};

export default Navbar;