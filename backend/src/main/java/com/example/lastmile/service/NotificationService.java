package com.example.lastmile.service;

import com.example.lastmile.model.Order;
import com.example.lastmile.model.OrderStatus;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

@Service
public class NotificationService {
    
    private static final Logger logger = LoggerFactory.getLogger(NotificationService.class);

    public void sendOrderUpdateNotification(Order order, OrderStatus oldStatus, OrderStatus newStatus) {
        // Since we don't have a free SMTP relay right now, we are mocking the notification via logger.
        String message = String.format(
            "NOTIFICATION TO CUSTOMER [%s]: Order #%d status changed from %s to %s",
            order.getCustomer().getEmail(),
            order.getId(),
            oldStatus != null ? oldStatus.name() : "NONE",
            newStatus.name()
        );

        logger.info("=====================================================");
        logger.info("{}", message);
        
        if (newStatus == OrderStatus.FAILED) {
            logger.info("ACTION REQUIRED: Delivery failed for order #{}. Please visit the portal to reschedule.", order.getId());
        } else if (newStatus == OrderStatus.DELIVERED) {
            logger.info("SUCCESS: Order #{} has been successfully delivered.", order.getId());
        }

        logger.info("=====================================================");
    }
}
