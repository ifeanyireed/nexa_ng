import 'package:flutter/material.dart';

class RentalScreen extends StatelessWidget {
  const RentalScreen({Key? key}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFFF8FAFC),
      appBar: AppBar(
        title: const Text('Rental', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 18)),
        backgroundColor: Colors.white,
        foregroundColor: Colors.black,
        elevation: 0,
        leading: const BackButton(color: Colors.black),
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(20),
        child: Column(
          children: [
            _buildVehicleCard('Shuttlers Black', 'Experience travel like never before with the Jet Mover. Equipped...', '₦250,000.00', true),
            const SizedBox(height: 16),
            _buildVehicleCard('Coaster Bus - New Shape', '(2017 - Present)', '₦350,000.00', false),
            const SizedBox(height: 16),
            _buildVehicleCard('Mini Bus', 'Mini Bus (Fold Roof - Hummer 2)', '₦130,000.00', false),
          ],
        ),
      ),
    );
  }

  Widget _buildVehicleCard(String title, String desc, String price, bool isBlack) {
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
                height: 60,
                decoration: BoxDecoration(
                  color: Colors.grey.shade200,
                  borderRadius: BorderRadius.circular(8),
                ),
                child: const Icon(Icons.directions_bus, size: 40, color: Colors.grey),
              ),
              const SizedBox(width: 16),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(title, style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 14)),
                    const SizedBox(height: 4),
                    Text(desc, style: const TextStyle(color: Colors.grey, fontSize: 11), maxLines: 2, overflow: TextOverflow.ellipsis),
                    const SizedBox(height: 8),
                    const Text('Starting from', style: TextStyle(color: Colors.grey, fontSize: 10)),
                    Text(price, style: const TextStyle(color: Colors.green, fontWeight: FontWeight.bold, fontSize: 14)),
                  ],
                ),
              )
            ],
          ),
          const SizedBox(height: 16),
          Row(
            children: [
              _buildFeatureIcon(Icons.ac_unit, 'AC'),
              const SizedBox(width: 16),
              _buildFeatureIcon(Icons.electrical_services, 'Charger'),
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
