CREATE TABLE IF NOT EXISTS materials (
    id                BIGINT AUTO_INCREMENT PRIMARY KEY,
    course_id         VARCHAR(50) NOT NULL,
    owner_id          VARCHAR(100) NOT NULL,
    title             VARCHAR(255) NOT NULL,
    description       VARCHAR(2000),
    source_type       VARCHAR(32) NOT NULL,
    library_item_id   BIGINT,
    file_path         VARCHAR(500),
    original_name     VARCHAR(255),
    content_type      VARCHAR(100),
    size_bytes        BIGINT,
    external_url      VARCHAR(1000),
    created_at        DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at        DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_material_course
        FOREIGN KEY (course_id) REFERENCES course(code) ON DELETE CASCADE
);
