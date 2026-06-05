package com.ubs.controller;

import com.ubs.dto.request.MeterRequest;
import com.ubs.dto.request.MeterStatusRequest;
import com.ubs.dto.response.MeterResponse;
import com.ubs.dto.response.PageResponse;
import com.ubs.enums.MeterStatus;
import com.ubs.enums.MeterType;
import com.ubs.service.MeterService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import com.ubs.config.OpenApiConfig;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/meters")
@RequiredArgsConstructor
@Tag(name = "Meters")
@SecurityRequirement(name = OpenApiConfig.BEARER_AUTH)
public class MeterController {

    private final MeterService meterService;

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'OPERATOR', 'FINANCE')")
    @Operation(summary = "List and search meters")
    public ResponseEntity<PageResponse<MeterResponse>> listMeters(
            @RequestParam(required = false) Long customerId,
            @RequestParam(required = false) MeterType meterType,
            @RequestParam(required = false) MeterStatus status,
            @RequestParam(required = false) String search,
            @RequestParam(required = false) Integer page,
            @RequestParam(required = false) Integer size,
            @RequestParam(required = false) String sortBy,
            @RequestParam(required = false) String sortDirection) {
        return ResponseEntity.ok(meterService.listMeters(customerId, meterType, status, search,
                page, size, sortBy, sortDirection));
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'OPERATOR', 'FINANCE')")
    @Operation(summary = "Get meter by ID")
    public ResponseEntity<MeterResponse> getById(@PathVariable Long id) {
        return ResponseEntity.ok(meterService.getById(id));
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Create a meter linked to a customer")
    public ResponseEntity<MeterResponse> create(@Valid @RequestBody MeterRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(meterService.create(request));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Update a meter")
    public ResponseEntity<MeterResponse> update(@PathVariable Long id,
                                                @Valid @RequestBody MeterRequest request) {
        return ResponseEntity.ok(meterService.update(id, request));
    }

    @PatchMapping("/{id}/status")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Update meter status", description = "Set INACTIVE to stop new readings without deleting history.")
    public ResponseEntity<MeterResponse> updateStatus(@PathVariable Long id,
                                                      @Valid @RequestBody MeterStatusRequest request) {
        return ResponseEntity.ok(meterService.updateStatus(id, request));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Delete meter", description = "ROLE_ADMIN only. Allowed only when meter has no readings and no bills.")
    @ApiResponses({
            @ApiResponse(responseCode = "204", description = "Meter deleted"),
            @ApiResponse(responseCode = "422", description = "Meter has readings or billing history")
    })
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        meterService.delete(id);
        return ResponseEntity.noContent().build();
    }
}
