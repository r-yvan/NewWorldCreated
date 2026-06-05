package com.ubs.service.impl;

import com.ubs.entity.Bill;
import com.ubs.entity.Tariff;
import com.ubs.enums.BillStatus;
import com.ubs.repository.BillRepository;
import com.ubs.service.OverduePenaltyService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class OverduePenaltyServiceImpl implements OverduePenaltyService {

    private final BillRepository billRepository;

    @Override
    @Transactional
    public int applyOverduePenalties() {
        List<Bill> overdueBills = billRepository.findOverdueBills(LocalDate.now());
        int applied = 0;

        for (Bill bill : overdueBills) {
            if (bill.getPenaltyAmount().compareTo(BigDecimal.ZERO) > 0) {
                continue;
            }

            Tariff tariff = bill.getTariff();
            BigDecimal penalty = bill.getOutstandingBalance()
                    .multiply(tariff.getPenaltyRate())
                    .divide(BigDecimal.valueOf(100), 2, RoundingMode.HALF_UP);

            if (penalty.compareTo(BigDecimal.ZERO) <= 0) {
                bill.setStatus(BillStatus.OVERDUE);
                billRepository.save(bill);
                continue;
            }

            bill.setPenaltyAmount(penalty);
            bill.setTotalAmount(bill.getTotalAmount().add(penalty));
            bill.setOutstandingBalance(bill.getOutstandingBalance().add(penalty));
            bill.setStatus(BillStatus.OVERDUE);
            billRepository.save(bill);
            applied++;

            log.info("Applied overdue penalty {} FRW to bill {}", penalty, bill.getBillReference());
        }

        if (applied > 0) {
            log.info("Overdue penalty job applied penalties to {} bill(s)", applied);
        }
        return applied;
    }
}
