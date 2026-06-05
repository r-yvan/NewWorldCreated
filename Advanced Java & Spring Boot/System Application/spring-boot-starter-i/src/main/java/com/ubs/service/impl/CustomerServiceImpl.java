package com.ubs.service.impl;

import com.ubs.dto.request.CustomerRequest;
import com.ubs.dto.request.CustomerStatusRequest;
import com.ubs.dto.response.CustomerResponse;
import com.ubs.dto.response.PageResponse;
import com.ubs.entity.Customer;
import com.ubs.enums.CustomerStatus;
import com.ubs.exception.ConflictException;
import com.ubs.exception.ResourceNotFoundException;
import com.ubs.mapper.CustomerMapper;
import com.ubs.exception.BusinessRuleException;
import com.ubs.repository.BillRepository;
import com.ubs.repository.CustomerRepository;
import com.ubs.repository.MeterRepository;
import com.ubs.util.PageableUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class CustomerServiceImpl implements com.ubs.service.CustomerService {

    private final CustomerRepository customerRepository;
    private final MeterRepository meterRepository;
    private final BillRepository billRepository;
    private final CustomerMapper customerMapper;

    @Override
    @Transactional(readOnly = true)
    public PageResponse<CustomerResponse> listCustomers(String search, CustomerStatus status,
                                                        Integer page, Integer size,
                                                        String sortBy, String sortDirection) {
        Page<Customer> result = customerRepository.search(search, status,
                PageableUtil.of(page, size, sortBy, sortDirection));
        return PageResponse.from(result.map(customerMapper::toResponse));
    }

    @Override
    @Transactional(readOnly = true)
    public CustomerResponse getById(Long id) {
        return customerMapper.toResponse(findCustomer(id));
    }

    @Override
    @Transactional
    public CustomerResponse create(CustomerRequest request) {
        if (customerRepository.existsByNationalId(request.getNationalId())) {
            throw new ConflictException("Customer with national ID already exists: " + request.getNationalId());
        }
        Customer customer = Customer.builder()
                .fullNames(request.getFullNames())
                .nationalId(request.getNationalId())
                .email(request.getEmail())
                .phoneNumber(request.getPhoneNumber())
                .address(request.getAddress())
                .status(CustomerStatus.ACTIVE)
                .build();
        return customerMapper.toResponse(customerRepository.save(customer));
    }

    @Override
    @Transactional
    public CustomerResponse update(Long id, CustomerRequest request) {
        Customer customer = findCustomer(id);
        if (!customer.getNationalId().equals(request.getNationalId())
                && customerRepository.existsByNationalId(request.getNationalId())) {
            throw new ConflictException("Customer with national ID already exists: " + request.getNationalId());
        }
        customer.setFullNames(request.getFullNames());
        customer.setNationalId(request.getNationalId());
        customer.setEmail(request.getEmail());
        customer.setPhoneNumber(request.getPhoneNumber());
        customer.setAddress(request.getAddress());
        return customerMapper.toResponse(customerRepository.save(customer));
    }

    @Override
    @Transactional
    public CustomerResponse updateStatus(Long id, CustomerStatusRequest request) {
        Customer customer = findCustomer(id);
        customer.setStatus(request.getStatus());
        return customerMapper.toResponse(customerRepository.save(customer));
    }

    @Override
    @Transactional
    public void delete(Long id) {
        Customer customer = findCustomer(id);
        if (meterRepository.existsByCustomerId(id)) {
            throw new BusinessRuleException("Cannot delete customer with registered meters. Set status to INACTIVE instead.");
        }
        if (billRepository.existsByCustomerId(id)) {
            throw new BusinessRuleException("Cannot delete customer with billing history. Set status to INACTIVE instead.");
        }
        customerRepository.delete(customer);
    }

    private Customer findCustomer(Long id) {
        return customerRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Customer not found with id: " + id));
    }
}
