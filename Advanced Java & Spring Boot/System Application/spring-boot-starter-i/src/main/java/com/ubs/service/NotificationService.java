package com.ubs.service;

import com.ubs.dto.response.NotificationResponse;
import com.ubs.dto.response.PageResponse;
import com.ubs.enums.NotificationStatus;
import com.ubs.enums.NotificationType;

public interface NotificationService {

    PageResponse<NotificationResponse> listNotifications(Long customerId, NotificationType notificationType,
                                                          NotificationStatus status,
                                                          Integer page, Integer size,
                                                          String sortBy, String sortDirection);

    PageResponse<NotificationResponse> getMyNotifications(Integer page, Integer size,
                                                           String sortBy, String sortDirection);

    void sendPendingNotifications();

    NotificationResponse getById(Long id);
}
