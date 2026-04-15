package com.proyectoinvdebienes.backend.service;

import com.proyectoinvdebienes.backend.domain.enums.AssetStatus;
import com.proyectoinvdebienes.backend.domain.enums.AssignmentStatus;
import com.proyectoinvdebienes.backend.domain.model.Asset;
import com.proyectoinvdebienes.backend.domain.model.Assignment;
import com.proyectoinvdebienes.backend.domain.model.Employee;
import com.proyectoinvdebienes.backend.repository.AssetRepository;
import com.proyectoinvdebienes.backend.repository.AssignmentRepository;
import com.proyectoinvdebienes.backend.repository.EmployeeRepository;
import com.proyectoinvdebienes.backend.web.dto.CreateAssignmentRequest;
import java.time.LocalDate;
import java.util.List;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class AssignmentService {

    private final AssignmentRepository assignmentRepository;
    private final AssetRepository assetRepository;
    private final EmployeeRepository employeeRepository;

    public AssignmentService(
            AssignmentRepository assignmentRepository,
            AssetRepository assetRepository,
            EmployeeRepository employeeRepository
    ) {
        this.assignmentRepository = assignmentRepository;
        this.assetRepository = assetRepository;
        this.employeeRepository = employeeRepository;
    }

    @Transactional
    public Assignment assignAsset(CreateAssignmentRequest request) {
        Asset asset = assetRepository.findById(request.assetId())
                .orElseThrow(() -> new NotFoundException("Activo no encontrado"));

        if (asset.getStatus() == AssetStatus.DADO_DE_BAJA) {
            throw new BusinessException("Los activos dados de baja no pueden reasignarse");
        }

        if (asset.getStatus() == AssetStatus.ASIGNADO) {
            throw new BusinessException("El activo ya está asignado");
        }

        Employee employee = employeeRepository.findById(request.employeeId())
                .orElseThrow(() -> new NotFoundException("Empleado no encontrado"));

        Assignment assignment = new Assignment();
        assignment.setAsset(asset);
        assignment.setEmployee(employee);
        assignment.setAssignedAt(request.assignedAt());
        assignment.setExpectedReturnAt(request.expectedReturnAt());
        assignment.setStatus(AssignmentStatus.ACTIVA);
        assignment.setDigitalSignature(request.digitalSignature());
        assignment.setReceiptConfirmation(request.receiptConfirmation());

        asset.setCurrentCustodian(employee);
        asset.setStatus(AssetStatus.ASIGNADO);
        assetRepository.save(asset);

        return assignmentRepository.save(assignment);
    }

    @Transactional
    public Assignment returnAssignment(Long assignmentId) {
        Assignment assignment = assignmentRepository.findById(assignmentId)
                .orElseThrow(() -> new NotFoundException("Asignación no encontrada"));

        assignment.setStatus(AssignmentStatus.DEVUELTA);
        assignment.setReturnedAt(LocalDate.now());

        Asset asset = assignment.getAsset();
        asset.setStatus(AssetStatus.EN_ALMACEN);
        asset.setCurrentCustodian(null);
        assetRepository.save(asset);

        return assignmentRepository.save(assignment);
    }

    public List<Assignment> listByEmployee(Long employeeId) {
        return assignmentRepository.findByEmployeeId(employeeId);
    }
}
