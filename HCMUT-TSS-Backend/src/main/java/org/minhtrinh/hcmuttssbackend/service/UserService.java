package org.minhtrinh.hcmuttssbackend.service;


import org.minhtrinh.hcmuttssbackend.TssUserPrincipal;
import org.minhtrinh.hcmuttssbackend.dto.RecvDatacoreDto;
import org.minhtrinh.hcmuttssbackend.entity.User;
import org.minhtrinh.hcmuttssbackend.mapper.FromDatacoreMapper;
import org.minhtrinh.hcmuttssbackend.mapper.ToFEUserMapper;
import org.minhtrinh.hcmuttssbackend.repository.UserRepository;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;

import java.util.Optional;


@Service
public class UserService {

    private final UserRepository userRepository;
    private final WebClient datacoreWebClient;
    private final FromDatacoreMapper fromDatacoreMapper;

    public UserService(UserRepository userRepository,
                       WebClient datacoreWebClient,
                       FromDatacoreMapper fromDatacoreMapper) {
        this.userRepository = userRepository;
        this.datacoreWebClient = datacoreWebClient;
        this.fromDatacoreMapper = fromDatacoreMapper;
    }

    public void getAndStoreUserFromDatacore(@AuthenticationPrincipal TssUserPrincipal principal){

        RecvDatacoreDto datacoreUser = datacoreWebClient.get()
                .uri("/users/by-email/{email}", principal.getEmail())
                .retrieve()
                .bodyToMono(RecvDatacoreDto.class).block();

        User user = fromDatacoreMapper.toUser(datacoreUser);
        userRepository.save(user);

    }

    public Optional<User> getUserFromDatabase(@AuthenticationPrincipal TssUserPrincipal principal){
        return userRepository.findByEmail(principal.getEmail());
    }
}
