package com.unilms.service;

import com.unilms.domain.entity.CourseMaterial;
import com.unilms.dto.CourseMaterialDto.MaterialResponse;
import com.unilms.repository.CourseMaterialRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.core.io.FileSystemResource;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.util.StringUtils;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.IOException;
import java.net.MalformedURLException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.List;
import java.util.UUID;
import java.util.concurrent.CompletableFuture;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class CourseMaterialService {

    private final CourseMaterialRepository materialRepository;
    private final Path fileStorageLocation = Paths.get("uploads/materials").toAbsolutePath().normalize();

    public MaterialResponse uploadMaterial(
            MultipartFile file,
            String title,
            UUID courseId,
            String moduleId,
            String fileType,
            Boolean allowDownload,
            UUID uploaderId,
            String uploaderName) {

        try {
            Files.createDirectories(fileStorageLocation);
        } catch (Exception ex) {
            throw new RuntimeException("Could not create directory for upload storage.", ex);
        }

        String originalFileName = file != null ? StringUtils.cleanPath(file.getOriginalFilename()) : "document.pdf";
        String fileExtension = "";
        int i = originalFileName.lastIndexOf('.');
        if (i > 0) {
            fileExtension = originalFileName.substring(i);
        }

        String storedFileName = UUID.randomUUID() + "_" + originalFileName.replaceAll("[^a-zA-Z0-9.-]", "_");
        Path targetLocation = fileStorageLocation.resolve(storedFileName);

        String fileSizeFormatted = "1.5 MB";
        if (file != null && !file.isEmpty()) {
            try {
                Files.copy(file.getInputStream(), targetLocation, StandardCopyOption.REPLACE_EXISTING);
                double sizeMb = (double) file.getSize() / (1024 * 1024);
                fileSizeFormatted = String.format("%.1f MB", sizeMb);
            } catch (IOException e) {
                throw new RuntimeException("Could not store file " + originalFileName + ". Please try again!", e);
            }
        }

        String fileUrl = "/api/v1/materials/files/" + storedFileName;
        String downloadUrl = "/api/v1/materials/download/" + storedFileName;

        CourseMaterial material = CourseMaterial.builder()
                .courseId(courseId)
                .moduleId(moduleId != null ? moduleId : "m-1")
                .title(StringUtils.hasText(title) ? title : originalFileName)
                .fileName(originalFileName)
                .fileType(StringUtils.hasText(fileType) ? fileType : getFileTypeFromExtension(fileExtension))
                .fileSize(fileSizeFormatted)
                .fileUrl(fileUrl)
                .downloadUrl(downloadUrl)
                .allowDownload(allowDownload != null ? allowDownload : true)
                .uploadedBy(uploaderId)
                .uploadedByName(StringUtils.hasText(uploaderName) ? uploaderName : "Giảng viên UniLMS")
                .build();

        CourseMaterial saved = materialRepository.save(material);

        if (file != null && !file.isEmpty() && Files.exists(targetLocation)) {
            syncToOmniBrainAsync(targetLocation, originalFileName, courseId);
        }

        return mapToResponse(saved);
    }

    private void syncToOmniBrainAsync(Path filePath, String originalFileName, UUID courseId) {
        CompletableFuture.runAsync(() -> {
            try {
                String namespace = "lms";
                if (courseId != null) {
                    String idStr = courseId.toString().toLowerCase();
                    if (idStr.startsWith("c1111111")) namespace = "c-101";
                    else if (idStr.startsWith("c2222222")) namespace = "c-102";
                    else if (idStr.startsWith("c3333333")) namespace = "c-103";
                    else if (idStr.startsWith("c4444444")) namespace = "c-104";
                    else if (idStr.startsWith("c5555555")) namespace = "c-105";
                }

                sendToOmniBrain(filePath, originalFileName, namespace);
                if (!"lms".equals(namespace)) {
                    sendToOmniBrain(filePath, originalFileName, "lms");
                }
            } catch (Exception e) {
                log.warn("Auto-syncing material to OmniBrain GraphRAG skipped or failed: {}", e.getMessage());
            }
        });
    }

    private void sendToOmniBrain(Path filePath, String originalFileName, String namespace) {
        try {
            RestTemplate restTemplate = new RestTemplate();
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.MULTIPART_FORM_DATA);
            headers.set("X-API-Key", "omni-sk-live-lms-platform-2026-secret");

            MultiValueMap<String, Object> body = new LinkedMultiValueMap<>();
            body.add("file", new FileSystemResource(filePath.toFile()) {
                @Override
                public String getFilename() {
                    return originalFileName;
                }
            });

            HttpEntity<MultiValueMap<String, Object>> requestEntity = new HttpEntity<>(body, headers);
            String url = "http://127.0.0.1:8000/api/v1/graph-rag/upload?namespace=" + namespace;
            restTemplate.postForEntity(url, requestEntity, String.class);
            log.info("Successfully synced {} to OmniBrain GraphRAG namespace '{}'", originalFileName, namespace);
        } catch (Exception e) {
            log.warn("Could not sync material to OmniBrain namespace {}: {}", namespace, e.getMessage());
        }
    }

    public List<MaterialResponse> getMaterialsByCourseId(UUID courseId) {
        return materialRepository.findByCourseIdOrderByCreatedAtDesc(courseId).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    public List<MaterialResponse> getAllMaterials() {
        return materialRepository.findAllByOrderByCreatedAtDesc().stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    public Resource loadFileAsResource(String fileName) {
        try {
            Path filePath = fileStorageLocation.resolve(fileName).normalize();
            Resource resource = new UrlResource(filePath.toUri());
            if (resource.exists()) {
                return resource;
            } else {
                throw new RuntimeException("File not found " + fileName);
            }
        } catch (MalformedURLException ex) {
            throw new RuntimeException("File not found " + fileName, ex);
        }
    }

    public void deleteMaterial(UUID id) {
        CourseMaterial material = materialRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Material not found: " + id));
        materialRepository.delete(material);
    }

    private String getFileTypeFromExtension(String ext) {
        String lower = ext.toLowerCase();
        if (lower.endsWith(".mp4") || lower.endsWith(".avi") || lower.endsWith(".mkv")) {
            return "VIDEO";
        } else if (lower.endsWith(".json")) {
            return "QUIZ";
        }
        return "DOCUMENT";
    }

    private MaterialResponse mapToResponse(CourseMaterial entity) {
        return MaterialResponse.builder()
                .id(entity.getId())
                .courseId(entity.getCourseId())
                .moduleId(entity.getModuleId())
                .title(entity.getTitle())
                .fileName(entity.getFileName())
                .fileType(entity.getFileType())
                .fileSize(entity.getFileSize())
                .fileUrl(entity.getFileUrl())
                .downloadUrl(entity.getDownloadUrl())
                .allowDownload(entity.getAllowDownload())
                .uploadedBy(entity.getUploadedBy())
                .uploadedByName(entity.getUploadedByName())
                .createdAt(entity.getCreatedAt())
                .build();
    }
}
