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

    public byte[] exportInvestedAssetsPdf() {
        StringBuilder lines = new StringBuilder();
        lines.append("Reporte de bienes invertidos\n\n");
        for (Asset asset : assetRepository.findAll()) {
            lines.append(asset.getAssetCode())
                    .append(" - ")
                    .append(asset.getName())
                    .append(" - ")
                    .append(asset.getAcquisitionCost())
                    .append(" - ")
                    .append(asset.getStatus())
                    .append('\n');
        }
        return buildSimplePdf(lines.toString());
    }

    private byte[] buildSimplePdf(String text) {
        String escaped = text
                .replace("\\", "\\\\")
                .replace("(", "\\(")
                .replace(")", "\\)")
                .replace("\n", "\\n");

        String obj1 = "1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n";
        String obj2 = "2 0 obj\n<< /Type /Pages /Kids [3 0 R] /Count 1 >>\nendobj\n";
        String obj3 = "3 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Contents 4 0 R /Resources << /Font << /F1 5 0 R >> >> >>\nendobj\n";
        String stream = "BT /F1 10 Tf 40 760 Td (" + escaped + ") Tj ET";
        String obj4 = "4 0 obj\n<< /Length " + stream.length() + " >>\nstream\n" + stream + "\nendstream\nendobj\n";
        String obj5 = "5 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>\nendobj\n";

        StringBuilder pdf = new StringBuilder("%PDF-1.4\n");
        int o1 = pdf.length();
        pdf.append(obj1);
        int o2 = pdf.length();
        pdf.append(obj2);
        int o3 = pdf.length();
        pdf.append(obj3);
        int o4 = pdf.length();
        pdf.append(obj4);
        int o5 = pdf.length();
        pdf.append(obj5);
        int xref = pdf.length();

        pdf.append("xref\n0 6\n");
        pdf.append("0000000000 65535 f \n");
        pdf.append(String.format("%010d 00000 n \n", o1));
        pdf.append(String.format("%010d 00000 n \n", o2));
        pdf.append(String.format("%010d 00000 n \n", o3));
        pdf.append(String.format("%010d 00000 n \n", o4));
        pdf.append(String.format("%010d 00000 n \n", o5));
        pdf.append("trailer\n<< /Root 1 0 R /Size 6 >>\nstartxref\n");
        pdf.append(xref).append("\n%%EOF");

        return pdf.toString().getBytes(StandardCharsets.UTF_8);
    }
}
