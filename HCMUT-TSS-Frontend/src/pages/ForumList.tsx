import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { BookOpen, Briefcase, Users, MessageSquare, Search, Plus, ArrowLeft, Trash2 } from "lucide-react";
import { forumApi } from "@/lib/forumApi";
import type { Forum, ForumType } from "@/types/forum";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { t } from "@/lib/translations";

export default function ForumList() {
    const { forumType: type } = useParams<{ forumType: 'academic' | 'career' }>();
    const navigate = useNavigate();
    const { user } = useAuth();
    const { language } = useLanguage();
    const [forums, setForums] = useState<Forum[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedSubject, setSelectedSubject] = useState<string>("all");

    const forumType: ForumType = type === 'career' ? 'CAREER' : 'ACADEMIC';
    const isAcademic = type === 'academic';

    useEffect(() => {
        loadForums();
    }, [type]);

    const loadForums = async () => {
        try {
            setLoading(true);
            const data = await forumApi.getAllForums(forumType);
            setForums(data);
        } catch (error) {
            console.error('Error loading forums:', error);
            toast.error(t(language, 'forums.failedToLoad'));
        } finally {
            setLoading(false);
        }
    };

    const handleJoinForum = async (forumId: number) => {
        try {
            await forumApi.joinForum(forumId);
            toast.success(t(language, 'forums.successfully'));
            await loadForums(); // Reload to update isJoined status
        } catch (error) {
            console.error('Error joining forum:', error);
            toast.error(t(language, 'forums.failedToJoin'));
        }
    };

    const handleDeleteForum = async (forumId: number, forumTitle: string) => {
        if (!window.confirm(`Are you sure you want to delete the forum "${forumTitle}"? This action cannot be undone and will delete all posts and comments.`)) {
            return;
        }
        
        try {
            await forumApi.deleteForum(forumId);
            toast.success(t(language, 'forums.deletedSuccess'));
            await loadForums(); // Reload forums list
        } catch (error) {
            console.error('Error deleting forum:', error);
            toast.error(t(language, 'forums.failedDelete'));
        }
    };

    // Get unique subjects
    const subjects = ['all', ...Array.from(new Set(forums.map(f => f.subject)))];

    // Filter forums
    const filteredForums = forums.filter(forum => {
        const matchesSearch = 
            forum.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            forum.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
            forum.subject.toLowerCase().includes(searchQuery.toLowerCase());
        
        const matchesSubject = selectedSubject === 'all' || forum.subject === selectedSubject;
        
        return matchesSearch && matchesSubject;
    });

    const title = isAcademic ? 'Academic Community Forums' : 'Career & Professional Development Forums';
    const subtitle = isAcademic 
        ? 'Join subject-specific forums to learn and collaborate'
        : 'Connect with mentors and explore career opportunities';

    return (
        <div className="min-h-screen bg-gray-50">
            <Navbar />

            <div className="max-w-7xl mx-auto px-6 py-8">
                {/* Header */}
                <div className="mb-8">
                    <button
                        onClick={() => navigate('/tutor-hub')}
                        className="text-blue-600 hover:underline mb-4 flex items-center gap-2"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        {t(language, 'common.back')}
                    </button>
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                        <div>
                            <h1 className="text-3xl font-bold text-blue-900 mb-2">{title}</h1>
                            <p className="text-gray-600">{subtitle}</p>
                        </div>
                        {user?.role === 'tutor' && (
                            <Button 
                                onClick={() => navigate(`/forums/create?type=${type}`)}
                                className="bg-blue-600 hover:bg-blue-700"
                            >
                                <Plus className="w-4 h-4 mr-2" />
                                {t(language, 'forums.createForum')}
                            </Button>
                        )}
                    </div>
                </div>

                {/* Search and Filter */}
                <div className="mb-6 flex flex-col md:flex-row gap-4">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                        <Input
                            placeholder={t(language, 'common.search')}
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-10"
                        />
                    </div>
                    <select
                        value={selectedSubject}
                        onChange={(e) => setSelectedSubject(e.target.value)}
                        className="px-4 py-2 border border-gray-300 rounded-md"
                    >
                        <option value="all">{isAcademic ? 'All Subjects' : 'All Topics'}</option>
                        {subjects.filter(s => s !== 'all').map(subject => (
                            <option key={subject} value={subject}>{subject}</option>
                        ))}
                    </select>
                </div>

                {/* Forums Grid */}
                {loading ? (
                    <div className="text-center py-12">Loading forums...</div>
                ) : filteredForums.length === 0 ? (
                    <Card className="text-center py-12">
                        <CardContent>
                            <p className="text-gray-600">{t(language, 'forums.noPosts')}</p>
                        </CardContent>
                    </Card>
                ) : (
                    <div className="grid md:grid-cols-3 gap-6">
                        {filteredForums.map((forum) => (
                            <Card key={forum.forumId} className="hover:shadow-lg transition-shadow">
                                <CardHeader>
                                    <div className="flex items-start justify-between">
                                        <div className="flex-1">
                                            <Badge className={`mb-2 ${
                                                isAcademic 
                                                    ? 'bg-blue-100 text-blue-700' 
                                                    : 'bg-blue-900 bg-opacity-10 text-blue-900'
                                            }`}>
                                                {forum.subject}
                                            </Badge>
                                            <CardTitle className="text-lg">{forum.title}</CardTitle>
                                        </div>
                                    </div>
                                    <CardDescription className="mt-3">
                                        {forum.description}
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-4">
                                        {/* Forum Stats */}
                                        <div className="flex items-center gap-4 text-sm text-gray-600">
                                            <div className="flex items-center gap-1">
                                                <Users className="w-4 h-4" />
                                                <span>{forum.memberCount} {t(language, 'forums.replies')}</span>
                                            </div>
                                            <div className="flex items-center gap-1">
                                                <MessageSquare className="w-4 h-4" />
                                                <span>{forum.postCount} {t(language, 'forums.replies')}</span>
                                            </div>
                                        </div>

                                        {/* Creator Info */}
                                        <div className="text-sm text-gray-600">
                                            Created by <span className="font-medium">{forum.creatorName}</span>
                                        </div>

                                        {/* Actions */}
                                        <div className="flex gap-2 flex-wrap">
                                            {forum.isJoined ? (
                                                <>
                                                    <Badge variant="secondary">Joined</Badge>
                                                    <Button 
                                                        onClick={() => navigate(`/forums/detail/${forum.forumId}`)}
                                                        variant="outline"
                                                        size="sm"
                                                    >
                                                        {t(language, 'common.close')}
                                                    </Button>
                                                </>
                                            ) : (
                                                <Button 
                                                    onClick={() => handleJoinForum(forum.forumId)}
                                                    className="bg-blue-600 hover:bg-blue-700"
                                                    size="sm"
                                                >
                                                    {t(language, 'forums.joinForum')}
                                                </Button>
                                            )}
                                            {user?.userId === forum.creatorUserId && (
                                                <Button 
                                                    onClick={() => handleDeleteForum(forum.forumId, forum.title)}
                                                    variant="destructive"
                                                    size="sm"
                                                    className="ml-auto"
                                                >
                                                    <Trash2 className="w-4 h-4 mr-1" />
                                                    {t(language, 'common.delete')}
                                                </Button>
                                            )}
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                )}
            </div>

            <Footer />
        </div>
    );
}
