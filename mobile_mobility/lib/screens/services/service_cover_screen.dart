import 'package:flutter/material.dart';
import 'package:flutter_animate/flutter_animate.dart';
import '../../models/transport_models.dart';

class ServiceCoverScreen extends StatelessWidget {
  final ServiceModule service;
  final Widget nextScreen;

  const ServiceCoverScreen({
    Key? key,
    required this.service,
    required this.nextScreen,
  }) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.white,
      appBar: AppBar(
        backgroundColor: Colors.white,
        elevation: 0,
        leading: IconButton(
          icon: const Icon(Icons.arrow_back, color: Colors.black),
          onPressed: () => Navigator.pop(context),
        ),
      ),
      body: SafeArea(
        child: Padding(
          padding: const EdgeInsets.all(24.0),
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              const Spacer(),
              // Icon
              Container(
                padding: const EdgeInsets.all(32),
                decoration: BoxDecoration(
                  color: service.color.withValues(alpha: 0.1),
                  shape: BoxShape.circle,
                ),
                child: Image.asset(service.imagePath, width: 120, height: 120),
              ).animate().scale(duration: 500.ms, curve: Curves.easeOutBack),
              const SizedBox(height: 40),

              // Title
              Text(
                service.name,
                style: const TextStyle(
                  fontSize: 32,
                  fontWeight: FontWeight.w800,
                  color: Color(0xFF0F172A),
                ),
              ).animate().fadeIn(delay: 200.ms).slideY(begin: 0.2, end: 0),
              const SizedBox(height: 16),

              // Description
              Text(
                service.description,
                textAlign: TextAlign.center,
                style: const TextStyle(
                  fontSize: 16,
                  color: Colors.grey,
                  height: 1.5,
                ),
              ).animate().fadeIn(delay: 400.ms).slideY(begin: 0.2, end: 0),

              const Spacer(),

              // Action Button
              SizedBox(
                width: double.infinity,
                height: 56,
                child: ElevatedButton(
                  onPressed: () {
                    Navigator.pushReplacement(
                      context,
                      MaterialPageRoute(builder: (context) => nextScreen),
                    );
                  },
                  style: ElevatedButton.styleFrom(
                    backgroundColor: const Color(0xFF1B62F0),
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(16),
                    ),
                  ),
                  child: Text(
                    'Book ${service.name}',
                    style: const TextStyle(
                      fontSize: 16,
                      fontWeight: FontWeight.w700,
                      color: Colors.white,
                    ),
                  ),
                ),
              ).animate().fadeIn(delay: 600.ms).slideY(begin: 0.2, end: 0),
              const SizedBox(height: 20),
            ],
          ),
        ),
      ),
    );
  }
}
