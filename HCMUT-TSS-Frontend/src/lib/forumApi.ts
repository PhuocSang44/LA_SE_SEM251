import { api } from './api';
import type {
    Forum,
    Post,
    Comment,
    CreateForumRequest,
    CreatePostRequest,
    CreateCommentRequest,
    VoteRequest,
    ForumType
} from '@/types/forum';

export const forumApi = {
    // ==================== FORUM MANAGEMENT ====================
    
    // Create a new forum (tutor only)
    createForum: async (request: CreateForumRequest): Promise<Forum> => {
        const response = await api.post('/api/forums', request);
        return response.data;
    },

    // Get all forums (optionally filtered by type)
    getAllForums: async (forumType?: ForumType): Promise<Forum[]> => {
        const params = forumType ? { forumType } : {};
        const response = await api.get('/api/forums', { params });
        return response.data;
    },

    // Get a specific forum by ID
    getForumById: async (forumId: number): Promise<Forum> => {
        const response = await api.get(`/api/forums/${forumId}`);
        return response.data;
    },

    // Search forums
    searchForums: async (query: string, forumType?: ForumType): Promise<Forum[]> => {
        const params: any = { query };
        if (forumType) params.forumType = forumType;
        const response = await api.get('/api/forums/search', { params });
        return response.data;
    },

    // Delete a forum (creator only)
    deleteForum: async (forumId: number): Promise<void> => {
        await api.delete(`/api/forums/${forumId}`);
    },

    // ==================== FORUM MEMBERSHIP ====================
    
    // Join a forum
    joinForum: async (forumId: number): Promise<void> => {
        await api.post(`/api/forums/${forumId}/join`);
    },

    // Leave a forum
    leaveForum: async (forumId: number): Promise<void> => {
        await api.delete(`/api/forums/${forumId}/leave`);
    },

    // ==================== POST MANAGEMENT ====================
    
    // Create a new post
    createPost: async (request: CreatePostRequest): Promise<Post> => {
        const response = await api.post('/api/forums/posts', request);
        return response.data;
    },

    // Get all posts in a forum
    getPostsByForum: async (forumId: number): Promise<Post[]> => {
        const response = await api.get(`/api/forums/${forumId}/posts`);
        return response.data;
    },

    // Get a specific post by ID
    getPostById: async (postId: number): Promise<Post> => {
        const response = await api.get(`/api/forums/posts/${postId}`);
        return response.data;
    },

    // Search posts in a forum
    searchPostsInForum: async (forumId: number, query: string): Promise<Post[]> => {
        const response = await api.get(`/api/forums/${forumId}/posts/search`, {
            params: { query }
        });
        return response.data;
    },

    // ==================== COMMENT MANAGEMENT ====================
    
    // Create a new comment
    createComment: async (request: CreateCommentRequest): Promise<Comment> => {
        const response = await api.post('/api/forums/comments', request);
        return response.data;
    },

    // Get all comments for a post
    getCommentsByPost: async (postId: number): Promise<Comment[]> => {
        const response = await api.get(`/api/forums/posts/${postId}/comments`);
        return response.data;
    },

    // Accept a comment as the answer (post author only)
    acceptComment: async (commentId: number): Promise<Comment> => {
        const response = await api.patch(`/api/forums/comments/${commentId}/accept`);
        return response.data;
    },

    // ==================== VOTING SYSTEM ====================
    
    // Vote on a post
    votePost: async (postId: number, request: VoteRequest): Promise<void> => {
        await api.post(`/api/forums/posts/${postId}/vote`, request);
    },

    // Vote on a comment
    voteComment: async (commentId: number, request: VoteRequest): Promise<void> => {
        await api.post(`/api/forums/comments/${commentId}/vote`, request);
    },
};
