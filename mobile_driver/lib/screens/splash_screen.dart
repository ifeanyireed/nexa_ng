import 'package:flutter/material.dart';
import 'package:flutter_animate/flutter_animate.dart';
import 'package:flutter_svg/flutter_svg.dart';
import 'onboarding_screen.dart';

class SplashScreen extends StatefulWidget {
  const SplashScreen({super.key});

  @override
  State<SplashScreen> createState() => _SplashScreenState();
}

class _SplashScreenState extends State<SplashScreen> {
  @override
  void initState() {
    super.initState();
    Future.delayed(const Duration(seconds: 4), () {
      Navigator.of(context).pushReplacement(
        MaterialPageRoute(builder: (context) => const OnboardingScreen()),
      );
    });
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: Stack(
        fit: StackFit.expand,
        children: [
          // Background Image
          Image.asset(
            'assets/images/splash6.jpg',
            fit: BoxFit.cover,
          ),

          // Content
          Center(
            child: Column(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                // Logo
                SvgPicture.asset(
                  'assets/images/favicon.svg',
                  width: 100,
                  height: 100,
                  fit: BoxFit.contain,
                ).animate().fadeIn(duration: const Duration(seconds: 2)),

                const SizedBox(height: 24),

                const Text(
                  'NETS',
                  style: TextStyle(
                    fontSize: 32,
                    fontWeight: FontWeight.bold,
                    color: Colors.white,
                    letterSpacing: 1.2,
                  ),
                )
                    .animate(delay: const Duration(milliseconds: 800))
                    .fadeIn(duration: const Duration(milliseconds: 800))
                    .slideY(
                        begin: 0.2,
                        end: 0,
                        duration: const Duration(milliseconds: 800)),

                const Text(
                  'Driver App',
                  style: TextStyle(
                    fontSize: 20,
                    fontWeight: FontWeight.w500,
                    color: Colors.white,
                    letterSpacing: 0.5,
                  ),
                )
                    .animate(delay: const Duration(milliseconds: 1200))
                    .fadeIn(duration: const Duration(milliseconds: 800))
                    .slideY(
                        begin: 0.2,
                        end: 0,
                        duration: const Duration(milliseconds: 800)),
              ],
            ),
          ),
        ],
      ),
    );
  }
}
