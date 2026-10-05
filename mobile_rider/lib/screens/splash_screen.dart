import 'package:flutter/material.dart';
import 'package:flexicon/flexicon.dart';
import '../main.dart'; // Import to access MainAppNavigationScaffold
import 'login_screen.dart';

class SplashScreen extends StatefulWidget {
  const SplashScreen({super.key});

  @override
  State<SplashScreen> createState() => _SplashScreenState();
}

class _SplashScreenState extends State<SplashScreen> {
  @override
  void initState() {
    super.initState();
    _navigateToNext();
  }

  void _navigateToNext() async {
    // Simulate loading delay
    await Future.delayed(const Duration(seconds: 2));
    if (!mounted) return;
    
    Navigator.of(context).pushReplacement(
      MaterialPageRoute(builder: (context) => const LoginScreen()),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Theme.of(context).colorScheme.primary, // #16A34A Green for Rider
      body: Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Container(
              width: 100,
              height: 100,
              decoration: const BoxDecoration(
                color: Colors.white,
                shape: BoxShape.circle,
              ),
              child: Center(
                child: Icon(
                  Icons.delivery_dining,
                  size: 50,
                  color: Theme.of(context).colorScheme.primary,
                ),
              ),
            ),
            const SizedBox(height: 24),
            const Text(
              'Ofia Rider',
              style: TextStyle(
                fontSize: 28,
                fontWeight: FontWeight.w900,
                color: Colors.white,
                letterSpacing: 1.2,
              ),
            ),
            const SizedBox(height: 8),
            const Text(
              'Deliver with speed & earn more',
              style: TextStyle(
                fontSize: 14,
                fontWeight: FontWeight.w600,
                color: Color(0xFFDCFCE7),
              ),
            ),
          ],
        ),
      ),
    );
  }
}
