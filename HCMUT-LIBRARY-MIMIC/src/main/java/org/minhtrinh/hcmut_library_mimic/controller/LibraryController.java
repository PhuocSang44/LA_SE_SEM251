package org.minhtrinh.hcmut_library_mimic.controller;

import java.util.List;
import lombok.RequiredArgsConstructor;
import org.minhtrinh.hcmut_library_mimic.dto.LibraryFileResource;
import org.minhtrinh.hcmut_library_mimic.dto.LibraryItemResponse;
import org.minhtrinh.hcmut_library_mimic.service.LibraryService;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.util.StringUtils;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/api/library/items")
@RequiredArgsConstructor
public class LibraryController {

    private final LibraryService libraryService;

    // TODO add authentication & authorization once security context is plugged in

    @GetMapping
    public List<LibraryItemResponse> searchItems(@RequestParam(value = "query", required = false) String query,
                                                 @RequestParam(value = "courseCode", required = false) String courseCode,
                                                 @RequestParam(value = "tag", required = false) String tag) {
        return libraryService.searchItems(query, courseCode, tag);
    }

    @GetMapping("/{id}")
    public LibraryItemResponse getItem(@PathVariable Long id) {
        return libraryService.getItem(id);
    }

    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public LibraryItemResponse uploadItem(@RequestParam("file") MultipartFile file,
                                          @RequestParam(value = "title", required = false) String title,
                                          @RequestParam(value = "description", required = false) String description,
                                          @RequestParam(value = "courseCode", required = false) String courseCode,
                                          @RequestParam(value = "tags", required = false) String tags,
                                          @RequestParam(value = "visibility", required = false) String visibility) {
        return libraryService.uploadItem(title, description, courseCode, tags, file, visibility);
    }

    @GetMapping("/{id}/download")
    public ResponseEntity<org.springframework.core.io.Resource> download(@PathVariable Long id) {
        LibraryFileResource resource = libraryService.downloadItem(id);
        String contentType = StringUtils.hasText(resource.getContentType())
            ? resource.getContentType()
            : MediaType.APPLICATION_OCTET_STREAM_VALUE;

        return ResponseEntity.ok()
            .contentType(MediaType.parseMediaType(contentType))
            .header(HttpHeaders.CONTENT_DISPOSITION,
                "attachment; filename=\"" + (resource.getFileName() == null ? "library-file" : resource.getFileName()) + "\"")
            .body(resource.getResource());
    }
}
