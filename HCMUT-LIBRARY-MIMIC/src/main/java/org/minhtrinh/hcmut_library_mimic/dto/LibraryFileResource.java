package org.minhtrinh.hcmut_library_mimic.dto;

import lombok.Builder;
import lombok.Value;
import org.springframework.core.io.Resource;

@Value
@Builder
public class LibraryFileResource {
    Resource resource;
    String contentType;
    String fileName;
}
