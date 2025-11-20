// ... (all your imports)
import ProtectedRoute from "@/components/ProtectedRoute";
import GuestRoute from "@/components/GuestRoute";
import Index from "./pages/Index";
import Login from "./pages/Login";
import {AuthProvider} from "@/contexts/AuthContext.tsx";
import {QueryClient, QueryClientProvider} from "@tanstack/react-query";
import {TooltipProvider} from "@radix-ui/react-tooltip";
import {BrowserRouter, Route, Routes} from "react-router-dom";
import SSO from "@/pages/SSO.tsx";
import Unauthorized from "@/pages/Unauthorized.tsx";
import Dashboard from "@/pages/Dashboard.tsx";
import MyCourses from "@/pages/MyCourses.tsx";
import CourseDetails from "@/pages/CourseDetails.tsx";
import Profile from "@/pages/Profile.tsx";
import AvailableCourses from "@/pages/AvailableCourses.tsx";
import AdminDashboard from "@/pages/AdminDashboard.tsx";
import RegisterSubject from "@/pages/RegisterSubject.tsx";
import NotFound from "@/pages/NotFound.tsx";
import CreateClass from "@/pages/CreateClass.tsx";
import CreateSession from "@/pages/CreateSession.tsx";

const queryClient = new QueryClient();

const App = () => (
    <QueryClientProvider client={queryClient}>
        <AuthProvider>
            <TooltipProvider>
                {/* ... (Toaster, Sonner) ... */}
                <BrowserRouter>
                    <Routes>

                        {/* --- Public-Only Routes (Login, etc.) --- */}
                        <Route element={<GuestRoute />}>
                            <Route path="/login" element={<Login />} />
                            <Route path="/sso" element={<SSO />} />
                        </Route>
                        <Route path="/unauthorized" element={<Unauthorized />} />

                        {/* --- Standard Protected Routes (All roles) --- */}
                        <Route element={<ProtectedRoute />}>
                            <Route path="/" element={<Index />} />
                            <Route path="/dashboard" element={<Dashboard />} />
                            <Route path="/my-courses" element={<MyCourses />} />
                            <Route path="/course-details" element={<CourseDetails />} />
                            <Route path="/available-courses" element={<AvailableCourses />} />
                            <Route path="/profile" element={<Profile />} />
                        </Route>

                        {/* --- Admin Only Route --- */}
                        <Route element={<ProtectedRoute allowedRoles={['administrator']} />}>
                            <Route path="/admin" element={<AdminDashboard />} />
                        </Route>

                        {/* --- Tutor and Student Routes --- */}
                        <Route element={<ProtectedRoute allowedRoles={['tutor', 'student']} />}>
                            <Route path="/register-subject" element={<RegisterSubject />} />
                            <Route path="/create-session" element={<CreateSession />} />
                        </Route>

                        {/* --- Tutor-only routes --- */}
                        <Route element={<ProtectedRoute allowedRoles={['tutor']} />}>
                            <Route path="/create-class" element={<CreateClass />} />
                            
                        </Route>

                        {/* --- Not Found (Catch-all) --- */}
                        <Route path="*" element={<NotFound />} />
                    </Routes>
                </BrowserRouter>
            </TooltipProvider>
        </AuthProvider>
    </QueryClientProvider>
);

export default App;