import 'package:flutter/material.dart';
import 'package:flutter_animate/flutter_animate.dart';
import '../models/driver_models.dart';
import '../data/mock_data.dart';
import 'trip_manifest_screen.dart';
import 'all_trips_screen.dart';
import 'package:mobile_driver/utils/icon_util.dart';
import 'package:flexicon/flexicon.dart';

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
              gradient: LinearGradient(
                colors: [Color(0xFF1B62F0), Color(0xFF1E3A8A)],
                begin: Alignment.topLeft,
                end: Alignment.bottomRight,
              ),
              borderRadius: BorderRadius.only(
                bottomLeft: Radius.circular(32),
                bottomRight: Radius.circular(32),
              ),
            ),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Row(
                      children: [
                        const Text('Lagos, Nigeria',
                            style: TextStyle(
                                color: Colors.white,
                                fontWeight: FontWeight.bold,
                                fontSize: 14)),
                        const Icon(Icons.keyboard_arrow_down, color: Colors.white, size: 20),
                      ],
                    ),
                    Row(
                      children: [
                        Icon(fixIcon(FlexIcon.remix.customerSupport5),
                            color: Colors.white),
                        const SizedBox(width: 16),
                        Stack(
                          children: [
                            Icon(fixIcon(FlexIcon.remix.bellNotification),
                                color: Colors.white),
                            Positioned(
                              right: 0,
                              top: 0,
                              child: Container(
                                width: 8,
                                height: 8,
                                decoration: const BoxDecoration(
                                    color: Colors.red, shape: BoxShape.circle),
                              ),
                            )
                          ],
                        )
                      ],
                    )
                  ],
                ),
                const SizedBox(height: 24),
                Row(
                  children: [
                    Icon(fixIcon(FlexIcon.remix.flower), color: Colors.orange, size: 24),
                    const SizedBox(width: 8),
                    Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        const Text('Good Morning,', style: TextStyle(color: Colors.white, fontSize: 16)),
                        Row(
                          children: [
                            Text(driver.name, style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 18)),
                            const SizedBox(width: 8),
                            Icon(fixIcon(FlexIcon.remix.starCircle), color: const Color(0xFF1B62F0), size: 14),
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
                      Icon(fixIcon(FlexIcon.remix.transferTruckTime), color: Color(0xFF757575), size: 16),
                      const SizedBox(width: 8),
                      Text(nextTrip.routeCode, style: const TextStyle(color: Color(0xFF757575), fontSize: 12)),
                    ],
                  ),
                  const SizedBox(height: 16),
                  Row(
                    children: [
                      Icon(fixIcon(FlexIcon.remix.locationTarget2), color: const Color(0xFF1B62F0), size: 12),
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
                      Icon(fixIcon(FlexIcon.remix.locationPin3), color: const Color(0xFF1B62F0), size: 12),
                      const SizedBox(width: 12),
                      Text(nextTrip.endLocation, style: const TextStyle(color: Colors.black87, fontSize: 16, fontWeight: FontWeight.bold)),
                    ],
                  ),
                  const SizedBox(height: 20),
                  Row(
                    children: [
                      Icon(fixIcon(FlexIcon.remix.countdownTimer), color: Color(0xFF757575), size: 14),
                      const SizedBox(width: 6),
                      Text(nextTrip.time, style: const TextStyle(color: Color(0xFF757575), fontSize: 12)),
                      const SizedBox(width: 16),
                      Icon(fixIcon(FlexIcon.remix.userCircleSingle), color: Color(0xFF757575), size: 14),
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
          ),
          
          const Spacer(),
          Column(
            children: [
              Icon(Icons.keyboard_arrow_down, color: Color(0xFF757575)),
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
    ).animate(delay: const Duration(seconds: 3))
      .fadeIn(duration: const Duration(milliseconds: 800))
      .slideY(begin: 0.2, end: 0, duration: const Duration(milliseconds: 800));
  }
}
