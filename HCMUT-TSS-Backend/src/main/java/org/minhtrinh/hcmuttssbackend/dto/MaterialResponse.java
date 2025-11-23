package org.minhtrinh.hcmuttssbackend.dto;

import java.time.LocalDateTime;
import lombok.Builder;
import lombok.Value;
import org.minhtrinh.hcmuttssbackend.entity.MaterialSourceType;

@Value
@Builder
public class MaterialResponse {
    Long id;
    Long courseId;
    String title;
    String description;
    MaterialSourceType sourceType;
    Long libraryItemId;
    String filePath;
    String originalName;
    String contentType;
    Long sizeBytes;
    String externalUrl;
    String ownerId;
    LocalDateTime createdAt;
    LocalDateTime updatedAt;
    String downloadUrl;
}
