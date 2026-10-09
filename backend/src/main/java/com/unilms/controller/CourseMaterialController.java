package com.unilms.controller;

import com.unilms.dto.CourseMaterialDto.MaterialResponse;
import com.unilms.security.UserPrincipal;
import com.unilms.service.CourseMaterialService;
import lombok.RequiredArgsConstructor;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/materials")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class CourseMaterialController {

    private final CourseMaterialService materialService;

    @PostMapping(value = "/upload", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<MaterialResponse> uploadMaterial(
            @RequestPart(value = "file", required = false) MultipartFile file,
            @RequestParam("title") String title,
            @RequestParam(value = "courseId", required = false) UUID courseId,
            @RequestParam(value = "moduleId", required = false) String moduleId,
            @RequestParam(value = "fileType", required = false) String fileType,
            @RequestParam(value = "allowDownload", required = false, defaultValue = "true") Boolean allowDownload,
            @RequestParam(value = "uploaderName", required = false) String uploaderName,
            @AuthenticationPrincipal UserPrincipal principal) {

        UUID uploaderId = principal != null ? principal.getId() : null;
        String name = principal != null ? principal.getUsername() : uploaderName;

        MaterialResponse response = materialService.uploadMaterial(
                file, title, courseId, moduleId, fileType, allowDownload, uploaderId, name);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/course/{courseId}")
    public ResponseEntity<List<MaterialResponse>> getMaterialsByCourse(@PathVariable UUID courseId) {
        return ResponseEntity.ok(materialService.getMaterialsByCourseId(courseId));
    }

    @GetMapping("/all")
    public ResponseEntity<List<MaterialResponse>> getAllMaterials() {
        return ResponseEntity.ok(materialService.getAllMaterials());
    }

    @GetMapping("/files/{fileName:.+}")
    public ResponseEntity<Resource> serveFile(@PathVariable String fileName) {
        Resource resource = materialService.loadFileAsResource(fileName);
        return ResponseEntity.ok()
                .contentType(MediaType.APPLICATION_OCTET_STREAM)
                .header(HttpHeaders.CONTENT_DISPOSITION, "inline; filename=\"" + resource.getFilename() + "\"")
                .body(resource);
    }

    @GetMapping("/download/{fileName:.+}")
    public ResponseEntity<Resource> downloadFile(@PathVariable String fileName) {
        Resource resource = materialService.loadFileAsResource(fileName);
        return ResponseEntity.ok()
                .contentType(MediaType.APPLICATION_OCTET_STREAM)
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + resource.getFilename() + "\"")
                .body(resource);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteMaterial(@PathVariable UUID id) {
        materialService.deleteMaterial(id);
        return ResponseEntity.noContent().build();
    }
}
