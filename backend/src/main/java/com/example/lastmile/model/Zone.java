package com.example.lastmile.model;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

@Entity
@Table(name = "zones")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Zone {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(name = "zone_name", nullable = false, unique = true, length = 50)
    private String zoneName;
    
    @Column(columnDefinition = "TEXT")
    private String description;
}
