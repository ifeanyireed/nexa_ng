import 'package:flutter/material.dart';
import 'package:flutter_animate/flutter_animate.dart';
import '../models/shipment.dart';
import '../data/mock_data.dart';
import 'tracking_screen.dart';
import 'package:flexicon/flexicon.dart';
import 'package:mobile_customer/utils/icon_util.dart';

class OrdersScreen extends StatefulWidget {
  const OrdersScreen({super.key});

  @override
  State<OrdersScreen> createState() => _OrdersScreenState();
}

class _OrdersScreenState extends State<OrdersScreen> with SingleTickerProviderStateMixin {
  late TabController _tabController;

  @override
  void initState() {
    super.initState();
    _tabController = TabController(length: 2, vsync: this);
  }

  @override
  void dispose() {
    _tabController.dispose();
    super.dispose();
  }

  void _openTracking(ShipmentItem shipment) {
    Navigator.of(context).push(
      MaterialPageRoute(
        builder: (context) => TrackingScreen(initialShipment: shipment),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFFF8FAFC),
      appBar: AppBar(
        backgroundColor: Colors.white,
        elevation: 0,
        scrolledUnderElevation: 1,
        title: const Text(
          'My Activity & Orders',
          style: TextStyle(fontSize: 18, fontWeight: FontWeight.w800, color: Color(0xFF0F172A)),
        ),
        bottom: TabBar(
          controller: _tabController,
          labelColor: const Color(0xFF1B62F0),
          unselectedLabelColor: const Color(0xFF64748B),
          indicatorColor: const Color(0xFF1B62F0),
          indicatorWeight: 3,
          labelStyle: const TextStyle(fontWeight: FontWeight.w800, fontSize: 13),
          tabs: const [
            Tab(text: 'Store Purchases'),
            Tab(text: 'Service Bookings'),
          ],
        ),
      ),
      body: TabBarView(
        controller: _tabController,
        children: [
          _buildStoreOrdersList(),
          _buildServiceBookingsList(),
        ],
      ),
    ).animate().fadeIn(duration: const Duration(milliseconds: 400)).slideY(begin: 0.05, end: 0);
  }

