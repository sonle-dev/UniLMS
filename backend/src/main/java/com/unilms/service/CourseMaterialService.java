package com.unilms.service;

import com.unilms.domain.entity.CourseMaterial;
import com.unilms.dto.CourseMaterialDto.MaterialResponse;
import com.unilms.repository.CourseMaterialRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
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
import java.util.stream.Collectors;

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
        return mapToResponse(saved);
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
