package com.example.lastmile.model;

import jakarta.persistence.*;
import org.hibernate.annotations.CreationTimestamp;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "orders")
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

    public Order() {}

    public Order(Long id, User customer, User agent, String pickupAddress, Zone pickupZone, String dropAddress, Zone dropZone, BigDecimal lengthCm, BigDecimal widthCm, BigDecimal heightCm, BigDecimal actualWeight, BigDecimal chargedWeight, String orderType, String paymentType, BigDecimal totalCharge, OrderStatus status, LocalDate rescheduledDate, LocalDateTime createdAt) {
        this.id = id;
        this.customer = customer;
        this.agent = agent;
        this.pickupAddress = pickupAddress;
        this.pickupZone = pickupZone;
        this.dropAddress = dropAddress;
        this.dropZone = dropZone;
        this.lengthCm = lengthCm;
        this.widthCm = widthCm;
        this.heightCm = heightCm;
        this.actualWeight = actualWeight;
        this.chargedWeight = chargedWeight;
        this.orderType = orderType;
        this.paymentType = paymentType;
        this.totalCharge = totalCharge;
        this.status = status;
        this.rescheduledDate = rescheduledDate;
        this.createdAt = createdAt;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public User getCustomer() {
        return customer;
    }

    public void setCustomer(User customer) {
        this.customer = customer;
    }

    public User getAgent() {
        return agent;
    }

    public void setAgent(User agent) {
        this.agent = agent;
    }

    public String getPickupAddress() {
        return pickupAddress;
    }

    public void setPickupAddress(String pickupAddress) {
        this.pickupAddress = pickupAddress;
    }

    public Zone getPickupZone() {
        return pickupZone;
    }

    public void setPickupZone(Zone pickupZone) {
        this.pickupZone = pickupZone;
    }

    public String getDropAddress() {
        return dropAddress;
    }

    public void setDropAddress(String dropAddress) {
        this.dropAddress = dropAddress;
    }

    public Zone getDropZone() {
        return dropZone;
    }

    public void setDropZone(Zone dropZone) {
        this.dropZone = dropZone;
    }

    public BigDecimal getLengthCm() {
        return lengthCm;
    }

    public void setLengthCm(BigDecimal lengthCm) {
        this.lengthCm = lengthCm;
    }

    public BigDecimal getWidthCm() {
        return widthCm;
    }

    public void setWidthCm(BigDecimal widthCm) {
        this.widthCm = widthCm;
    }

    public BigDecimal getHeightCm() {
        return heightCm;
    }

    public void setHeightCm(BigDecimal heightCm) {
        this.heightCm = heightCm;
    }

    public BigDecimal getActualWeight() {
        return actualWeight;
    }

    public void setActualWeight(BigDecimal actualWeight) {
        this.actualWeight = actualWeight;
    }

    public BigDecimal getChargedWeight() {
        return chargedWeight;
    }

    public void setChargedWeight(BigDecimal chargedWeight) {
        this.chargedWeight = chargedWeight;
    }

    public String getOrderType() {
        return orderType;
    }

    public void setOrderType(String orderType) {
        this.orderType = orderType;
    }

    public String getPaymentType() {
        return paymentType;
    }

    public void setPaymentType(String paymentType) {
        this.paymentType = paymentType;
    }

    public BigDecimal getTotalCharge() {
        return totalCharge;
    }

    public void setTotalCharge(BigDecimal totalCharge) {
        this.totalCharge = totalCharge;
    }

    public OrderStatus getStatus() {
        return status;
    }

    public void setStatus(OrderStatus status) {
        this.status = status;
    }

    public LocalDate getRescheduledDate() {
        return rescheduledDate;
    }

    public void setRescheduledDate(LocalDate rescheduledDate) {
        this.rescheduledDate = rescheduledDate;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

}