  Widget _buildStoreOrdersList() {
    final mockOrders = [
      {
        'id': 'OFIA-99201',
        'store': 'Volt & Quartz Flagship',
        'vertical': 'Gadgets',
        'date': 'Today, 2:15 PM',
        'items': 'Apple MacBook Pro 16" (M3 Max)',
        'amount': '₦4,850,000',
        'status': 'Out for Delivery',
        'color': const Color(0xFF2563EB),
        'shipment': MockData.shipments[0],
      },
      {
        'id': 'OFIA-98432',
        'store': 'Terra & Thyme Bistro',
        'vertical': 'Food',
        'date': 'Yesterday, 7:30 PM',
        'items': '2x Fire-Roasted Suya Ribeye + 1x Honey Cake',
        'amount': '₦95,000',
        'status': 'Delivered',
        'color': const Color(0xFF16A34A),
        'shipment': MockData.shipments[3],
      },
      {
        'id': 'OFIA-96110',
        'store': 'Hardware & Energy',
        'vertical': 'Hardware',
        'date': '28 Sep 2026',
        'items': '1x Felicity 10kWh LiFePO4 Lithium Battery',
        'amount': '₦2,650,000',
        'status': 'Delivered',
        'color': const Color(0xFF16A34A),
        'shipment': MockData.shipments[1],
      },
    ];

    return ListView.separated(
      physics: const BouncingScrollPhysics(),
      padding: const EdgeInsets.fromLTRB(20, 16, 20, 100),
      itemCount: mockOrders.length,
      separatorBuilder: (_, __) => const SizedBox(height: 14),
      itemBuilder: (context, index) {
        final order = mockOrders[index];
        final shipment = order['shipment'] as ShipmentItem;
        final statusColor = order['color'] as Color;

        return Container(
          padding: const EdgeInsets.all(16),
          decoration: BoxDecoration(
            color: Colors.white,
            borderRadius: BorderRadius.circular(20),
            border: Border.all(color: const Color(0xFFE2E8F0)),
            boxShadow: [
              BoxShadow(color: Colors.black.withOpacity(0.02), blurRadius: 8, offset: const Offset(0, 2)),
            ],
          ),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Text(
                    order['id'] as String,
                    style: const TextStyle(fontSize: 12, fontWeight: FontWeight.w800, color: Color(0xFF64748B)),
                  ),
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                    decoration: BoxDecoration(
                      color: statusColor.withOpacity(0.1),
                      borderRadius: BorderRadius.circular(8),
                    ),
                    child: Text(
                      order['status'] as String,
                      style: TextStyle(fontSize: 11, fontWeight: FontWeight.w800, color: statusColor),
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 8),
              Text(
                order['store'] as String,
                style: const TextStyle(fontSize: 15, fontWeight: FontWeight.w800, color: Color(0xFF0F172A)),
              ),
              const SizedBox(height: 4),
              Text(
                order['items'] as String,
                style: const TextStyle(fontSize: 12, color: Color(0xFF475569)),
              ),
              const SizedBox(height: 12),
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Text(
                    order['amount'] as String,
                    style: const TextStyle(fontSize: 15, fontWeight: FontWeight.w900, color: Color(0xFF0F172A)),
                  ),
                  ElevatedButton.icon(
                    style: ElevatedButton.styleFrom(
                      backgroundColor: const Color(0xFF1B62F0),
                      foregroundColor: Colors.white,
                      elevation: 0,
                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                      padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 8),
                    ),
                    icon: Icon(fixIcon(FlexIcon.remix.locationTarget2), size: 14),
                    label: const Text('Track Courier', style: TextStyle(fontSize: 11, fontWeight: FontWeight.w800)),
                    onPressed: () => _openTracking(shipment),
                  ),
                ],
              ),
            ],
          ),
        );
      },
    );
  }

  Widget _buildServiceBookingsList() {
    final mockBookings = [
      {
        'title': 'COREN Solar Sizing & Roof Inspection',
        'store': 'Hardware & Energy',
        'specialist': 'Engr. Kayode Adebayo',
        'date': 'Tomorrow, 10:00 AM',
        'status': 'Confirmed',
        'fee': '₦50,000',
      },
      {
        'title': 'Pre-Purchase Mechanical Diagnostic Inspection',
        'store': 'Apex Motor Group',
        'specialist': 'Engr. Tariq Adeleke',
        'date': 'Friday, 3:00 PM',
        'status': 'Confirmed',
        'fee': '₦45,000',
      },
      {
        'title': 'Botanical Oxygen Hydra-Facial Treatment',
        'store': 'Élan Skin Sanctuary',
        'specialist': 'Dr. Amara Okonkwo',
        'date': '24 Sep 2026',
        'status': 'Completed',
        'fee': '₦45,000',
      },
    ];

    return ListView.separated(
      physics: const BouncingScrollPhysics(),
      padding: const EdgeInsets.fromLTRB(20, 16, 20, 100),
      itemCount: mockBookings.length,
      separatorBuilder: (_, __) => const SizedBox(height: 14),
      itemBuilder: (context, index) {
        final booking = mockBookings[index];
        final isCompleted = booking['status'] == 'Completed';

        return Container(
          padding: const EdgeInsets.all(16),
          decoration: BoxDecoration(
            color: Colors.white,
            borderRadius: BorderRadius.circular(20),
            border: Border.all(color: const Color(0xFFE2E8F0)),
          ),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                    decoration: BoxDecoration(
                      color: isCompleted ? const Color(0xFFF1F5F9) : const Color(0xFFDCFCE7),
                      borderRadius: BorderRadius.circular(8),
                    ),
                    child: Text(
                      booking['status'] as String,
                      style: TextStyle(
                        fontSize: 11,
                        fontWeight: FontWeight.w800,
                        color: isCompleted ? const Color(0xFF64748B) : const Color(0xFF16A34A),
                      ),
                    ),
                  ),
                  Text(
                    booking['fee'] as String,
                    style: const TextStyle(fontSize: 14, fontWeight: FontWeight.w900, color: Color(0xFF0F172A)),
                  ),
                ],
              ),
              const SizedBox(height: 10),
              Text(
                booking['title'] as String,
                style: const TextStyle(fontSize: 14, fontWeight: FontWeight.w800, color: Color(0xFF0F172A)),
              ),
              const SizedBox(height: 3),
              Text(
                'Provider: ${booking['store']} • ${booking['specialist']}',
                style: const TextStyle(fontSize: 12, color: Color(0xFF64748B)),
              ),
              const SizedBox(height: 10),
              Row(
                children: [
                  Icon(fixIcon(FlexIcon.remix.stopwatch), size: 14, color: Color(0xFF1B62F0)),
                  const SizedBox(width: 4),
                  Text(
                    booking['date'] as String,
                    style: const TextStyle(fontSize: 12, fontWeight: FontWeight.w700, color: Color(0xFF1B62F0)),
                  ),
                  const Spacer(),
                  OutlinedButton(
                    style: OutlinedButton.styleFrom(
                      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                      visualDensity: VisualDensity.compact,
                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                    ),
                    onPressed: () {
                      ScaffoldMessenger.of(context).showSnackBar(
                        const SnackBar(
                          content: Text('Opening chat with provider concierge...'),
                          behavior: SnackBarBehavior.floating,
                        ),
                      );
                    },
                    child: const Text('Contact Provider', style: TextStyle(fontSize: 11, fontWeight: FontWeight.w700)),
                  ),
                ],
              ),
            ],
          ),
        );
      },
    );
  }
}
