package org.minhtrinh.hcmutssomimic.service;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.Getter;
import org.springframework.core.io.ClassPathResource;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.AuthorityUtils;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;


import java.io.InputStream;
import java.util.Collection;
import java.util.List;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class JsonUserDetailsService implements UserDetailsService {

    private static final Logger logger = LoggerFactory.getLogger(JsonUserDetailsService.class);

    private final Map<String, UserDetails> userDetailsMap = new ConcurrentHashMap<>();

    @Getter
    static public class CustomUser extends User {
        private final String email;
        // NEW: Store the actual hash locally to prevent the superclass from clearing it
        private final String storedPasswordHash;

        public CustomUser(String login_name, String email, String password, Collection<? extends GrantedAuthority> authorities) {
            super(login_name, password, authorities);
            this.email = email;
            this.storedPasswordHash = password; // Store the hash immediately

            // DIAGNOSTIC CHECK
            if (password == null || password.isEmpty()) {
                logger.error("DIAGNOSTIC FAILED: CustomUser being created for {} with null/empty password!", login_name);
            } else if (!password.startsWith("$2a$")) {
                logger.error("DIAGNOSTIC FAILED: CustomUser for {} has non-BCrypt password: {}", login_name, password);
            }
        }

        // NEW: Override getPassword to return the guaranteed non-null hash
        @Override
        public String getPassword() {
            return this.storedPasswordHash;
        }

        public String getEmail() {
            return this.email;
        }
    }

    // Temporary Data Holder
    static class UserConfig {
        public String login_name;
        public String password;
        public String email;
    }

    public JsonUserDetailsService(ObjectMapper objectMapper) {
        try {
            ClassPathResource resource = new ClassPathResource("users.json");
            InputStream inputStream = resource.getInputStream();
            TypeReference<List<UserConfig>> typeReference = new TypeReference<>() {};
            List<UserConfig> userConfigs = objectMapper.readValue(inputStream, typeReference);

            List<GrantedAuthority> defaultAuthorities = AuthorityUtils.createAuthorityList("ROLE_USER");

            for (UserConfig config : userConfigs) {
                // Ensure the password hash is not null or empty before loading
                if (config.password == null || config.password.isEmpty()) {
                    logger.error("User {} has a null or empty password in users.json. Skipping.", config.login_name);
                    continue;
                }

                // Logging for verification (first 10 chars of hash)
                logger.warn("Loading User: {}, Stored Password Hash (now BCrypt): {}",
                        config.login_name,
                        config.password.substring(0, Math.min(config.password.length(), 10)) + "...");

                UserDetails user = new CustomUser(
                        config.login_name,
                        config.email,
                        config.password, // This is the BCrypt hash
                        defaultAuthorities
                );

                this.userDetailsMap.put(user.getUsername(), user);
            }

        } catch (Exception e) {
            throw new RuntimeException("Failed to load users from users.json", e);
        }
    }

    @Override
    public UserDetails loadUserByUsername(String login_name) throws UsernameNotFoundException {
        UserDetails user = this.userDetailsMap.get(login_name);
        if (user == null) {
            // Check if the input is empty/null, which can cause the subsequent empty password error
            if (login_name == null || login_name.trim().isEmpty()) {
                logger.error("Attempted login with null or empty username.");
            }
            throw new UsernameNotFoundException("User not found: " + login_name);
        }

        // ** DEBUG LINE: This will now show the protected password hash length **
        String password = user.getPassword();
        logger.debug("DIAGNOSTIC: Retrieved password for user {}. Length: {}",
                login_name, (password != null ? password.length() : "null"));
        // -----------------------------------------------------------------

        return user;
    }
}
