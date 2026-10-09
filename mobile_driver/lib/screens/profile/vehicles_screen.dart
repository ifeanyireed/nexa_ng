import 'package:flutter/material.dart';

class VehiclesScreen extends StatelessWidget {
  const VehiclesScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFFF8FAFC),
      appBar: AppBar(
        title: const Text('My Vehicles', style: TextStyle(fontWeight: FontWeight.bold)),
        backgroundColor: Colors.white,
        foregroundColor: Colors.black,
        elevation: 0,
      ),
      body: ListView(
        padding: const EdgeInsets.all(24.0),
        children: [
          _buildVehicleCard(
            brand: 'Toyota Hiace',
            plate: 'KJA-234-XY',
            year: '2021',
            color: 'White',
            status: 'Active',
            isActive: true,
          ),
          const SizedBox(height: 16),
          _buildVehicleCard(
            brand: 'Ford Transit',
            plate: 'EKY-987-AB',
            year: '2019',
            color: 'Silver',
            status: 'In Maintenance',
            isActive: false,
          ),
          const SizedBox(height: 32),
          OutlinedButton.icon(
            onPressed: () {},
            icon: const Icon(Icons.add),
            label: const Text('Request Vehicle Change'),
            style: OutlinedButton.styleFrom(
              foregroundColor: const Color(0xFF1B62F0),
              side: const BorderSide(color: Color(0xFF1B62F0)),
              padding: const EdgeInsets.symmetric(vertical: 16),
              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
            ),
          )
        ],
      ),
    );
  }

  Widget _buildVehicleCard({
    required String brand,
    required String plate,
    required String year,
    required String color,
    required String status,
    required bool isActive,
  }) {
    return Container(
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: isActive ? const Color(0xFF1B62F0) : Colors.transparent, width: 2),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withValues(alpha: 0.03),
            blurRadius: 10,
            offset: const Offset(0, 4),
          ),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Row(
                children: [
                  const Icon(Icons.directions_car, color: Color(0xFF757575)),
                  const SizedBox(width: 8),
                  Text(brand, style: const TextStyle(fontSize: 18, fontWeight: FontWeight.bold, color: Colors.black87)),
                ],
              ),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                decoration: BoxDecoration(
                  color: isActive ? Colors.green.shade50 : Colors.orange.shade50,
                  borderRadius: BorderRadius.circular(12),
                ),
                child: Text(status, style: TextStyle(color: isActive ? Colors.green : Colors.orange, fontSize: 12, fontWeight: FontWeight.bold)),
              ),
            ],
          ),
          const SizedBox(height: 16),
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              _buildVehicleDetail('Plate No.', plate),
              _buildVehicleDetail('Year', year),
              _buildVehicleDetail('Color', color),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildVehicleDetail(String label, String value) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(label, style: const TextStyle(color: Color(0xFF757575), fontSize: 12)),
        const SizedBox(height: 4),
        Text(value, style: const TextStyle(color: Colors.black87, fontSize: 14, fontWeight: FontWeight.w600)),
      ],
    );
  }
}
