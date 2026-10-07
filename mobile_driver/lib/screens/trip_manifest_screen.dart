import 'package:flutter/material.dart';
import 'package:flutter_animate/flutter_animate.dart';
import '../models/driver_models.dart';
import 'package:mobile_driver/utils/icon_util.dart';
import 'package:flexicon/flexicon.dart';

class TripManifestScreen extends StatefulWidget {
  final DriverTrip trip;
  const TripManifestScreen({Key? key, required this.trip}) : super(key: key);

  @override
  State<TripManifestScreen> createState() => _TripManifestScreenState();
}

class _TripManifestScreenState extends State<TripManifestScreen> {
  bool isPickup = true;
  bool showNavMenu = false;

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.grey.shade300,
      body: Stack(
        children: [
          // Map Background Placeholder
          Positioned.fill(
            child: Image.network(
              'https://miro.medium.com/max/4096/1*qYUvh-dpTqwqh3_4o4KYzA.png',
              fit: BoxFit.cover,
            ),
          ),
          
          // Header Overlay
          Positioned(
            top: 50,
            left: 20,
            right: 20,
            child: Row(
              children: [
                CircleAvatar(
                  backgroundColor: Colors.black54,
                  child: IconButton(
                    icon: Icon(Icons.arrow_back, color: Colors.black87),
                    onPressed: () => Navigator.pop(context),
                  ),
                ),
                const Spacer(),
                if (showNavMenu) 
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
                    decoration: BoxDecoration(color: Colors.green, borderRadius: BorderRadius.circular(20)),
                    child: const Text('• Trip has started', style: TextStyle(color: Colors.black87, fontWeight: FontWeight.bold)),
                  )
              ],
            ),
          ),
          
          Positioned(
            top: 110,
            left: 20,
            right: 20,
            child: Container(
              padding: const EdgeInsets.all(16),
              decoration: BoxDecoration(color: Colors.blue.shade700, borderRadius: BorderRadius.circular(12)),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text('Next Stop - Yaba Bus stop', style: TextStyle(color: Colors.black54, fontSize: 12)),
                  SizedBox(height: 4),
                  Row(
                    children: [
                      Icon(fixIcon(FlexIcon.remix.locationPin3), color: Colors.black87, size: 16),
                      SizedBox(width: 8),
                      Text('Estimated time of arrival - 17 mins', style: TextStyle(color: Colors.black87, fontWeight: FontWeight.bold)),
                    ],
                  )
                ],
              ),
            ),
          ),

          // Bottom Sheet Manifest
          Positioned(
            bottom: 0,
            left: 0,
            right: 0,
            child: Container(
              height: MediaQuery.of(context).size.height * 0.55,
              padding: const EdgeInsets.all(20),
              decoration: const BoxDecoration(
                color: Color(0xFFF8FAFC),
                borderRadius: BorderRadius.only(topLeft: Radius.circular(32), topRight: Radius.circular(32)),
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    children: [
                      Expanded(
                        child: GestureDetector(
                          onTap: () => setState(() => isPickup = true),
                          child: Container(
                            padding: const EdgeInsets.symmetric(vertical: 12),
                            decoration: BoxDecoration(
                              color: isPickup ? Colors.black87.withOpacity(0.1) : Colors.transparent,
                              borderRadius: BorderRadius.circular(12),
                              border: Border.all(color: isPickup ? Colors.black54 : Colors.transparent),
                            ),
                            child: Center(child: Text('Pick up', style: TextStyle(color: isPickup ? Colors.black87 : Color(0xFF757575), fontWeight: FontWeight.bold))),
                          ),
                        ),
                      ),
                      const SizedBox(width: 12),
                      Expanded(
                        child: GestureDetector(
                          onTap: () => setState(() => isPickup = false),
                          child: Container(
                            padding: const EdgeInsets.symmetric(vertical: 12),
                            decoration: BoxDecoration(
                              color: !isPickup ? Colors.black87.withOpacity(0.1) : Colors.transparent,
                              borderRadius: BorderRadius.circular(12),
                              border: Border.all(color: !isPickup ? Colors.black54 : Colors.transparent),
                            ),
                            child: Center(child: Text('Drop off', style: TextStyle(color: !isPickup ? Colors.black87 : Color(0xFF757575), fontWeight: FontWeight.bold))),
                          ),
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 24),
                  
                  Expanded(
                    child: ListView.builder(
                      itemCount: widget.trip.stops.length,
                      itemBuilder: (context, index) {
                        final stop = widget.trip.stops[index];
                        return _buildStopSection(stop);
                      },
                    ),
                  )
                ],
              ),
            ),
          ),
          
          // Emergency Button (Drop off screen context)
          if (!isPickup)
            Positioned(
              right: 20,
              bottom: MediaQuery.of(context).size.height * 0.55 + 20,
              child: ElevatedButton.icon(
                style: ElevatedButton.styleFrom(backgroundColor: Colors.red),
                onPressed: () {},
                icon: Icon(fixIcon(FlexIcon.remix.shield1), color: Colors.black87, size: 16),
                label: const Text('Emergency', style: TextStyle(color: Colors.black87)),
              ),
            ),
        ],
      ),
    ).animate().fadeIn(duration: const Duration(milliseconds: 400)).slideY(begin: 0.05, end: 0);
  }

  Widget _buildStopSection(TripStop stop) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            Row(
              children: [
                Icon(fixIcon(FlexIcon.remix.locationPin3), color: isPickup ? Colors.greenAccent : Colors.redAccent, size: 16),
                const SizedBox(width: 8),
                Text(stop.name, style: const TextStyle(color: Colors.black87, fontWeight: FontWeight.bold, fontSize: 16)),
              ],
            ),
            IconButton(
              icon: Icon(Icons.keyboard_arrow_down, color: Color(0xFF757575)),
              onPressed: () {},
            )
          ],
        ),
        Padding(
          padding: const EdgeInsets.only(left: 24, bottom: 16),
          child: Text(
            isPickup ? 'Picking up ${stop.passengers.length} passengers' : 'Dropping off ${stop.passengers.length} passengers',
            style: const TextStyle(color: Color(0xFF757575), fontSize: 12),
          ),
        ),
        
        ...stop.passengers.map((p) => _buildPassengerRow(p)).toList(),
        const SizedBox(height: 16),
      ],
    );
  }

  Widget _buildPassengerRow(Passenger passenger) {
    return GestureDetector(
      onTap: () {
        setState(() {
          showNavMenu = !showNavMenu; // Simulate opening the submenu
        });
      },
      child: Container(
        margin: const EdgeInsets.only(left: 12, bottom: 16),
        padding: const EdgeInsets.all(12),
        decoration: BoxDecoration(
          color: showNavMenu ? Colors.black87.withOpacity(0.05) : Colors.transparent,
          borderRadius: BorderRadius.circular(12),
        ),
        child: Column(
          children: [
            Row(
              children: [
                CircleAvatar(
                  radius: 16,
                  backgroundImage: NetworkImage('https://i.pravatar.cc/100?u=${passenger.id}'),
                ),
                const SizedBox(width: 12),
                Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(passenger.name, style: const TextStyle(color: Colors.black87, fontWeight: FontWeight.w600)),
                    Row(
                      children: [
                        Icon(fixIcon(FlexIcon.remix.receipt), color: Color(0xFF757575), size: 12),
                        const SizedBox(width: 4),
                        Text(passenger.ticketNumber, style: const TextStyle(color: Color(0xFF757575), fontSize: 12)),
                      ],
                    )
                  ],
                ),
                const Spacer(),
                if (!isPickup) 
                  const Text('Dropped Off', style: TextStyle(color: Color(0xFF757575), fontSize: 12)),
              ],
            ),
            if (showNavMenu) ...[
              const SizedBox(height: 16),
              const Divider(color: Colors.black26),
              _buildNavMenuItem(fixIcon(FlexIcon.remix.locationTarget2), 'Navigation', Colors.greenAccent),
              _buildNavMenuItem(fixIcon(FlexIcon.remix.scanner), 'View QR code', Colors.greenAccent),
              _buildNavMenuItem(fixIcon(FlexIcon.remix.applicationAdd), 'Add Passenger', Colors.greenAccent),
            ]
          ],
        ),
      ),
    );
  }
  
  Widget _buildNavMenuItem(IconData icon, String title, Color color) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 8),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Text(title, style: const TextStyle(color: Colors.black87, fontSize: 14)),
          Icon(icon, color: color, size: 18),
        ],
      ),
    );
  }
}
