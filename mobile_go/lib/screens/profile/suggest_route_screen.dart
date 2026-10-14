import 'package:flutter/material.dart';
import 'package:flutter_animate/flutter_animate.dart';

class SuggestRouteScreen extends StatelessWidget {
  const SuggestRouteScreen({Key? key}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFFF8FAFC),
      appBar: AppBar(
          title: const Text('Suggest a Route'),
          backgroundColor: Colors.white,
          foregroundColor: Colors.black,
          elevation: 0),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(20),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Text("Don't see your route?",
                style: TextStyle(fontSize: 22, fontWeight: FontWeight.bold)),
            const SizedBox(height: 8),
            const Text('Suggest a route and we might add it to our network!'),
            const SizedBox(height: 24),
            const TextField(
              decoration: InputDecoration(
                  labelText: 'Pickup Location', border: OutlineInputBorder()),
            ),
            const SizedBox(height: 16),
            const TextField(
              decoration: InputDecoration(
                  labelText: 'Drop-off Location', border: OutlineInputBorder()),
            ),
            const SizedBox(height: 16),
            const TextField(
              decoration: InputDecoration(
                  labelText: 'Preferred Time (e.g. 7:00 AM)',
                  border: OutlineInputBorder()),
            ),
            const SizedBox(height: 32),
            SizedBox(
              width: double.infinity,
              child: ElevatedButton(
                onPressed: () {
                  ScaffoldMessenger.of(context).showSnackBar(
                      const SnackBar(content: Text('Suggestion submitted!')));
                  Navigator.pop(context);
                },
                style: ElevatedButton.styleFrom(
                    backgroundColor: const Color(0xFF1B62F0),
                    padding: const EdgeInsets.symmetric(vertical: 16)),
                child: const Text('Submit Suggestion',
                    style: TextStyle(color: Colors.white)),
              ),
            )
          ],
        ).animate().fadeIn().slideY(begin: 0.05),
      ),
    );
  }
}
