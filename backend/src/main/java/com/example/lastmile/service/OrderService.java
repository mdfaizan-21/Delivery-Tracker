package com.example.lastmile.service;

import com.example.lastmile.model.*;
import com.example.lastmile.repository.OrderRepository;
import com.example.lastmile.repository.OrderTrackingHistoryRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;

@Service
public class OrderService {

    @Autowired
    private OrderRepository orderRepository;

    @Autowired
    private OrderTrackingHistoryRepository historyRepository;

    @Autowired
    private AgentAssignmentService assignmentService;

    @Autowired
    private NotificationService notificationService;

    @Transactional
    public Order createOrder(Order order, User customer) {
        order.setCustomer(customer);
        order.setStatus(OrderStatus.PENDING);
        order = orderRepository.save(order);

        logHistory(order, null, OrderStatus.PENDING, customer);

        // Attempt auto-assignment immediately
        return tryAutoAssign(order, customer);
    }

    @Transactional
    public Order tryAutoAssign(Order order, User actor) {
        if (order.getStatus() != OrderStatus.PENDING) {
            return order; // Can only auto-assign pending orders
        }

        User bestAgent = assignmentService.findBestAgentForOrder(order);
        if (bestAgent != null) {
            order.setAgent(bestAgent);
            updateOrderStatus(order, OrderStatus.ASSIGNED, actor);
        }
        return order;
    }

    @Transactional
    public void updateOrderStatus(Order order, OrderStatus newStatus, User actor) {
        OrderStatus oldStatus = order.getStatus();
        
        // Prevent illegal state jumps (basic validation)
        if (oldStatus == newStatus) return;
        
        order.setStatus(newStatus);
        
        if (newStatus == OrderStatus.FAILED) {
            order.setAgent(null); // release agent
        }
        
        orderRepository.save(order);
        logHistory(order, oldStatus, newStatus, actor);
        notificationService.sendOrderUpdateNotification(order, oldStatus, newStatus);
    }

    @Transactional
    public Order rescheduleFailedOrder(Order order, LocalDate rescheduledDate, User actor) {
        if (order.getStatus() != OrderStatus.FAILED) {
            throw new IllegalStateException("Only failed orders can be rescheduled");
        }

        order.setRescheduledDate(rescheduledDate);
        updateOrderStatus(order, OrderStatus.PENDING, actor);
        
        return tryAutoAssign(order, actor);
    }

    private void logHistory(Order order, OrderStatus oldStatus, OrderStatus newStatus, User actor) {
        OrderTrackingHistory history = new OrderTrackingHistory();
        history.setOrder(order);
        history.setOldStatus(oldStatus);
        history.setNewStatus(newStatus);
        history.setChangedBy(actor);
        historyRepository.save(history);
    }
}
