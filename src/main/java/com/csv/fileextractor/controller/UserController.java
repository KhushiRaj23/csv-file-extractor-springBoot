package com.csv.fileextractor.controller;

import com.csv.fileextractor.model.User;
import com.csv.fileextractor.repository.CSVDataExtractorRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/users")
@CrossOrigin(origins = "*")
public class UserController {

    @Autowired
    private CSVDataExtractorRepository userRepository;

    // Upload users from parsed CSV (JSON array of users)
    @PostMapping("/upload-csv")
    public ResponseEntity<Map<String, Object>> uploadUsersFromCSV(@RequestBody List<User> users) {
        Map<String, Object> response = new HashMap<>();
        int added = 0;
        int duplicates = 0;
        for (User user : users) {
            if (user.getEmail() == null || user.getEmail().isEmpty()) {
                continue; // skip users with no email
            }
            if (userRepository.findAll().stream().anyMatch(u -> u.getEmail().equalsIgnoreCase(user.getEmail()))) {
                duplicates++;
                continue; // skip duplicates by email
            }
            userRepository.save(user);
            added++;
        }
        response.put("success", true);
        response.put("added", added);
        response.put("duplicates", duplicates);
        response.put("message", String.format("Added %d users, %d duplicates skipped (by email)", added, duplicates));
        return ResponseEntity.ok(response);
    }

    // Get user by ID
    @GetMapping("/{id}")
    public ResponseEntity<?> getUserById(@PathVariable Long id) {
        Optional<User> user = userRepository.findById(id);
        if (user.isPresent()) {
            return ResponseEntity.ok(user.get());
        } else {
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", "User not found");
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(response);
        }
    }
} 