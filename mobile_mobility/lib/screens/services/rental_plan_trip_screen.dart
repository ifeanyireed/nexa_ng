import 'package:flutter/material.dart';
import 'package:flutter_animate/flutter_animate.dart';
import 'package:flexicon/flexicon.dart';
import 'package:mobile_mobility/utils/icon_util.dart';

class RentalPlanTripScreen extends StatefulWidget {
  const RentalPlanTripScreen({Key? key}) : super(key: key);

  @override
  State<RentalPlanTripScreen> createState() => _RentalPlanTripScreenState();
}

class _RentalPlanTripScreenState extends State<RentalPlanTripScreen> {
  bool _enableReturnTrip = false;
  bool _subscribeToRoute = false;

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFFF8FAFC),
      appBar: AppBar(
        title: const Text("Let's plan your next trip",
            style: TextStyle(fontWeight: FontWeight.bold, fontSize: 18)),
        backgroundColor: Colors.white,
        foregroundColor: Colors.black,
        elevation: 0,
        centerTitle: true,
      ),
      body: Column(
        children: [
          Expanded(
            child: SingleChildScrollView(
              padding: const EdgeInsets.all(20),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  // Origin / Destination Card
                  Container(
                    padding: const EdgeInsets.all(16),
                    decoration: BoxDecoration(
                      color: Colors.white,
                      borderRadius: BorderRadius.circular(16),
                      border: Border.all(color: const Color(0xFFE2E8F0)),
                    ),
                    child: Stack(
                      alignment: Alignment.centerRight,
                      children: [
                        Column(
                          children: [
                            _buildTextField('Origin', 'Enter pickup location'),
                            const Padding(
                              padding: EdgeInsets.symmetric(vertical: 8),
                              child: Divider(color: Color(0xFFE2E8F0)),
                            ),
                            _buildTextField(
                                'Destination', 'Enter drop-off location'),
                          ],
                        ),
                        // Swap Icon
                        Container(
                          padding: const EdgeInsets.all(8),
                          decoration: BoxDecoration(
                            color: const Color(0xFFF1F5F9),
                            shape: BoxShape.circle,
                            border: Border.all(color: Colors.white, width: 2),
                          ),
                          child: const Icon(Icons.swap_vert,
                              color: Colors.black54),
                        ),
                      ],
                    ),
                  ),

                  const SizedBox(height: 20),

                  // Date and Time
                  Container(
                    padding: const EdgeInsets.all(16),
                    decoration: BoxDecoration(
                      color: Colors.white,
                      borderRadius: BorderRadius.circular(16),
                      border: Border.all(color: const Color(0xFFE2E8F0)),
                    ),
                    child: Column(
                      children: [
                        Row(
                          children: [
                            const Icon(Icons.calendar_today_outlined,
                                color: Colors.grey, size: 20),
                            const SizedBox(width: 12),
                            const Expanded(
                              child: Text('Departure Date',
                                  style: TextStyle(fontSize: 14)),
                            ),
                            const Icon(Icons.chevron_right, color: Colors.grey),
                          ],
                        ),
                        const Padding(
                          padding: EdgeInsets.symmetric(vertical: 8),
                          child: Divider(color: Color(0xFFE2E8F0)),
                        ),
                        Row(
                          children: [
                            const Icon(Icons.access_time_outlined,
                                color: Colors.grey, size: 20),
                            const SizedBox(width: 12),
                            const Expanded(
                              child: Text('Departure Time',
                                  style: TextStyle(fontSize: 14)),
                            ),
                            const Icon(Icons.chevron_right, color: Colors.grey),
                          ],
                        ),
                      ],
                    ),
                  ),

                  const SizedBox(height: 20),

                  // Toggles
                  Container(
                    padding:
                        const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
                    decoration: BoxDecoration(
                      color: Colors.white,
                      borderRadius: BorderRadius.circular(16),
                      border: Border.all(color: const Color(0xFFE2E8F0)),
                    ),
                    child: Column(
                      children: [
                        Row(
                          mainAxisAlignment: MainAxisAlignment.spaceBetween,
                          children: [
                            const Text('Enable Return trip',
                                style: TextStyle(fontSize: 14)),
                            Switch(
                              value: _enableReturnTrip,
                              onChanged: (val) =>
                                  setState(() => _enableReturnTrip = val),
                              activeColor: const Color(0xFF00C853),
                            ),
                          ],
                        ),
                        const Divider(color: Color(0xFFE2E8F0)),
                        Row(
                          mainAxisAlignment: MainAxisAlignment.spaceBetween,
                          children: [
                            const Text('Subscribe to route',
                                style: TextStyle(fontSize: 14)),
                            Switch(
                              value: _subscribeToRoute,
                              onChanged: (val) =>
                                  setState(() => _subscribeToRoute = val),
                              activeColor: const Color(0xFF00C853),
                            ),
                          ],
                        ),
                      ],
                    ),
                  ),
                ],
              ),
            ),
          ),

          // Bottom Button
          Container(
            padding: const EdgeInsets.all(20),
            decoration: BoxDecoration(
              color: Colors.white,
              boxShadow: [
                BoxShadow(
                  color: Colors.black.withValues(alpha: 0.05),
                  blurRadius: 10,
                  offset: const Offset(0, -5),
                ),
              ],
            ),
            child: SafeArea(
              child: SizedBox(
                width: double.infinity,
                height: 56,
                child: ElevatedButton(
                  onPressed: () {
                    // Navigate to payment or next step
                  },
                  style: ElevatedButton.styleFrom(
                    backgroundColor: const Color(0xFF00C853),
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(16),
                    ),
                  ),
                  child: const Text(
                    'Proceed to Payment',
                    style: TextStyle(
                      fontSize: 16,
                      fontWeight: FontWeight.bold,
                      color: Colors.white,
                    ),
                  ),
                ),
              ),
            ),
          ),
        ],
      ),
    )
        .animate()
        .fadeIn(duration: const Duration(milliseconds: 400))
        .slideY(begin: 0.05, end: 0);
  }

  Widget _buildTextField(String label, String hint) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(label, style: const TextStyle(fontSize: 12, color: Colors.grey)),
        TextField(
          decoration: InputDecoration(
            hintText: hint,
            hintStyle: const TextStyle(fontSize: 14, color: Colors.black87),
            border: InputBorder.none,
            isDense: true,
            contentPadding: const EdgeInsets.symmetric(vertical: 8),
          ),
        ),
      ],
    );
  }
}
