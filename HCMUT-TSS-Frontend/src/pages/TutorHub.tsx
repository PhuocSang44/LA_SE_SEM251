import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { BookOpen, Briefcase, MessageSquare, Users } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function TutorHub() {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen bg-gray-50">
            <Navbar />

            {/* Hero Section */}
            <div className="bg-gradient-to-r from-blue-600 to-blue-900 text-white py-16 px-6">
                <div className="max-w-6xl mx-auto text-center">
                    <h1 className="text-4xl font-bold mb-4">Tutor & Mentorship Hub</h1>
                    <p className="text-lg opacity-90">Connect, Learn, and Grow Together</p>
                </div>
            </div>

            {/* Main Content */}
            <div className="max-w-6xl mx-auto px-6 py-12">
                <div className="grid md:grid-cols-2 gap-8">
                    {/* Academic Community Card */}
                    <Card className="shadow-lg hover:shadow-xl transition-shadow border-2 border-transparent hover:border-blue-600">
                        <CardHeader>
                            <div className="flex items-center gap-3 mb-4">
                                <div className="p-3 bg-blue-100 rounded-lg">
                                    <BookOpen className="w-8 h-8 text-blue-600" />
                                </div>
                                <CardTitle className="text-blue-900">Academic Community</CardTitle>
                            </div>
                            <CardDescription className="text-base">
                                Join subject-specific forums to discuss coursework, share knowledge, and get help from tutors and peers on academic topics.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                {/* Features */}
                                <div className="space-y-2">
                                    <div className="flex items-center gap-2">
                                        <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                                        <span className="text-sm">Subject-based forums</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                                        <span className="text-sm">Q&A with voting system</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                                        <span className="text-sm">Expert tutor answers</span>
                                    </div>
                                </div>

                                {/* Stats */}
                                <div className="grid grid-cols-3 gap-4 py-4 border-t border-b border-gray-200">
                                    <div className="text-center">
                                        <div className="text-2xl font-bold text-blue-600">50+</div>
                                        <div className="text-xs text-gray-600">Active Forums</div>
                                    </div>
                                    <div className="text-center">
                                        <div className="text-2xl font-bold text-blue-600">1.2k</div>
                                        <div className="text-xs text-gray-600">Questions</div>
                                    </div>
                                    <div className="text-center">
                                        <div className="text-2xl font-bold text-blue-600">5k+</div>
                                        <div className="text-xs text-gray-600">Members</div>
                                    </div>
                                </div>

                                {/* Button */}
                                <button
                                    onClick={() => navigate('/forums/academic')}
                                    className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 px-6 rounded-lg transition-colors flex items-center justify-center gap-2"
                                >
                                    <MessageSquare className="w-5 h-5" />
                                    Explore Academic Forums
                                </button>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Career & Professional Development Card */}
                    <Card className="shadow-lg hover:shadow-xl transition-shadow border-2 border-transparent hover:border-blue-900">
                        <CardHeader>
                            <div className="flex items-center gap-3 mb-4">
                                <div className="p-3 bg-blue-900 bg-opacity-10 rounded-lg">
                                    <Briefcase className="w-8 h-8 text-blue-900" />
                                </div>
                                <CardTitle className="text-blue-900">Career & Professional Development</CardTitle>
                            </div>
                            <CardDescription className="text-base">
                                Connect with mentors and peers to discuss career paths, internships, industry insights, and professional skill development.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                {/* Features */}
                                <div className="space-y-2">
                                    <div className="flex items-center gap-2">
                                        <div className="w-2 h-2 bg-blue-900 rounded-full"></div>
                                        <span className="text-sm">Career-focused discussions</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <div className="w-2 h-2 bg-blue-900 rounded-full"></div>
                                        <span className="text-sm">Mentorship opportunities</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <div className="w-2 h-2 bg-blue-900 rounded-full"></div>
                                        <span className="text-sm">Industry insights</span>
                                    </div>
                                </div>

                                {/* Stats */}
                                <div className="grid grid-cols-3 gap-4 py-4 border-t border-b border-gray-200">
                                    <div className="text-center">
                                        <div className="text-2xl font-bold text-blue-900">30+</div>
                                        <div className="text-xs text-gray-600">Career Topics</div>
                                    </div>
                                    <div className="text-center">
                                        <div className="text-2xl font-bold text-blue-900">800+</div>
                                        <div className="text-xs text-gray-600">Discussions</div>
                                    </div>
                                    <div className="text-center">
                                        <div className="text-2xl font-bold text-blue-900">150+</div>
                                        <div className="text-xs text-gray-600">Active Mentors</div>
                                    </div>
                                </div>

                                {/* Button */}
                                <button
                                    onClick={() => navigate('/forums/career')}
                                    className="w-full bg-blue-900 hover:bg-blue-950 text-white py-3 px-6 rounded-lg transition-colors flex items-center justify-center gap-2"
                                >
                                    <Briefcase className="w-5 h-5" />
                                    Explore Career Forums
                                </button>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Additional Info */}
                <div className="mt-12 text-center">
                    <Card className="bg-gradient-to-r from-blue-50 to-indigo-50">
                        <CardContent className="py-8">
                            <Users className="w-12 h-12 text-blue-600 mx-auto mb-4" />
                            <h3 className="text-blue-900 text-xl font-semibold mb-2">
                                Join the Learning Community
                            </h3>
                            <p className="text-gray-700 max-w-2xl mx-auto">
                                Whether you're seeking academic help or career guidance, our community of students, 
                                tutors, and mentors is here to support your journey. Ask questions, share knowledge, 
                                and grow together!
                            </p>
                        </CardContent>
                    </Card>
                </div>
            </div>

            <Footer />
        </div>
    );
}
