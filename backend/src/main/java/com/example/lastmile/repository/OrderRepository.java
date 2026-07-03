package com.example.lastmile.repository;

import com.example.lastmile.model.Order;
import com.example.lastmile.model.OrderStatus;
import com.example.lastmile.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Collection;
import java.util.List;

@Repository
public interface OrderRepository extends JpaRepository<Order, Long> {
    List<Order> findByCustomer(User customer);
    List<Order> findByAgent(User agent);
    List<Order> findByStatus(OrderStatus status);
    
    long countByAgentAndStatusIn(User agent, Collection<OrderStatus> statuses);

    // Filters for Admin
    @Query("SELECT o FROM Order o WHERE " +
           "(:status IS NULL OR o.status = :status) AND " +
           "(:zoneId IS NULL OR o.pickupZone.id = :zoneId) AND " +
           "(:agentId IS NULL OR o.agent.id = :agentId)")
    List<Order> findByFilters(@Param("status") OrderStatus status, 
                              @Param("zoneId") Long zoneId, 
                              @Param("agentId") Long agentId);
}
