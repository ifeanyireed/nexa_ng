import 'package:flutter/material.dart';
import 'package:flutter_animate/flutter_animate.dart';

class SavedLocationsScreen extends StatelessWidget {
  const SavedLocationsScreen({Key? key}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFFF8FAFC),
      appBar: AppBar(title: const Text('Saved Locations'), backgroundColor: Colors.white, foregroundColor: Colors.black, elevation: 0),
      body: ListView(
        padding: const EdgeInsets.all(20),
        children: [
          _buildLocationTile(Icons.home, 'Home', '123 Main St, Lagos'),
          _buildLocationTile(Icons.work, 'Work', 'Tech Hub, Yaba, Lagos'),
          _buildLocationTile(Icons.favorite, 'Gym', 'FitCenter, Ikeja'),
          const SizedBox(height: 24),
          SizedBox(
            width: double.infinity,
            child: OutlinedButton.icon(
              onPressed: () {},
              icon: const Icon(Icons.add),
              label: const Text('Add New Location'),
              style: OutlinedButton.styleFrom(padding: const EdgeInsets.symmetric(vertical: 16), foregroundColor: const Color(0xFF1B62F0)),
            ),
          )
        ],
      ).animate().fadeIn().slideY(begin: 0.05),
    );
  }

  Widget _buildLocationTile(IconData icon, String title, String subtitle) {
    return ListTile(
      contentPadding: EdgeInsets.zero,
      leading: CircleAvatar(backgroundColor: const Color(0xFF1B62F0).withOpacity(0.1), child: Icon(icon, color: const Color(0xFF1B62F0))),
      title: Text(title, style: const TextStyle(fontWeight: FontWeight.bold)),
      subtitle: Text(subtitle, style: TextStyle(color: Colors.grey.shade600)),
      trailing: const Icon(Icons.more_vert),
    );
  }
}
