package org.minhtrinh.hcmuttssbackend.dto;

import jakarta.validation.constraints.NotNull;

public record LinkLibraryMaterialRequest(
    @NotNull Long libraryItemId,
    String title,
    String description
) {}
