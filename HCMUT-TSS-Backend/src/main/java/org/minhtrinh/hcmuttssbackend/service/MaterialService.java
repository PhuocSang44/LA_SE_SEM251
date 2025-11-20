package org.minhtrinh.hcmuttssbackend.service;

import jakarta.persistence.EntityNotFoundException;
import java.net.URI;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.minhtrinh.hcmuttssbackend.client.LibraryClient;
import org.minhtrinh.hcmuttssbackend.dto.LinkLibraryMaterialRequest;
import org.minhtrinh.hcmuttssbackend.dto.MaterialResponse;
import org.minhtrinh.hcmuttssbackend.dto.library.LibraryItemResponse;
import org.minhtrinh.hcmuttssbackend.entity.Course;
import org.minhtrinh.hcmuttssbackend.entity.Material;
import org.minhtrinh.hcmuttssbackend.entity.MaterialSourceType;
import org.minhtrinh.hcmuttssbackend.repository.CourseRepository;
import org.minhtrinh.hcmuttssbackend.repository.MaterialRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

@Service
@RequiredArgsConstructor
public class MaterialService {

    private final MaterialRepository materialRepository;
    private final CourseRepository courseRepository;
    private final LibraryClient libraryClient;

    @Transactional
    public MaterialResponse linkLibraryMaterial(Long courseId,
                                                LinkLibraryMaterialRequest request,
                                                String ownerId) {
        if (request.libraryItemId() == null) {
            throw new IllegalArgumentException("libraryItemId is required");
        }
        Course course = courseRepository.findById(courseId)
            .orElseThrow(() -> new EntityNotFoundException("Course not found: " + courseId));

        // TODO enforce tutor ownership/course membership before linking library content

        LibraryItemResponse libraryItem = libraryClient.getItem(request.libraryItemId());

        String title = StringUtils.hasText(request.title()) ? request.title() : libraryItem.getTitle();
        if (!StringUtils.hasText(title)) {
            title = libraryItem.getOriginalName();
        }
        if (!StringUtils.hasText(title)) {
            title = "Library Item #" + libraryItem.getId();
        }
        String description = StringUtils.hasText(request.description())
            ? request.description()
            : libraryItem.getDescription();

        Material material = Material.builder()
            .course(course)
            .ownerId(ownerId)
            .title(title)
            .description(description)
            .sourceType(MaterialSourceType.LIBRARY_REF)
            .libraryItemId(libraryItem.getId())
            .build();

        Material saved = materialRepository.save(material);
        return toResponse(saved);
    }

    @Transactional(readOnly = true)
    public List<LibraryItemResponse> searchLibrary(String query, String courseCode) {
        return libraryClient.searchItems(query, courseCode);
    }

    @Transactional(readOnly = true)
    public URI buildLibraryDownloadRedirect(Long materialId) {
        Material material = materialRepository.findById(materialId)
            .orElseThrow(() -> new EntityNotFoundException("Material not found: " + materialId));

        if (material.getSourceType() != MaterialSourceType.LIBRARY_REF || material.getLibraryItemId() == null) {
            throw new UnsupportedOperationException("Only LIBRARY_REF materials support download redirect");
        }
        return URI.create(libraryClient.buildDownloadUrl(material.getLibraryItemId()));
    }

    private MaterialResponse toResponse(Material material) {
        return MaterialResponse.builder()
            .id(material.getId())
            .courseId(material.getCourse().getCourseId())
            .title(material.getTitle())
            .description(material.getDescription())
            .sourceType(material.getSourceType())
            .libraryItemId(material.getLibraryItemId())
            .filePath(material.getFilePath())
            .originalName(material.getOriginalName())
            .contentType(material.getContentType())
            .sizeBytes(material.getSizeBytes())
            .externalUrl(material.getExternalUrl())
            .ownerId(material.getOwnerId())
            .createdAt(material.getCreatedAt())
            .updatedAt(material.getUpdatedAt())
            .downloadUrl(material.getLibraryItemId() != null
                ? libraryClient.buildDownloadUrl(material.getLibraryItemId())
                : null)
            .build();
    }
}
