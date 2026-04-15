package com.proyectoinvdebienes.backend.service;

import com.proyectoinvdebienes.backend.domain.enums.AssetStatus;
import com.proyectoinvdebienes.backend.domain.model.Asset;
import com.proyectoinvdebienes.backend.domain.model.Assignment;
import com.proyectoinvdebienes.backend.repository.AssetRepository;
import com.proyectoinvdebienes.backend.repository.AssignmentRepository;
import java.math.BigDecimal;
import java.nio.charset.StandardCharsets;
import java.util.List;
import org.springframework.stereotype.Service;

@Service
public class ReportService {

    private final AssetRepository assetRepository;
    private final AssignmentRepository assignmentRepository;

    public ReportService(AssetRepository assetRepository, AssignmentRepository assignmentRepository) {
        this.assetRepository = assetRepository;
        this.assignmentRepository = assignmentRepository;
    }

    public BigDecimal totalInvestedAssets() {
        return assetRepository.findAll().stream()
                .map(Asset::getAcquisitionCost)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
    }

    public List<Assignment> assignmentsByEmployee(Long employeeId) {
        return assignmentRepository.findByEmployeeId(employeeId);
    }

    public List<Asset> upcomingDisposals() {
        return assetRepository.findAll().stream()
                .filter(asset -> asset.getStatus() != AssetStatus.DADO_DE_BAJA)
                .toList();
    }

    public byte[] exportInvestedAssetsCsv() {
        StringBuilder csv = new StringBuilder("assetCode,name,cost,status\n");
        for (Asset asset : assetRepository.findAll()) {
            csv.append(asset.getAssetCode()).append(',')
                    .append(asset.getName()).append(',')
                    .append(asset.getAcquisitionCost()).append(',')
                    .append(asset.getStatus()).append('\n');
        }
        return csv.toString().getBytes(StandardCharsets.UTF_8);
    }
}
