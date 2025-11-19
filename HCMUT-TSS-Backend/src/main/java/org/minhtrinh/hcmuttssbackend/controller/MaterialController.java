package org.minhtrinh.hcmuttssbackend.controller;

import jakarta.validation.Valid;
import java.net.URI;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.minhtrinh.hcmuttssbackend.TssUserPrincipal;
import org.minhtrinh.hcmuttssbackend.dto.LinkLibraryMaterialRequest;
import org.minhtrinh.hcmuttssbackend.dto.MaterialResponse;
import org.minhtrinh.hcmuttssbackend.dto.library.LibraryItemResponse;
import org.minhtrinh.hcmuttssbackend.service.MaterialService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
@Validated
public class MaterialController {

    private final MaterialService materialService;
    
    @GetMapping("/library/search")
    public List<LibraryItemResponse> searchLibrary(@RequestParam(value = "query", required = false) String query,
                                                   @RequestParam(value = "courseCode", required = false) String courseCode) {
        return materialService.searchLibrary(query, courseCode);
    }

    @PostMapping("/courses/{courseId}/materials/link-library")
    public MaterialResponse linkLibraryMaterial(@PathVariable Long courseId,
                                                @Valid @RequestBody LinkLibraryMaterialRequest request,
                                                Authentication authentication) {
        String ownerId = resolveOwnerId(authentication);
        return materialService.linkLibraryMaterial(courseId, request, ownerId);
    }

    @GetMapping("/materials/{materialId}/download")
    public ResponseEntity<Void> downloadMaterial(@PathVariable Long materialId) {
        URI redirect = materialService.buildLibraryDownloadRedirect(materialId);
        return ResponseEntity.status(HttpStatus.FOUND)
            .location(redirect)
            .build();
    }

    private String resolveOwnerId(Authentication authentication) {
        if (authentication != null && authentication.getPrincipal() instanceof TssUserPrincipal principal) {
            if (principal.getOfficialID() != null && !principal.getOfficialID().isBlank()) {
                return principal.getOfficialID();
            }
            return principal.getEmail();
        }
        return "system";
    }
}
