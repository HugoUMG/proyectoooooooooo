package com.proyectoinvdebienes.backend.web.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.time.LocalDate;

public record CreateAssignmentRequest(
        @NotNull Long assetId,
        @NotNull Long employeeId,
        @NotNull LocalDate assignedAt,
        LocalDate expectedReturnAt,
        @NotBlank String digitalSignature,
        @NotBlank String receiptConfirmation
) {
}
