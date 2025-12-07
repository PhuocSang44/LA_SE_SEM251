import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, X } from "lucide-react";
import { forumApi } from "@/lib/forumApi";
import { toast } from "sonner";
import { useLanguage } from "@/contexts/LanguageContext";
import { t } from "@/lib/translations";

export default function CreatePost() {
    const navigate = useNavigate();
    const { language } = useLanguage();
    const { forumId } = useParams<{ forumId: string }>();
    const forumIdNum = Number(forumId);
    
    const [title, setTitle] = useState("");
    const [content, setContent] = useState("");
    const [tags, setTags] = useState<string[]>([]);
    const [tagInput, setTagInput] = useState("");

    const handleAddTag = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && tagInput.trim()) {
            e.preventDefault();
            if (tags.length >= 5) {
                toast.error(t(language, 'forums.maxTags'));
                return;
            }
            if (!tags.includes(tagInput.trim().toLowerCase())) {
                setTags([...tags, tagInput.trim().toLowerCase()]);
            }
            setTagInput('');
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!title.trim() || !content.trim()) {
            toast.error(t(language, 'forums.fillRequired'));
            return;
        }

        try {
            await forumApi.createPost({
                forumId: forumIdNum,
                title,
                content,
                tags
            });
            toast.success(t(language, 'forums.postedSuccess'));
            navigate(`/forums/detail/${forumId}`);
        } catch (error) {
            console.error('Error creating post:', error);
            toast.error(t(language, 'forums.failedCreate'));
        }
    };

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
                        <CardTitle>{t(language, 'forums.postQuestion')}</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div>
                                <label className="block text-sm font-medium mb-2">{t(language, 'forums.questionTitle')} *</label>
                                <Input
                                    value={title}
                                    onChange={(e) => setTitle(e.target.value)}
                                    placeholder="Be specific and clear about your question..."
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-2">{t(language, 'forums.questionContent')} *</label>
                                <Textarea
                                    value={content}
                                    onChange={(e) => setContent(e.target.value)}
                                    placeholder="Provide all the details, context, and what you've tried..."
                                    rows={8}
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-2">{t(language, 'forums.tags')} (max 5)</label>
                                <Input
                                    value={tagInput}
                                    onChange={(e) => setTagInput(e.target.value)}
                                    onKeyDown={handleAddTag}
                                    placeholder="Add a tag and press Enter..."
                                />
                                <div className="flex flex-wrap gap-2 mt-2">
                                    {tags.map(tag => (
                                        <Badge key={tag} className="flex items-center gap-1">
                                            {tag}
                                            <X 
                                                className="w-3 h-3 cursor-pointer" 
                                                onClick={() => setTags(tags.filter(t => t !== tag))}
                                            />
                                        </Badge>
                                    ))}
                                </div>
                            </div>

                            <div className="flex gap-2">
                                <Button type="submit" className="bg-blue-600">{t(language, 'forums.postQuestion')}</Button>
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
