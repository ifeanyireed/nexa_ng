import 'package:flutter/material.dart';
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
        leading: IconButton(
          icon: Icon(fixIcon(FlexIcon.remix.lessThanSignCircle), color: Colors.black87),
          onPressed: () => Navigator.pop(context),
        ),
        title: const Text('All Trips', style: TextStyle(color: Colors.black87)),
        actions: [
          Container(
            margin: const EdgeInsets.only(right: 16, top: 12, bottom: 12),
            padding: const EdgeInsets.symmetric(horizontal: 12),
            decoration: BoxDecoration(
              color: const Color(0xFF1B62F0),
              borderRadius: BorderRadius.circular(20),
            ),
            child: Row(
              children: [
                Text('Upcoming trips', style: TextStyle(color: Colors.black, fontWeight: FontWeight.bold, fontSize: 12)),
                Icon(fixIcon(FlexIcon.remix.downloadArrow), color: Colors.black, size: 16),
              ],
            ),
          )
        ],
      ),
      body: ListView(
        padding: const EdgeInsets.all(24),
        children: [
          const Text('Dec 22nd, 2022', style: TextStyle(color: Colors.black87, fontWeight: FontWeight.bold, fontSize: 16)),
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
              Icon(fixIcon(FlexIcon.remix.roundAnchorPoint), color: Colors.greenAccent, size: 12),
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
              Icon(fixIcon(FlexIcon.remix.locationPin3), color: Colors.greenAccent, size: 12),
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
                  Icon(fixIcon(FlexIcon.remix.lineArrowExpand), size: 16),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }
}
