package org.minhtrinh.hcmutdatacoremimic.Controller;

import org.minhtrinh.hcmutdatacoremimic.Dto.ToTssUserDto;
import org.minhtrinh.hcmutdatacoremimic.Mapper.ToTssUserMapper;
import org.minhtrinh.hcmutdatacoremimic.Model.CustomUser;
import org.minhtrinh.hcmutdatacoremimic.Service.DatacoreService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class DatacoreController {
    private final DatacoreService datacoreService;
    private final ToTssUserMapper toTssUserMapper;

    @Autowired
    public DatacoreController(DatacoreService datacoreService, ToTssUserMapper toTssUserMapper) {
        this.datacoreService = datacoreService;
        this.toTssUserMapper = toTssUserMapper;
    }

    @GetMapping("/users/by-email/{email}")
    public ResponseEntity<ToTssUserDto> getUserByEmail(@PathVariable String email) {

        CustomUser userEntity = datacoreService.getUserByEmail(email);

        // Handle case where user is not found
        if (userEntity == null) {
            // This will send a 404 Not Found, which your WebClient will see as an error
            return ResponseEntity.notFound().build();
        }

        return ResponseEntity.ok(toTssUserMapper.toTssUserDtoMapper(userEntity));
    }
}
