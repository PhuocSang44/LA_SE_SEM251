package org.minhtrinh.hcmuttssbackend.config;

import org.minhtrinh.hcmuttssbackend.service.TssUserOAuth2UserService;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.oauth2.client.registration.ClientRegistrationRepository;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.AuthenticationSuccessHandler;
import org.springframework.security.web.authentication.SimpleUrlAuthenticationSuccessHandler;
import org.springframework.http.HttpMethod;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.List;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

    @Value("${frontend.url}")
    private String frontendUrl;

    private final TssUserOAuth2UserService tssUserOAuth2UserService;

    public SecurityConfig(TssUserOAuth2UserService tssUserOAuth2UserService) {
        this.tssUserOAuth2UserService = tssUserOAuth2UserService;
    }

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http,
                                                   AuthenticationSuccessHandler authenticationSuccessHandler,
                                                   ClientRegistrationRepository clientRegistrationRepository) throws Exception {

        OidcLogoutSuccessHandler oidcLogoutSuccessHandler = new OidcLogoutSuccessHandler(clientRegistrationRepository);
        oidcLogoutSuccessHandler.setDefaultTargetUrl(frontendUrl);


        http
                .cors(Customizer.withDefaults()) // <-- Enable CORS
                .csrf(csrf -> csrf
                        // Bypass CSRF for auth logout and certain API endpoints used by the frontend during development.
                        // NOTE: In production, prefer sending CSRF tokens from the FRONTEND !!! 
                        // Ignore CSRF for all class endpoints (including PATCH/DELETE on /api/classes/{id})
                        .ignoringRequestMatchers("/auth/logout", "/api/classes/**", "/course-registrations/**", "/api/feedback/**", "/api/sessions/**", "/api/session-enrollments/**")
                )
                .authorizeHttpRequests(authorize -> authorize
                        // Allow the /auth/me endpoint (which we will protect)
                        // Allow the path that STARTS the flow (it must be public or handled by the filter)
                        .requestMatchers("/oauth2/authorization/**").permitAll()

                        // Allow the redirect URI from the SSO server
                        .requestMatchers("/login/oauth2/code/*").permitAll()

                        .requestMatchers("/auth/me").authenticated()
                        .requestMatchers("/error").permitAll()
                        .requestMatchers(HttpMethod.OPTIONS, "/**").permitAll()
                        // All other requests must be authenticated
                        .anyRequest().authenticated()
                )
                // This enables the OAuth2 login flow
                .oauth2Login(oauth2 -> oauth2
                        .userInfoEndpoint(userInfo -> userInfo //handle ID Token
                                .oidcUserService(tssUserOAuth2UserService))
                        .successHandler(authenticationSuccessHandler)
                )
                .logout(logout -> logout
                        .logoutUrl("/auth/logout")
                        .logoutSuccessHandler(oidcLogoutSuccessHandler)
                        .invalidateHttpSession(true)
                        .deleteCookies("SESSION")
                );

        return http.build();
    }

    // This bean redirects to the frontend after a successful SSO login
    @Bean
    public AuthenticationSuccessHandler authenticationSuccessHandler() {
        SimpleUrlAuthenticationSuccessHandler handler = new SimpleUrlAuthenticationSuccessHandler();
        handler.setDefaultTargetUrl(frontendUrl); // http://localhost:10004
        handler.setAlwaysUseDefaultTargetUrl(true);

        return handler;
    }

    // This bean redirects to the frontend after a successful logout
//    @Bean
//    public LogoutSuccessHandler logoutSuccessHandler() {
//        SimpleUrlLogoutSuccessHandler handler = new SimpleUrlLogoutSuccessHandler();
//        handler.setDefaultTargetUrl(frontendUrl); // http://localhost:10004
//        return handler;
//    }

    // This bean configures CORS to allow your frontend
    @Bean
    CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        // --- UPDATE THIS LINE ---
        configuration.setAllowedOrigins(List.of(frontendUrl));
        configuration.setAllowedMethods(List.of("GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"));
        configuration.setAllowedHeaders(List.of("*"));
        configuration.setAllowCredentials(true); // <-- CRITICAL

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }
}

