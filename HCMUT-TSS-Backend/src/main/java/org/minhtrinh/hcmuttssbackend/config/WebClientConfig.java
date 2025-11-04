package org.minhtrinh.hcmuttssbackend.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.reactive.function.client.WebClient;

@Configuration
public class WebClientConfig {

    @Value("${datacore.url}")
    private String datacoreUrl;

    @Value("${app.internal-api-key}")
    private String apiKey;

    @Bean
    public WebClient datacoreWebClient() {
        return WebClient.builder()
                .baseUrl(datacoreUrl)
                .defaultHeader("X-INTERNAL-API-KEY", apiKey)
                .build();
    }
}