package com.proyectoinvdebienes.backend.web.controller;

import com.proyectoinvdebienes.backend.domain.model.Assignment;
import com.proyectoinvdebienes.backend.service.AssignmentService;
import java.util.List;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/employee")
public class EmployeeController {

    private final AssignmentService assignmentService;

    public EmployeeController(AssignmentService assignmentService) {
        this.assignmentService = assignmentService;
    }

    @GetMapping("/me/assignments")
    public List<Assignment> myAssignments(Authentication authentication) {
        return assignmentService.listByAuthenticatedUser(authentication.getName());
    }
}
