import 'package:flutter/material.dart';
import '../models/driver_models.dart';
import '../data/mock_data.dart';
import 'trip_manifest_screen.dart';
import 'all_trips_screen.dart';

class HomeScreen extends StatelessWidget {
  const HomeScreen({Key? key}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    final driver = MockData.currentDriver;
    final nextTrip = MockData.todaysTrips.first;

    return Scaffold(
      backgroundColor: const Color(0xFFF8FAFC), // Dark theme matching the UI
      body: Column(
        children: [
          // Header Section with purple background
          Container(
            padding: const EdgeInsets.only(top: 60, left: 24, right: 24, bottom: 40),
            decoration: const BoxDecoration(
              color: Color(0xFF1B62F0),
              borderRadius: BorderRadius.only(
                bottomLeft: Radius.circular(32),
                bottomRight: Radius.circular(32),
              ),
            ),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const Text('View your next trip from\nthe Home screen', style: TextStyle(color: Colors.white70, fontSize: 14)),
                const SizedBox(height: 20),
                Row(
                  children: [
                    const Icon(Icons.wb_sunny, color: Colors.orange, size: 24),
                    const SizedBox(width: 8),
                    Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        const Text('Good Morning,', style: TextStyle(color: Colors.white, fontSize: 16)),
                        Row(
                          children: [
                            Text(driver.name, style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 18)),
                            const SizedBox(width: 8),
                            const Icon(Icons.star, color: Colors.greenAccent, size: 14),
                            Text(' ${driver.rating} ratings', style: const TextStyle(color: Colors.white70, fontSize: 12)),
                          ],
                        )
                      ],
                    ),
                  ],
                ),
                const SizedBox(height: 32),
                const Text('You have 5 trips\ntoday.', style: TextStyle(color: Colors.white, fontSize: 28, fontWeight: FontWeight.bold)),
              ],
            ),
          ),
          
          // Next Trip Card
          Transform.translate(
            offset: const Offset(0, -30),
            child: Container(
              margin: const EdgeInsets.symmetric(horizontal: 24),
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
                      const Icon(Icons.directions_bus, color: Color(0xFF757575), size: 16),
                      const SizedBox(width: 8),
                      Text(nextTrip.routeCode, style: const TextStyle(color: Color(0xFF757575), fontSize: 12)),
                    ],
                  ),
                  const SizedBox(height: 16),
                  Row(
                    children: [
                      const Icon(Icons.trip_origin, color: Colors.greenAccent, size: 12),
                      const SizedBox(width: 12),
                      Text(nextTrip.startLocation, style: const TextStyle(color: Colors.black87, fontSize: 16, fontWeight: FontWeight.bold)),
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
                      const Icon(Icons.location_on, color: Colors.greenAccent, size: 12),
                      const SizedBox(width: 12),
                      Text(nextTrip.endLocation, style: const TextStyle(color: Colors.black87, fontSize: 16, fontWeight: FontWeight.bold)),
                    ],
                  ),
                  const SizedBox(height: 20),
                  Row(
                    children: [
                      const Icon(Icons.access_time, color: Color(0xFF757575), size: 14),
                      const SizedBox(width: 6),
                      Text(nextTrip.time, style: const TextStyle(color: Color(0xFF757575), fontSize: 12)),
                      const SizedBox(width: 16),
                      const Icon(Icons.person, color: Color(0xFF757575), size: 14),
                      const SizedBox(width: 6),
                      Text('${nextTrip.totalPassengers} Passengers', style: const TextStyle(color: Color(0xFF757575), fontSize: 12)),
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
                        Navigator.push(context, MaterialPageRoute(builder: (_) => TripManifestScreen(trip: nextTrip)));
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
            ),
          ),
          
          const Spacer(),
          Column(
            children: [
              const Icon(Icons.keyboard_arrow_down, color: Color(0xFF757575)),
              const Text('4 More Trips', style: TextStyle(color: Colors.black87, fontWeight: FontWeight.bold)),
              TextButton(
                onPressed: () {
                  Navigator.push(context, MaterialPageRoute(builder: (_) => const AllTripsScreen()));
                },
                child: const Text('See all your trips >', style: TextStyle(color: Color(0xFF1B62F0))),
              ),
            ],
          ),
          const SizedBox(height: 20),
        ],
      ),
    );
  }
}
