package com.ubs.mapper;

import com.ubs.dto.response.MeterReadingResponse;
import com.ubs.entity.MeterReading;
import org.springframework.stereotype.Component;

@Component
public class MeterReadingMapper {

    public MeterReadingResponse toResponse(MeterReading reading) {
        return MeterReadingResponse.builder()
                .id(reading.getId())
                .meterId(reading.getMeter().getId())
                .meterNumber(reading.getMeter().getMeterNumber())
                .meterType(reading.getMeter().getMeterType())
                .previousReading(reading.getPreviousReading())
                .currentReading(reading.getCurrentReading())
                .consumption(reading.getConsumption())
                .readingDate(reading.getReadingDate())
                .billingMonth(reading.getBillingMonth())
                .billingYear(reading.getBillingYear())
                .capturedById(reading.getCapturedBy().getId())
                .capturedByName(reading.getCapturedBy().getFullNames())
                .createdAt(reading.getCreatedAt())
                .build();
    }
}
