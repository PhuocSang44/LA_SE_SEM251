package org.minhtrinh.hcmuttssbackend.controller;

import org.minhtrinh.hcmuttssbackend.TssUserPrincipal;
import org.minhtrinh.hcmuttssbackend.dto.ToFEUserDto;
import org.minhtrinh.hcmuttssbackend.dto.UpdateStudentRequest;
import org.minhtrinh.hcmuttssbackend.entity.User;
import org.minhtrinh.hcmuttssbackend.mapper.ToFEUserMapper;
import org.minhtrinh.hcmuttssbackend.service.UserService;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

@RestController
public class UserController {

    private final UserService userService;
    private final ToFEUserMapper toFEUserMapper;

    public UserController(UserService userService, ToFEUserMapper toFEUserMapper) {
        this.userService = userService;
        this.toFEUserMapper = toFEUserMapper;
    }

    @GetMapping("/my/profile")
    public ToFEUserDto getProfileInfo(@AuthenticationPrincipal TssUserPrincipal principal) {

        return toFEUserMapper.fromDBtoFEUserDto(userService.getUserFromDatabase(principal));
    }

    @PutMapping("/my/student-profile")
    public void updateStudentProfile(@AuthenticationPrincipal TssUserPrincipal principal,
                                     @RequestBody UpdateStudentRequest request) {
        User user = userService.getUserFromDatabase(principal)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));
        userService.updateStudentProfile(user.getUserId(), request);
    }
}
