package org.minhtrinh.hcmutssomimic.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;

@Configuration
public class PasswordConfig {

    @Bean
    public PasswordEncoder passwordEncoder() {
        // We use BCryptPasswordEncoder directly because the passwords in the
        // JSON file are stored as raw BCrypt hashes (no {bcrypt} prefix).
        return new BCryptPasswordEncoder();
    }
}