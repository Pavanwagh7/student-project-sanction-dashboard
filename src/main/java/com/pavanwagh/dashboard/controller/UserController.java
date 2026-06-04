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
        String email = request.getEmail();
        if (email == null) return "Email field is Empty.";                            // Email null check
        email = email.trim();                                                         // trim()
        if (email.length() == 0) return "Email field is Empty, enter valid email.";   // Check after trim email length is 0 or not
        email = email.toLowerCase();                                                  // Convert to Lowercase
        if (userService.doesEmailExist(email)) { return "Account already exists,log in to the account"; }     // Check if email already exist

        userService.registration(
                email,
                request.getPassword(),
                request.getFullName(),
                request.getDepartment(),
                "STUDENT"
        );
        return "Account is opened,try logging in.";
    }
}
