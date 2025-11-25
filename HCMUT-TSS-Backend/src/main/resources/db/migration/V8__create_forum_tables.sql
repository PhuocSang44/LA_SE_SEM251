-- Create forum tables for the community discussion feature

-- Forums table (Academic and Career forums)
CREATE TABLE forums (
    forum_id BIGINT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    forum_type ENUM('ACADEMIC', 'CAREER') NOT NULL,
    subject VARCHAR(100) NOT NULL,
    creator_user_id INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_forum_creator FOREIGN KEY (creator_user_id) REFERENCES user(user_id) ON DELETE CASCADE
);

-- Forum members table (tracks who has joined which forums)
CREATE TABLE forum_members (
    member_id BIGINT AUTO_INCREMENT PRIMARY KEY,
    forum_id BIGINT NOT NULL,
    user_id INT NOT NULL,
    joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_member_forum FOREIGN KEY (forum_id) REFERENCES forums(forum_id) ON DELETE CASCADE,
    CONSTRAINT fk_member_user FOREIGN KEY (user_id) REFERENCES user(user_id) ON DELETE CASCADE,
    UNIQUE KEY unique_forum_member (forum_id, user_id)
);

-- Forum posts/questions table
CREATE TABLE forum_posts (
    post_id BIGINT AUTO_INCREMENT PRIMARY KEY,
    forum_id BIGINT NOT NULL,
    author_user_id INT NOT NULL,
    title VARCHAR(500) NOT NULL,
    content TEXT NOT NULL,
    views INT DEFAULT 0,
    has_accepted_answer BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_post_forum FOREIGN KEY (forum_id) REFERENCES forums(forum_id) ON DELETE CASCADE,
    CONSTRAINT fk_post_author FOREIGN KEY (author_user_id) REFERENCES user(user_id) ON DELETE CASCADE
);

-- Post tags table (for categorizing posts)
CREATE TABLE post_tags (
    tag_id BIGINT AUTO_INCREMENT PRIMARY KEY,
    post_id BIGINT NOT NULL,
    tag_name VARCHAR(50) NOT NULL,
    CONSTRAINT fk_tag_post FOREIGN KEY (post_id) REFERENCES forum_posts(post_id) ON DELETE CASCADE
);

-- Forum comments/answers table
CREATE TABLE forum_comments (
    comment_id BIGINT AUTO_INCREMENT PRIMARY KEY,
    post_id BIGINT NOT NULL,
    author_user_id INT NOT NULL,
    content TEXT NOT NULL,
    is_accepted BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_comment_post FOREIGN KEY (post_id) REFERENCES forum_posts(post_id) ON DELETE CASCADE,
    CONSTRAINT fk_comment_author FOREIGN KEY (author_user_id) REFERENCES user(user_id) ON DELETE CASCADE
);

-- Forum votes table (for posts and comments)
CREATE TABLE forum_votes (
    vote_id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    post_id BIGINT NULL,
    comment_id BIGINT NULL,
    vote_type ENUM('UP', 'DOWN') NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_vote_user FOREIGN KEY (user_id) REFERENCES user(user_id) ON DELETE CASCADE,
    CONSTRAINT fk_vote_post FOREIGN KEY (post_id) REFERENCES forum_posts(post_id) ON DELETE CASCADE,
    CONSTRAINT fk_vote_comment FOREIGN KEY (comment_id) REFERENCES forum_comments(comment_id) ON DELETE CASCADE,
    UNIQUE KEY unique_user_post_vote (user_id, post_id),
    UNIQUE KEY unique_user_comment_vote (user_id, comment_id),
    CONSTRAINT check_vote_target CHECK ((post_id IS NOT NULL AND comment_id IS NULL) OR (post_id IS NULL AND comment_id IS NOT NULL))
);

-- Indexes for better query performance
CREATE INDEX idx_forum_type ON forums(forum_type);
CREATE INDEX idx_forum_creator ON forums(creator_user_id);
CREATE INDEX idx_member_user ON forum_members(user_id);
CREATE INDEX idx_post_forum ON forum_posts(forum_id);
CREATE INDEX idx_post_author ON forum_posts(author_user_id);
CREATE INDEX idx_post_created ON forum_posts(created_at DESC);
CREATE INDEX idx_comment_post ON forum_comments(post_id);
CREATE INDEX idx_comment_author ON forum_comments(author_user_id);
CREATE INDEX idx_vote_post ON forum_votes(post_id);
CREATE INDEX idx_vote_comment ON forum_votes(comment_id);
