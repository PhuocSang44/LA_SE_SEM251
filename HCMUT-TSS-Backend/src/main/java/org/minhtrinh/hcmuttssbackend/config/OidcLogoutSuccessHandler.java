package org.minhtrinh.hcmuttssbackend.config;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.oauth2.client.authentication.OAuth2AuthenticationToken;
import org.springframework.security.oauth2.client.registration.ClientRegistration;
import org.springframework.security.oauth2.client.registration.ClientRegistrationRepository;
import org.springframework.security.oauth2.core.oidc.user.OidcUser;
import org.springframework.security.web.authentication.logout.SimpleUrlLogoutSuccessHandler;
import org.springframework.security.web.authentication.logout.CookieClearingLogoutHandler;
import org.springframework.web.util.UriComponentsBuilder;

import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;

public class OidcLogoutSuccessHandler extends SimpleUrlLogoutSuccessHandler {

    private static final Logger logger = LoggerFactory.getLogger(OidcLogoutSuccessHandler.class);
    private final ClientRegistrationRepository clientRegistrationRepository;
    private final CookieClearingLogoutHandler cookieClearingLogoutHandler;

    public OidcLogoutSuccessHandler(ClientRegistrationRepository clientRegistrationRepository) {
        this.clientRegistrationRepository = clientRegistrationRepository;
        this.cookieClearingLogoutHandler = new CookieClearingLogoutHandler("JSESSIONID", "SESSION");
    }

    @Override
    public void onLogoutSuccess(HttpServletRequest request, HttpServletResponse response, Authentication authentication)
            throws IOException, ServletException {

        // --- 1. DATA RETRIEVAL ---
        String clientRegistrationId;
        String idTokenHint = null;
        String endSessionEndpoint = null;
        String baseUrl; // Defined here for logging scope

        if (authentication instanceof OAuth2AuthenticationToken oauth2Token) {

            clientRegistrationId = oauth2Token.getAuthorizedClientRegistrationId();

            ClientRegistration clientRegistration = clientRegistrationRepository.findByRegistrationId(clientRegistrationId);

            if (clientRegistration != null && clientRegistration.getProviderDetails().getConfigurationMetadata() != null) {
                endSessionEndpoint = (String) clientRegistration.getProviderDetails().getConfigurationMetadata()
                        .get("end_session_endpoint");
            }

            if (oauth2Token.getPrincipal() instanceof OidcUser oidcUser && oidcUser.getIdToken() != null) {
                idTokenHint = oidcUser.getIdToken().getTokenValue();
            }
        }

        // Construct the Client App's base URL (This is the URI we must register on the SSO server)
        baseUrl = UriComponentsBuilder.fromUriString(request.getRequestURL().toString())
                .replacePath(request.getContextPath()).build().toUriString();

        // ** CRITICAL DEBUG LOGGING **
        logger.warn("OIDC Logout Debug: Generated base URL for post_logout_redirect_uri: {}", baseUrl);

        // --- 2. EXECUTE LOCAL CLEANUP ---
        if (request.getSession(false) != null) {
            request.getSession(false).invalidate();
        }
        SecurityContextHolder.clearContext();
        cookieClearingLogoutHandler.logout(request, response, authentication);

        // --- 3. DECISION: OIDC LOGOUT vs. FALLBACK ---

        if (endSessionEndpoint != null && idTokenHint != null) {
            logger.debug("OIDC Logout Success: Initiating redirect to End Session Endpoint.");

            String logoutRedirectUrl = UriComponentsBuilder.fromUriString(endSessionEndpoint)
                    .queryParam("post_logout_redirect_uri", baseUrl)
                    .queryParam("id_token_hint", idTokenHint)
                    .toUriString();

            this.getRedirectStrategy().sendRedirect(request, response, logoutRedirectUrl);
            return;
        }

        // --- 4. FALLBACK ---
        logger.warn("OIDC Logout failed to retrieve necessary components. Falling back to local redirect. Status: EndPoint: {}, ID Token: {}",
                endSessionEndpoint != null, idTokenHint != null);

        super.onLogoutSuccess(request, response, authentication);
    }
}
