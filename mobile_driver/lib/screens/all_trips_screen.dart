import 'package:flutter/material.dart';
import '../data/mock_data.dart';
import 'trip_manifest_screen.dart';

class AllTripsScreen extends StatelessWidget {
  const AllTripsScreen({Key? key}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFF1E1E2C),
      appBar: AppBar(
        backgroundColor: const Color(0xFF1E1E2C),
        elevation: 0,
        leading: IconButton(
          icon: const Icon(Icons.arrow_back, color: Colors.white),
          onPressed: () => Navigator.pop(context),
        ),
        title: const Text('All Trips', style: TextStyle(color: Colors.white)),
        actions: [
          Container(
            margin: const EdgeInsets.only(right: 16, top: 12, bottom: 12),
            padding: const EdgeInsets.symmetric(horizontal: 12),
            decoration: BoxDecoration(
              color: const Color(0xFF00E676),
              borderRadius: BorderRadius.circular(20),
            ),
            child: const Row(
              children: [
                Text('Upcoming trips', style: TextStyle(color: Colors.black, fontWeight: FontWeight.bold, fontSize: 12)),
                Icon(Icons.keyboard_arrow_down, color: Colors.black, size: 16),
              ],
            ),
          )
        ],
      ),
      body: ListView(
        padding: const EdgeInsets.all(24),
        children: [
          const Text('Dec 22nd, 2022', style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 16)),
          const SizedBox(height: 16),
          ...MockData.todaysTrips.map((trip) => _buildTripCard(context, trip)).toList(),
        ],
      ),
    );
  }

  Widget _buildTripCard(BuildContext context, trip) {
    return Container(
      margin: const EdgeInsets.only(bottom: 16),
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        color: const Color(0xFF2D2D3F),
        borderRadius: BorderRadius.circular(24),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              const Icon(Icons.directions_bus, color: Colors.grey, size: 16),
              const SizedBox(width: 8),
              Text(trip.routeCode, style: const TextStyle(color: Colors.grey, fontSize: 12)),
            ],
          ),
          const SizedBox(height: 16),
          Row(
            children: [
              const Icon(Icons.trip_origin, color: Colors.greenAccent, size: 12),
              const SizedBox(width: 12),
              Text(trip.startLocation, style: const TextStyle(color: Colors.white, fontSize: 16, fontWeight: FontWeight.bold)),
            ],
          ),
          Container(
            margin: const EdgeInsets.only(left: 5),
            height: 20,
            width: 2,
            color: Colors.grey.shade800,
          ),
          Row(
            children: [
              const Icon(Icons.location_on, color: Colors.greenAccent, size: 12),
              const SizedBox(width: 12),
              Text(trip.endLocation, style: const TextStyle(color: Colors.white, fontSize: 16, fontWeight: FontWeight.bold)),
            ],
          ),
          const SizedBox(height: 20),
          Row(
            children: [
              const Icon(Icons.access_time, color: Colors.grey, size: 14),
              const SizedBox(width: 6),
              Text(trip.time, style: const TextStyle(color: Colors.grey, fontSize: 12)),
              const SizedBox(width: 16),
              const Icon(Icons.person, color: Colors.grey, size: 14),
              const SizedBox(width: 6),
              Text('${trip.totalPassengers} Passengers', style: const TextStyle(color: Colors.grey, fontSize: 12)),
            ],
          ),
          const SizedBox(height: 20),
          SizedBox(
            width: double.infinity,
            child: ElevatedButton(
              style: ElevatedButton.styleFrom(
                backgroundColor: const Color(0xFF00E676),
                foregroundColor: Colors.black,
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                padding: const EdgeInsets.symmetric(vertical: 16),
              ),
              onPressed: () {
                Navigator.push(context, MaterialPageRoute(builder: (_) => TripManifestScreen(trip: trip)));
              },
              child: const Row(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  Text('More Details', style: TextStyle(fontWeight: FontWeight.bold)),
                  SizedBox(width: 8),
                  Icon(Icons.arrow_forward, size: 16),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }
}
