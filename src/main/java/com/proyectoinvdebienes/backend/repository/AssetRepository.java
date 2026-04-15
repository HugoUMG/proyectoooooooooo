package com.proyectoinvdebienes.backend.repository;

import com.proyectoinvdebienes.backend.domain.model.Asset;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface AssetRepository extends JpaRepository<Asset, Long> {
    Optional<Asset> findByAssetCode(String assetCode);
    long countByCurrentCustodianId(Long employeeId);
}
