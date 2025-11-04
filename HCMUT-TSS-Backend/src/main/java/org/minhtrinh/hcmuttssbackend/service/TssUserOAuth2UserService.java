package org.minhtrinh.hcmuttssbackend.service;

import org.minhtrinh.hcmuttssbackend.TssUserPrincipal;
import org.minhtrinh.hcmuttssbackend.dto.RecvDatacoreDto;
import org.minhtrinh.hcmuttssbackend.repository.UserRepository;
import org.springframework.security.oauth2.client.oidc.userinfo.OidcUserRequest;
import org.springframework.security.oauth2.core.OAuth2Error;
import org.springframework.security.oauth2.core.oidc.OidcIdToken;
import org.springframework.security.oauth2.core.oidc.user.DefaultOidcUser;
import org.springframework.security.oauth2.core.oidc.user.OidcUser;
import org.springframework.security.oauth2.core.OAuth2AuthenticationException;
import org.springframework.security.oauth2.client.userinfo.OAuth2UserService;
import org.springframework.stereotype.Service;
import org.springframework.security.core.authority.AuthorityUtils;
import org.springframework.web.reactive.function.client.WebClient;


@Service
public class TssUserOAuth2UserService implements OAuth2UserService<OidcUserRequest, OidcUser> {

    private final WebClient datacoreWebClient;
    private final UserService userService;
    private final UserRepository userRepository;

    public TssUserOAuth2UserService(WebClient datacoreWebClient, UserService userService, UserRepository userRepository) {
        this.datacoreWebClient = datacoreWebClient;
        this.userService = userService;
        this.userRepository = userRepository;
    }

    @Override
    public OidcUser loadUser(OidcUserRequest userRequest) throws OAuth2AuthenticationException {

        // OidcUser oidcUser = new OidcUserService().loadUser(userRequest); // <-- do not use this line

        OidcIdToken idToken = userRequest.getIdToken();
        String userNameAttributeName = userRequest.getClientRegistration().getProviderDetails().getUserInfoEndpoint().getUserNameAttributeName();

        OidcUser oidcUser = new DefaultOidcUser(
                AuthorityUtils.createAuthorityList("ROLE_USER"),
                idToken,
                userNameAttributeName
        );

        String email = oidcUser.getAttribute("email");
        // 4. Call the external "datacore" API
        RecvDatacoreDto datacoreUser;
        try {
            datacoreUser = datacoreWebClient.get()
                    .uri("/users/by-email/{email}", email) // <-- Adjust this endpoint path
                    .retrieve()
                    .bodyToMono(RecvDatacoreDto.class).block();// .block() makes this synchronous call

        } catch (Exception e) {
            // 1. Create a specific OAuth2Error object
            // You can make up your own error code (e.g., "DATACORE_ERROR")
            OAuth2Error error = new OAuth2Error(
                    "DATACORE_ERROR",
                    "Failed to retrieve user details from datacore: " + e.getMessage(),
                    null
            );

            // 2. Pass the error and the original exception (e) as the cause
            throw new OAuth2AuthenticationException(error, e);
        }
        if (datacoreUser == null) {
            throw new OAuth2AuthenticationException("User not found in datacore system.");
        }



        // 5. Return your custom principal, now with BOTH OIDC and datacore data
        TssUserPrincipal principal = new TssUserPrincipal(oidcUser, datacoreUser);
        if(userRepository.findByEmail(principal.getEmail()).isEmpty())
            userService.getAndStoreUserFromDatacore(principal);

        return principal;
    }
}