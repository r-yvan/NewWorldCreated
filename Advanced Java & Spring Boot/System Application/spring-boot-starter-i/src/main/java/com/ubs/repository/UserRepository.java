package com.ubs.repository;

import com.ubs.entity.User;
import com.ubs.enums.UserRole;
import com.ubs.enums.UserStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Optional;

public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByEmail(String email);
    boolean existsByEmail(String email);

    @Query("""
            SELECT u FROM User u WHERE
            (CAST(:search AS string) IS NULL OR LOWER(u.fullNames) LIKE LOWER(CONCAT('%', CAST(:search AS string), '%'))
             OR LOWER(u.email) LIKE LOWER(CONCAT('%', CAST(:search AS string), '%')))
            AND (:status IS NULL OR u.status = :status)
            AND (:role IS NULL OR :role MEMBER OF u.roles)
            """)
    Page<User> search(@Param("search") String search,
                      @Param("status") UserStatus status,
                      @Param("role") UserRole role,
                      Pageable pageable);
}
