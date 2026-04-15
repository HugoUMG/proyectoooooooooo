package com.proyectoinvdebienes.backend.service;

import com.proyectoinvdebienes.backend.domain.model.BudgetLine;
import com.proyectoinvdebienes.backend.domain.model.PurchaseInvoice;
import com.proyectoinvdebienes.backend.domain.model.Supplier;
import com.proyectoinvdebienes.backend.repository.BudgetLineRepository;
import com.proyectoinvdebienes.backend.repository.PurchaseInvoiceRepository;
import com.proyectoinvdebienes.backend.repository.SupplierRepository;
import com.proyectoinvdebienes.backend.web.dto.CreatePurchaseInvoiceRequest;
import org.springframework.stereotype.Service;

@Service
public class AcquisitionService {

    private final PurchaseInvoiceRepository purchaseInvoiceRepository;
    private final SupplierRepository supplierRepository;
    private final BudgetLineRepository budgetLineRepository;

    public AcquisitionService(
            PurchaseInvoiceRepository purchaseInvoiceRepository,
            SupplierRepository supplierRepository,
            BudgetLineRepository budgetLineRepository
    ) {
        this.purchaseInvoiceRepository = purchaseInvoiceRepository;
        this.supplierRepository = supplierRepository;
        this.budgetLineRepository = budgetLineRepository;
    }

    public PurchaseInvoice createInvoice(CreatePurchaseInvoiceRequest request) {
        if (purchaseInvoiceRepository.findByInvoiceNumber(request.invoiceNumber()).isPresent()) {
            throw new BusinessException("La factura ya existe: " + request.invoiceNumber());
        }

        Supplier supplier = supplierRepository.findById(request.supplierId())
                .orElseThrow(() -> new NotFoundException("Proveedor no encontrado"));

        BudgetLine budgetLine = budgetLineRepository.findById(request.budgetLineId())
                .orElseThrow(() -> new NotFoundException("Partida presupuestaria no encontrada"));

        PurchaseInvoice invoice = new PurchaseInvoice();
        invoice.setInvoiceNumber(request.invoiceNumber());
        invoice.setInvoiceDate(request.invoiceDate());
        invoice.setTotalAmount(request.totalAmount());
        invoice.setSupplier(supplier);
        invoice.setBudgetLine(budgetLine);
        invoice.setNotes(request.notes());

        return purchaseInvoiceRepository.save(invoice);
    }
}
