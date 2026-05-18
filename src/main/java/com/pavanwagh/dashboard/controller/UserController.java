package com.pavanwagh.dashboard.controller;


import com.pavanwagh.dashboard.dto.LoginRequest;
import com.pavanwagh.dashboard.dto.RegisterRequest;
import com.pavanwagh.dashboard.entity.User;
import com.pavanwagh.dashboard.service.UserService;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/users")
public class UserController {
    private final UserService userService;

    //constructor
    public UserController (UserService userService) {
        this.userService = userService;
    }

//    @GetMapping("/email")
//    public User getUserByEmail (String email) {
//        return userService.getUserByEmail(email);
//    }

    @PostMapping("/login")
    public String login (@RequestBody LoginRequest request) {
        boolean isValid = userService.login (request.getEmail(),request.getPassword());

        return isValid ? "Login Successfully" : "Invalid Email or Password";
    }

    @PostMapping("/register")
    public String register (@RequestBody RegisterRequest request) {
        if (userService.doesEmailExist(request.getEmail())) { return "Account already exists,log in to the account"; }

        userService.registration(
                request.getEmail(),
                request.getPassword(),
                request.getFullName(),
                request.getDepartment(),
                "STUDENT"
        );
        return "Account is opened,try logging in.";
    }
}
