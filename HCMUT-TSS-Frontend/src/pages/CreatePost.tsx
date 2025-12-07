import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, X, AlertCircle } from "lucide-react";
import { forumApi } from "@/lib/forumApi";
import { toast } from "sonner";
import { useLanguage } from "@/contexts/LanguageContext";
import { t } from "@/lib/translations";
import { containsInappropriateContent, isSpam } from "@/lib/contentModeration";

export default function CreatePost() {
    const navigate = useNavigate();
    const { language } = useLanguage();
    const { forumId } = useParams<{ forumId: string }>();
    const forumIdNum = Number(forumId);
    
    const [title, setTitle] = useState("");
    const [content, setContent] = useState("");
    const [tags, setTags] = useState<string[]>([]);
    const [tagInput, setTagInput] = useState("");
    const [validationErrors, setValidationErrors] = useState<string[]>([]);

    // Word counts
    const titleWordCount = title.trim().split(/\s+/).filter(w => w.length > 0).length;
    const contentWordCount = content.trim().split(/\s+/).filter(w => w.length > 0).length;
    
    // Validation
    const titleValid = titleWordCount >= 3 && titleWordCount <= 20;
    const contentValid = contentWordCount >= 10 && contentWordCount <= 200;
    const allValid = titleValid && contentValid;

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
        const newErrors: string[] = [];

        // Validate title
        if (!titleValid) {
            if (titleWordCount < 3) {
                newErrors.push('Question title must be at least 3 words');
            } else if (titleWordCount > 20) {
                newErrors.push('Question title must not exceed 20 words');
            }
        }

        // Validate content
        if (!contentValid) {
            if (contentWordCount < 10) {
                newErrors.push('Question content must be at least 10 words');
            } else if (contentWordCount > 200) {
                newErrors.push('Question content must not exceed 200 words');
            }
        }

        // Check for inappropriate content
        if (containsInappropriateContent(title)) {
            newErrors.push('Title contains inappropriate language');
        }
        if (containsInappropriateContent(content)) {
            newErrors.push('Content contains inappropriate language');
        }

        // Check for spam/gibberish
        if (isSpam(title)) {
            newErrors.push('Title appears to be spam or gibberish');
        }
        if (isSpam(content)) {
            newErrors.push('Content appears to be spam or gibberish');
        }

        if (newErrors.length > 0) {
            setValidationErrors(newErrors);
            toast.error('Please fix the errors below');
            return;
        }

        setValidationErrors([]);

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
                            {validationErrors.length > 0 && (
                                <div className="bg-red-50 border border-red-200 rounded-md p-4">
                                    <div className="flex items-start gap-3">
                                        <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                                        <div>
                                            <h3 className="font-medium text-red-900 mb-2">Please fix these issues:</h3>
                                            <ul className="list-disc list-inside space-y-1">
                                                {validationErrors.map((error, idx) => (
                                                    <li key={idx} className="text-sm text-red-800">{error}</li>
                                                ))}
                                            </ul>
                                        </div>
                                    </div>
                                </div>
                            )}
                            <div>
                                <label className="block text-sm font-medium mb-2">{t(language, 'forums.questionTitle')} *</label>
                                <Input
                                    value={title}
                                    onChange={(e) => setTitle(e.target.value)}
                                    placeholder={t(language, 'forums.postTitlePlaceholder')}
                                    required
                                />
                                <p className={`text-xs mt-1 ${titleWordCount > 20 ? 'text-red-500' : 'text-gray-500'}`}>
                                    {titleWordCount} / 20 words
                                </p>
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-2">{t(language, 'forums.questionContent')} *</label>
                                <Textarea
                                    value={content}
                                    onChange={(e) => setContent(e.target.value)}
                                    placeholder={t(language, 'forums.postContentPlaceholder')}
                                    rows={8}
                                    required
                                />
                                <p className={`text-xs mt-1 ${contentWordCount > 200 ? 'text-red-500' : 'text-gray-500'}`}>
                                    {contentWordCount} / 200 words
                                </p>
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
                                <Button 
                                    type="submit" 
                                    className="bg-blue-600"
                                    disabled={!allValid}
                                >
                                    {t(language, 'forums.postQuestion')}
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
