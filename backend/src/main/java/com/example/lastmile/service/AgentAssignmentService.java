package com.example.lastmile.service;

import com.example.lastmile.model.Order;
import com.example.lastmile.model.OrderStatus;
import com.example.lastmile.model.User;
import com.example.lastmile.model.UserRole;
import com.example.lastmile.repository.OrderRepository;
import com.example.lastmile.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.Arrays;
import java.util.List;

@Service
public class AgentAssignmentService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private OrderRepository orderRepository;

    private static final List<OrderStatus> ACTIVE_STATUSES = Arrays.asList(
            OrderStatus.ASSIGNED, 
            OrderStatus.PICKED_UP, 
            OrderStatus.IN_TRANSIT, 
            OrderStatus.OUT_FOR_DELIVERY
    );

    /**
     * Finds the most suitable agent for the given order based on lowest active payload queue.
     * Note: In a full GIS system, this would filter agents based on `pickup_zone_id`. 
     * Since agents aren't tied to zones in the schema, we find the globally freest agent.
     */
    public User findBestAgentForOrder(Order order) {
        List<User> agents = userRepository.findByRole(UserRole.AGENT);
        
        if (agents.isEmpty()) {
            return null; // No agents available
        }

        User bestAgent = null;
        long lowestQueue = Long.MAX_VALUE;

        for (User agent : agents) {
            long activeOrders = orderRepository.countByAgentAndStatusIn(agent, ACTIVE_STATUSES);
            if (activeOrders < lowestQueue) {
                lowestQueue = activeOrders;
                bestAgent = agent;
            }
        }

        return bestAgent;
    }
}
