package com.pavanwagh.dashboard.config;

import com.pavanwagh.dashboard.entity.Coordinator;
import com.pavanwagh.dashboard.entity.Guide;
import com.pavanwagh.dashboard.entity.User;
import com.pavanwagh.dashboard.enums.RoleEnum;
import com.pavanwagh.dashboard.repository.CoordinatorRepository;
import com.pavanwagh.dashboard.repository.GuideRepository;
import com.pavanwagh.dashboard.repository.UserRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Component;

@Component
public class DataSeeder implements CommandLineRunner {
    private final UserRepository userRepository;
    private final CoordinatorRepository coordinatorRepository;
    private final GuideRepository guideRepository;

    public DataSeeder(UserRepository userRepository, CoordinatorRepository coordinatorRepository, GuideRepository guideRepository) {
        this.userRepository = userRepository;
        this.coordinatorRepository = coordinatorRepository;
        this.guideRepository = guideRepository;
    }

    @Override
    public void run(String... args) throws Exception {
        BCryptPasswordEncoder encoder = new BCryptPasswordEncoder();

        // ELECTRONICS & TELECOMMUNICATION (ETC)
        createCoordinatorIfMissing("coordinator.etc@rcpit.edu", "Prof. Prashant Patil", "ETC", "Coordinator@123", encoder);
        createGuideIfMissing("sharma.etc@rcpit.edu", "Prof. Amit Sharma", "ETC", "Guide@123", encoder);
        createGuideIfMissing("patil.etc@rcpit.edu", "Prof. Sunita Patil", "ETC", "Guide@123", encoder);


        // COMPUTER ENGINEERING (CSE)
        createCoordinatorIfMissing("coordinator.cse@rcpit.edu", "Prof. Anil Joshi", "CSE", "Coordinator@123", encoder);
        createGuideIfMissing("shinde.cse@rcpit.edu", "Prof. Vikas Shinde", "CSE", "Guide@123", encoder);


        // MECHANICAL ENGINEERING (MECH)
        createCoordinatorIfMissing("coordinator.mech@rcpit.edu", "Prof. Sunil Pawar", "MECH", "Coordinator@123", encoder);
        createGuideIfMissing("verma.mech@rcpit.edu", "Prof. Vikram Verma", "MECH", "Guide@123", encoder);
    }


    // HELPER: Creates a Coordinator if their email does not already exist
    private void createCoordinatorIfMissing(String email, String name, String dept, String rawPassword, BCryptPasswordEncoder encoder) {
        if (!userRepository.existsByEmail(email)) {
            User user = new User(email, encoder.encode(rawPassword), name, dept, RoleEnum.COORDINATOR);
            userRepository.save(user);

            Coordinator coordinator = new Coordinator(user.getId());
            coordinatorRepository.save(coordinator);

            System.out.println(">>> SEED: " + dept + " Coordinator created: " + email);
        }
    }


    // HELPER: Creates a Guide if their email does not already exist
    private void createGuideIfMissing(String email, String name, String dept, String rawPassword, BCryptPasswordEncoder encoder) {
        if (!userRepository.existsByEmail(email)) {
            User user = new User(email, encoder.encode(rawPassword), name, dept, RoleEnum.GUIDE);
            userRepository.save(user);

            Guide guide = new Guide(user.getId());
            guideRepository.save(guide);

            System.out.println(">>> SEED: " + dept + " Guide created: " + email);
        }
    }
}