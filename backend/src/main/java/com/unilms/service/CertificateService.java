package com.unilms.service;

import com.unilms.domain.entity.Certificate;
import com.unilms.domain.entity.StudentProfile;
import com.unilms.dto.CertificateDto.CertificateDetailResponse;
import com.unilms.repository.CertificateRepository;
import com.unilms.repository.StudentProfileRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class CertificateService {

    private final CertificateRepository certificateRepository;
    private final StudentProfileRepository studentProfileRepository;

    @Transactional(readOnly = true)
    public CertificateDetailResponse getCertificateByCode(String code) {
        Certificate cert = certificateRepository.findByCertificateCode(code)
                .orElseThrow(() -> new RuntimeException("Certificate not found with code: " + code));

        StudentProfile profile = studentProfileRepository.findById(cert.getEnrollment().getUser().getId()).orElse(null);

        return CertificateDetailResponse.builder()
                .id(cert.getId())
                .certificateCode(cert.getCertificateCode())
                .studentName(cert.getEnrollment().getUser().getFullName())
                .studentCode(profile != null ? profile.getStudentCode() : "SV-UNILMS")
                .courseTitle(cert.getEnrollment().getCourse().getTitle())
                .issuedAt(cert.getIssuedAt())
                .build();
    }
}
