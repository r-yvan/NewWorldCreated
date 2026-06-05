package com.ubs.dto.response;

import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Builder
public class FileUploadResponse {
    private Long id;
    private String fileName;
    private String originalFileName;
    private String contentType;
    private Long fileSize;
    private String filePath;
    private String relatedEntityType;
    private Long relatedEntityId;
    private Long uploadedBy;
    private LocalDateTime createdAt;
}
