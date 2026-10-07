import 'package:flutter/material.dart';
import 'package:flexicon/flexicon.dart';
import '../utils/icon_util.dart';
import '../models/transport_models.dart';
import '../data/transport_mock_data.dart';

class BookingsScreen extends StatelessWidget {
  const BookingsScreen({Key? key}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    // For demo purposes, we will use activeTrip and maybe some mock past trips
    final activeTrip = TransportMockData.activeTrip;

    return Scaffold(
      backgroundColor: const Color(0xFFF8FAFC),
      appBar: AppBar(
        title: const Text('My Bookings', style: TextStyle(fontWeight: FontWeight.w700)),
        backgroundColor: Colors.white,
        foregroundColor: Colors.black,
        elevation: 0,
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(20),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Text(
              'Active & Upcoming',
              style: TextStyle(
                fontSize: 16,
                fontWeight: FontWeight.w800,
                color: Color(0xFF0F172A),
              ),
            ),
            const SizedBox(height: 16),
            if (activeTrip != null) _buildBookingCard(activeTrip, isActive: true),
            const SizedBox(height: 24),
            const Text(
              'Past Bookings',
              style: TextStyle(
                fontSize: 16,
                fontWeight: FontWeight.w800,
                color: Color(0xFF0F172A),
              ),
            ),
            const SizedBox(height: 16),
            _buildBookingCard(
              Trip(
                id: 'trip_8828',
                serviceType: ServiceType.rental,
                pickupLocation: 'Victoria Island',
                destination: 'Lekki Phase 1',
                pickupTime: DateTime.now().subtract(const Duration(days: 2)),
                status: TripStatus.completed,
              ),
              isActive: false,
            ),
            const SizedBox(height: 16),
            _buildBookingCard(
              Trip(
                id: 'trip_8827',
                serviceType: ServiceType.onDemand,
                pickupLocation: 'Ikeja City Mall',
                destination: 'Maryland',
                pickupTime: DateTime.now().subtract(const Duration(days: 5)),
                status: TripStatus.completed,
              ),
              isActive: false,
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildBookingCard(Trip trip, {required bool isActive}) {
    return Container(
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: const Color(0xFFE2E8F0)),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(0.02),
            blurRadius: 5,
            offset: const Offset(0, 2),
          ),
        ],
      ),
      child: Padding(
        padding: const EdgeInsets.all(20),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Row(
                  children: [
                    Container(
                      padding: const EdgeInsets.all(8),
                      decoration: BoxDecoration(
                        color: const Color(0xFF1B62F0).withOpacity(0.1),
                        shape: BoxShape.circle,
                      ),
                      child: Icon(fixIcon(FlexIcon.remix.car), color: const Color(0xFF1B62F0), size: 16),
                    ),
                    const SizedBox(width: 12),
                    Text(
                      trip.serviceType.name.toUpperCase(),
                      style: const TextStyle(fontWeight: FontWeight.w700, fontSize: 13),
                    ),
                  ],
                ),
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                  decoration: BoxDecoration(
                    color: isActive ? const Color(0xFF1B62F0).withOpacity(0.1) : Colors.grey.shade100,
                    borderRadius: BorderRadius.circular(20),
                  ),
                  child: Text(
                    trip.status.name.toUpperCase(),
                    style: TextStyle(
                      color: isActive ? const Color(0xFF1B62F0) : Colors.grey.shade600,
                      fontSize: 11,
                      fontWeight: FontWeight.w800,
                    ),
                  ),
                ),
              ],
            ),
            const SizedBox(height: 20),
            Row(
              children: [
                Column(
                  children: [
                    Icon(fixIcon(FlexIcon.remix.focus), color: const Color(0xFF94A3B8), size: 16),
                    Container(height: 20, width: 2, color: const Color(0xFFE2E8F0)),
                    Icon(fixIcon(FlexIcon.remix.locationPin3), color: const Color(0xFFF59E0B), size: 16),
                  ],
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(trip.pickupLocation, style: const TextStyle(fontSize: 14, fontWeight: FontWeight.w600)),
                      const SizedBox(height: 18),
                      Text(trip.destination, style: const TextStyle(fontSize: 14, fontWeight: FontWeight.w600)),
                    ],
                  ),
                ),
                Column(
                  crossAxisAlignment: CrossAxisAlignment.end,
                  children: [
                    Text(trip.pickupTime.toString().substring(0, 10), style: TextStyle(color: Colors.grey.shade500, fontSize: 12)),
                    const SizedBox(height: 4),
                    Text(trip.pickupTime.toString().substring(11, 16), style: const TextStyle(fontWeight: FontWeight.w700, fontSize: 13)),
                  ],
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }
}
