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


    public boolean login (String email,String password) {
        User user = userRepository.findByEmail(email);

        if (user != null && password.equals(user.getPassword())) return true;
        return false;
    }
}
