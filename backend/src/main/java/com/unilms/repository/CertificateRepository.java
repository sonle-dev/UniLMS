package com.unilms.repository;

import com.unilms.domain.entity.Certificate;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface CertificateRepository extends JpaRepository<Certificate, UUID> {
    Optional<Certificate> findByCertificateCode(String certificateCode);
    Optional<Certificate> findByEnrollmentId(UUID enrollmentId);
}
