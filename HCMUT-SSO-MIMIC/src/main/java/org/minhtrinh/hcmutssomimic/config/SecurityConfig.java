package org.minhtrinh.hcmutssomimic.config;

import com.nimbusds.jose.jwk.JWKSet;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.annotation.authentication.builders.AuthenticationManagerBuilder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.oauth2.core.oidc.endpoint.OidcParameterNames;
import org.springframework.security.oauth2.server.authorization.client.RegisteredClientRepository;
import org.springframework.security.oauth2.server.authorization.config.annotation.web.configurers.OAuth2AuthorizationServerConfigurer;

import com.nimbusds.jose.jwk.RSAKey;
import com.nimbusds.jose.jwk.source.ImmutableJWKSet;
import com.nimbusds.jose.jwk.source.JWKSource;
import com.nimbusds.jose.proc.SecurityContext;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.annotation.Order;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.oauth2.core.AuthorizationGrantType;
import org.springframework.security.oauth2.core.ClientAuthenticationMethod;
import org.springframework.security.oauth2.core.oidc.OidcScopes;
import org.springframework.security.oauth2.jwt.JwtDecoder;
import org.springframework.security.oauth2.jwt.NimbusJwtDecoder;
import org.springframework.security.oauth2.server.authorization.client.InMemoryRegisteredClientRepository;
import org.springframework.security.oauth2.server.authorization.client.RegisteredClient;
import org.springframework.security.oauth2.server.authorization.settings.AuthorizationServerSettings;
import org.springframework.security.oauth2.server.authorization.token.JwtEncodingContext;
import org.springframework.security.oauth2.server.authorization.token.OAuth2TokenCustomizer;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.LoginUrlAuthenticationEntryPoint;
import org.springframework.security.web.util.matcher.RequestMatcher;

import java.util.*;


import org.minhtrinh.hcmutssomimic.service.JsonUserDetailsService;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

    // 🎯 Inject issuer URL from configuration (ENV var > application-prod.properties > application.properties)
    @Value("${spring.security.oauth2.authorizationserver.issuer:http://localhost:10003}")
    private String issuerUri;

    // 🎯 Inject backend URL for redirect URIs
    @Value("${backend.url:http://localhost:10001}")
    private String backendUrl;

    // --- DEPENDENCIES (Needed for new AuthenticationManager bean) ---
    private final JsonUserDetailsService userDetailsService;
    private final PasswordEncoder passwordEncoder;

    // Auto-inject the user service and the password encoder (from PasswordConfig.java)
    public SecurityConfig(JsonUserDetailsService userDetailsService, PasswordEncoder passwordEncoder) {
        this.userDetailsService = userDetailsService;
        this.passwordEncoder = passwordEncoder;
    }
    // ----------------------------------------------------------------

    // *** NEW CRITICAL BEAN: Authentication Manager Configuration ***
    /**
     * Configures the global AuthenticationManager to use your custom UserDetailsService
     * and the DelegatingPasswordEncoder. This resolves the login/password error.
     */
    @Bean
    public AuthenticationManager authenticationManager(HttpSecurity http) throws Exception {
        AuthenticationManagerBuilder authenticationManagerBuilder =
                http.getSharedObject(AuthenticationManagerBuilder.class);

        // Explicitly link the UserDetailsService and PasswordEncoder
        // to the DaoAuthenticationProvider.
        authenticationManagerBuilder
                .userDetailsService(userDetailsService)
                .passwordEncoder(passwordEncoder);

        return authenticationManagerBuilder.build();
    }


    @Bean
    public AuthorizationServerSettings authorizationServerSettings() {
        return AuthorizationServerSettings.builder()
                .issuer(this.issuerUri) // 🎯 Use injected value instead of hardcoded localhost
                .build();
    }
    /*
    The defaults it provides for you are:
    Token Endpoint: /oauth2/token
    Authorization Endpoint: /oauth2/authorize
    JWK Set Endpoint (public keys): /oauth2/jwks
    OIDC Discovery Endpoint: /.well-known/openid-configuration
    */

    // In your SSO-MIMIC (Authorization Server) application
    @Bean
    @Order(1)
    public SecurityFilterChain authorizationServerSecurityFilterChain(HttpSecurity http) throws Exception {

        OAuth2AuthorizationServerConfigurer authorizationServerConfigurer = OAuth2AuthorizationServerConfigurer.authorizationServer();

        RequestMatcher endpointsMatcher = authorizationServerConfigurer.getEndpointsMatcher();

        http
                .securityMatcher(endpointsMatcher)
                .authorizeHttpRequests(authorize -> authorize
                        .anyRequest().authenticated()
                )
                .csrf(csrf -> csrf.ignoringRequestMatchers(endpointsMatcher))

                // 1. Maintain OIDC Configuration
                .with(authorizationServerConfigurer, authorizationServer -> {
                    // This line is enough to enable OIDC discovery and the /connect/endsession endpoint.
                    authorizationServer.oidc(Customizer.withDefaults());
                })

                .exceptionHandling(exceptions -> exceptions
                        .authenticationEntryPoint(new LoginUrlAuthenticationEntryPoint("/login"))
                )
                .oauth2ResourceServer(resourceServer -> resourceServer
                        .jwt(Customizer.withDefaults())
                );

        // This second block applies to ALL requests not matched by the first securityMatcher (i.e., /login, /logout, /)
        http
                // If the user is unauthenticated, redirect them to the login page
                .formLogin(Customizer.withDefaults())

                // This is the standard Spring Security Logout Filter, which handles session cleanup.
                // When your client redirects the user to /connect/endsession, this filter is often
                // what cleans up the local SSO session state.
                .logout(logout -> logout
                        .logoutUrl("/logout") // Standard Spring Security logout URL
                        .logoutSuccessUrl("/") // Redirect after internal session is destroyed
                        .invalidateHttpSession(true)
                        .deleteCookies("JSESSIONID") // <-- THIS DESTROYS THE SSO SESSION COOKIE
                );


        return http.build();
    }

    @Bean
    @Order(2)
    public SecurityFilterChain defaultSecurityFilterChain(HttpSecurity http) throws Exception {
        http
                // 1. This chain handles ALL OTHER requests
                .authorizeHttpRequests(authorize -> authorize
                        .requestMatchers("/error", "/login", "/home.html").permitAll()
                        .requestMatchers("/images/**", "/css/**", "/js/**").permitAll() // Allow static resources
                        .requestMatchers("/.well-known/openid-configuration").permitAll()
                        .requestMatchers("/.well-known/jwks.json").permitAll()
                        .anyRequest().authenticated()
                )
                .formLogin(formLogin ->
                        formLogin
                                .loginPage("/login")
                                .permitAll()
                );

        return http.build();
    }

    @Bean
    public OAuth2TokenCustomizer<JwtEncodingContext> tokenCustomizer() {
        return context -> {
            if (OidcParameterNames.ID_TOKEN.equals(context.getTokenType().getValue())) {

                // 1. Get the authenticated user object
                Object principal = context.getPrincipal().getPrincipal();
                if (principal instanceof JsonUserDetailsService.CustomUser user) {

                    // 3. Get the email and add it to the token - only return email to TSS
                    context.getClaims().claim("email", user.getEmail());
                }
            }
        };
    }



    @Bean
    public RegisteredClientRepository registeredClientRepository() {
        RegisteredClient lmsClient = RegisteredClient.withId(UUID.randomUUID().toString())
                .clientId("tss-backend")
                .clientSecret("$2a$10$8ycACeWRjUo0RyG1Cdvw3.y17eHBmNpxYp1aPXX0196/.LZHmbpm.")
                .clientAuthenticationMethod(ClientAuthenticationMethod.CLIENT_SECRET_BASIC)
                .authorizationGrantType(AuthorizationGrantType.AUTHORIZATION_CODE)
                .authorizationGrantType(AuthorizationGrantType.REFRESH_TOKEN)
                // 🎯 Use injected backend URL instead of hardcoded localhost
                .redirectUri(backendUrl + "/login/oauth2/code/sso-server")
                .postLogoutRedirectUri(backendUrl)
                .scope(OidcScopes.OPENID)
                .scope(OidcScopes.PROFILE)
                .scope(OidcScopes.EMAIL)
                .build();

        return new InMemoryRegisteredClientRepository(lmsClient);
    }

    @Bean
    public JWKSource<SecurityContext> jwkSource(RsaKeyProperties rsaKeys) {
        RSAKey rsaKey = new RSAKey.Builder(rsaKeys.publicKey())
                .privateKey(rsaKeys.privateKey())
                .keyID(UUID.randomUUID().toString())
                .build();
        JWKSet jwkSet = new JWKSet(rsaKey);
        return new ImmutableJWKSet<>(jwkSet);
    } //Default Encoder will be generated

    @Bean
    public JwtDecoder jwtDecoder(RsaKeyProperties rsaKeys) {
        return NimbusJwtDecoder.withPublicKey(rsaKeys.publicKey()).build();
    }


}

