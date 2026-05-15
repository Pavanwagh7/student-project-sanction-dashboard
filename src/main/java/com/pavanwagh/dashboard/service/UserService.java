//Business logic

package com.pavanwagh.dashboard.service;

import com.pavanwagh.dashboard.entity.User;
import com.pavanwagh.dashboard.repository.UserRepository;
import org.springframework.stereotype.Service;

@Service
public class UserService {
    private final UserRepository userRepository;

    // Contructor
    public UserService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

//    public User getUserByEmail(String email){
//        return userRepository.findByEmail(email);
//    }

    //Login dialogue.
    public boolean login (String email,String password) {
        User user = userRepository.findByEmail(email);

        if (user != null && password.equals(user.getPassword())) return true;
        return false;
    }

    //New Student registration dialogue(First check if the email provided already exist in database or not).
    public boolean doesEmailExist (String email) {
        if (userRepository.existsByEmail(email)){ return true;}
        return false;
    }
    public void registration (String email,String password,String fullName,String department,String role) {
        User newUser = new User(email,password,fullName,department,role);
        userRepository.save(newUser);
    }
}
