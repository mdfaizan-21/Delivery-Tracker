package com.example.lastmile.controller;

import com.example.lastmile.model.Order;
import com.example.lastmile.model.OrderStatus;
import com.example.lastmile.model.User;
import com.example.lastmile.repository.OrderRepository;
import com.example.lastmile.repository.UserRepository;
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
@RequestMapping("/api/agent")
@PreAuthorize("hasRole('AGENT')")
public class AgentController {

    @Autowired
    private OrderRepository orderRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private OrderService orderService;

    @GetMapping("/orders")
    public ResponseEntity<List<Order>> getMyAssignedOrders(@AuthenticationPrincipal UserDetailsImpl userDetails) {
        User agent = userRepository.findById(userDetails.getId()).orElseThrow();
        return ResponseEntity.ok(orderRepository.findByAgent(agent));
    }

    @PutMapping("/orders/{id}/status")
    public ResponseEntity<Order> updateOrderStatus(@PathVariable Long id, 
                                                   @RequestParam OrderStatus newStatus, 
                                                   @AuthenticationPrincipal UserDetailsImpl userDetails) {
        User agent = userRepository.findById(userDetails.getId()).orElseThrow();
        Order order = orderRepository.findById(id).orElseThrow();

        if (order.getAgent() == null || !order.getAgent().getId().equals(agent.getId())) {
            return ResponseEntity.status(403).build();
        }

        orderService.updateOrderStatus(order, newStatus, agent);
        
        return ResponseEntity.ok(orderRepository.findById(id).get());
    }
}
