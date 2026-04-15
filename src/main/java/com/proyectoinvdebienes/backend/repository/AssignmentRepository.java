package com.proyectoinvdebienes.backend.repository;

import com.proyectoinvdebienes.backend.domain.model.Assignment;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface AssignmentRepository extends JpaRepository<Assignment, Long> {
    List<Assignment> findByEmployeeId(Long employeeId);
    List<Assignment> findByAssetId(Long assetId);
}
