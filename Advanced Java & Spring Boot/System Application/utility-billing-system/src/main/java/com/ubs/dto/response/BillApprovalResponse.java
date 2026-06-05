package com.ubs.dto.response;

import com.ubs.enums.BillStatus;
import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Builder
public class BillApprovalResponse {
    private Long id;
    private String billReference;
    private BillStatus status;
    private Long approvedById;
    private String approvedByName;
    private LocalDateTime approvedAt;
}
