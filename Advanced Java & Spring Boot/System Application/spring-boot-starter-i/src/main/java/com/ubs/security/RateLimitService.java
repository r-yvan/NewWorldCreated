package com.ubs.security;

import com.ubs.exception.RateLimitExceededException;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class RateLimitService {

    @Value("${app.rate-limit.auth-max-requests}")
    private int maxRequests;

    @Value("${app.rate-limit.auth-window-seconds}")
    private int windowSeconds;

    private final Map<String, RequestWindow> windows = new ConcurrentHashMap<>();

    public void checkLimit(String key) {
        long now = Instant.now().getEpochSecond();
        RequestWindow window = windows.compute(key, (k, existing) -> {
            if (existing == null || now - existing.windowStart >= windowSeconds) {
                return new RequestWindow(now, 1);
            }
            existing.count++;
            return existing;
        });

        if (window.count > maxRequests) {
            throw new RateLimitExceededException("Too many requests. Please try again later.");
        }
    }

    private static class RequestWindow {
        long windowStart;
        int count;

        RequestWindow(long windowStart, int count) {
            this.windowStart = windowStart;
            this.count = count;
        }
    }
}
