package com.ubs.mapper;

import com.ubs.dto.response.NotificationResponse;
import com.ubs.entity.Notification;
import org.springframework.stereotype.Component;

@Component
public class NotificationMapper {

    public NotificationResponse toResponse(Notification notification) {
        return NotificationResponse.builder()
                .id(notification.getId())
                .customerId(notification.getCustomer().getId())
                .customerName(notification.getCustomer().getFullNames())
                .billId(notification.getBill() != null ? notification.getBill().getId() : null)
                .billReference(notification.getBill() != null ? notification.getBill().getBillReference() : null)
                .message(notification.getMessage())
                .notificationType(notification.getNotificationType())
                .status(notification.getStatus())
                .createdAt(notification.getCreatedAt())
                .sentAt(notification.getSentAt())
                .build();
    }
}
