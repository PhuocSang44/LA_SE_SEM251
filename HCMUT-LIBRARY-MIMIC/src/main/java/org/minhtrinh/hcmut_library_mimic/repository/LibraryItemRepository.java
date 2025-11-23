package org.minhtrinh.hcmut_library_mimic.repository;

import java.util.List;
import java.util.Optional;
import org.minhtrinh.hcmut_library_mimic.entity.LibraryItem;
import org.springframework.data.jpa.repository.JpaRepository;

public interface LibraryItemRepository extends JpaRepository<LibraryItem, Long> {

    List<LibraryItem> findByDeletedFalseAndTitleContainingIgnoreCase(String keyword);

    Optional<LibraryItem> findByIdAndDeletedFalse(Long id);

    List<LibraryItem> findTop50ByDeletedFalseOrderByCreatedAtDesc();
}
