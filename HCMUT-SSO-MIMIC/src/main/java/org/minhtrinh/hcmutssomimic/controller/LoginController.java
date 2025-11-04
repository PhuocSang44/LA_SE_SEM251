package org.minhtrinh.hcmutssomimic.controller;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;


@Controller
public class LoginController {

    @GetMapping("/")
    public String goHome() {
        return "redirect:/home.html";
    }

    @GetMapping("/login")
    public String loginPage() {
        return "login";
    }

}
