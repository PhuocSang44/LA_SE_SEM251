package org.minhtrinh.hcmuttssbackend.client;

import java.util.Collections;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.minhtrinh.hcmuttssbackend.dto.library.LibraryItemResponse;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;
import org.springframework.web.reactive.function.client.WebClient;
import reactor.core.publisher.Mono;

@Component
@RequiredArgsConstructor
public class LibraryClient {

    private final @Qualifier("libraryWebClient") WebClient libraryWebClient;

    @Value("${library.base-url}")
    private String libraryBaseUrl;

    public List<LibraryItemResponse> searchItems(String query, String courseCode) {
        Mono<List<LibraryItemResponse>> responseMono = libraryWebClient.get()
            .uri(uriBuilder -> {
                var builder = uriBuilder.path("/api/library/items");
                if (StringUtils.hasText(query)) {
                    builder.queryParam("query", query);
                }
                if (StringUtils.hasText(courseCode)) {
                    builder.queryParam("courseCode", courseCode);
                }
                return builder.build();
            })
            .retrieve()
            .bodyToFlux(LibraryItemResponse.class)
            .collectList();

        return responseMono.blockOptional().orElse(Collections.emptyList());
    }

    public LibraryItemResponse getItem(Long id) {
        return libraryWebClient.get()
            .uri("/api/library/items/{id}", id)
            .retrieve()
            .bodyToMono(LibraryItemResponse.class)
            .blockOptional()
            .orElseThrow(() -> new IllegalStateException("Library item " + id + " not found"));
    }

    public String buildDownloadUrl(Long libraryItemId) {
        return String.format("%s/api/library/items/%d/download", libraryBaseUrl, libraryItemId);
    }
}
