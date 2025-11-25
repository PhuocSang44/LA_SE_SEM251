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
import Banned from "@/pages/Banned.tsx";
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
import { Toast } from "@radix-ui/react-toast";
import { Toaster } from "./components/ui/toaster";
import TutorHub from "@/pages/TutorHub.tsx";
import ForumList from "@/pages/ForumList.tsx";
import ForumDetail from "@/pages/ForumDetail.tsx";
import CreatePost from "@/pages/CreatePost.tsx";
import CreateForum from "@/pages/CreateForum.tsx";
import PostDetail from "@/pages/PostDetail.tsx";

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
                        <Route path="/banned" element={<Banned />} />

                        {/* --- Standard Protected Routes (All roles) --- */}
                        <Route element={<ProtectedRoute />}>
                            <Route path="/" element={<Index />} />
                            <Route path="/dashboard" element={<Dashboard />} />
                            <Route path="/my-courses" element={<MyCourses />} />
                            <Route path="/course-details" element={<CourseDetails />} />
                            <Route path="/available-courses" element={<AvailableCourses />} />
                            <Route path="/profile" element={<Profile />} />
                            
                            {/* Forum Routes - All authenticated users */}
                            <Route path="/tutor-hub" element={<TutorHub />} />
                            <Route path="/forums/:forumType" element={<ForumList />} />
                            <Route path="/forums/detail/:forumId" element={<ForumDetail />} />
                            <Route path="/forums/:forumId/posts/create" element={<CreatePost />} />
                            <Route path="/forums/posts/:postId" element={<PostDetail />} />
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
                            <Route path="/forums/create" element={<CreateForum />} />
                        </Route>

                        {/* --- Not Found (Catch-all) --- */}
                        <Route path="*" element={<NotFound />} />
                    </Routes>
                </BrowserRouter>
                <Toaster />
            </TooltipProvider>
        </AuthProvider>
    </QueryClientProvider>
);

export default App;