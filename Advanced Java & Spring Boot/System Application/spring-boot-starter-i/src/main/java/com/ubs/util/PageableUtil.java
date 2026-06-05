package com.ubs.util;

import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;

public final class PageableUtil {

    private PageableUtil() {}

    public static Pageable of(Integer page, Integer size, String sortBy, String sortDirection) {
        int p = page != null ? page : 0;
        int s = size != null ? size : 20;
        if (sortBy != null && !sortBy.isBlank()) {
            Sort.Direction direction = "desc".equalsIgnoreCase(sortDirection)
                    ? Sort.Direction.DESC : Sort.Direction.ASC;
            return PageRequest.of(p, s, Sort.by(direction, sortBy));
        }
        return PageRequest.of(p, s);
    }
}
