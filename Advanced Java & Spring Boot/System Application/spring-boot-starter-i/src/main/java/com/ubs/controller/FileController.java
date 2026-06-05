package com.ubs.controller;

import com.ubs.config.OpenApiConfig;
import com.ubs.dto.response.FileUploadResponse;
import com.ubs.service.FileStorageService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/api/files")
@RequiredArgsConstructor
@Tag(name = "Files")
@SecurityRequirement(name = OpenApiConfig.BEARER_AUTH)
public class FileController {

    private final FileStorageService fileStorageService;

    @PostMapping(value = "/upload", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @PreAuthorize("hasAnyRole('ADMIN', 'FINANCE')")
    @Operation(summary = "Upload a PDF, PNG, JPG, or JPEG file", description = "Max 5MB. Stores metadata in DB and file on disk.")
    public ResponseEntity<FileUploadResponse> upload(
            @RequestParam("file") MultipartFile file,
            @RequestParam(required = false) String relatedEntityType,
            @RequestParam(required = false) Long relatedEntityId) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(fileStorageService.upload(file, relatedEntityType, relatedEntityId));
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'FINANCE')")
    @Operation(summary = "Get uploaded file metadata by ID")
    public ResponseEntity<FileUploadResponse> getById(@PathVariable Long id) {
        return ResponseEntity.ok(fileStorageService.getById(id));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'FINANCE')")
    @Operation(summary = "Delete uploaded file", description = "Removes file from disk and metadata from database.")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        fileStorageService.delete(id);
        return ResponseEntity.noContent().build();
    }
}
