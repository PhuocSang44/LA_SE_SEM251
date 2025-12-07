import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
    const [myClasses, setMyClasses] = useState<any[]>([]);
    const [showDeleteDialog, setShowDeleteDialog] = useState(false);
    const [deleteConfirmText, setDeleteConfirmText] = useState("");
    const [deletingForumId, setDeletingForumId] = useState<number | null>(null);
    const [deletingForumTitle, setDeletingForumTitle] = useState("");
    const [deleting, setDeleting] = useState(false);

    const forumType: ForumType = type === 'career' ? 'CAREER' : 'ACADEMIC';
    const isAcademic = type === 'academic';

    useEffect(() => {
        loadForums();
        loadMyClasses();
    }, [type]);

    const loadMyClasses = async () => {
        try {
            const apiBase = import.meta.env.VITE_API_BASE_URL || 'http://localhost:10001';
            
            // For tutors: get classes they teach
            if (user?.role === 'tutor') {
                const res = await fetch(`${apiBase}/api/classes/my-classes`, { 
                    credentials: 'include' 
                });
                if (res.ok) {
                    const data = await res.json();
                    setMyClasses(data);
                }
            } 
            // For students: get classes they're enrolled in
            else {
                const res = await fetch(`${apiBase}/api/course-registrations/me`, { 
                    credentials: 'include' 
                });
                if (res.ok) {
                    const data = await res.json();
                    // Extract class info from course registrations
                    const enrolledClasses = data.map((reg: any) => ({
                        id: reg.classId,
                        classId: reg.classId,
                        name: reg.className,
                        code: reg.courseCode
                    }));
                    setMyClasses(enrolledClasses);
                }
            }
        } catch (error) {
            console.error('Error loading my classes:', error);
        }
    };

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
            // Find the forum to check if it's class-specific
            const forum = forums.find(f => f.forumId === forumId);
            
            // If forum is class-specific, verify user is enrolled in that class
            if (forum?.classId) {
                const myClassIds = new Set(myClasses.map(c => c.classId || c.id));
                if (!myClassIds.has(forum.classId)) {
                    toast.error(t(language, 'courses.mustEnrollToJoinForum'));
                    return;
                }
            }
            
            await forumApi.joinForum(forumId);
            toast.success(t(language, 'forums.successfully'));
            // Navigate to forum after joining
            navigate(`/forums/detail/${forumId}`);
        } catch (error) {
            console.error('Error joining forum:', error);
            toast.error(t(language, 'forums.failedToJoin'));
        }
    };

    const handleLeaveForum = async (forumId: number) => {
        try {
            await forumApi.leaveForum(forumId);
            toast.success('Left forum successfully!');
            await loadForums(); // Reload forums to update UI
        } catch (error) {
            console.error('Error leaving forum:', error);
            toast.error('Failed to leave forum');
        }
    };

    const handleDeleteForum = async (forumId: number, forumTitle: string) => {
        setDeletingForumId(forumId);
        setDeletingForumTitle(forumTitle);
        setDeleteConfirmText("");
        setShowDeleteDialog(true);
    };

    const confirmDeleteForum = async () => {
        if (!deletingForumId) return;
        
        if (deleteConfirmText !== deletingForumTitle) {
            toast.error('Forum name does not match. Deletion cancelled.');
            return;
        }
        
        setDeleting(true);
        try {
            await forumApi.deleteForum(deletingForumId);
            toast.success(t(language, 'forums.deletedSuccess'));
            setShowDeleteDialog(false);
            setDeleteConfirmText("");
            await loadForums(); // Reload forums list
        } catch (error) {
            console.error('Error deleting forum:', error);
            toast.error(t(language, 'forums.failedDelete'));
        } finally {
            setDeleting(false);
        }
    };

    // Get unique subjects
    const subjects = ['all', ...Array.from(new Set(forums.map(f => f.subject)))];

    // Get IDs of classes user has joined
    const myClassIds = new Set(myClasses.map(c => c.classId || c.id));

    // Filter forums
    const filteredForums = forums.filter(forum => {
        // If forum is class-specific, only show if user joined that class
        if (forum.classId && !myClassIds.has(forum.classId)) {
            return false;
        }

        const matchesSearch = 
            forum.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            forum.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
            forum.subject.toLowerCase().includes(searchQuery.toLowerCase());
        
        const matchesSubject = selectedSubject === 'all' || forum.subject === selectedSubject;
        
        return matchesSearch && matchesSubject;
    });

    const title = isAcademic ? t(language, 'forums.academicTitle') : t(language, 'forums.careerTitle');
    const subtitle = isAcademic 
        ? t(language, 'forums.academicSubtitle')
        : t(language, 'forums.careerSubtitle');

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
                        <option value="all">{isAcademic ? t(language, 'forums.allSubjects') : t(language, 'forums.allTopics')}</option>
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
                                            <div className="flex items-center gap-2 mb-2">
                                                <Badge className={`${
                                                    isAcademic 
                                                        ? 'bg-blue-100 text-blue-700' 
                                                        : 'bg-blue-900 bg-opacity-10 text-blue-900'
                                                }`}>
                                                    {forum.subject}
                                                </Badge>
                                                {forum.classId && forum.className && (
                                                    <Badge variant="outline" className="text-xs">
                                                        {forum.className}
                                                    </Badge>
                                                )}
                                            </div>
                                            <CardTitle className="text-lg">{forum.title}</CardTitle>
                                        </div>
                                        {forum.isJoined && (
                                            <Badge variant="secondary" className="ml-2">Joined</Badge>
                                        )}
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
                                                    <Button 
                                                        onClick={() => navigate(`/forums/detail/${forum.forumId}`)}
                                                        className="bg-blue-600 hover:bg-blue-700"
                                                        size="sm"
                                                    >
                                                        {t(language, 'forums.enterForum')}
                                                    </Button>
                                                    {user?.userId !== forum.creatorUserId && (
                                                        <Button 
                                                            onClick={() => handleLeaveForum(forum.forumId)}
                                                            variant="destructive"
                                                            size="sm"
                                                        >
                                                            {t(language, 'forums.leaveForum')}
                                                        </Button>
                                                    )}
                                                </>
                                            ) : (
                                                // Only show Join button if forum is public (no classId) OR user is enrolled in the class
                                                !forum.classId || myClassIds.has(forum.classId) ? (
                                                    <Button 
                                                        onClick={() => handleJoinForum(forum.forumId)}
                                                        className="bg-green-600 hover:bg-green-700"
                                                        size="sm"
                                                    >
                                                        {t(language, 'forums.joinForum')}
                                                    </Button>
                                                ) : (
                                                    <div className="text-sm text-gray-500 italic">
                                                        {t(language, 'courses.mustEnrollToJoinForum')}
                                                    </div>
                                                )
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

            {/* Delete Confirmation Dialog */}
            <Dialog open={showDeleteDialog} onOpenChange={(open) => !open && setShowDeleteDialog(false)}>
                <DialogContent className="sm:max-w-lg">
                    <DialogHeader>
                        <DialogTitle>Delete Forum</DialogTitle>
                        <DialogDescription>This action cannot be undone. Type the forum name to confirm.</DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                        <input 
                            className="w-full border rounded p-2" 
                            placeholder="Type forum name to confirm" 
                            value={deleteConfirmText} 
                            onChange={(e) => setDeleteConfirmText(e.target.value)} 
                        />
                        <div className="flex gap-2">
                            <Button 
                                variant="destructive" 
                                onClick={confirmDeleteForum} 
                                disabled={deleting || deleteConfirmText !== deletingForumTitle}
                            >
                                {deleting ? 'Deleting...' : 'Delete Forum'}
                            </Button>
                            <Button variant="outline" onClick={() => setShowDeleteDialog(false)}>Cancel</Button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>

            <Footer />
        </div>
    );
}
