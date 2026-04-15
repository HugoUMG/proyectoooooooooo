package com.proyectoinvdebienes.backend.repository;

import com.proyectoinvdebienes.backend.domain.enums.DisposalStatus;
import com.proyectoinvdebienes.backend.domain.model.Disposal;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface DisposalRepository extends JpaRepository<Disposal, Long> {
    List<Disposal> findByStatus(DisposalStatus status);
}
