import 'package:flutter/material.dart';
import 'package:flutter_animate/flutter_animate.dart';

class FavouriteRoutesScreen extends StatelessWidget {
  const FavouriteRoutesScreen({Key? key}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFFF8FAFC),
      appBar: AppBar(title: const Text('Favourite Routes'), backgroundColor: Colors.white, foregroundColor: Colors.black, elevation: 0),
      body: ListView(
        padding: const EdgeInsets.all(20),
        children: [
          _buildRouteTile('Yaba to Ikeja', 'Morning Commute'),
          _buildRouteTile('Lekki to VI', 'Evening Return'),
          const SizedBox(height: 24),
          const Center(child: Text('You can save routes from your trip history.', style: TextStyle(color: Colors.grey))),
        ],
      ).animate().fadeIn().slideY(begin: 0.05),
    );
  }

  Widget _buildRouteTile(String route, String label) {
    return Card(
      elevation: 0,
      margin: const EdgeInsets.only(bottom: 12),
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12), side: BorderSide(color: Colors.grey.shade200)),
      child: ListTile(
        leading: const Icon(Icons.route, color: Color(0xFF1B62F0)),
        title: Text(route, style: const TextStyle(fontWeight: FontWeight.bold)),
        subtitle: Text(label),
        trailing: const Icon(Icons.arrow_forward_ios, size: 16),
      ),
    );
  }
}
