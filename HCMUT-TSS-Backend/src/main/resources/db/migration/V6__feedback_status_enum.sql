ALTER TABLE feedback
	MODIFY COLUMN status VARCHAR(30) NOT NULL DEFAULT 'PENDING_APPROVAL';

UPDATE feedback
SET status = 'PENDING_APPROVAL'
WHERE status IS NULL OR status = 'PENDING';

UPDATE feedback
SET status = 'POSTED'
WHERE status = 'APPROVED';

UPDATE feedback
SET status = 'REJECTED'
WHERE status NOT IN ('PENDING_APPROVAL', 'POSTED', 'REJECTED');

ALTER TABLE feedback
	ADD COLUMN moderated_by INT NULL AFTER status,
	ADD COLUMN moderated_at TIMESTAMP NULL AFTER moderated_by,
	ADD COLUMN client_request_id VARCHAR(100) NULL UNIQUE AFTER updated_at;

ALTER TABLE feedback
	ADD CONSTRAINT fk_feedback_moderated_by
		FOREIGN KEY (moderated_by) REFERENCES `user`(user_id);