package com.ubs.service;

import com.ubs.entity.Bill;
import com.ubs.entity.Customer;
import com.ubs.entity.Meter;
import com.ubs.entity.MeterReading;
import com.ubs.entity.Tariff;
import com.ubs.enums.BillStatus;
import com.ubs.enums.MeterType;
import com.ubs.enums.TariffType;
import com.ubs.entity.User;
import com.ubs.enums.UserRole;
import com.ubs.enums.UserStatus;
import com.ubs.repository.BillRepository;
import com.ubs.repository.CustomerRepository;
import com.ubs.repository.MeterReadingRepository;
import com.ubs.repository.MeterRepository;
import com.ubs.repository.TariffRepository;
import com.ubs.repository.UserRepository;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.Set;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;

@SpringBootTest
@ActiveProfiles("test")
@Transactional
class OverduePenaltyServiceTest {

    @Autowired
    private OverduePenaltyService overduePenaltyService;

    @Autowired
    private BillRepository billRepository;
    @Autowired
    private CustomerRepository customerRepository;
    @Autowired
    private MeterRepository meterRepository;
    @Autowired
    private MeterReadingRepository meterReadingRepository;
    @Autowired
    private TariffRepository tariffRepository;
    @Autowired
    private UserRepository userRepository;

    @Test
    void appliesPenaltyToOverdueBill() {
        User operator = userRepository.save(User.builder()
                .fullNames("Test Operator")
                .email("op-penalty@test.com")
                .phoneNumber("0788000099")
                .password("encoded")
                .status(UserStatus.ACTIVE)
                .roles(Set.of(UserRole.ROLE_OPERATOR))
                .build());
        Customer customer = customerRepository.save(Customer.builder()
                .fullNames("Penalty Test")
                .nationalId("9999888877776666")
                .email("penalty@test.com")
                .phoneNumber("0788999900")
                .address("Kigali")
                .status(com.ubs.enums.CustomerStatus.ACTIVE)
                .build());

        Meter meter = meterRepository.save(Meter.builder()
                .meterNumber("WTR-PEN-01")
                .meterType(MeterType.WATER)
                .installationDate(LocalDate.of(2025, 1, 1))
                .status(com.ubs.enums.MeterStatus.ACTIVE)
                .customer(customer)
                .build());

        Tariff tariff = tariffRepository.save(Tariff.builder()
                .meterType(MeterType.WATER)
                .tariffType(TariffType.FLAT)
                .ratePerUnit(new BigDecimal("500"))
                .fixedServiceCharge(new BigDecimal("1000"))
                .vatRate(new BigDecimal("18"))
                .penaltyRate(new BigDecimal("5"))
                .effectiveFrom(LocalDate.of(2026, 1, 1))
                .active(true)
                .version(99)
                .build());

        MeterReading reading = meterReadingRepository.save(MeterReading.builder()
                .meter(meter)
                .previousReading(new BigDecimal("0"))
                .currentReading(new BigDecimal("100"))
                .consumption(new BigDecimal("100"))
                .readingDate(LocalDate.of(2026, 4, 1))
                .billingMonth(4)
                .billingYear(2026)
                .capturedBy(operator)
                .build());

        Bill bill = billRepository.save(Bill.builder()
                .billReference("BILL-PENALTY-TEST")
                .customer(customer)
                .meter(meter)
                .meterReading(reading)
                .tariff(tariff)
                .billingMonth(4)
                .billingYear(2026)
                .consumption(new BigDecimal("100"))
                .consumptionAmount(new BigDecimal("50000"))
                .fixedServiceCharge(new BigDecimal("1000"))
                .taxAmount(new BigDecimal("9180"))
                .penaltyAmount(BigDecimal.ZERO)
                .totalAmount(new BigDecimal("60180"))
                .amountPaid(BigDecimal.ZERO)
                .outstandingBalance(new BigDecimal("60180"))
                .dueDate(LocalDate.now().minusDays(5))
                .status(BillStatus.APPROVED)
                .build());

        int applied = overduePenaltyService.applyOverduePenalties();

        Bill updated = billRepository.findById(bill.getId()).orElseThrow();
        assertTrue(applied >= 1);
        assertEquals(new BigDecimal("3009.00"), updated.getPenaltyAmount());
        assertEquals(BillStatus.OVERDUE, updated.getStatus());
        assertEquals(new BigDecimal("63189.00"), updated.getOutstandingBalance());
    }
}
