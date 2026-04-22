package com.pavanwagh.dashboard.controller;


import com.pavanwagh.dashboard.entity.User;
import com.pavanwagh.dashboard.service.UserService;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/users")
public class UserController {
    private final UserService userService;

    //contructor
    public UserController (UserService userService) {
        this.userService = userService;
    }

//    @GetMapping("/email")
//    public User getUserByEmail (String email) {
//        return userService.getUserByEmail(email);
//    }

    @GetMapping("/login")
    public String login (@RequestParam String email,@RequestParam String password) {
        boolean isValid = userService.login (email,password);

        return isValid ? "Login Successfully" : "Invalid Email or Password";
    }
}
