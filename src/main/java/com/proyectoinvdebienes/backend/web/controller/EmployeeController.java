package com.proyectoinvdebienes.backend.web.controller;

import com.proyectoinvdebienes.backend.domain.model.Assignment;
import com.proyectoinvdebienes.backend.service.AssignmentService;
import com.proyectoinvdebienes.backend.service.BusinessException;
import com.proyectoinvdebienes.backend.service.NotFoundException;
import com.proyectoinvdebienes.backend.service.UserAccountService;
import java.util.List;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/employee")
public class EmployeeController {

    private final AssignmentService assignmentService;
    private final UserAccountService userAccountService;

    public EmployeeController(AssignmentService assignmentService, UserAccountService userAccountService) {
        this.assignmentService = assignmentService;
        this.userAccountService = userAccountService;
    }

    @GetMapping("/me/assignments")
    public List<Assignment> myAssignments(Authentication authentication) {
        Long employeeId = userAccountService.findByUsername(authentication.getName())
                .map(user -> user.getEmployee() != null ? user.getEmployee().getId() : null)
                .orElseThrow(() -> new NotFoundException("Usuario autenticado no encontrado"));

        if (employeeId == null) {
            throw new BusinessException("La cuenta no está vinculada a un empleado.");
        }

        return assignmentService.listByEmployee(employeeId);
    }
}
