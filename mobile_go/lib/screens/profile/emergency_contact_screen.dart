import 'package:flutter/material.dart';
import 'package:flutter_animate/flutter_animate.dart';

class EmergencyContactScreen extends StatelessWidget {
  const EmergencyContactScreen({Key? key}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFFF8FAFC),
      appBar: AppBar(
          title: const Text('Emergency Contacts'),
          backgroundColor: Colors.white,
          foregroundColor: Colors.black,
          elevation: 0),
      body: Padding(
        padding: const EdgeInsets.all(20),
        child: Column(
          children: [
            const Text(
                'These contacts will be notified if you trigger an SOS during a trip.',
                style: TextStyle(color: Colors.grey)),
            const SizedBox(height: 20),
            _buildContact('John Doe', '+234 800 111 2222', 'Brother'),
            _buildContact('Jane Smith', '+234 800 333 4444', 'Spouse'),
            const Spacer(),
            SizedBox(
              width: double.infinity,
              child: ElevatedButton.icon(
                onPressed: () {},
                icon: const Icon(Icons.add, color: Colors.white),
                label: const Text('Add Contact',
                    style: TextStyle(color: Colors.white)),
                style: ElevatedButton.styleFrom(
                    backgroundColor: const Color(0xFF1B62F0),
                    padding: const EdgeInsets.symmetric(vertical: 16)),
              ),
            )
          ],
        ),
      ).animate().fadeIn().slideY(begin: 0.05),
    );
  }

  Widget _buildContact(String name, String phone, String relation) {
    return ListTile(
      contentPadding: EdgeInsets.zero,
      leading: const CircleAvatar(backgroundImage: AssetImage('assets/images/avatar2.png')),
      title: Text(name, style: const TextStyle(fontWeight: FontWeight.bold)),
      subtitle: Text('$relation • $phone'),
      trailing: IconButton(
          icon: const Icon(Icons.delete, color: Colors.red), onPressed: () {}),
    );
  }
}
