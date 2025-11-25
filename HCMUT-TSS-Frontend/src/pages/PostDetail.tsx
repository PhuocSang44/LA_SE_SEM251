import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, ThumbsUp, ThumbsDown, CheckCircle, Eye } from "lucide-react";
import { forumApi } from "@/lib/forumApi";
import type { Post, Comment } from "@/types/forum";
import { toast } from "sonner";
import { format } from "date-fns";
import { useAuth } from "@/contexts/AuthContext";

export default function PostDetail() {
    const { postId } = useParams<{ postId: string }>();
    const navigate = useNavigate();
    const { user } = useAuth();
    const [post, setPost] = useState<Post | null>(null);
    const [comments, setComments] = useState<Comment[]>([]);
    const [newComment, setNewComment] = useState("");
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (postId) {
            loadPostData();
        }
    }, [postId]);

    const loadPostData = async () => {
        try {
            setLoading(true);
            const [postData, commentsData] = await Promise.all([
                forumApi.getPostById(Number(postId)),
                forumApi.getCommentsByPost(Number(postId))
            ]);
            setPost(postData);
            setComments(commentsData.sort((a, b) => 
                (a.isAccepted === b.isAccepted) ? b.voteScore - a.voteScore : (b.isAccepted ? 1 : -1)
            ));
        } catch (error) {
            console.error('Error loading post:', error);
            toast.error('Failed to load post');
        } finally {
            setLoading(false);
        }
    };

    const handleVotePost = async (voteType: 'UP' | 'DOWN') => {
        try {
            await forumApi.votePost(Number(postId), { voteType });
            await loadPostData();
        } catch (error) {
            console.error('Error voting:', error);
            toast.error('Failed to vote');
        }
    };

    const handleVoteComment = async (commentId: number, voteType: 'UP' | 'DOWN') => {
        try {
            await forumApi.voteComment(commentId, { voteType });
            await loadPostData();
        } catch (error) {
            console.error('Error voting:', error);
            toast.error('Failed to vote');
        }
    };

    const handlePostComment = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newComment.trim()) return;

        try {
            await forumApi.createComment({
                postId: Number(postId),
                content: newComment
            });
            setNewComment('');
            toast.success('Answer posted!');
            await loadPostData();
        } catch (error) {
            console.error('Error posting comment:', error);
            toast.error('Failed to post answer');
        }
    };

    const handleAcceptComment = async (commentId: number) => {
        try {
            await forumApi.acceptComment(commentId);
            toast.success('Answer accepted!');
            await loadPostData();
        } catch (error) {
            console.error('Error accepting answer:', error);
            toast.error('Failed to accept answer');
        }
    };

    if (loading || !post) {
        return <div className="min-h-screen bg-gray-50 flex items-center justify-center">Loading...</div>;
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <Navbar />
            <div className="max-w-5xl mx-auto px-6 py-8">
                <button
                    onClick={() => navigate(`/forums/${post.forumId}`)}
                    className="text-blue-600 hover:underline mb-6 flex items-center gap-2"
                >
                    <ArrowLeft className="w-4 h-4" />
                    Back to Forum
                </button>

                {/* Question */}
                <Card className="mb-8">
                    <CardContent className="p-8">
                        <div className="flex gap-6">
                            {/* Voting */}
                            <div className="flex flex-col items-center gap-3 min-w-[60px]">
                                <button 
                                    onClick={() => handleVotePost('UP')}
                                    className={`p-2 rounded hover:bg-gray-100 ${post.userVote === 'up' ? 'text-blue-600' : ''}`}
                                >
                                    <ThumbsUp className="w-6 h-6" />
                                </button>
                                <div className="text-2xl font-bold">{post.voteScore}</div>
                                <button 
                                    onClick={() => handleVotePost('DOWN')}
                                    className={`p-2 rounded hover:bg-gray-100 ${post.userVote === 'down' ? 'text-red-600' : ''}`}
                                >
                                    <ThumbsDown className="w-6 h-6" />
                                </button>
                            </div>

                            {/* Content */}
                            <div className="flex-1">
                                <h1 className="text-2xl font-bold text-blue-900 mb-4">{post.title}</h1>
                                <div className="prose max-w-none mb-4">{post.content}</div>
                                
                                <div className="flex flex-wrap gap-2 mb-4">
                                    {post.tags.map(tag => (
                                        <Badge key={tag} variant="secondary">{tag}</Badge>
                                    ))}
                                </div>

                                <div className="flex items-center gap-4 text-sm text-gray-600">
                                    <span>Asked by <strong>{post.authorName}</strong></span>
                                    <span className="flex items-center gap-1">
                                        <Eye className="w-4 h-4" />
                                        {post.views} views
                                    </span>
                                    <span>{format(new Date(post.createdAt), 'MMM d, yyyy HH:mm')}</span>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Answers */}
                <div className="mb-8">
                    <h2 className="text-xl font-bold text-blue-900 mb-6">{comments.length} Answers</h2>
                    <div className="space-y-6">
                        {comments.map(comment => (
                            <Card key={comment.commentId} className={comment.isAccepted ? 'border-2 border-green-500' : ''}>
                                <CardContent className="p-6">
                                    <div className="flex gap-6">
                                        {/* Voting */}
                                        <div className="flex flex-col items-center gap-3 min-w-[60px]">
                                            <button 
                                                onClick={() => handleVoteComment(comment.commentId, 'UP')}
                                                className={`p-2 rounded hover:bg-gray-100 ${comment.userVote === 'up' ? 'text-blue-600' : ''}`}
                                            >
                                                <ThumbsUp className="w-5 h-5" />
                                            </button>
                                            <div className="text-xl font-bold">{comment.voteScore}</div>
                                            <button 
                                                onClick={() => handleVoteComment(comment.commentId, 'DOWN')}
                                                className={`p-2 rounded hover:bg-gray-100 ${comment.userVote === 'down' ? 'text-red-600' : ''}`}
                                            >
                                                <ThumbsDown className="w-5 h-5" />
                                            </button>
                                            {comment.isAccepted && (
                                                <CheckCircle className="w-6 h-6 text-green-600 mt-2" />
                                            )}
                                        </div>

                                        {/* Content */}
                                        <div className="flex-1">
                                            {comment.isAccepted && (
                                                <Badge className="bg-green-600 mb-2">Accepted Answer</Badge>
                                            )}
                                            <div className="prose max-w-none mb-4">{comment.content}</div>
                                            <div className="flex items-center justify-between">
                                                <div className="text-sm text-gray-600">
                                                    <span>by <strong>{comment.authorName}</strong></span>
                                                    <span className="ml-4">{format(new Date(comment.createdAt), 'MMM d, yyyy HH:mm')}</span>
                                                </div>
                                                {user?.userId === post.authorUserId && !comment.isAccepted && (
                                                    <Button 
                                                        onClick={() => handleAcceptComment(comment.commentId)}
                                                        size="sm"
                                                        variant="outline"
                                                        className="text-green-600"
                                                    >
                                                        <CheckCircle className="w-4 h-4 mr-2" />
                                                        Accept Answer
                                                    </Button>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </div>

                {/* Post Answer */}
                <Card>
                    <CardContent className="p-6">
                        <h3 className="text-lg font-semibold mb-4">Your Answer</h3>
                        <form onSubmit={handlePostComment}>
                            <Textarea
                                value={newComment}
                                onChange={(e) => setNewComment(e.target.value)}
                                placeholder="Write your answer..."
                                rows={6}
                                className="mb-4"
                            />
                            <Button type="submit" className="bg-blue-600">Post Answer</Button>
                        </form>
                    </CardContent>
                </Card>
            </div>
            <Footer />
        </div>
    );
}