//    @Bean
//    @Order(1)
//    public SecurityFilterChain authorizationServerSecurityFilterChain(HttpSecurity http,
//                                                                      Function<OidcUserInfoAuthenticationContext, OidcUserInfo> userInfoMapper) throws Exception {
//
//        OAuth2AuthorizationServerConfigurer authorizationServerConfigurer = OAuth2AuthorizationServerConfigurer.authorizationServer();
//
//        RequestMatcher endpointsMatcher = authorizationServerConfigurer.getEndpointsMatcher();
//
//        http
//                .securityMatcher(endpointsMatcher)
//                .authorizeHttpRequests(authorize -> authorize
//                        .anyRequest().authenticated()
//                )
//                .csrf(csrf -> csrf.ignoringRequestMatchers(endpointsMatcher)) // cross origin block disable
//                .with(authorizationServerConfigurer, authorizationServer -> { // /userinfo endpoint not needed just ignored
//                    authorizationServer
//                            .oidc((oidc) -> oidc
//                                            .userInfoEndpoint((userInfoEndpoint) -> userInfoEndpoint
//                                                    .userInfoMapper(userInfoMapper) // <-- Explicitly set the mapper
//                                            )
//                            );
//                })
//                .exceptionHandling(exceptions -> exceptions
//                        .authenticationEntryPoint(new LoginUrlAuthenticationEntryPoint("/login"))
//                )
//                .oauth2ResourceServer(resourceServer -> resourceServer
//                        .jwt(Customizer.withDefaults())
//                );
//
//        return http.build();
//    }

//    @Bean
//    public Function<OidcUserInfoAuthenticationContext, OidcUserInfo> userInfoMapper() {
//
//        return (context) -> {
//            Object principal = context.getAuthentication().getPrincipal();
//
//            if (principal instanceof JsonUserDetailsService.CustomUser user) {
//                // This is the map that will be returned as JSON
//                Map<String, Object> claims = new HashMap<>();
//
//                claims.put("email", user.getEmail());
//                return new OidcUserInfo(claims);
//            }
//            return null;
//        };
//    }