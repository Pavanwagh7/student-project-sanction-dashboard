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

        /** Basic email Validation */
        String email = request.getEmail();
        if (email == null) return "Email field is Empty.";                            // Email null check
        email = email.trim();                                                         // trim()
        if (email.length() == 0) return "Email field is Empty, enter valid email.";   // Check after trim email length is 0 or not
        email = email.toLowerCase();                                                  // Convert to Lowercase
        if (userService.doesEmailExist(email)) { return "Account already exists,log in to the account"; }     // Check if email already exist

        /** Basic Password Validation */
        String password = request.getPassword();
        if (password == null) return "Password field is empty.";                                 // Password null check
        if (password.length() < 6 || password.length() > 50) return "Enter the valid Password";  // Valid Password length check
        boolean containsOnlySpaces = true;                                                       // Check if Password has all charaters whitespace
        for (int i = 0;i < password.length();i++) {
            if (password.charAt(i) != ' ') {
                containsOnlySpaces = false ;
                break;
            }
        }
        if (containsOnlySpaces) return "Enter valid Password.";

        /** Basic Name Validation */
        String name = request.getFullName();
        if (name == null)  return "Name field is empty.";                       // Name null check
        name = name.trim();                                                     // trim() leading and trailing spaces
        if (name.length() < 2 || name.length() > 50) return "Enter valid Name"; // Check valid name length

        /** Department Validation */
        String department = request.getDepartment();
        if (department == null) return "Branch field is empty.";               // Department null check
        switch (department) {
            case "CSE":   department = "CSE"; break;
            case "DS":    department = "DS"; break;
            case "AIML":  department = "AIML"; break;
            case "AIDS":  department = "AIDS"; break;
            case "IT":    department = "IT"; break;
            case "ETC":   department = "ETC"; break;
            case "EE":    department = "EE"; break;
            case "MECH":  department = "MECH"; break;
            case "CIVIL": department = "CIVIL"; break;
            default: return "Enter valid Branch";
        }

        userService.registration(email, password, name, department, "STUDENT");
        return "Account is opened,try logging in.";
    }
}
