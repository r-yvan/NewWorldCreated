package com.ubs.dto.response;

import com.ubs.enums.NotificationStatus;
import com.ubs.enums.NotificationType;
import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Builder
public class NotificationResponse {
    private Long id;
    private Long customerId;
    private String customerName;
    private Long billId;
    private String billReference;
    private String message;
    private NotificationType notificationType;
    private NotificationStatus status;
    private LocalDateTime createdAt;
    private LocalDateTime sentAt;
}
