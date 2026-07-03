package com.example.lastmile.controller;

import com.example.lastmile.model.Order;
import com.example.lastmile.model.RateCard;
import com.example.lastmile.model.User;
import com.example.lastmile.model.Zone;
import com.example.lastmile.repository.OrderRepository;
import com.example.lastmile.repository.RateCardRepository;
import com.example.lastmile.repository.UserRepository;
import com.example.lastmile.repository.ZoneRepository;
import com.example.lastmile.security.services.UserDetailsImpl;
import com.example.lastmile.service.OrderService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/api/admin")
@PreAuthorize("hasRole('ADMIN')")
public class AdminController {

    @Autowired
    private ZoneRepository zoneRepository;

    @Autowired
    private RateCardRepository rateCardRepository;

    @Autowired
    private OrderRepository orderRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private OrderService orderService;

    // --- ZONES ---
    @GetMapping("/zones")
    public List<Zone> getAllZones() {
        return zoneRepository.findAll();
    }

    @PostMapping("/zones")
    public Zone createZone(@RequestBody Zone zone) {
        return zoneRepository.save(zone);
    }

    // --- RATE CARDS ---
    @GetMapping("/rates")
    public List<RateCard> getAllRateCards() {
        return rateCardRepository.findAll();
    }

    @PostMapping("/rates")
    public RateCard createRateCard(@RequestBody RateCard rateCard) {
        Zone from = zoneRepository.findById(rateCard.getFromZone().getId()).orElseThrow();
        Zone to = zoneRepository.findById(rateCard.getToZone().getId()).orElseThrow();
        rateCard.setFromZone(from);
        rateCard.setToZone(to);
        return rateCardRepository.save(rateCard);
    }

    // --- ORDERS ---
    @GetMapping("/orders")
    public List<Order> getAllOrders() {
        return orderRepository.findAll();
    }

    @PostMapping("/orders/{id}/assign")
    public ResponseEntity<Order> manualAssignAgent(@PathVariable Long id, 
                                                   @RequestParam Long agentId,
                                                   @AuthenticationPrincipal UserDetailsImpl userDetails) {
        User admin = userRepository.findById(userDetails.getId()).orElseThrow();
        Order order = orderRepository.findById(id).orElseThrow();
        User agent = userRepository.findById(agentId).orElseThrow();

        order.setAgent(agent);
        orderService.updateOrderStatus(order, com.example.lastmile.model.OrderStatus.ASSIGNED, admin);
        
        return ResponseEntity.ok(order);
    }
    
    @PostMapping("/orders/{id}/auto-assign")
    public ResponseEntity<Order> triggerAutoAssign(@PathVariable Long id,
                                                   @AuthenticationPrincipal UserDetailsImpl userDetails) {
        User admin = userRepository.findById(userDetails.getId()).orElseThrow();
        Order order = orderRepository.findById(id).orElseThrow();
        
        Order assigned = orderService.tryAutoAssign(order, admin);
        return ResponseEntity.ok(assigned);
    }
}
