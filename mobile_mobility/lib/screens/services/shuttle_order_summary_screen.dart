import 'package:flutter/material.dart';
import 'package:flexicon/flexicon.dart';
import 'package:mobile_mobility/utils/icon_util.dart';
import 'package:google_maps_flutter/google_maps_flutter.dart';
import '../payment_screen.dart';

class ShuttleOrderSummaryScreen extends StatelessWidget {
  final bool isSubscription;
  final String routeCode;
  final String price;

  const ShuttleOrderSummaryScreen({
    Key? key,
    this.isSubscription = false,
    this.routeCode = 'SGT4',
    this.price = '₦36,240.00',
  }) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFFF8FAFC),
      appBar: AppBar(
        title: Text(isSubscription ? 'Subscription Summary' : 'Order Summary',
            style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 18)),
        backgroundColor: Colors.white,
        foregroundColor: Colors.black,
        elevation: 0,
      ),
      body: SingleChildScrollView(
        child: Column(
          children: [
            Container(
              height: 120,
              width: double.infinity,
              color: const Color(0xFFE8EDF2),
              child: const GoogleMap(
                initialCameraPosition: CameraPosition(
                  target: LatLng(6.5244, 3.3792), // Default to Lagos, Nigeria
                  zoom: 12,
                ),
                zoomControlsEnabled: false,
                mapType: MapType.normal,
                myLocationButtonEnabled: false,
              ),
            ),
            
            Padding(
              padding: const EdgeInsets.all(20),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  // Promo Code
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
                    decoration: BoxDecoration(
                      color: const Color(0xFFE0E7FF),
                      borderRadius: BorderRadius.circular(12),
                    ),
                    child: Row(
                      children: [
                        const Icon(Icons.local_activity_outlined, color: Color(0xFF4338CA), size: 20),
                        const SizedBox(width: 12),
                        const Expanded(
                          child: Text('Apply promo code',
                              style: TextStyle(color: Color(0xFF4338CA), fontWeight: FontWeight.w600)),
                        ),
                        const Icon(Icons.arrow_forward_ios, size: 14, color: Color(0xFF4338CA)),
                      ],
                    ),
                  ),
                  const SizedBox(height: 24),

                  // Driver Info
                  Row(
                    children: [
                      const CircleAvatar(
                        radius: 20,
                        backgroundImage: AssetImage('assets/images/driver.jpg'),
                      ),
                      const SizedBox(width: 12),
                      Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          const Text('Adekunle Olamilekan Ayuba',
                              style: TextStyle(fontWeight: FontWeight.bold, fontSize: 14)),
                          Text('Toyota Coaster • AAA-17JL',
                              style: TextStyle(color: Colors.grey.shade600, fontSize: 12)),
                        ],
                      )
                    ],
                  ),
                  const SizedBox(height: 24),

                  // Timeline
                  _buildTimelineItem(
                      'Trip starts here', 'Sangotedo Bus Stop', 'Starts at 5:00 AM',
                      isFirst: true),
                  _buildTimelineItem(
                      'Your pick up location', 'Ogidan Bus Stop', 'Est. Arrival: 5:41 AM',
                      isActive: true,
                      customIcon: Icon(fixIcon(FlexIcon.remix.locationTarget2), size: 16, color: Colors.green.shade600)),
                  _buildTimelineItem(
                      'Your drop off location', 'Sandfill Bus Stop', '',
                      isLast: true,
                      customIcon: Icon(fixIcon(FlexIcon.remix.locationPin3), size: 16, color: Colors.blue.shade600)),

                  const SizedBox(height: 24),

                  // Details
                  _buildDetailRow('Route code', routeCode, valueColor: const Color(0xFF4338CA)),
                  const SizedBox(height: 12),
                  _buildDetailRow('Trip start time', '5:40 AM'),

                  if (isSubscription) ...[
                    const SizedBox(height: 24),
                    const Text('Selected week days',
                        style: TextStyle(fontWeight: FontWeight.w600, fontSize: 14)),
                    const SizedBox(height: 12),
                    Row(
                      children: [
                        _buildDayChip('Fri'),
                        _buildDayChip('Sun'),
                        _buildDayChip('Mon'),
                        _buildDayChip('Tue'),
                      ],
                    ),
                  ]
                ],
              ),
            ),
          ],
        ),
      ),
      bottomNavigationBar: SafeArea(
        child: Padding(
          padding: const EdgeInsets.all(20),
          child: SizedBox(
            width: double.infinity,
            height: 50,
            child: ElevatedButton(
              onPressed: () {
                Navigator.push(
                  context,
                  MaterialPageRoute(builder: (context) => const PaymentScreen()),
                );
              },
              style: ElevatedButton.styleFrom(
                backgroundColor: const Color(0xFF10B981), // Emerald green
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(12),
                ),
                elevation: 0,
              ),
              child: Text('Book Trip $price',
                  style: const TextStyle(
                      color: Colors.white,
                      fontWeight: FontWeight.bold,
                      fontSize: 16)),
            ),
          ),
        ),
      ),
    );
  }

  Widget _buildTimelineItem(String title, String subtitle, String trailing,
      {bool isFirst = false, bool isLast = false, bool isActive = false, Widget? customIcon}) {
    return IntrinsicHeight(
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          SizedBox(
            width: 24,
            child: Column(
              children: [
                Container(
                  width: 2,
                  height: 16,
                  color: isFirst ? Colors.transparent : Colors.grey.shade300,
                ),
                customIcon ?? Container(
                  width: isActive ? 12 : 8,
                  height: isActive ? 12 : 8,
                  decoration: BoxDecoration(
                    shape: BoxShape.circle,
                    color: isActive ? const Color(0xFF10B981) : Colors.grey.shade400,
                    border: isActive
                        ? Border.all(color: const Color(0xFFD1FAE5), width: 3)
                        : null,
                  ),
                ),
                Expanded(
                  child: Container(
                    width: 2,
                    color: isLast ? Colors.transparent : Colors.grey.shade300,
                  ),
                ),
              ],
            ),
          ),
          const SizedBox(width: 12),
          Expanded(
            child: Padding(
              padding: const EdgeInsets.only(bottom: 20),
              child: Row(
                crossAxisAlignment: CrossAxisAlignment.start,
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(title, style: TextStyle(color: Colors.grey.shade500, fontSize: 12)),
                      const SizedBox(height: 2),
                      Text(subtitle,
                          style: TextStyle(
                              fontWeight: isActive ? FontWeight.bold : FontWeight.w600,
                              fontSize: 14)),
                    ],
                  ),
                  if (trailing.isNotEmpty)
                    Text(trailing, style: TextStyle(color: Colors.grey.shade500, fontSize: 10)),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildDetailRow(String label, String value, {Color? valueColor}) {
    return Row(
      mainAxisAlignment: MainAxisAlignment.spaceBetween,
      children: [
        Text(label, style: const TextStyle(fontWeight: FontWeight.w600, fontSize: 14)),
        Text(value,
            style: TextStyle(
                fontWeight: FontWeight.bold,
                fontSize: 14,
                color: valueColor ?? Colors.black)),
      ],
    );
  }

  Widget _buildDayChip(String day) {
    return Container(
      margin: const EdgeInsets.only(right: 8),
      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
      decoration: BoxDecoration(
        color: const Color(0xFF10B981),
        borderRadius: BorderRadius.circular(6),
      ),
      child: Text(day,
          style: const TextStyle(
              color: Colors.white, fontSize: 12, fontWeight: FontWeight.bold)),
    );
  }
}
