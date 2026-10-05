import 'package:flutter/material.dart';
import 'package:flexicon/flexicon.dart';
import '../utils/icon_util.dart';

class JobOffersScreen extends StatelessWidget {
  final Function(int)? onNavigateToTab;

  const JobOffersScreen({super.key, this.onNavigateToTab});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFFF6F8FB),
      appBar: AppBar(
        backgroundColor: Colors.white,
        elevation: 0,
        scrolledUnderElevation: 1,
        title: const Text(
          'Available Job Offers',
          style: TextStyle(fontSize: 18, fontWeight: FontWeight.w800, color: Color(0xFF0F172A)),
        ),
      ),
      body: ListView(
        padding: const EdgeInsets.all(20),
        physics: const BouncingScrollPhysics(),
        children: [
          _buildJobCard(
            context: context,
            storeName: 'Lumina Solar & Power',
            pickupAddress: 'Block A, Industrial Estate, Ikeja',
            dropoffAddress: 'No 15, Residential Estate, Lekki',
            distance: '18 km',
            earning: '₦4,500',
            timeWindow: 'Deliver by 2:00 PM',
          ),
          const SizedBox(height: 16),
          _buildJobCard(
            context: context,
            storeName: 'Elite Gadgets Hub',
            pickupAddress: 'Shop 4, Tech Plaza, Surulere',
            dropoffAddress: 'No 2, Marina Road, Island',
            distance: '12 km',
            earning: '₦3,200',
            timeWindow: 'Deliver by 3:30 PM',
          ),
          const SizedBox(height: 16),
          _buildJobCard(
            context: context,
            storeName: 'Fresh Groceries',
            pickupAddress: 'Market Square, Yaba',
            dropoffAddress: 'Plot 7, Victoria Island',
            distance: '8 km',
            earning: '₦2,100',
            timeWindow: 'Deliver by 4:00 PM',
          ),
        ],
      ),
    );
  }

  Widget _buildJobCard({
    required BuildContext context,
    required String storeName,
    required String pickupAddress,
    required String dropoffAddress,
    required String distance,
    required String earning,
    required String timeWindow,
  }) {
    return Container(
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(20),
        border: Border.all(color: const Color(0xFFE2E8F0)),
        boxShadow: const [
          BoxShadow(
            color: Color(0x05000000),
            blurRadius: 10,
            offset: Offset(0, 4),
          ),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Padding(
            padding: const EdgeInsets.all(16),
            child: Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                  decoration: BoxDecoration(
                    color: const Color(0xFFE0E7FF),
                    borderRadius: BorderRadius.circular(8),
                  ),
                  child: Text(
                    timeWindow,
                    style: const TextStyle(fontSize: 10, fontWeight: FontWeight.w800, color: Color(0xFF4338CA)),
                  ),
                ),
                Text(
                  earning,
                  style: const TextStyle(fontSize: 16, fontWeight: FontWeight.w900, color: Color(0xFF16A34A)),
                ),
              ],
            ),
          ),
          const Divider(height: 1, color: Color(0xFFF1F5F9)),
          Padding(
            padding: const EdgeInsets.all(16),
            child: Column(
              children: [
                Row(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Icon(fixIcon(FlexIcon.solid.store1), size: 20, color: const Color(0xFF64748B)),
                    const SizedBox(width: 12),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            storeName,
                            style: const TextStyle(fontSize: 14, fontWeight: FontWeight.w800, color: Color(0xFF0F172A)),
                          ),
                          const SizedBox(height: 2),
                          Text(
                            pickupAddress,
                            style: const TextStyle(fontSize: 12, color: Color(0xFF64748B)),
                          ),
                        ],
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 16),
                Row(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Icon(fixIcon(FlexIcon.solid.locationPin3), size: 20, color: const Color(0xFFEF4444)),
                    const SizedBox(width: 12),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          const Text(
                            'Dropoff',
                            style: TextStyle(fontSize: 14, fontWeight: FontWeight.w800, color: Color(0xFF0F172A)),
                          ),
                          const SizedBox(height: 2),
                          Text(
                            dropoffAddress,
                            style: const TextStyle(fontSize: 12, color: Color(0xFF64748B)),
                          ),
                        ],
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 12),
                Row(
                  children: [
                    Icon(fixIcon(FlexIcon.remix.mapLocation), size: 16, color: const Color(0xFF94A3B8)),
                    const SizedBox(width: 6),
                    Text(
                      'Total Distance: $distance',
                      style: const TextStyle(fontSize: 12, fontWeight: FontWeight.w600, color: Color(0xFF475569)),
                    ),
                  ],
                ),
              ],
            ),
          ),
          const Divider(height: 1, color: Color(0xFFF1F5F9)),
          Padding(
            padding: const EdgeInsets.all(16),
            child: Row(
              children: [
                Expanded(
                  child: OutlinedButton(
                    style: OutlinedButton.styleFrom(
                      foregroundColor: const Color(0xFFEF4444),
                      side: const BorderSide(color: Color(0xFFFCA5A5)),
                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                      padding: const EdgeInsets.symmetric(vertical: 14),
                    ),
                    onPressed: () {},
                    child: const Text('Reject', style: TextStyle(fontWeight: FontWeight.w700)),
                  ),
                ),
                const SizedBox(width: 12),
                Expanded(
                  flex: 2,
                  child: ElevatedButton(
                    style: ElevatedButton.styleFrom(
                      backgroundColor: const Color(0xFF16A34A),
                      foregroundColor: Colors.white,
                      elevation: 0,
                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                      padding: const EdgeInsets.symmetric(vertical: 14),
                    ),
                    onPressed: () {},
                    child: const Text('Accept Job', style: TextStyle(fontWeight: FontWeight.w700)),
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}
