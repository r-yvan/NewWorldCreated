package com.ubs.repository;

import com.ubs.entity.Notification;
import com.ubs.enums.NotificationStatus;
import com.ubs.enums.NotificationType;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface NotificationRepository extends JpaRepository<Notification, Long> {

    @Query("""
            SELECT n FROM Notification n WHERE
            (:customerId IS NULL OR n.customer.id = :customerId)
            AND (:notificationType IS NULL OR n.notificationType = :notificationType)
            AND (:status IS NULL OR n.status = :status)
            """)
    Page<Notification> search(@Param("customerId") Long customerId,
                              @Param("notificationType") NotificationType notificationType,
                              @Param("status") NotificationStatus status,
                              Pageable pageable);
}
