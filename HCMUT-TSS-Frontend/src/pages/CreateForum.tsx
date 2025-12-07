import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { ArrowLeft, CheckCircle2, Circle, AlertCircle } from "lucide-react";
import { forumApi } from "@/lib/forumApi";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { t } from "@/lib/translations";
import type { ForumType } from "@/types/forum";
import { containsInappropriateContent, isSpam } from "@/lib/contentModeration";

export default function CreateForum() {
    const navigate = useNavigate();
    const { user } = useAuth();
    const { language } = useLanguage();
    const [searchParams] = useSearchParams();
    const type = searchParams.get('type') as 'academic' | 'career';
    
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [subject, setSubject] = useState("");
    const [errors, setErrors] = useState<string[]>([]);

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

    // Validation checks
    const titleWordCount = title.trim().split(/\s+/).filter(w => w.length > 0).length;
    const descriptionWordCount = description.trim().split(/\s+/).filter(w => w.length > 0).length;
    
    const titleValid = titleWordCount >= 3 && titleWordCount <= 20;
    const descriptionValid = descriptionWordCount <= 200;
    const subjectValid = subject.length > 0;
    const allValid = titleValid && descriptionValid && subjectValid;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const newErrors: string[] = [];

        // Validate title
        if (!titleValid) {
            if (titleWordCount < 3) {
                newErrors.push('Forum title must be at least 3 words');
            } else if (titleWordCount > 20) {
                newErrors.push('Forum title must not exceed 20 words');
            }
        }

        // Validate description
        if (!descriptionValid) {
            newErrors.push('Description must not exceed 200 words');
        }

        // Check for inappropriate content
        if (containsInappropriateContent(title)) {
            newErrors.push('Title contains inappropriate language');
        }
        if (description && containsInappropriateContent(description)) {
            newErrors.push('Description contains inappropriate language');
        }

        // Check for spam/gibberish
        if (isSpam(title)) {
            newErrors.push('Title appears to be spam or gibberish');
        }
        if (description && isSpam(description)) {
            newErrors.push('Description appears to be spam or gibberish');
        }

        // Validate subject
        if (!subjectValid) newErrors.push('Please select a subject/topic');

        if (newErrors.length > 0) {
            setErrors(newErrors);
            toast.error('Please fix the errors below');
            return;
        }

        setErrors([]);

        try {
            await forumApi.createForum({
                title,
                description,
                forumType,
                subject
            });
            toast.success(t(language, 'forums.createdSuccess'));
            navigate(`/forums/${type}`);
        } catch (error) {
            console.error('Error creating forum:', error);
            toast.error(t(language, 'forums.failedCreateForum'));
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
                    {t(language, 'common.back')}
                </button>

                <Card>
                    <CardHeader>
                        <CardTitle>{t(language, 'forums.createForum')}</CardTitle>
                        <CardDescription>
                            {t(language, 'forums.forumDescription')}
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        {/* Error Display */}
                        {errors.length > 0 && (
                            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                                <h3 className="font-semibold text-red-900 mb-2 flex items-center gap-2">
                                    <AlertCircle className="w-5 h-5" />
                                    Errors Found
                                </h3>
                                <ul className="space-y-1">
                                    {errors.map((error, idx) => (
                                        <li key={idx} className="text-sm text-red-800">• {error}</li>
                                    ))}
                                </ul>
                            </div>
                        )}

                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div>
                                <label className="block text-sm font-medium mb-2">{t(language, 'forums.forumTitle')} *</label>
                                <Input
                                    value={title}
                                    onChange={(e) => setTitle(e.target.value)}
                                    placeholder="e.g., Calculus I Discussion (3-20 words)"
                                    required
                                />
                                <p className={`text-xs mt-1 ${titleWordCount > 20 ? 'text-red-500' : 'text-gray-500'}`}>
                                    {titleWordCount} / 20 words
                                </p>
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-2">{t(language, 'forums.forumDescription')}</label>
                                <Textarea
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    placeholder="Describe the purpose and scope of this forum... (optional, max 200 words)"
                                    rows={5}
                                />
                                <p className={`text-xs mt-1 ${descriptionWordCount > 200 ? 'text-red-500' : 'text-gray-500'}`}>
                                    {descriptionWordCount} / 200 words
                                </p>
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
                                <Button 
                                    type="submit" 
                                    className="bg-blue-600"
                                    disabled={!allValid}
                                >
                                    {t(language, 'forums.createForum')}
                                </Button>
                                <Button type="button" variant="outline" onClick={() => navigate(-1)}>{t(language, 'common.cancel')}</Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            </div>
            <Footer />
        </div>
    );
}
