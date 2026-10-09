import 'package:flutter/material.dart';
import 'package:flutter_animate/flutter_animate.dart';

class RewardScreen extends StatelessWidget {
  final int points;
  const RewardScreen({Key? key, required this.points}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFFF8FAFC),
      appBar: AppBar(
          title: const Text('Rewards'),
          backgroundColor: Colors.white,
          foregroundColor: Colors.black,
          elevation: 0),
      body: Padding(
        padding: const EdgeInsets.all(20),
        child: Column(
          children: [
            Container(
              padding: const EdgeInsets.all(24),
              decoration: BoxDecoration(
                  color: const Color(0xFF1B62F0),
                  borderRadius: BorderRadius.circular(16)),
              child: Column(
                children: [
                  const Icon(Icons.stars, color: Colors.amber, size: 48),
                  const SizedBox(height: 12),
                  const Text('Total Points',
                      style: TextStyle(color: Colors.white70, fontSize: 16)),
                  Text('$points',
                      style: const TextStyle(
                          color: Colors.white,
                          fontSize: 36,
                          fontWeight: FontWeight.bold)),
                ],
              ),
            ),
            const SizedBox(height: 24),
            const Align(
                alignment: Alignment.centerLeft,
                child: Text('How to earn',
                    style:
                        TextStyle(fontSize: 18, fontWeight: FontWeight.bold))),
            const SizedBox(height: 12),
            _buildInfoTile('Complete a ride', '+10 pts'),
            _buildInfoTile('Refer a friend', '+50 pts'),
            _buildInfoTile('Share on social media', '+5 pts'),
          ],
        ),
      ).animate().fadeIn().slideY(begin: 0.05),
    );
  }

  Widget _buildInfoTile(String title, String pts) {
    return ListTile(
      contentPadding: EdgeInsets.zero,
      leading: const CircleAvatar(
          backgroundColor: Colors.white,
          child: Icon(Icons.check, color: Colors.green)),
      title: Text(title, style: const TextStyle(fontWeight: FontWeight.w600)),
      trailing: Text(pts,
          style: const TextStyle(
              color: Color(0xFF1B62F0), fontWeight: FontWeight.bold)),
    );
  }
}
