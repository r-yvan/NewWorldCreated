package com.ubs.controller;

import com.ubs.dto.request.MeterReadingRequest;
import com.ubs.dto.response.MeterReadingResponse;
import com.ubs.dto.response.PageResponse;
import com.ubs.enums.MeterType;
import com.ubs.service.MeterReadingService;
import com.ubs.config.OpenApiConfig;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/readings")
@RequiredArgsConstructor
@Tag(name = "Meter Readings")
@SecurityRequirement(name = OpenApiConfig.BEARER_AUTH)
public class MeterReadingController {

    private final MeterReadingService meterReadingService;

    @PostMapping
    @PreAuthorize("hasRole('OPERATOR')")
    @Operation(summary = "Capture a meter reading")
    public ResponseEntity<MeterReadingResponse> captureReading(@Valid @RequestBody MeterReadingRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(meterReadingService.captureReading(request));
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'OPERATOR', 'FINANCE')")
    @Operation(summary = "List meter readings")
    public ResponseEntity<PageResponse<MeterReadingResponse>> listReadings(
            @RequestParam(required = false) Long meterId,
            @RequestParam(required = false) Long customerId,
            @RequestParam(required = false) Integer billingMonth,
            @RequestParam(required = false) Integer billingYear,
            @RequestParam(required = false) MeterType meterType,
            @RequestParam(required = false) Integer page,
            @RequestParam(required = false) Integer size,
            @RequestParam(required = false) String sortBy,
            @RequestParam(required = false) String sortDirection) {
        return ResponseEntity.ok(meterReadingService.listReadings(meterId, customerId, billingMonth,
                billingYear, meterType, page, size, sortBy, sortDirection));
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'OPERATOR', 'FINANCE')")
    @Operation(summary = "Get meter reading by ID")
    public ResponseEntity<MeterReadingResponse> getById(@PathVariable Long id) {
        return ResponseEntity.ok(meterReadingService.getById(id));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Delete meter reading", description = "ROLE_ADMIN only. Allowed only before a bill is generated from this reading.")
    @ApiResponses({
            @ApiResponse(responseCode = "204", description = "Reading deleted"),
            @ApiResponse(responseCode = "422", description = "Reading already used in a bill")
    })
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        meterReadingService.delete(id);
        return ResponseEntity.noContent().build();
    }
}
