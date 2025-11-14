//Vuong
package org.minhtrinh.hcmuttssbackend.controller;

import org.minhtrinh.hcmuttssbackend.TssUserPrincipal;
import org.minhtrinh.hcmuttssbackend.service.UserProfilePersistenceService;
import org.minhtrinh.hcmuttssbackend.service.UserService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/internal/user-sync")
public class UserSyncController {

    private final UserService userService;
    private final UserProfilePersistenceService profilePersistenceService;

    public UserSyncController(UserService userService, UserProfilePersistenceService profilePersistenceService) {
        this.userService = userService;
        this.profilePersistenceService = profilePersistenceService;
    }

    // base user table -> enrich subtype profile
    @PostMapping
    public ResponseEntity<String> sync(@AuthenticationPrincipal TssUserPrincipal principal) {
        userService.getAndStoreUserFromDatacore(principal);
        profilePersistenceService.ensureUserSubProfilePersisted(principal);
        return ResponseEntity.ok("User synced & profile done");
    }
}
