package com.example.lastmile.model;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

import java.math.BigDecimal;

@Entity
@Table(name = "rate_cards", uniqueConstraints = {
    @UniqueConstraint(columnNames = {"from_zone_id", "to_zone_id", "order_type"})
})
@Data
@NoArgsConstructor
@AllArgsConstructor
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
}
