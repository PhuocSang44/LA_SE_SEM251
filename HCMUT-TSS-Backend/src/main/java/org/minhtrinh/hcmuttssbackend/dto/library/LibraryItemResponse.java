package org.minhtrinh.hcmuttssbackend.dto.library;

import java.time.LocalDateTime;
import lombok.Builder;
import lombok.Value;

@Value
@Builder
public class LibraryItemResponse {
    Long id;
    String title;
    String description;
    String courseCode;
    String tags;
    String originalName;
    Long sizeBytes;
    String contentType;
    String visibility;
    LocalDateTime createdAt;
}
