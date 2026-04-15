package com.proyectoinvdebienes.backend.service;

import com.proyectoinvdebienes.backend.domain.enums.AssetStatus;
import com.proyectoinvdebienes.backend.domain.model.Asset;
import com.proyectoinvdebienes.backend.domain.model.PurchaseInvoice;
import com.proyectoinvdebienes.backend.repository.AssetRepository;
import com.proyectoinvdebienes.backend.repository.PurchaseInvoiceRepository;
import com.proyectoinvdebienes.backend.web.dto.CreateAssetRequest;
import java.util.List;
import java.util.UUID;
import org.springframework.stereotype.Service;

@Service
public class InventoryService {

    private final AssetRepository assetRepository;
    private final PurchaseInvoiceRepository purchaseInvoiceRepository;

    public InventoryService(AssetRepository assetRepository, PurchaseInvoiceRepository purchaseInvoiceRepository) {
        this.assetRepository = assetRepository;
        this.purchaseInvoiceRepository = purchaseInvoiceRepository;
    }

    public Asset registerAsset(CreateAssetRequest request) {
        PurchaseInvoice invoice = purchaseInvoiceRepository.findById(request.purchaseInvoiceId())
                .orElseThrow(() -> new NotFoundException("Factura de adquisición no encontrada"));

        Asset asset = new Asset();
        asset.setAssetCode(request.assetCode() == null || request.assetCode().isBlank() ? generateAssetCode() : request.assetCode());
        asset.setName(request.name());
        asset.setDescription(request.description());
        asset.setSerialNumber(request.serialNumber());
        asset.setAcquisitionDate(request.acquisitionDate());
        asset.setAcquisitionCost(request.acquisitionCost());
        asset.setStatus(AssetStatus.EN_ALMACEN);
        asset.setTagType(request.tagType());
        asset.setTagValue(request.tagValue());
        asset.setLocation(request.location());
        asset.setPurchaseInvoice(invoice);

        return assetRepository.save(asset);
    }

    public List<Asset> listAssets() {
        return assetRepository.findAll();
    }

    private String generateAssetCode() {
        return "ACT-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase();
    }
}
