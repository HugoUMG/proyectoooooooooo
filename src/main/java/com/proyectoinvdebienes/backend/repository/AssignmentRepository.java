package com.proyectoinvdebienes.backend.repository;

import com.proyectoinvdebienes.backend.domain.model.Assignment;
import com.proyectoinvdebienes.backend.domain.enums.AssignmentStatus;
import java.util.List;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;

public interface AssignmentRepository extends JpaRepository<Assignment, Long> {
    @EntityGraph(attributePaths = {"asset"})
    List<Assignment> findByEmployeeId(Long employeeId);
    List<Assignment> findByAssetId(Long assetId);

    @EntityGraph(attributePaths = {"asset"})
    List<Assignment> findByStatus(AssignmentStatus status);

    @Override
    @EntityGraph(attributePaths = {"asset"})
    List<Assignment> findAll();
}
