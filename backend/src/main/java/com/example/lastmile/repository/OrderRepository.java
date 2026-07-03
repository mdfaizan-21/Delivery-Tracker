package com.example.lastmile.repository;

import com.example.lastmile.model.Order;
import com.example.lastmile.model.OrderStatus;
import com.example.lastmile.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface OrderRepository extends JpaRepository<Order, Long> {
    List<Order> findByCustomer(User customer);
    List<Order> findByAgent(User agent);
    List<Order> findByStatus(OrderStatus status);
}
