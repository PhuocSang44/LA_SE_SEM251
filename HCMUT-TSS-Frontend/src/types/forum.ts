// Forum Types
export type ForumType = 'ACADEMIC' | 'CAREER';

export interface Forum {
  forumId: number;
  title: string;
  description: string;
  forumType: ForumType;
  subject: string;
  creatorUserId: number;
  creatorName: string;
  creatorRole: string;
  memberCount: number;
  postCount: number;
  isJoined: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Post {
  postId: number;
  forumId: number;
  forumTitle: string;
  authorUserId: number;
  authorName: string;
  authorRole: string;
  title: string;
  content: string;
  views: number;
  voteScore: number;
  commentCount: number;
  hasAcceptedAnswer: boolean;
  tags: string[];
  userVote: 'up' | 'down' | null;
  createdAt: string;
  updatedAt: string;
}

export interface Comment {
  commentId: number;
  postId: number;
  authorUserId: number;
  authorName: string;
  authorRole: string;
  content: string;
  voteScore: number;
  isAccepted: boolean;
  userVote: 'up' | 'down' | null;
  createdAt: string;
  updatedAt: string;
}

export type VoteType = 'UP' | 'DOWN';

export interface CreateForumRequest {
  title: string;
  description: string;
  forumType: ForumType;
  subject: string;
}

export interface CreatePostRequest {
  forumId: number;
  title: string;
  content: string;
  tags: string[];
}

export interface CreateCommentRequest {
  postId: number;
  content: string;
}

export interface VoteRequest {
  voteType: VoteType;
}
