package org.minhtrinh.hcmuttssbackend.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;

public record AddExternalMaterialRequest(
    @NotBlank String title,
    String description,
    @NotBlank
    @Pattern(regexp = "^https?://.*", message = "Must be a valid HTTP/HTTPS URL")
    String externalUrl
) {}

