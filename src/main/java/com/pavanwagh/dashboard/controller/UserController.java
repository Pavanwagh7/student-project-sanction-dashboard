package com.pavanwagh.dashboard.controller;


import com.pavanwagh.dashboard.dto.LoginRequest;
import com.pavanwagh.dashboard.dto.RegisterRequest;
import com.pavanwagh.dashboard.entity.User;
import com.pavanwagh.dashboard.service.UserService;
import jakarta.servlet.http.HttpSession;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
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


    @GetMapping("/me")
    public ResponseEntity<User> getCurrentUser(HttpSession session) {

        Long userId = (Long) session.getAttribute("userId");

        if (userId == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        return ResponseEntity.status(HttpStatus.FOUND).body(userService.getUserById(userId));
    }

    @PostMapping("/logout")
    public ResponseEntity<String>  logout(HttpSession session) {

        session.invalidate();

        return ResponseEntity.ok().body("Logged out successfully");
    }

    @PostMapping("/login")
    public ResponseEntity<String> login (@RequestBody LoginRequest request, HttpSession session) {
        Long userID = userService.login (request.getEmail(),request.getPassword());

        if (userID != null) {
            session.setAttribute("userId",userID);
            return ResponseEntity.ok().body( "Login Successfully,userID: " + session.getAttribute("userId"));
        }
        else{
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Invalid Email or Password");
        }
    }

    @PostMapping("/register")
    public ResponseEntity<String>  register (@RequestBody RegisterRequest request) {

        /** Basic email Validation */
        String email = request.getEmail();
        if (email == null) return ResponseEntity.badRequest().body("Email field is Empty.");                            // Email null check
        email = email.trim();                                                         // trim()
        email = email.toLowerCase();
        if (email.length() > "@gmail.com".length()){
            // Check the Existence of '@gmail.com' at the end of the String email
            if (!email.substring(email.length() - "@gmail.com".length(),email.length()).equals("@gmail.com")) return ResponseEntity.badRequest().body("Enter valid email.");

            // Now check if part before '@gmail.com' is valid or not
            for (int i = 0;i < email.length() - "@gmail.com".length();i++) {
                char ch = email.charAt(i);
                if(!((ch >= 97 && ch <= 122) || (ch >= 48 && ch <= 57) || ch == 46 || ch == 95)) {
                    return ResponseEntity.badRequest().body("Enter valid Email.");
                }
            }
        }
        else { return ResponseEntity.badRequest().body("Enter valid Email.");}
        if (userService.doesEmailExist(email)) { return ResponseEntity.status(HttpStatus.CONFLICT).body("Account already exists,log in to the account"); }     // Check if email already exist

        /** Basic Password Validation */
        String password = request.getPassword();
        if (password == null) return ResponseEntity.badRequest().body("Password field is empty.");                                 // Password null check
        if (password.length() < 6 || password.length() > 50) return ResponseEntity.badRequest().body("Enter the valid Password");  // Valid Password length check
        boolean containsOnlySpaces = true;                                                       // Check if Password has all charaters whitespace
        for (int i = 0;i < password.length();i++) {
            if (password.charAt(i) != ' ') {
                containsOnlySpaces = false ;
                break;
            }
        }
        if (containsOnlySpaces) return ResponseEntity.badRequest().body("Enter valid Password.");

        // Validate password complexity (At least one Special Character and a Digit)
        boolean hasSpecialCharacter = false;
        boolean hasDigit = false;
        for (int i = 0; i < password.length(); i++) {
            char ch = password.charAt(i);
            if (ch >= '0' && ch <= '9') { hasDigit = true; }
            else if (!(  (ch >= 'A' && ch <= 'Z')  ||  (ch >= 'a' && ch <= 'z')  ||  ch == ' '  )) {
                hasSpecialCharacter = true;
            }

            if (hasDigit && hasSpecialCharacter) {
                break;
            }
        }

        if (!hasSpecialCharacter) {
            return ResponseEntity.badRequest().body("Password must contain at least one special character.") ;
        }

        if (!hasDigit) {
            return ResponseEntity.badRequest().body("Password must contain at least one digit.") ;
        }


        /** Basic Name Validation */
        String name = request.getFullName();
        if (name == null)  return  ResponseEntity.badRequest().body("Name field is empty.");                       // Name null check
        name = name.trim();                                                     // trim() leading and trailing spaces
        if (name.length() < 2 || name.length() > 50) return ResponseEntity.badRequest().body("Enter valid Name."); // Check valid name length

        /** Department Validation */
        String department = request.getDepartment();
        if (department == null) return ResponseEntity.badRequest().body("Branch field is empty.");               // Department null check
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
            default: return ResponseEntity.badRequest().body("Enter valid Branch.");
        }

        userService.registration(email, password, name, department, "STUDENT");
        return ResponseEntity.status(HttpStatus.CREATED).body("Account is opened,try logging in.") ;
    }
}
