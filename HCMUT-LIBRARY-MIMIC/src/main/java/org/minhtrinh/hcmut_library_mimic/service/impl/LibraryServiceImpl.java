package org.minhtrinh.hcmut_library_mimic.service.impl;

import jakarta.persistence.EntityNotFoundException;
import java.io.IOException;
import java.net.MalformedURLException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.List;
import java.util.UUID;
import java.util.stream.Stream;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.minhtrinh.hcmut_library_mimic.dto.LibraryFileResource;
import org.minhtrinh.hcmut_library_mimic.dto.LibraryItemResponse;
import org.minhtrinh.hcmut_library_mimic.entity.LibraryItem;
import org.minhtrinh.hcmut_library_mimic.repository.LibraryItemRepository;
import org.minhtrinh.hcmut_library_mimic.service.LibraryService;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;

@Service
@RequiredArgsConstructor
@Slf4j
public class LibraryServiceImpl implements LibraryService {

    private final LibraryItemRepository libraryItemRepository;

    @Value("${library.file-storage.dir:uploads/library}")
    private String libraryDir;

    @Override
    public List<LibraryItemResponse> searchItems(String query, String courseCode, String tag) {
        List<LibraryItem> items;
        if (!StringUtils.hasText(query)) {
            items = libraryItemRepository.findTop50ByDeletedFalseOrderByCreatedAtDesc();
        } else {
            items = libraryItemRepository.findByDeletedFalseAndTitleContainingIgnoreCase(query.trim());
        }

        Stream<LibraryItem> stream = items.stream();
        if (StringUtils.hasText(courseCode)) {
            stream = stream.filter(item -> courseCode.equalsIgnoreCase(item.getCourseCode()));
        }
        if (StringUtils.hasText(tag)) {
            stream = stream.filter(item -> hasTag(item.getTags(), tag));
        }
        return stream
            .map(this::mapToResponse)
            .toList();
    }

    @Override
    public LibraryItemResponse getItem(Long id) {
        LibraryItem item = libraryItemRepository.findByIdAndDeletedFalse(id)
            .orElseThrow(() -> new EntityNotFoundException("Library item not found"));
        return mapToResponse(item);
    }

    @Override
    public LibraryItemResponse uploadItem(String title,
                                          String description,
                                          String courseCode,
                                          String tags,
                                          MultipartFile file,
                                          String visibility) {
        if (file == null || file.isEmpty()) {
            throw new IllegalArgumentException("File payload is required");
        }

        String originalName = file.getOriginalFilename();
        String targetTitle = StringUtils.hasText(title) ? title : originalName;
        String resolvedVisibility = StringUtils.hasText(visibility) ? visibility : "PUBLIC";
        String storedFileName = buildStoredFileName(originalName);
        Path storagePath = resolveStorageDir().resolve(storedFileName);

        try {
            Files.createDirectories(storagePath.getParent());
            Files.copy(file.getInputStream(), storagePath, StandardCopyOption.REPLACE_EXISTING);
        } catch (IOException ex) {
            throw new IllegalStateException("Failed to store library file", ex);
        }

        LibraryItem entity = new LibraryItem();
        entity.setTitle(targetTitle);
        entity.setDescription(description);
        entity.setCourseCode(courseCode);
        entity.setTags(tags);
        entity.setFilePath(storedFileName);
        entity.setOriginalName(originalName);
        entity.setContentType(file.getContentType());
        entity.setSizeBytes(file.getSize());
        entity.setVisibility(resolvedVisibility);

        LibraryItem saved = libraryItemRepository.save(entity);
        return mapToResponse(saved);
    }

    @Override
    public LibraryFileResource downloadItem(Long id) {
        LibraryItem item = libraryItemRepository.findByIdAndDeletedFalse(id)
            .orElseThrow(() -> new EntityNotFoundException("Library item not found"));

        Path storagePath = resolveStorageDir().resolve(item.getFilePath());
        if (Files.notExists(storagePath)) {
            throw new EntityNotFoundException("File missing on disk");
        }

        try {
            Resource resource = new UrlResource(storagePath.toUri());
            return LibraryFileResource.builder()
                .resource(resource)
                .contentType(item.getContentType())
                .fileName(item.getOriginalName())
                .build();
        } catch (MalformedURLException ex) {
            throw new IllegalStateException("Failed to load file", ex);
        }
    }

    private boolean hasTag(String tags, String target) {
        if (!StringUtils.hasText(tags) || !StringUtils.hasText(target)) {
            return false;
        }
        String[] tokenized = tags.split(",");
        for (String token : tokenized) {
            if (target.equalsIgnoreCase(token.trim())) {
                return true;
            }
        }
        return false;
    }

    private Path resolveStorageDir() {
        return Paths.get(libraryDir).toAbsolutePath().normalize();
    }

    private String buildStoredFileName(String originalName) {
        String extension = "";
        if (StringUtils.hasText(originalName) && originalName.contains(".")) {
            extension = originalName.substring(originalName.lastIndexOf('.'));
        }
        return UUID.randomUUID() + extension;
    }

    private LibraryItemResponse mapToResponse(LibraryItem item) {
        return LibraryItemResponse.builder()
            .id(item.getId())
            .title(item.getTitle())
            .description(item.getDescription())
            .courseCode(item.getCourseCode())
            .tags(item.getTags())
            .originalName(item.getOriginalName())
            .sizeBytes(item.getSizeBytes())
            .contentType(item.getContentType())
            .visibility(item.getVisibility())
            .createdAt(item.getCreatedAt())
            .build();
    }
}
