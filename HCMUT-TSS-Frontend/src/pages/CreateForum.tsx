import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { forumApi } from "@/lib/forumApi";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import type { ForumType } from "@/types/forum";

export default function CreateForum() {
    const navigate = useNavigate();
    const { user } = useAuth();
    const [searchParams] = useSearchParams();
    const type = searchParams.get('type') as 'academic' | 'career';
    
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [subject, setSubject] = useState("");

    const forumType: ForumType = type === 'career' ? 'CAREER' : 'ACADEMIC';
    const isAcademic = type === 'academic';

    const academicSubjects = [
        'Mathematics', 'Computer Science', 'Physics', 'Chemistry', 'Biology',
        'English', 'Literature', 'History', 'Economics', 'Engineering'
    ];

    const careerTopics = [
        'Software Engineering', 'Data Science', 'Career Development', 'Career Skills',
        'Entrepreneurship', 'Professional Development', 'Industry Insights', 'Internships'
    ];

    const subjects = isAcademic ? academicSubjects : careerTopics;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!title.trim() || !description.trim() || !subject) {
            toast.error('Please fill in all required fields');
            return;
        }

        try {
            await forumApi.createForum({
                title,
                description,
                forumType,
                subject
            });
            toast.success('Forum created successfully!');
            navigate(`/forums/${type}`);
        } catch (error) {
            console.error('Error creating forum:', error);
            toast.error('Failed to create forum');
        }
    };

    if (user?.role !== 'tutor') {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <Card><CardContent className="p-6">
                    <p>Only tutors can create forums</p>
                    <Button onClick={() => navigate(-1)} className="mt-4">Go Back</Button>
                </CardContent></Card>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <Navbar />
            <div className="max-w-4xl mx-auto px-6 py-8">
                <button onClick={() => navigate(-1)} className="text-blue-600 hover:underline mb-6 flex items-center gap-2">
                    <ArrowLeft className="w-4 h-4" />
                    Back to Forums
                </button>

                <Card>
                    <CardHeader>
                        <CardTitle>Create {isAcademic ? 'Academic' : 'Career'} Forum</CardTitle>
                        <CardDescription>
                            Create a new community forum for students to learn and collaborate
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div>
                                <label className="block text-sm font-medium mb-2">Forum Title *</label>
                                <Input
                                    value={title}
                                    onChange={(e) => setTitle(e.target.value)}
                                    placeholder="e.g., Calculus I Discussion"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-2">Description *</label>
                                <Textarea
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    placeholder="Describe the purpose and scope of this forum..."
                                    rows={5}
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-2">
                                    {isAcademic ? 'Subject/Course' : 'Career Topic'} *
                                </label>
                                <select
                                    value={subject}
                                    onChange={(e) => setSubject(e.target.value)}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-md"
                                    required
                                >
                                    <option value="">Select...</option>
                                    {subjects.map(s => (
                                        <option key={s} value={s}>{s}</option>
                                    ))}
                                </select>
                            </div>

                            <div className="flex gap-2">
                                <Button type="submit" className="bg-blue-600">Create Forum</Button>
                                <Button type="button" variant="outline" onClick={() => navigate(-1)}>Cancel</Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            </div>
            <Footer />
        </div>
    );
}
