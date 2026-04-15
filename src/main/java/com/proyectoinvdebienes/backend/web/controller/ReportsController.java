package com.proyectoinvdebienes.backend.web.controller;

import com.proyectoinvdebienes.backend.domain.model.Asset;
import com.proyectoinvdebienes.backend.domain.model.Assignment;
import com.proyectoinvdebienes.backend.service.ReportService;
import java.math.BigDecimal;
import java.util.List;
import java.util.Map;
import org.springframework.http.ContentDisposition;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/reports")
public class ReportsController {

    private final ReportService reportService;

    public ReportsController(ReportService reportService) {
        this.reportService = reportService;
    }

    @GetMapping("/invested-assets/summary")
    public Map<String, BigDecimal> investedAssetsSummary() {
        return Map.of("totalInvested", reportService.totalInvestedAssets());
    }

    @GetMapping("/employee/{employeeId}")
    public List<Assignment> employeeReport(@PathVariable Long employeeId) {
        return reportService.assignmentsByEmployee(employeeId);
    }

    @GetMapping("/upcoming-disposals")
    public List<Asset> upcomingDisposals() {
        return reportService.upcomingDisposals();
    }

    @GetMapping("/invested-assets/export")
    public ResponseEntity<byte[]> exportInvestedAssets(@RequestParam(defaultValue = "excel") String format) {
        byte[] payload = reportService.exportInvestedAssetsCsv();
        String fileName = "reporte-bienes-invertidos." + ("pdf".equalsIgnoreCase(format) ? "pdf" : "csv");

        HttpHeaders headers = new HttpHeaders();
        headers.setContentDisposition(ContentDisposition.attachment().filename(fileName).build());
        headers.setContentType("pdf".equalsIgnoreCase(format) ? MediaType.APPLICATION_PDF : MediaType.parseMediaType("text/csv"));

        return ResponseEntity.ok().headers(headers).body(payload);
    }
}
