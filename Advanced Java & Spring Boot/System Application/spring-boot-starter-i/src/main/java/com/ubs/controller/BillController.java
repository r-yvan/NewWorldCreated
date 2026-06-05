package com.ubs.controller;

import com.ubs.dto.request.BillGenerateRequest;
import com.ubs.dto.response.BillApprovalResponse;
import com.ubs.dto.response.BillResponse;
import com.ubs.dto.response.PageResponse;
import com.ubs.enums.BillStatus;
import com.ubs.service.BillService;
import com.ubs.service.OverduePenaltyService;
import com.ubs.config.OpenApiConfig;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.Map;

@RestController
@RequestMapping("/api/bills")
@RequiredArgsConstructor
@Tag(name = "Bills")
@SecurityRequirement(name = OpenApiConfig.BEARER_AUTH)
public class BillController {

    private final BillService billService;
    private final OverduePenaltyService overduePenaltyService;

    @PostMapping("/generate")
    @PreAuthorize("hasAnyRole('ADMIN', 'FINANCE')")
    @Operation(summary = "Generate a bill from a meter reading")
    public ResponseEntity<BillResponse> generate(@Valid @RequestBody BillGenerateRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(billService.generate(request));
    }

    @PatchMapping("/{id}/approve")
    @PreAuthorize("hasAnyRole('ADMIN', 'FINANCE')")
    @Operation(summary = "Approve a generated bill")
    public ResponseEntity<BillApprovalResponse> approve(@PathVariable Long id) {
        return ResponseEntity.ok(billService.approve(id));
    }

    @PatchMapping("/{id}/cancel")
    @PreAuthorize("hasAnyRole('ADMIN', 'FINANCE')")
    @Operation(summary = "Cancel a bill", description = "Allowed only when no payments have been recorded.")
    public ResponseEntity<BillResponse> cancel(@PathVariable Long id) {
        return ResponseEntity.ok(billService.cancel(id));
    }

    @PostMapping("/apply-overdue-penalties")
    @PreAuthorize("hasAnyRole('ADMIN', 'FINANCE')")
    @Operation(summary = "Apply late payment penalties to overdue bills")
    public ResponseEntity<Map<String, Object>> applyOverduePenalties() {
        int count = overduePenaltyService.applyOverduePenalties();
        return ResponseEntity.ok(Map.of(
                "message", "Overdue penalty check completed",
                "penaltiesApplied", count
        ));
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'FINANCE')")
    @Operation(summary = "List and search bills")
    public ResponseEntity<PageResponse<BillResponse>> listBills(
            @RequestParam(required = false) Long customerId,
            @RequestParam(required = false) Long meterId,
            @RequestParam(required = false) Integer billingMonth,
            @RequestParam(required = false) Integer billingYear,
            @RequestParam(required = false) BillStatus status,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate fromDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate toDate,
            @RequestParam(required = false) String search,
            @RequestParam(required = false) Integer page,
            @RequestParam(required = false) Integer size,
            @RequestParam(required = false) String sortBy,
            @RequestParam(required = false) String sortDirection) {
        return ResponseEntity.ok(billService.listBills(customerId, meterId, billingMonth, billingYear,
                status, fromDate, toDate, search, page, size, sortBy, sortDirection));
    }

    @GetMapping("/my")
    @PreAuthorize("hasRole('CUSTOMER')")
    @Operation(summary = "Get bills for the authenticated customer")
    public ResponseEntity<PageResponse<BillResponse>> getMyBills(
            @RequestParam(required = false) Integer page,
            @RequestParam(required = false) Integer size,
            @RequestParam(required = false) String sortBy,
            @RequestParam(required = false) String sortDirection) {
        return ResponseEntity.ok(billService.getMyBills(page, size, sortBy, sortDirection));
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'FINANCE', 'CUSTOMER')")
    @Operation(summary = "Get bill by ID")
    public ResponseEntity<BillResponse> getById(@PathVariable Long id) {
        return ResponseEntity.ok(billService.getById(id));
    }
}
