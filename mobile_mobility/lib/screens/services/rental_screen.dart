import 'package:flutter/material.dart';
import 'package:flutter_animate/flutter_animate.dart';
import 'package:mobile_mobility/utils/icon_util.dart';
import 'package:flexicon/flexicon.dart';

class RentalScreen extends StatelessWidget {
  const RentalScreen({Key? key}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFFF8FAFC),
      appBar: AppBar(
        title: const Text('Rental',
            style: TextStyle(fontWeight: FontWeight.bold, fontSize: 18)),
        backgroundColor: Colors.white,
        foregroundColor: Colors.black,
        elevation: 0,
        leading: const BackButton(color: Colors.black),
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(20),
        child: Column(
          children: [
            _buildVehicleCard(
                'Sedan',
                'Comfortable and efficient, perfect for personal travel.',
                '₦40,000.00',
                'assets/images/Sedan.jpeg',
                false),
            const SizedBox(height: 16),
            _buildVehicleCard(
                'SUV',
                'Spacious and premium, great for family and business trips.',
                '₦60,000.00',
                'assets/images/suv.png',
                true),
            const SizedBox(height: 16),
            _buildVehicleCard(
                'Sienna Space Bus',
                'Comfortable 7-seater for group travels and events.',
                '₦75,000.00',
                'assets/images/Sienna.jpeg',
                false),
            const SizedBox(height: 16),
            _buildVehicleCard(
                'Hiace Mini Bus',
                'Ideal for small groups and airport pickups (Hummer 2).',
                '₦130,000.00',
                'assets/images/hiace.jpg',
                false),
            const SizedBox(height: 16),
            _buildVehicleCard(
                'Coaster Bus',
                'Perfect for large groups, excursions, and corporate events (New Shape).',
                '₦350,000.00',
                'assets/images/coaster.jpg',
                false),
          ],
        ),
      ),
    )
        .animate()
        .fadeIn(duration: const Duration(milliseconds: 400))
        .slideY(begin: 0.05, end: 0);
  }

  Widget _buildVehicleCard(
      String title, String desc, String price, String imagePath, bool isBlack) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: const Color(0xFFE2E8F0)),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Container(
                width: 100,
                height: 70,
                decoration: BoxDecoration(
                  color: Colors.grey.shade200,
                  borderRadius: BorderRadius.circular(8),
                  image: DecorationImage(
                    image: AssetImage(imagePath),
                    fit: BoxFit.cover,
                  ),
                ),
              ),
              const SizedBox(width: 16),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(title,
                        style: const TextStyle(
                            fontWeight: FontWeight.bold, fontSize: 14)),
                    const SizedBox(height: 4),
                    Text(desc,
                        style:
                            const TextStyle(color: Colors.grey, fontSize: 11),
                        maxLines: 2,
                        overflow: TextOverflow.ellipsis),
                    const SizedBox(height: 8),
                    const Text('Starting from',
                        style: TextStyle(color: Colors.grey, fontSize: 10)),
                    Text(price,
                        style: const TextStyle(
                            color: Colors.green,
                            fontWeight: FontWeight.bold,
                            fontSize: 14)),
                  ],
                ),
              )
            ],
          ),
          const SizedBox(height: 16),
          Row(
            children: [
              _buildFeatureIcon(fixIcon(FlexIcon.remix.flower), 'AC'),
              const SizedBox(width: 16),
              _buildFeatureIcon(fixIcon(FlexIcon.remix.flash3), 'Charger'),
            ],
          )
        ],
      ),
    );
  }

  Widget _buildFeatureIcon(IconData icon, String label) {
    return Row(
      children: [
        Icon(icon, size: 14, color: Colors.grey),
        const SizedBox(width: 4),
        Text(label, style: const TextStyle(color: Colors.grey, fontSize: 12)),
      ],
    );
  }
}
