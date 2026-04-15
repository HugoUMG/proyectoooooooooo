package com.proyectoinvdebienes.backend.web.controller;

import com.proyectoinvdebienes.backend.domain.model.PurchaseInvoice;
import com.proyectoinvdebienes.backend.service.AcquisitionService;
import com.proyectoinvdebienes.backend.web.dto.CreatePurchaseInvoiceRequest;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/acquisitions")
public class AcquisitionController {

    private final AcquisitionService acquisitionService;

    public AcquisitionController(AcquisitionService acquisitionService) {
        this.acquisitionService = acquisitionService;
    }

    @PostMapping("/invoices")
    @ResponseStatus(HttpStatus.CREATED)
    public PurchaseInvoice createInvoice(@Valid @RequestBody CreatePurchaseInvoiceRequest request) {
        return acquisitionService.createInvoice(request);
    }
}
