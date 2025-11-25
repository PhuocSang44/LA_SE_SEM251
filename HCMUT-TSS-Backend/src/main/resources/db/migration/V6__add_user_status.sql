-- Add status column to user table
ALTER TABLE user ADD status VARCHAR(20) NOT NULL DEFAULT 'ACTIVE';
