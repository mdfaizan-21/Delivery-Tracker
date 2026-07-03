package com.example.lastmile.service;

import com.example.lastmile.model.RateCard;
import com.example.lastmile.model.Zone;
import com.example.lastmile.repository.RateCardRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;

@Service
public class RateEngineService {

    @Autowired
    private RateCardRepository rateCardRepository;

    public BigDecimal calculateVolumetricWeight(BigDecimal length, BigDecimal width, BigDecimal height) {
        if (length == null || width == null || height == null) return BigDecimal.ZERO;
        
        // (L * B * H) / 5000
        BigDecimal volume = length.multiply(width).multiply(height);
        return volume.divide(new BigDecimal(5000), 2, RoundingMode.HALF_UP);
    }

    public BigDecimal getChargedWeight(BigDecimal actualWeight, BigDecimal volumetricWeight) {
        if (actualWeight == null) return volumetricWeight;
        if (volumetricWeight == null) return actualWeight;
        return actualWeight.compareTo(volumetricWeight) > 0 ? actualWeight : volumetricWeight;
    }

    public BigDecimal calculateQuote(Zone fromZone, Zone toZone, String orderType, String paymentType, 
                                     BigDecimal length, BigDecimal width, BigDecimal height, BigDecimal actualWeight) {
        
        RateCard rateCard = rateCardRepository.findByFromZoneAndToZoneAndOrderType(fromZone, toZone, orderType)
                .orElseThrow(() -> new RuntimeException("No rate card found for the given zones and order type"));

        BigDecimal volumetricWeight = calculateVolumetricWeight(length, width, height);
        BigDecimal chargedWeight = getChargedWeight(actualWeight, volumetricWeight);

        BigDecimal baseCharge = chargedWeight.multiply(rateCard.getRatePerKg());
        
        if ("COD".equalsIgnoreCase(paymentType)) {
            baseCharge = baseCharge.add(rateCard.getCodSurcharge());
        }

        return baseCharge;
    }
}
