package com.ubs.service;

import com.ubs.dto.response.FileUploadResponse;
import org.springframework.web.multipart.MultipartFile;

public interface FileStorageService {

    FileUploadResponse upload(MultipartFile file, String relatedEntityType, Long relatedEntityId);

    FileUploadResponse getById(Long id);

    void delete(Long id);
}
