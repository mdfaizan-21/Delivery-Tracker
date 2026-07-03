package com.example.lastmile.repository;

import com.example.lastmile.model.Order;
import com.example.lastmile.model.OrderTrackingHistory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface OrderTrackingHistoryRepository extends JpaRepository<OrderTrackingHistory, Long> {
    List<OrderTrackingHistory> findByOrderOrderByTimestampAsc(Order order);
}
