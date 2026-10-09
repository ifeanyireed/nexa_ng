import 'package:flutter/material.dart';

class RoutesScreen extends StatelessWidget {
  const RoutesScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFFF8FAFC),
      appBar: AppBar(
        title: const Text('My Routes', style: TextStyle(fontWeight: FontWeight.bold)),
        backgroundColor: Colors.white,
        foregroundColor: Colors.black,
        elevation: 0,
      ),
      body: ListView(
        padding: const EdgeInsets.all(24.0),
        children: [
          _buildRouteCard(
            routeCode: 'RT-101',
            startLocation: 'Ikeja Terminal',
            endLocation: 'CMS Terminal',
            time: '08:00 AM - 09:30 AM',
            frequency: 'Daily',
          ),
          const SizedBox(height: 16),
          _buildRouteCard(
            routeCode: 'RT-205',
            startLocation: 'Yaba',
            endLocation: 'Lekki Phase 1',
            time: '05:00 PM - 06:45 PM',
            frequency: 'Weekdays',
          ),
        ],
      ),
    );
  }

  Widget _buildRouteCard({
    required String routeCode,
    required String startLocation,
    required String endLocation,
    required String time,
    required String frequency,
  }) {
    return Container(
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(16),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withValues(alpha: 0.03),
            blurRadius: 10,
            offset: const Offset(0, 4),
          ),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                decoration: BoxDecoration(
                  color: const Color(0xFF1B62F0).withValues(alpha: 0.1),
                  borderRadius: BorderRadius.circular(8),
                ),
                child: Text(routeCode, style: const TextStyle(color: Color(0xFF1B62F0), fontWeight: FontWeight.bold, fontSize: 12)),
              ),
              Text(frequency, style: const TextStyle(color: Colors.orange, fontWeight: FontWeight.bold, fontSize: 12)),
            ],
          ),
          const SizedBox(height: 20),
          Row(
            children: [
              const Icon(Icons.circle, color: Color(0xFF1B62F0), size: 12),
              const SizedBox(width: 12),
              Text(startLocation, style: const TextStyle(fontSize: 16, fontWeight: FontWeight.bold, color: Colors.black87)),
            ],
          ),
          Container(
            margin: const EdgeInsets.only(left: 5),
            height: 24,
            width: 2,
            color: Colors.grey.shade300,
          ),
          Row(
            children: [
              const Icon(Icons.location_on, color: Color(0xFF1B62F0), size: 12),
              const SizedBox(width: 12),
              Text(endLocation, style: const TextStyle(fontSize: 16, fontWeight: FontWeight.bold, color: Colors.black87)),
            ],
          ),
          const SizedBox(height: 20),
          Divider(color: Colors.grey.shade200),
          const SizedBox(height: 12),
          Row(
            children: [
              const Icon(Icons.access_time, color: Color(0xFF757575), size: 16),
              const SizedBox(width: 8),
              Text(time, style: const TextStyle(color: Color(0xFF757575), fontSize: 14)),
            ],
          ),
        ],
      ),
    );
  }
}
