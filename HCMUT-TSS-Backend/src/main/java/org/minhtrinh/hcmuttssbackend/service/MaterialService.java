package org.minhtrinh.hcmuttssbackend.service;

import jakarta.persistence.EntityNotFoundException;
import java.io.IOException;
import java.net.MalformedURLException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.List;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.minhtrinh.hcmuttssbackend.dto.MaterialResponse;
import org.minhtrinh.hcmuttssbackend.entity.Course;
import org.minhtrinh.hcmuttssbackend.entity.Material;
import org.minhtrinh.hcmuttssbackend.entity.MaterialSourceType;
import org.minhtrinh.hcmuttssbackend.repository.CourseRepository;
import org.minhtrinh.hcmuttssbackend.repository.MaterialRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;

@Service
@RequiredArgsConstructor
@Slf4j
public class MaterialService {

    private final MaterialRepository materialRepository;
    private final CourseRepository courseRepository;

    @Value("${material.file-storage.dir:uploads/materials}")
    private String materialsDir;

    public List<MaterialResponse> getMaterialsByCourse(Long courseId) {
        return materialRepository.findByCourse_CourseIdOrderByCreatedAtDesc(courseId)
            .stream()
            .map(this::mapToResponse)
            .toList();
    }

    public MaterialResponse addExternalUrl(Long courseId, String ownerId, String title, String description, String externalUrl) {
        Course course = courseRepository.findById(courseId)
            .orElseThrow(() -> new EntityNotFoundException("Course not found"));

        Material material = Material.builder()
            .course(course)
            .ownerId(ownerId)
            .title(title)
            .description(description)
            .sourceType(MaterialSourceType.EXTERNAL_URL)
            .externalUrl(externalUrl)
            .build();

        Material saved = materialRepository.save(material);
        return mapToResponse(saved);
    }

    public MaterialResponse uploadFile(Long courseId, String ownerId, String title, String description, MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new IllegalArgumentException("File is required");
        }

        Course course = courseRepository.findById(courseId)
            .orElseThrow(() -> new EntityNotFoundException("Course not found"));

        String originalName = file.getOriginalFilename();
        String targetTitle = StringUtils.hasText(title) ? title : originalName;
        String storedFileName = buildStoredFileName(originalName);
        Path storagePath = resolveStorageDir().resolve(storedFileName);

        try {
            Files.createDirectories(storagePath.getParent());
            Files.copy(file.getInputStream(), storagePath, StandardCopyOption.REPLACE_EXISTING);
        } catch (IOException ex) {
            log.error("Failed to store material file", ex);
            throw new IllegalStateException("Failed to store file", ex);
        }

        Material material = Material.builder()
            .course(course)
            .ownerId(ownerId)
            .title(targetTitle)
            .description(description)
            .sourceType(MaterialSourceType.LOCAL_FILE)
            .filePath(storedFileName)
            .originalName(originalName)
            .contentType(file.getContentType())
            .sizeBytes(file.getSize())
            .build();

        Material saved = materialRepository.save(material);
        return mapToResponse(saved);
    }

    public FileDownloadResource downloadFile(Long materialId) {
        Material material = materialRepository.findById(materialId)
            .orElseThrow(() -> new EntityNotFoundException("Material not found"));

        if (material.getSourceType() != MaterialSourceType.LOCAL_FILE) {
            throw new IllegalArgumentException("Material is not a local file");
        }

        Path storagePath = resolveStorageDir().resolve(material.getFilePath());
        if (Files.notExists(storagePath)) {
            throw new EntityNotFoundException("File missing on disk");
        }

        try {
            Resource resource = new UrlResource(storagePath.toUri());
            return FileDownloadResource.builder()
                .resource(resource)
                .contentType(material.getContentType())
                .fileName(material.getOriginalName())
                .build();
        } catch (MalformedURLException ex) {
            log.error("Failed to load file", ex);
            throw new IllegalStateException("Failed to load file", ex);
        }
    }

    private Path resolveStorageDir() {
        return Paths.get(materialsDir).toAbsolutePath().normalize();
    }

    private String buildStoredFileName(String originalName) {
        String extension = "";
        if (StringUtils.hasText(originalName) && originalName.contains(".")) {
            extension = originalName.substring(originalName.lastIndexOf('.'));
        }
        return UUID.randomUUID() + extension;
    }

    private MaterialResponse mapToResponse(Material material) {
        String downloadUrl = null;
        if (material.getSourceType() == MaterialSourceType.LOCAL_FILE) {
            downloadUrl = "/api/materials/" + material.getId() + "/download";
        }

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
            .downloadUrl(downloadUrl)
            .build();
    }

    @lombok.Value
    @lombok.Builder
    public static class FileDownloadResource {
        Resource resource;
        String contentType;
        String fileName;
    }
}

