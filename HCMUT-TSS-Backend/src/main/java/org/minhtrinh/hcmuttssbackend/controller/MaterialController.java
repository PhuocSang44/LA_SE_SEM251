package org.minhtrinh.hcmuttssbackend.controller;

import java.util.List;
import lombok.RequiredArgsConstructor;
import org.minhtrinh.hcmuttssbackend.TssUserPrincipal;
import org.minhtrinh.hcmuttssbackend.dto.MaterialResponse;
import org.minhtrinh.hcmuttssbackend.service.MaterialService;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.util.StringUtils;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class MaterialController {

    private final MaterialService materialService;

    @GetMapping("/courses/{courseId}/materials")
    public ResponseEntity<List<MaterialResponse>> getMaterials(@PathVariable Long courseId) {
        return ResponseEntity.ok(materialService.getMaterialsByCourse(courseId));
    }

    @PostMapping("/courses/{courseId}/materials/add-external")
    public ResponseEntity<MaterialResponse> addExternalUrl(
            @PathVariable Long courseId,
            @RequestBody AddExternalUrlRequest request,
            @AuthenticationPrincipal TssUserPrincipal principal) {

        MaterialResponse response = materialService.addExternalUrl(
            courseId,
            principal.getOfficialID(),
            request.title,
            request.description,
            request.externalUrl
        );
        return ResponseEntity.ok(response);
    }

    @PostMapping(value = "/courses/{courseId}/materials/upload", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<MaterialResponse> uploadFile(
            @PathVariable Long courseId,
            @RequestParam("file") MultipartFile file,
            @RequestParam(value = "title", required = false) String title,
            @RequestParam(value = "description", required = false) String description,
            @AuthenticationPrincipal TssUserPrincipal principal) {

        MaterialResponse response = materialService.uploadFile(
            courseId,
            principal.getOfficialID(),
            title,
            description,
            file
        );
        return ResponseEntity.ok(response);
    }

    @PostMapping(value = "/classes/{classId}/materials/upload", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<MaterialResponse> uploadFileByClassId(
            @PathVariable Long classId,
            @RequestParam("file") MultipartFile file,
            @RequestParam(value = "title", required = false) String title,
            @RequestParam(value = "description", required = false) String description,
            @AuthenticationPrincipal TssUserPrincipal principal) {

        MaterialResponse response = materialService.uploadFileByClassId(
            classId,
            principal.getOfficialID(),
            title,
            description,
            file
        );
        return ResponseEntity.ok(response);
    }

    @PostMapping("/courses/{courseId}/materials/add-library-ref")
    public ResponseEntity<MaterialResponse> addLibraryReference(
            @PathVariable Long courseId,
            @RequestBody AddLibraryRefRequest request,
            @AuthenticationPrincipal TssUserPrincipal principal) {

        MaterialResponse response = materialService.addLibraryReference(
            courseId,
            principal.getOfficialID(),
            request.libraryItemId,
            request.title,
            request.description
        );
        return ResponseEntity.ok(response);
    }

    @GetMapping("/materials/{materialId}/download")
    public ResponseEntity<org.springframework.core.io.Resource> downloadFile(@PathVariable Long materialId) {
        MaterialService.FileDownloadResource resource = materialService.downloadFile(materialId);

        String contentType = StringUtils.hasText(resource.getContentType())
            ? resource.getContentType()
            : MediaType.APPLICATION_OCTET_STREAM_VALUE;

        return ResponseEntity.ok()
            .contentType(MediaType.parseMediaType(contentType))
            .header(HttpHeaders.CONTENT_DISPOSITION,
                "attachment; filename=\"" + (resource.getFileName() == null ? "material-file" : resource.getFileName()) + "\"")
            .body(resource.getResource());
    }

    @DeleteMapping("/materials/{materialId}")
    public ResponseEntity<Void> deleteMaterial(
            @PathVariable Long materialId,
            @AuthenticationPrincipal TssUserPrincipal principal) {
        materialService.deleteMaterial(materialId, principal.getOfficialID());
        return ResponseEntity.noContent().build();
    }

    public static record AddExternalUrlRequest(String title, String description, String externalUrl) {}
    public static record AddLibraryRefRequest(Long libraryItemId, String title, String description) {}
}

