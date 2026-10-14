import 'package:flutter/material.dart';
import 'package:flutter_animate/flutter_animate.dart';

class SupportScreen extends StatelessWidget {
  const SupportScreen({Key? key}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFFF8FAFC),
      appBar: AppBar(
          title: const Text('Support'),
          backgroundColor: Colors.white,
          foregroundColor: Colors.black,
          elevation: 0),
      body: ListView(
        padding: const EdgeInsets.all(20),
        children: [
          const Text('How can we help you?',
              style: TextStyle(fontSize: 24, fontWeight: FontWeight.bold)),
          const SizedBox(height: 20),
          _buildSupportOption(
              Icons.chat, 'Live Chat', 'Talk to our agents now'),
          _buildSupportOption(Icons.email, 'Email Us', 'support@example.com'),
          _buildSupportOption(Icons.phone, 'Call Us', '+234 800 000 0000'),
          const SizedBox(height: 30),
          const Text('FAQs',
              style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
          const SizedBox(height: 10),
          _buildFaq('How do I reset my password?'),
          _buildFaq('How do I fund my wallet?'),
          _buildFaq('Can I cancel a scheduled trip?'),
        ],
      ).animate().fadeIn().slideY(begin: 0.05),
    );
  }

  Widget _buildSupportOption(IconData icon, String title, String subtitle) {
    return ListTile(
      contentPadding: EdgeInsets.zero,
      leading: CircleAvatar(
          backgroundColor: const Color(0xFF1B62F0).withOpacity(0.1),
          child: Icon(icon, color: const Color(0xFF1B62F0))),
      title: Text(title, style: const TextStyle(fontWeight: FontWeight.bold)),
      subtitle: Text(subtitle),
      trailing: const Icon(Icons.arrow_forward_ios, size: 16),
    );
  }

  Widget _buildFaq(String question) {
    return ExpansionTile(
      title:
          Text(question, style: const TextStyle(fontWeight: FontWeight.w500)),
      children: [
        Padding(
          padding: const EdgeInsets.all(16.0),
          child: Text('This is a placeholder answer for "$question".',
              style: TextStyle(color: Colors.grey.shade700)),
        )
      ],
    );
  }
}
