package org.minhtrinh.hcmut_library_mimic.service;

import java.util.List;
import org.minhtrinh.hcmut_library_mimic.dto.LibraryFileResource;
import org.minhtrinh.hcmut_library_mimic.dto.LibraryItemResponse;
import org.springframework.web.multipart.MultipartFile;

public interface LibraryService {

    List<LibraryItemResponse> searchItems(String query, String courseCode, String tag);

    LibraryItemResponse getItem(Long id);

    LibraryItemResponse uploadItem(String title,
                                   String description,
                                   String courseCode,
                                   String tags,
                                   MultipartFile file,
                                   String visibility);

    LibraryFileResource downloadItem(Long id);
}
