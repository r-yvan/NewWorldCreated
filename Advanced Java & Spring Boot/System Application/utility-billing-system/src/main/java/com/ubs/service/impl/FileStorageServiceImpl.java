package com.ubs.service.impl;

import com.ubs.dto.response.FileUploadResponse;
import com.ubs.entity.FileMetadata;
import com.ubs.entity.User;
import com.ubs.exception.BadRequestException;
import com.ubs.exception.ResourceNotFoundException;
import com.ubs.repository.FileMetadataRepository;
import com.ubs.util.SecurityUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.Set;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class FileStorageServiceImpl implements com.ubs.service.FileStorageService {

    private static final Set<String> ALLOWED_CONTENT_TYPES = Set.of(
            "application/pdf", "image/png", "image/jpeg", "image/jpg"
    );
    private static final Set<String> ALLOWED_EXTENSIONS = Set.of("pdf", "png", "jpg", "jpeg");

    private final FileMetadataRepository fileMetadataRepository;
    private final SecurityUtils securityUtils;

    @Value("${app.file.upload-dir:uploads}")
    private String uploadDir;

    @Value("${spring.servlet.multipart.max-file-size:5MB}")
    private String maxFileSize;

    @Override
    @Transactional
    public FileUploadResponse upload(MultipartFile file, String relatedEntityType, Long relatedEntityId) {
        if (file == null || file.isEmpty()) {
            throw new BadRequestException("File must not be empty");
        }

        validateFile(file);

        String originalFileName = StringUtils.cleanPath(file.getOriginalFilename() != null
                ? file.getOriginalFilename() : "file");
        if (originalFileName.contains("..")) {
            throw new BadRequestException("Invalid file name");
        }

        String extension = getExtension(originalFileName);
        if (!ALLOWED_EXTENSIONS.contains(extension.toLowerCase())) {
            throw new BadRequestException("Only PDF, PNG, JPG, and JPEG files are allowed");
        }

        String storedFileName = UUID.randomUUID() + "." + extension;
        Path uploadPath = Paths.get(uploadDir).toAbsolutePath().normalize();

        try {
            Files.createDirectories(uploadPath);
            Path targetLocation = uploadPath.resolve(storedFileName).normalize();
            if (!targetLocation.startsWith(uploadPath)) {
                throw new BadRequestException("Invalid file path");
            }
            file.transferTo(targetLocation);

            User currentUser = securityUtils.getCurrentUser();

            FileMetadata metadata = FileMetadata.builder()
                    .fileName(storedFileName)
                    .originalFileName(originalFileName)
                    .contentType(file.getContentType())
                    .fileSize(file.getSize())
                    .filePath(targetLocation.toString())
                    .relatedEntityType(relatedEntityType)
                    .relatedEntityId(relatedEntityId)
                    .uploadedBy(currentUser.getId())
                    .build();

            return toResponse(fileMetadataRepository.save(metadata));
        } catch (IOException e) {
            throw new BadRequestException("Failed to store file: " + e.getMessage());
        }
    }

    private void validateFile(MultipartFile file) {
        String contentType = file.getContentType();
        if (contentType == null || !ALLOWED_CONTENT_TYPES.contains(contentType.toLowerCase())) {
            throw new BadRequestException("Only PDF, PNG, JPG, and JPEG files are allowed");
        }
    }

    @Override
    @Transactional(readOnly = true)
    public FileUploadResponse getById(Long id) {
        FileMetadata metadata = fileMetadataRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("File not found with id: " + id));
        return toResponse(metadata);
    }

    @Override
    @Transactional
    public void delete(Long id) {
        FileMetadata metadata = fileMetadataRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("File not found with id: " + id));
        try {
            Files.deleteIfExists(Paths.get(metadata.getFilePath()));
        } catch (IOException e) {
            throw new BadRequestException("Failed to delete file: " + e.getMessage());
        }
        fileMetadataRepository.delete(metadata);
    }

    private FileUploadResponse toResponse(FileMetadata saved) {
        return FileUploadResponse.builder()
                .id(saved.getId())
                .fileName(saved.getFileName())
                .originalFileName(saved.getOriginalFileName())
                .contentType(saved.getContentType())
                .fileSize(saved.getFileSize())
                .filePath(saved.getFilePath())
                .relatedEntityType(saved.getRelatedEntityType())
                .relatedEntityId(saved.getRelatedEntityId())
                .uploadedBy(saved.getUploadedBy())
                .createdAt(saved.getCreatedAt())
                .build();
    }

    private String getExtension(String fileName) {
        int dotIndex = fileName.lastIndexOf('.');
        if (dotIndex < 0) {
            throw new BadRequestException("File must have an extension");
        }
        return fileName.substring(dotIndex + 1);
    }
}
