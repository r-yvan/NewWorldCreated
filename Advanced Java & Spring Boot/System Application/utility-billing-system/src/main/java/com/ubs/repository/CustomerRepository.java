package com.ubs.repository;

import com.ubs.entity.Customer;
import com.ubs.enums.CustomerStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Optional;

public interface CustomerRepository extends JpaRepository<Customer, Long> {
    boolean existsByNationalId(String nationalId);
    Optional<Customer> findByNationalId(String nationalId);

    @Query("""
            SELECT c FROM Customer c WHERE
            (CAST(:search AS string) IS NULL OR LOWER(c.fullNames) LIKE LOWER(CONCAT('%', CAST(:search AS string), '%'))
             OR LOWER(c.nationalId) LIKE LOWER(CONCAT('%', CAST(:search AS string), '%'))
             OR LOWER(c.email) LIKE LOWER(CONCAT('%', CAST(:search AS string), '%')))
            AND (:status IS NULL OR c.status = :status)
            """)
    Page<Customer> search(@Param("search") String search,
                          @Param("status") CustomerStatus status,
                          Pageable pageable);
}
