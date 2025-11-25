package org.minhtrinh.hcmuttssbackend.controller;

import lombok.AllArgsConstructor;
import org.minhtrinh.hcmuttssbackend.TssUserPrincipal;
import org.minhtrinh.hcmuttssbackend.dto.ToFEUserDto;
import org.minhtrinh.hcmuttssbackend.mapper.ToFEUserMapper;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/auth")
@AllArgsConstructor
public class AuthController {
    private final ToFEUserMapper toFEUserMapper;

    @GetMapping("/me")
    public ResponseEntity<ToFEUserDto> getCurrentUser(@AuthenticationPrincipal TssUserPrincipal principal) {

        if (principal == null) {
            return ResponseEntity.status(401).build();
        }

        return ResponseEntity.ok(toFEUserMapper.toFEUserDtoMapper(principal.getDatacoreUser() ) );
    }
}