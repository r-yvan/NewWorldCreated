package com.ubs.controller;

import com.ubs.dto.request.TariffRequest;
import com.ubs.dto.response.PageResponse;
import com.ubs.dto.response.TariffResponse;
import com.ubs.enums.MeterType;
import com.ubs.enums.TariffType;
import com.ubs.service.TariffService;
import com.ubs.config.OpenApiConfig;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;

import java.util.List;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/tariffs")
@RequiredArgsConstructor
@Tag(name = "Tariffs")
@SecurityRequirement(name = OpenApiConfig.BEARER_AUTH)
public class TariffController {

    private final TariffService tariffService;

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Create a flat or tiered tariff")
    public ResponseEntity<TariffResponse> create(@Valid @RequestBody TariffRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(tariffService.create(request));
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'FINANCE')")
    @Operation(summary = "List tariffs")
    public ResponseEntity<PageResponse<TariffResponse>> listTariffs(
            @RequestParam(required = false) MeterType meterType,
            @RequestParam(required = false) TariffType tariffType,
            @RequestParam(required = false) Boolean active,
            @RequestParam(required = false) Integer page,
            @RequestParam(required = false) Integer size,
            @RequestParam(required = false) String sortBy,
            @RequestParam(required = false) String sortDirection) {
        return ResponseEntity.ok(tariffService.listTariffs(meterType, tariffType, active,
                page, size, sortBy, sortDirection));
    }

    @GetMapping("/active")
    @PreAuthorize("hasAnyRole('ADMIN', 'FINANCE')")
    @Operation(summary = "List all active tariffs", description = "Returns currently active tariff versions for water and electricity.")
    public ResponseEntity<List<TariffResponse>> listActive() {
        return ResponseEntity.ok(tariffService.listActiveTariffs());
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'FINANCE')")
    @Operation(summary = "Get tariff by ID")
    public ResponseEntity<TariffResponse> getById(@PathVariable Long id) {
        return ResponseEntity.ok(tariffService.getById(id));
    }

    @PatchMapping("/{id}/deactivate")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Deactivate tariff", description = "ROLE_ADMIN only. Prefer deactivate over delete — old bills keep their tariff version.")
    public ResponseEntity<TariffResponse> deactivate(@PathVariable Long id) {
        return ResponseEntity.ok(tariffService.deactivate(id));
    }
}
