package com.example.lastmile.model;

import jakarta.persistence.*;

import java.math.BigDecimal;

@Entity
@Table(name = "rate_cards", uniqueConstraints = {
    @UniqueConstraint(columnNames = {"from_zone_id", "to_zone_id", "order_type"})
})
public class RateCard {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @ManyToOne
    @JoinColumn(name = "from_zone_id", referencedColumnName = "id")
    private Zone fromZone;
    
    @ManyToOne
    @JoinColumn(name = "to_zone_id", referencedColumnName = "id")
    private Zone toZone;
    
    @Column(name = "order_type", length = 10)
    private String orderType; // B2B or B2C
    
    @Column(name = "rate_per_kg", nullable = false, precision = 10, scale = 2)
    private BigDecimal ratePerKg;
    
    @Column(name = "cod_surcharge", precision = 10, scale = 2)
    private BigDecimal codSurcharge = BigDecimal.ZERO;

    // Transient alias used by frontend (baseRate maps to ratePerKg)
    @Transient
    private BigDecimal baseRate;

    public RateCard() {}

    public RateCard(Long id, Zone fromZone, Zone toZone, String orderType, BigDecimal ratePerKg, BigDecimal codSurcharge) {
        this.id = id;
        this.fromZone = fromZone;
        this.toZone = toZone;
        this.orderType = orderType;
        this.ratePerKg = ratePerKg;
        this.codSurcharge = codSurcharge;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Zone getFromZone() {
        return fromZone;
    }

    public void setFromZone(Zone fromZone) {
        this.fromZone = fromZone;
    }

    public Zone getToZone() {
        return toZone;
    }

    public void setToZone(Zone toZone) {
        this.toZone = toZone;
    }

    public String getOrderType() {
        return orderType;
    }

    public void setOrderType(String orderType) {
        this.orderType = orderType;
    }

    public BigDecimal getRatePerKg() {
        return ratePerKg;
    }

    public void setRatePerKg(BigDecimal ratePerKg) {
        this.ratePerKg = ratePerKg;
    }

    public BigDecimal getCodSurcharge() {
        return codSurcharge;
    }

    public void setCodSurcharge(BigDecimal codSurcharge) {
        this.codSurcharge = codSurcharge;
    }

    public BigDecimal getBaseRate() {
        return baseRate != null ? baseRate : ratePerKg;
    }

    public void setBaseRate(BigDecimal baseRate) {
        this.baseRate = baseRate;
    }

}
