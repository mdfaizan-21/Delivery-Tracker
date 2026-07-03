package com.example.lastmile.model;

import jakarta.persistence.*;

@Entity
@Table(name = "zones")
public class Zone {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(name = "zone_name", nullable = false, unique = true, length = 50)
    private String zoneName;
    
    @Column(columnDefinition = "TEXT")
    private String description;

    public Zone() {}

    public Zone(Long id, String zoneName, String description) {
        this.id = id;
        this.zoneName = zoneName;
        this.description = description;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getZoneName() {
        return zoneName;
    }

    public void setZoneName(String zoneName) {
        this.zoneName = zoneName;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

}
