package com.example.lastmile.repository;

import com.example.lastmile.model.RateCard;
import com.example.lastmile.model.Zone;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface RateCardRepository extends JpaRepository<RateCard, Long> {
    Optional<RateCard> findByFromZoneAndToZoneAndOrderType(Zone fromZone, Zone toZone, String orderType);
}
