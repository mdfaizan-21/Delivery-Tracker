package com.example.lastmile.controller;

import com.example.lastmile.model.*;
import com.example.lastmile.repository.*;
import com.example.lastmile.security.services.UserDetailsImpl;
import com.example.lastmile.service.OrderService;
import com.example.lastmile.service.RateEngineService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/api/customer")
@PreAuthorize("hasRole('CUSTOMER')")
public class CustomerController {

    @Autowired
    private OrderService orderService;

    @Autowired
    private OrderRepository orderRepository;

    @Autowired
    private ZoneRepository zoneRepository;

    @Autowired
    private RateEngineService rateEngineService;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private OrderTrackingHistoryRepository orderTrackingHistoryRepository;

    @GetMapping("/orders")
    public ResponseEntity<List<Order>> getMyOrders(@AuthenticationPrincipal UserDetailsImpl userDetails) {
        User customer = userRepository.findById(userDetails.getId()).orElseThrow();
        return ResponseEntity.ok(orderRepository.findByCustomer(customer));
    }

    @GetMapping("/zones")
    public ResponseEntity<List<Zone>> getAvailableZones() {
        return ResponseEntity.ok(zoneRepository.findAll());
    }

    @PostMapping("/quotes")
    public ResponseEntity<BigDecimal> getQuote(@RequestParam Long fromZoneId, 
                                               @RequestParam Long toZoneId, 
                                               @RequestParam String orderType, 
                                               @RequestParam String paymentType,
                                               @RequestParam BigDecimal length, 
                                               @RequestParam BigDecimal width, 
                                               @RequestParam BigDecimal height, 
                                               @RequestParam BigDecimal weight) {
        Zone fromZone = zoneRepository.findById(fromZoneId).orElseThrow();
        Zone toZone = zoneRepository.findById(toZoneId).orElseThrow();
        
        BigDecimal quote = rateEngineService.calculateQuote(fromZone, toZone, orderType, paymentType, length, width, height, weight);
        return ResponseEntity.ok(quote);
    }

    @PostMapping("/orders")
    public ResponseEntity<Order> placeOrder(@RequestBody Order orderRequest, 
                                            @AuthenticationPrincipal UserDetailsImpl userDetails) {
        User customer = userRepository.findById(userDetails.getId()).orElseThrow();
        
        // Setup Zones
        Zone pickupZone = zoneRepository.findById(orderRequest.getPickupZone().getId()).orElseThrow();
        Zone dropZone = zoneRepository.findById(orderRequest.getDropZone().getId()).orElseThrow();
        orderRequest.setPickupZone(pickupZone);
        orderRequest.setDropZone(dropZone);

        // Auto calculate the total charge to prevent frontend tampering
        BigDecimal charge = rateEngineService.calculateQuote(
            pickupZone, dropZone, orderRequest.getOrderType(), orderRequest.getPaymentType(),
            orderRequest.getLengthCm(), orderRequest.getWidthCm(), orderRequest.getHeightCm(), orderRequest.getActualWeight()
        );
        orderRequest.setTotalCharge(charge);
        
        // Volumetric logic for tracking
        orderRequest.setChargedWeight(rateEngineService.getChargedWeight(orderRequest.getActualWeight(), 
                rateEngineService.calculateVolumetricWeight(orderRequest.getLengthCm(), orderRequest.getWidthCm(), orderRequest.getHeightCm())));

        Order newOrder = orderService.createOrder(orderRequest, customer);
        return ResponseEntity.ok(newOrder);
    }

    @PostMapping("/orders/{id}/reschedule")
    public ResponseEntity<Order> rescheduleOrder(@PathVariable Long id, 
                                                 @RequestParam String newDateStr, 
                                                 @AuthenticationPrincipal UserDetailsImpl userDetails) {
        User customer = userRepository.findById(userDetails.getId()).orElseThrow();
        Order order = orderRepository.findById(id).orElseThrow();

        if (!order.getCustomer().getId().equals(customer.getId())) {
            return ResponseEntity.status(403).build();
        }

        LocalDate newDate = LocalDate.parse(newDateStr);
        Order rescheduled = orderService.rescheduleFailedOrder(order, newDate, customer);
        
        return ResponseEntity.ok(rescheduled);
    }

    @GetMapping("/orders/{id}/timeline")
    public ResponseEntity<List<OrderTrackingHistory>> getOrderTimeline(@PathVariable Long id, 
                                                                       @AuthenticationPrincipal UserDetailsImpl userDetails) {
        User customer = userRepository.findById(userDetails.getId()).orElseThrow();
        Order order = orderRepository.findById(id).orElseThrow();
        
        if (!order.getCustomer().getId().equals(customer.getId())) {
            return ResponseEntity.status(403).build();
        }

        List<OrderTrackingHistory> timeline = orderTrackingHistoryRepository.findByOrderOrderByTimestampAsc(order);
        return ResponseEntity.ok(timeline);
    }
}
