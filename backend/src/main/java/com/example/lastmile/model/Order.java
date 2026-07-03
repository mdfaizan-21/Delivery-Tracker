package com.example.lastmile.model;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "orders")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Order {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "customer_id", referencedColumnName = "id")
    private User customer;

    @ManyToOne
    @JoinColumn(name = "agent_id", referencedColumnName = "id")
    private User agent;

    @Column(name = "pickup_address", columnDefinition = "TEXT", nullable = false)
    private String pickupAddress;

    @ManyToOne
    @JoinColumn(name = "pickup_zone_id", referencedColumnName = "id")
    private Zone pickupZone;

    @Column(name = "drop_address", columnDefinition = "TEXT", nullable = false)
    private String dropAddress;

    @ManyToOne
    @JoinColumn(name = "drop_zone_id", referencedColumnName = "id")
    private Zone dropZone;

    @Column(name = "length_cm", precision = 10, scale = 2)
    private BigDecimal lengthCm;

    @Column(name = "width_cm", precision = 10, scale = 2)
    private BigDecimal widthCm;

    @Column(name = "height_cm", precision = 10, scale = 2)
    private BigDecimal heightCm;

    @Column(name = "actual_weight", precision = 10, scale = 2)
    private BigDecimal actualWeight;

    @Column(name = "charged_weight", precision = 10, scale = 2)
    private BigDecimal chargedWeight;

    @Column(name = "order_type", length = 10)
    private String orderType;

    @Column(name = "payment_type", length = 10)
    private String paymentType;

    @Column(name = "total_charge", precision = 10, scale = 2)
    private BigDecimal totalCharge;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private OrderStatus status = OrderStatus.PENDING;

    @Column(name = "rescheduled_date")
    private LocalDate rescheduledDate;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;
}
