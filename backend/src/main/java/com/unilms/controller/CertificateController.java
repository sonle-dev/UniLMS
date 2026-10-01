package com.unilms.controller;

import com.unilms.dto.CertificateDto.CertificateDetailResponse;
import com.unilms.service.CertificateService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/certificates")
@RequiredArgsConstructor
public class CertificateController {

    private final CertificateService certificateService;

    @GetMapping("/public/{code}")
    public ResponseEntity<CertificateDetailResponse> getCertificateByCode(@PathVariable String code) {
        return ResponseEntity.ok(certificateService.getCertificateByCode(code));
    }
}
