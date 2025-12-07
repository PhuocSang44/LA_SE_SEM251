import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Search, Plus, MessageSquare, Eye, ThumbsUp, CheckCircle } from "lucide-react";
import { forumApi } from "@/lib/forumApi";
import type { Forum, Post } from "@/types/forum";
import { toast } from "sonner";
import { format } from "date-fns";
import { useLanguage } from "@/contexts/LanguageContext";
import { t } from "@/lib/translations";

export default function ForumDetail() {
    const { forumId } = useParams<{ forumId: string }>();
    const navigate = useNavigate();
    const { language } = useLanguage();
    const [forum, setForum] = useState<Forum | null>(null);
    const [posts, setPosts] = useState<Post[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const [sortBy, setSortBy] = useState<'newest' | 'popular' | 'unanswered'>('popular');

    useEffect(() => {
        if (forumId) {
            loadForumData();
        }
    }, [forumId]);

    const loadForumData = async () => {
        try {
            setLoading(true);
            const [forumData, postsData] = await Promise.all([
                forumApi.getForumById(Number(forumId)),
                forumApi.getPostsByForum(Number(forumId))
            ]);
            setForum(forumData);
            setPosts(postsData);
        } catch (error) {
            console.error('Error loading forum:', error);
            toast.error(t(language, 'forums.failedToLoad'));
        } finally {
            setLoading(false);
        }
    };

    const filteredPosts = posts
        .filter(post => 
            post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            post.content.toLowerCase().includes(searchQuery.toLowerCase())
        )
        .sort((a, b) => {
            if (sortBy === 'newest') return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
            if (sortBy === 'popular') return b.voteScore - a.voteScore;
            if (sortBy === 'unanswered') return a.commentCount - b.commentCount;
            return 0;
        });

    if (loading || !forum) {
        return <div className="min-h-screen bg-gray-50 flex items-center justify-center">Loading...</div>;
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <Navbar />
            <div className="max-w-7xl mx-auto px-6 py-8">
                <button
                    onClick={() => navigate(`/forums/${forum.forumType.toLowerCase()}`)}
                    className="text-blue-600 hover:underline mb-6 flex items-center gap-2"
                >
                    <ArrowLeft className="w-4 h-4" />
                    {t(language, 'common.back')}
                </button>

                {/* Forum Header */}
                <Card className="mb-8">
                    <CardContent className="p-6">
                        <h1 className="text-2xl font-bold text-blue-900 mb-2">{forum.title}</h1>
                        <p className="text-gray-600 mb-4">{forum.description}</p>
                        <div className="flex items-center gap-4 text-sm text-gray-600">
                            <Badge>{forum.subject}</Badge>
                            <span>{forum.memberCount} {t(language, 'forums.members')}</span>
                            <span>{forum.postCount} {t(language, 'forums.questions')}</span>
                        </div>
                        {forum.isJoined && (
                            <Button 
                                onClick={() => navigate(`/forums/${forumId}/posts/create`)}
                                className="mt-4 bg-blue-600"
                            >
                                <Plus className="w-4 h-4 mr-2" />
                                {t(language, 'forums.createPost')}
                            </Button>
                        )}
                    </CardContent>
                </Card>

                {/* Search and Sort */}
                <div className="mb-6 flex gap-4">
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
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value as any)}
                        className="px-4 py-2 border rounded-md"
                    >
                        <option value="popular">{t(language, 'forumDetail.popular')}</option>
                        <option value="newest">{t(language, 'forumDetail.newest')}</option>
                        <option value="unanswered">{t(language, 'forumDetail.unanswered')}</option>
                    </select>
                </div>

                {/* Posts List */}
                {!forum.isJoined ? (
                    <Card className="text-center py-12">
                        <CardContent>
                            <p className="text-gray-600 mb-4">{t(language, 'forums.joinForum')}</p>
                            <Button onClick={() => window.location.reload()}>{t(language, 'forums.joinForum')}</Button>
                        </CardContent>
                    </Card>
                ) : filteredPosts.length === 0 ? (
                    <Card className="text-center py-12">
                        <CardContent><p className="text-gray-600">{t(language, 'forums.noPosts')}</p></CardContent>
                    </Card>
                ) : (
                    <div className="space-y-4">
                        {filteredPosts.map(post => (
                            <Card key={post.postId} className="hover:shadow-md transition-shadow cursor-pointer"
                                  onClick={() => navigate(`/forums/posts/${post.postId}`)}>
                                <CardContent className="p-6">
                                    <div className="flex gap-4">
                                        <div className="flex flex-col items-center gap-2 min-w-[60px]">
                                            <div className="text-lg font-semibold">{post.voteScore}</div>
                                            <div className="text-xs text-gray-500">votes</div>
                                            <div className={`text-sm font-medium px-2 py-1 rounded ${
                                                post.hasAcceptedAnswer ? 'bg-green-100 text-green-700' : 'bg-gray-100'
                                            }`}>
                                                {post.commentCount}
                                            </div>
                                            <div className="text-xs text-gray-500">answers</div>
                                        </div>
                                        <div className="flex-1">
                                            <h3 className="text-lg font-semibold text-blue-900 mb-2 hover:text-blue-600">
                                                {post.title}
                                            </h3>
                                            <div className="flex flex-wrap gap-2 mb-3">
                                                {post.tags.map(tag => (
                                                    <Badge key={tag} variant="secondary" className="text-xs">
                                                        {tag}
                                                    </Badge>
                                                ))}
                                            </div>
                                            <div className="flex items-center gap-4 text-sm text-gray-600">
                                                <span>by {post.authorName}</span>
                                                <span className="flex items-center gap-1">
                                                    <Eye className="w-4 h-4" />
                                                    {post.views} views
                                                </span>
                                                <span>{format(new Date(post.createdAt), 'MMM d, yyyy')}</span>
                                                {post.hasAcceptedAnswer && (
                                                    <span className="flex items-center gap-1 text-green-600">
                                                        <CheckCircle className="w-4 h-4" />
                                                        Answered
                                                    </span>
                                                )}
                                            </div>
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
