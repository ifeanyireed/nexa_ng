import 'package:flutter/material.dart';
import 'package:flutter_animate/flutter_animate.dart';
import 'package:flutter_svg/flutter_svg.dart';
import 'home_screen.dart';

class OnboardingScreen extends StatefulWidget {
  const OnboardingScreen({super.key});

  @override
  State<OnboardingScreen> createState() => _OnboardingScreenState();
}

class _OnboardingScreenState extends State<OnboardingScreen> {
  final PageController _pageController = PageController();
  int _currentIndex = 0;

  final List<String> _images = [
    'assets/images/splash1.jpg',
    'assets/images/splash2.jpg',
    'assets/images/splash3.jpg',
  ];

  final List<String> _inscriptions = [
    'Seamless Fleet Management',
    'Real-time Tracking & Logistics',
    'Reliable Corporate Transport',
  ];

  void _finish() {
    Navigator.of(context).pushReplacement(
      MaterialPageRoute(builder: (context) => const HomeScreen()),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: Stack(
        children: [
          PageView.builder(
            controller: _pageController,
            itemCount: _images.length,
            onPageChanged: (index) {
              setState(() {
                _currentIndex = index;
              });
            },
            itemBuilder: (context, index) {
              return Stack(
                fit: StackFit.expand,
                children: [
                  Image.asset(
                    _images[index],
                    fit: BoxFit.cover,
                  ),
                ],
              );
            },
          ),

          // Top Logo and Inscription
          Positioned(
            top: 60,
            left: 20,
            right: 20,
            child: Column(
              children: [
                // Logo
                SvgPicture.asset(
                  'assets/images/favicon.svg',
                  width: 70,
                  height: 70,
                  fit: BoxFit.contain,
                ),
                const SizedBox(height: 20),
                Text(
                  _inscriptions[_currentIndex],
                  textAlign: TextAlign.center,
                  style: const TextStyle(
                    color: Color(0xFF1B62F0),
                    fontSize: 28,
                    fontWeight: FontWeight.bold,
                  ),
                )
                    .animate(key: ValueKey('inscription_$_currentIndex'))
                    .fadeIn(duration: const Duration(milliseconds: 600))
                    .slideY(begin: 0.2, end: 0),
              ],
            ),
          ),

          // Bottom Controls (Dots and Skip/Next)
          Positioned(
            bottom: 40,
            left: 20,
            right: 20,
            child: Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                TextButton(
                  onPressed: _finish,
                  child: const Text('Skip',
                      style: TextStyle(
                          color: Color(0xFF1B62F0),
                          fontSize: 16,
                          fontWeight: FontWeight.bold)),
                ),
                Row(
                  children: List.generate(_images.length, (index) {
                    return Container(
                      margin: const EdgeInsets.symmetric(horizontal: 4),
                      width: _currentIndex == index ? 12 : 8,
                      height: 8,
                      decoration: BoxDecoration(
                        color: _currentIndex == index
                            ? const Color(0xFF1B62F0)
                            : const Color(0xFF1B62F0).withValues(alpha: 0.5),
                        borderRadius: BorderRadius.circular(4),
                      ),
                    );
                  }),
                ),
                TextButton(
                  onPressed: () {
                    if (_currentIndex == _images.length - 1) {
                      _finish();
                    } else {
                      _pageController.nextPage(
                        duration: const Duration(milliseconds: 300),
                        curve: Curves.easeInOut,
                      );
                    }
                  },
                  child: Text(
                    _currentIndex == _images.length - 1 ? 'Done' : 'Next',
                    style: const TextStyle(
                        color: Color(0xFF1B62F0),
                        fontSize: 16,
                        fontWeight: FontWeight.bold),
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    )
        .animate()
        .fadeIn(duration: const Duration(seconds: 3))
        .slideY(begin: 0.05, end: 0);
  }
}
