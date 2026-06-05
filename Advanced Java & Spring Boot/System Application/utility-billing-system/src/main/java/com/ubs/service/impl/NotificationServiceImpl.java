package com.ubs.service.impl;

import com.ubs.dto.response.NotificationResponse;
import com.ubs.dto.response.PageResponse;
import com.ubs.entity.Notification;
import com.ubs.entity.User;
import com.ubs.enums.NotificationStatus;
import com.ubs.enums.NotificationType;
import com.ubs.exception.BusinessRuleException;
import com.ubs.exception.ResourceNotFoundException;
import com.ubs.mapper.NotificationMapper;
import com.ubs.repository.NotificationRepository;
import com.ubs.service.EmailService;
import com.ubs.util.PageableUtil;
import com.ubs.util.SecurityUtils;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class NotificationServiceImpl implements com.ubs.service.NotificationService {

    private final NotificationRepository notificationRepository;
    private final NotificationMapper notificationMapper;
    private final EmailService emailService;
    private final SecurityUtils securityUtils;

    @Override
    @Transactional(readOnly = true)
    public PageResponse<NotificationResponse> listNotifications(Long customerId, NotificationType notificationType,
                                                                 NotificationStatus status,
                                                                 Integer page, Integer size,
                                                                 String sortBy, String sortDirection) {
        Page<Notification> result = notificationRepository.search(customerId, notificationType, status,
                PageableUtil.of(page, size, sortBy, sortDirection));
        return PageResponse.from(result.map(notificationMapper::toResponse));
    }

    @Override
    @Transactional(readOnly = true)
    public PageResponse<NotificationResponse> getMyNotifications(Integer page, Integer size,
                                                                  String sortBy, String sortDirection) {
        User user = securityUtils.getCurrentUser();
        if (user.getCustomerId() == null) {
            throw new BusinessRuleException("No customer profile linked to this user");
        }
        Page<Notification> result = notificationRepository.search(user.getCustomerId(), null, null,
                PageableUtil.of(page, size, sortBy, sortDirection));
        return PageResponse.from(result.map(notificationMapper::toResponse));
    }

    @Override
    @Async
    @Transactional
    public void sendPendingNotifications() {
        List<Notification> pending = notificationRepository.search(null, null, NotificationStatus.PENDING,
                PageableUtil.of(0, 100, "createdAt", "asc")).getContent();

        for (Notification notification : pending) {
            try {
                String email = notification.getCustomer().getEmail();
                String subject = buildSubject(notification.getNotificationType());
                boolean sent = emailService.sendEmailSync(email, subject, notification.getMessage());

                if (sent) {
                    notification.setStatus(NotificationStatus.SENT);
                    notification.setSentAt(LocalDateTime.now());
                    notificationRepository.save(notification);
                }
            } catch (Exception e) {
                log.error("Failed to send notification {}: {}", notification.getId(), e.getMessage());
            }
        }
    }

    @Override
    @Transactional(readOnly = true)
    public NotificationResponse getById(Long id) {
        return notificationMapper.toResponse(notificationRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Notification not found with id: " + id)));
    }

    private String buildSubject(NotificationType type) {
        return switch (type) {
            case BILL_GENERATED -> "Utility Bill Generated";
            case PAYMENT_RECEIVED -> "Payment Confirmation";
            default -> "Utility Billing Notification";
        };
    }
}
