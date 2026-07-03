# System Design: Last-Mile Delivery Tracker

The Last-Mile Delivery Tracker is a comprehensive logistics platform designed to manage the entire delivery lifecycle, from automated pricing and intelligent agent routing to real-time customer notifications. The system handles complex business logic systematically to ensure scalability and reliability.

## 1. Rate Calculation Engine

The Rate Calculation Engine dynamically computes the total shipping cost of an order before confirmation, without relying on hardcoded values. The algorithm strictly adheres to industry-standard volumetric pricing logic and applies surcharges seamlessly.

### Mechanism:
1. **Volumetric Weight Calculation:** 
   Logistics providers charge based on the space a package occupies rather than just its dead weight. When an order is placed, the engine calculates the volumetric weight using the standard formula:
   \[ \text{Volumetric Weight (kg)} = \frac{L \times B \times H \text{ (in cm)}}{5000} \]
   The engine then compares this volumetric weight with the actual physical weight of the package and bills the customer based on the higher of the two (Charged Weight).
   
2. **Dynamic Rate Card Lookup:**
   The admin configures a flexible mapping of rates in the `rate_cards` database table. A Rate Card is uniquely identified by the combination of a `From Zone`, a `To Zone`, and an `Order Type` (B2B or B2C). Upon order creation, the engine queries the `RateCardRepository` to extract the base rate per kilogram for that specific route and segment.
   
3. **Total Calculation & COD Surcharge:**
   The base shipping cost is derived by multiplying the Charged Weight by the matched Rate Card's per-kg value. If the customer selects Cash on Delivery (COD) as the payment type, the engine dynamically adds the predefined COD surcharge from the Rate Card.

This modular design allows logistics administrators to adjust base rates, surcharges, and inter-zone configurations dynamically from an administrative panel without any backend code deployments.

## 2. Zone Detection Approach

Zones define operational coverage areas. Instead of relying on rigid, hardcoded location coordinates, the system uses a mapping-based detection approach to simplify administrative control.

### Mechanism:
1. **Zone Entities:** 
   Admins create distinct `Zone` entities in the database (e.g., "Zone A - Downtown", "Zone B - Suburbs"). Each zone acts as a geographic bucket.
2. **Frontend Mapping:** 
   For the MVP, zone detection relies on explicit zone IDs selected by the customer or admin during the order creation process.
3. **Future Extension:**
   The schema naturally supports expanding into arbitrary address string mapping. A `zone_mappings` table or an integration with a geocoding API (e.g., Google Maps API) would convert raw string addresses into standardized coordinates, evaluating boundary logic (Polygons or Radius) to automatically resolve an address into its parent `zone_id`.

## 3. Auto-Assignment Logic

Efficient order distribution is critical to minimizing delivery bottlenecks. The Auto-Assignment Engine intelligently delegates orders to agents based on active payload capacity, ensuring balanced workloads across the fleet.

### Mechanism:
1. **Agent Availability Modeling:**
   When an order is created and hits the `PENDING` state, the `AgentAssignmentService` is triggered. The service polls the system for all active users possessing the `AGENT` role.
2. **Payload Queue Evaluation:**
   To prevent overwhelming a single agent, the system dynamically calculates the current "Active Payload Queue" for every agent. It queries the `orders` table to count how many non-terminal orders (e.g., `ASSIGNED`, `PICKED_UP`, `IN_TRANSIT`, `OUT_FOR_DELIVERY`) are currently attached to each agent.
3. **Lowest-Queue Routing:**
   The assignment algorithm loops through the available agents and assigns the new order to the agent with the lowest active payload queue. This acts as an organic load balancer, ensuring that order backlogs do not centralize heavily on specific individuals.

## 4. Order Lifecycle & Failed Delivery Handling

A state machine governs the order lifecycle, ensuring strict progression and immutable tracking histories for accountability. 

### Status Lifecycle:
An order flows from `PENDING` -> `ASSIGNED` -> `PICKED_UP` -> `IN_TRANSIT` -> `OUT_FOR_DELIVERY` -> (`DELIVERED` or `FAILED`).

### Immutable Tracking:
Every transition is intercepted by the `OrderService`. The old status, new status, timestamp, and the actor (Admin or Agent) executing the change are logged into the append-only `order_tracking_history` table. This creates a tamper-proof audit trail accessible by customers via the `/api/customer/orders/{id}/timeline` endpoint.

### Failed Delivery Flow:
1. If a delivery attempt is unsuccessful (e.g., customer unavailable), the agent marks the status as `FAILED`.
2. The `NotificationService` intercepts the `FAILED` state and immediately dispatches an automated email to the customer (via SMTP JavaMailSender integrations), alerting them of the failure and requesting action.
3. The customer accesses their dashboard and provides a new target date, triggering the `rescheduleFailedOrder` endpoint.
4. The system updates the `rescheduled_date` column, resets the status back to `PENDING`, and forcibly clears the previous agent assignment. The Auto-Assignment engine is then re-invoked to intelligently route the rescheduled order to a fresh, available agent for the second attempt.
