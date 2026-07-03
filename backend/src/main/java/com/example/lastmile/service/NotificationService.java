package com.example.lastmile.service;

import com.example.lastmile.model.Order;
import com.example.lastmile.model.OrderStatus;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
public class NotificationService {
    
    private static final Logger logger = LoggerFactory.getLogger(NotificationService.class);

    @Autowired
    private JavaMailSender mailSender;

    public void sendOrderUpdateNotification(Order order, OrderStatus oldStatus, OrderStatus newStatus) {
        String subject = "Update on your Order #" + order.getId();
        String message = String.format(
            "Hello %s,\n\nYour order status has changed from %s to %s.\n\n",
            order.getCustomer().getName(),
            oldStatus != null ? oldStatus.name() : "NONE",
            newStatus.name()
        );

        if (newStatus == OrderStatus.FAILED) {
            message += "ACTION REQUIRED: Delivery failed. Please visit the portal to reschedule your delivery.";
        } else if (newStatus == OrderStatus.DELIVERED) {
            message += "SUCCESS: Your order has been successfully delivered. Thank you!";
        } else {
            message += "Thank you for using Last-Mile Delivery Tracker.";
        }

        // Log it as well
        logger.info("Sending Email to {}: {}", order.getCustomer().getEmail(), subject);

        try {
            SimpleMailMessage email = new SimpleMailMessage();
            email.setTo(order.getCustomer().getEmail());
            email.setSubject(subject);
            email.setText(message);
            // Default from could be set in properties, or set here
            email.setFrom("noreply@lastmile.com");
            
            mailSender.send(email);
            logger.info("Email sent successfully to {}", order.getCustomer().getEmail());
        } catch (Exception e) {
            logger.error("Failed to send email to {}", order.getCustomer().getEmail(), e);
        }
    }
}
