import 'package:flutter/material.dart';
import 'package:flutter_animate/flutter_animate.dart';
import '../data/mock_data.dart';
import 'trip_manifest_screen.dart';
import 'package:mobile_driver/utils/icon_util.dart';
import 'package:flexicon/flexicon.dart';

class AllTripsScreen extends StatelessWidget {
  const AllTripsScreen({Key? key}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFFF8FAFC),
      appBar: AppBar(
        backgroundColor: const Color(0xFFF8FAFC),
        elevation: 0,
        leading: Navigator.canPop(context) ? IconButton(
          icon: const Icon(Icons.arrow_back, color: Colors.black87),
          onPressed: () => Navigator.pop(context),
        ) : null,
        title: const Text('All Trips', style: TextStyle(color: Colors.black87)),
        actions: [
          Padding(
            padding: const EdgeInsets.only(right: 16, top: 8, bottom: 8),
            child: PopupMenuButton<String>(
              position: PopupMenuPosition.under,
              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
              child: Container(
                padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
                decoration: BoxDecoration(
                  color: const Color(0xFF1B62F0),
                  borderRadius: BorderRadius.circular(20),
                ),
                child: const Row(
                  children: [
                    Text('Upcoming trips', style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 13)),
                    SizedBox(width: 4),
                    Icon(Icons.keyboard_arrow_down, color: Colors.white, size: 18),
                  ],
                ),
              ),
              itemBuilder: (context) => [
                const PopupMenuItem(
                  value: 'all',
                  child: Text('All Trips'),
                ),
                const PopupMenuItem(
                  value: 'upcoming',
                  child: Text('Upcoming Trips'),
                ),
                const PopupMenuItem(
                  value: 'past',
                  child: Text('Past Trips'),
                ),
              ],
              onSelected: (value) {
                // To be implemented: filter functionality
              },
            ),
          )
        ],
      ),
      body: ListView(
        padding: const EdgeInsets.all(24),
        children: [
          const Text('Active Trip', style: TextStyle(color: Colors.black87, fontWeight: FontWeight.bold, fontSize: 18)),
          const SizedBox(height: 16),
          _buildActiveTripCard(context, MockData.todaysTrips.first),
          const SizedBox(height: 32),
          const Text('Dec 22nd, 2022', style: TextStyle(color: Colors.black87, fontWeight: FontWeight.bold, fontSize: 16)),
          const SizedBox(height: 16),
          ...MockData.todaysTrips.skip(1).map((trip) => _buildTripCard(context, trip)).toList(),
        ],
      ).animate(delay: const Duration(milliseconds: 1500)).fadeIn(duration: const Duration(milliseconds: 800)).slideY(begin: 0.2, end: 0, duration: const Duration(milliseconds: 800)),
    );
  }

  Widget _buildTripCard(BuildContext context, trip) {
    return GestureDetector(
      onTap: () {
        Navigator.push(
          context,
          MaterialPageRoute(
            builder: (context) => TripManifestScreen(trip: trip),
          ),
        );
      },
      child: Container(
        margin: const EdgeInsets.only(bottom: 16),
        padding: const EdgeInsets.all(20),
        decoration: BoxDecoration(
          color: const Color(0xFFFFFFFF),
          borderRadius: BorderRadius.circular(24),
        ),
        child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Icon(fixIcon(FlexIcon.remix.transferTruckTime), color: Color(0xFF757575), size: 16),
              const SizedBox(width: 8),
              Text(trip.routeCode, style: const TextStyle(color: Color(0xFF757575), fontSize: 12)),
            ],
          ),
          const SizedBox(height: 16),
          Row(
            children: [
              Icon(fixIcon(FlexIcon.remix.locationTarget2), color: const Color(0xFF1B62F0), size: 12),
              const SizedBox(width: 12),
              Text(trip.startLocation, style: const TextStyle(color: Colors.black87, fontSize: 16, fontWeight: FontWeight.bold)),
            ],
          ),
          Container(
            margin: const EdgeInsets.only(left: 5),
            height: 20,
            width: 2,
            color: Color(0xFFE0E0E0),
          ),
          Row(
            children: [
              Icon(fixIcon(FlexIcon.remix.locationPin3), color: const Color(0xFF1B62F0), size: 12),
              const SizedBox(width: 12),
              Text(trip.endLocation, style: const TextStyle(color: Colors.black87, fontSize: 16, fontWeight: FontWeight.bold)),
            ],
          ),
          const SizedBox(height: 20),
          Row(
            children: [
              Icon(fixIcon(FlexIcon.remix.countdownTimer), color: Color(0xFF757575), size: 14),
              const SizedBox(width: 6),
              Text(trip.time, style: const TextStyle(color: Color(0xFF757575), fontSize: 12)),
              const SizedBox(width: 16),
              Icon(fixIcon(FlexIcon.remix.userCircleSingle), color: Color(0xFF757575), size: 14),
              const SizedBox(width: 6),
              Text('${trip.totalPassengers} Passengers', style: const TextStyle(color: Color(0xFF757575), fontSize: 12)),
            ],
          ),
          const SizedBox(height: 20),
          SizedBox(
            width: double.infinity,
            child: ElevatedButton(
              style: ElevatedButton.styleFrom(
                backgroundColor: const Color(0xFF1B62F0),
                foregroundColor: Colors.white,
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                padding: const EdgeInsets.symmetric(vertical: 16),
              ),
              onPressed: () {
                Navigator.push(context, MaterialPageRoute(builder: (_) => TripManifestScreen(trip: trip)));
              },
              child: Row(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  Text('More Details', style: TextStyle(fontWeight: FontWeight.bold)),
                  SizedBox(width: 8),
                  Icon(Icons.chevron_right, size: 16),
                ],
              ),
            ),
          ),
        ],
      ),
    ),
    );
  }

  Widget _buildActiveTripCard(BuildContext context, trip) {
    return GestureDetector(
      onTap: () {
        Navigator.push(context, MaterialPageRoute(builder: (context) => TripManifestScreen(trip: trip)));
      },
      child: Container(
        padding: const EdgeInsets.all(20),
        decoration: BoxDecoration(
          color: const Color(0xFF1B62F0),
          borderRadius: BorderRadius.circular(24),
          boxShadow: [
            BoxShadow(
              color: const Color(0xFF1B62F0).withValues(alpha: 0.3),
              blurRadius: 16,
              offset: const Offset(0, 8),
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
                    color: Colors.white.withValues(alpha: 0.2),
                    borderRadius: BorderRadius.circular(12),
                  ),
                  child: const Text('ONGOING', style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 12)),
                ),
                const Icon(Icons.person_pin_circle, color: Colors.white, size: 24),
              ],
            ),
            const SizedBox(height: 20),
            Row(
              children: [
                const Icon(Icons.my_location, color: Colors.white, size: 16),
                const SizedBox(width: 12),
                Text(trip.startLocation, style: const TextStyle(color: Colors.white, fontSize: 18, fontWeight: FontWeight.bold)),
              ],
            ),
            Container(
              margin: const EdgeInsets.only(left: 7),
              height: 24,
              width: 2,
              color: Colors.white54,
            ),
            Row(
              children: [
                const Icon(Icons.location_on, color: Colors.white, size: 16),
                const SizedBox(width: 12),
                Text(trip.endLocation, style: const TextStyle(color: Colors.white, fontSize: 18, fontWeight: FontWeight.bold)),
              ],
            ),
            const SizedBox(height: 24),
            SizedBox(
              width: double.infinity,
              child: ElevatedButton(
                style: ElevatedButton.styleFrom(
                  backgroundColor: Colors.white,
                  foregroundColor: const Color(0xFF1B62F0),
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                  padding: const EdgeInsets.symmetric(vertical: 16),
                ),
                onPressed: () {
                  Navigator.push(context, MaterialPageRoute(builder: (_) => TripManifestScreen(trip: trip)));
                },
                child: const Row(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    Icon(Icons.map, size: 18),
                    SizedBox(width: 8),
                    Text('View Live Map', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 16)),
                  ],
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}
