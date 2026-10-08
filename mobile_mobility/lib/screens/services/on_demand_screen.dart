import 'package:flutter/material.dart';
import 'package:flutter_animate/flutter_animate.dart';
import 'package:mobile_mobility/utils/icon_util.dart';
import 'package:flexicon/flexicon.dart';
import '../../widgets/map_painter.dart';

class OnDemandScreen extends StatelessWidget {
  const OnDemandScreen({Key? key}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: Stack(
        children: [
          // Map Background
          Positioned.fill(
            child: CustomPaint(
              painter: VectorMapPainter(),
            ),
          ),

          // Top Back Button
          Positioned(
            top: 50,
            left: 20,
            child: InkWell(
              onTap: () => Navigator.pop(context),
              child: Container(
                padding: const EdgeInsets.all(10),
                decoration: const BoxDecoration(
                    color: Colors.white, shape: BoxShape.circle),
                child: Icon(Icons.arrow_back, color: Colors.black),
              ),
            ),
          ),

          // Bottom Booking Sheet
          Align(
            alignment: Alignment.bottomCenter,
            child: Container(
              padding: const EdgeInsets.all(24),
              decoration: const BoxDecoration(
                color: Colors.white,
                borderRadius: BorderRadius.vertical(top: Radius.circular(32)),
                boxShadow: [
                  BoxShadow(
                      color: Colors.black12,
                      blurRadius: 20,
                      offset: Offset(0, -5))
                ],
              ),
              child: Column(
                mainAxisSize: MainAxisSize.min,
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const Text('Where to?',
                      style:
                          TextStyle(fontSize: 24, fontWeight: FontWeight.bold)),
                  const SizedBox(height: 20),

                  // Pickup & Destination Inputs
                  Container(
                    padding: const EdgeInsets.all(16),
                    decoration: BoxDecoration(
                      color: const Color(0xFFF1F5F9),
                      borderRadius: BorderRadius.circular(16),
                    ),
                    child: Column(
                      children: [
                        Row(
                          children: [
                            Icon(fixIcon(FlexIcon.remix.locationTarget2),
                                color: Color(0xFF1B62F0), size: 20),
                            SizedBox(width: 12),
                            Text('Current Location',
                                style: TextStyle(fontWeight: FontWeight.w600)),
                          ],
                        ),
                        const Padding(
                          padding: EdgeInsets.symmetric(vertical: 8),
                          child: Divider(height: 1),
                        ),
                        Row(
                          children: [
                            Icon(fixIcon(FlexIcon.remix.magnifyingGlass),
                                color: Color(0xFF64748B), size: 20),
                            const SizedBox(width: 12),
                            Text('Search destination...',
                                style: TextStyle(color: Colors.grey.shade500)),
                          ],
                        ),
                      ],
                    ),
                  ),
                  const SizedBox(height: 24),

                  // Vehicle Types
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceAround,
                    children: [
                      _buildVehicleOption(
                          'Economy', '₦1,500', 'assets/images/car.png', true),
                      _buildVehicleOption(
                          'Standard', '₦2,500', 'assets/images/car.png', false),
                      _buildVehicleOption(
                          'SUV', '₦4,000', 'assets/images/car.png', false),
                    ],
                  ),
                  const SizedBox(height: 24),

                  SizedBox(
                    width: double.infinity,
                    child: ElevatedButton(
                      style: ElevatedButton.styleFrom(
                        backgroundColor: const Color(0xFF1B62F0),
                        padding: const EdgeInsets.symmetric(vertical: 16),
                        shape: RoundedRectangleBorder(
                            borderRadius: BorderRadius.circular(12)),
                      ),
                      onPressed: () {},
                      child: const Text('Request Ride',
                          style: TextStyle(
                              color: Colors.white,
                              fontSize: 16,
                              fontWeight: FontWeight.bold)),
                    ),
                  ),
                ],
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

  Widget _buildVehicleOption(
      String name, String price, String imageAsset, bool isSelected) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
      decoration: BoxDecoration(
        color: isSelected ? const Color(0xFFE0E7FF) : Colors.transparent,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(
            color:
                isSelected ? const Color(0xFF1B62F0) : const Color(0xFFE2E8F0)),
      ),
      child: Column(
        children: [
          Image.asset(imageAsset, width: 48, height: 48, fit: BoxFit.contain),
          const SizedBox(height: 8),
          Text(name,
              style: TextStyle(
                  fontWeight: FontWeight.w600,
                  color: isSelected ? const Color(0xFF1B62F0) : Colors.black)),
          const SizedBox(height: 4),
          Text(price,
              style: const TextStyle(fontSize: 12, color: Color(0xFF64748B))),
        ],
      ),
    );
  }
}
