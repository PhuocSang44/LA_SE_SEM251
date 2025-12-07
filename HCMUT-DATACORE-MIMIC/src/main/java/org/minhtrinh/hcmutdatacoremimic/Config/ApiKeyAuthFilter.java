package org.minhtrinh.hcmutdatacoremimic.Config;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.lang.NonNull;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.Collections;

@Component
public class ApiKeyAuthFilter extends OncePerRequestFilter {

    @Value("${app.internal-api-key:YourVeryStrongAndSecretKeyHere12345}")
    private String expectedApiKey;

    private static final String API_KEY_HEADER = "X-INTERNAL-API-KEY";

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    @NonNull HttpServletResponse response,
                                    @NonNull FilterChain filterChain)
            throws ServletException, IOException {

        String actualApiKey = request.getHeader(API_KEY_HEADER);

        if (expectedApiKey.equals(actualApiKey)) {
            // --- THIS IS THE NEW, IMPORTANT PART ---
            // The key is valid! We must create an "Authentication" object
            // to tell Spring Security that this request is legitimate.

            // We create a simple token representing the authenticated "internal service"
            var authentication = new UsernamePasswordAuthenticationToken(
                    "internal-service",  // This can be any string representing the "user"
                    null,                // No password needed
                    Collections.singletonList(new SimpleGrantedAuthority("ROLE_INTERNAL"))
            );

            // Set this authentication in the SecurityContext
            SecurityContextHolder.getContext().setAuthentication(authentication);
            // --- END OF NEW PART ---

            // Continue the request
            filterChain.doFilter(request, response);

        } else {
            // Key is invalid or missing, reject the request
            response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
            response.getWriter().write("Unauthorized: Invalid API Key");
        }
    }
}