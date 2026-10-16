import 'dart:async';
import 'package:flutter/material.dart';
import 'package:flutter_animate/flutter_animate.dart';
import 'login_screen.dart';

class SplashScreen extends StatefulWidget {
  const SplashScreen({super.key});

  @override
  State<SplashScreen> createState() => _SplashScreenState();
}

class _SplashScreenState extends State<SplashScreen> {
  final PageController _pageController = PageController();
  int _currentPage = 0;
  bool _showInitialSplash = true;
  Timer? _splashTimer;

  final List<Map<String, String>> _onboardingData = [
    {
      'title': 'Be Your Own Boss',
      'subtitle':
          'Deliver smiles across the city while working on your own terms.',
      'image': 'assets/images/splash8.jpg',
    },
    {
      'title': 'Earn on Your Schedule',
      'subtitle':
          'Work whenever you want and get paid directly to your wallet.',
      'image': 'assets/images/splash9.jpg',
    },
    {
      'title': 'Track Your Earnings',
      'subtitle':
          'Monitor your trips, performance, and daily income effortlessly.',
      'image': 'assets/images/splash10.jpg',
    },
  ];

  @override
  void initState() {
    super.initState();
    _splashTimer = Timer(const Duration(seconds: 5), () {
      if (mounted) {
        setState(() {
          _showInitialSplash = false;
        });
      }
    });
  }

  @override
  void dispose() {
    _splashTimer?.cancel();
    _pageController.dispose();
    super.dispose();
  }

  void _navigateToAuth() {
    Navigator.of(context).pushReplacement(
      MaterialPageRoute(builder: (context) => const LoginScreen()),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.white,
      body: AnimatedSwitcher(
        duration: const Duration(milliseconds: 600),
        switchInCurve: Curves.easeInOut,
        switchOutCurve: Curves.easeInOut,
        transitionBuilder: (child, animation) {
          return FadeTransition(opacity: animation, child: child);
        },
        child: _showInitialSplash
            ? _buildInitialSplash()
            : _buildOnboardingWalkthrough(),
      ),
    );
  }

  Widget _buildInitialSplash() {
    return GestureDetector(
      key: const ValueKey('initial_splash'),
      onTap: () {
        _splashTimer?.cancel();
        if (mounted) {
          setState(() {
            _showInitialSplash = false;
          });
        }
      },
      child: SizedBox.expand(
        child: Image.asset(
          'assets/images/splash7.jpg',
          fit: BoxFit.cover,
          width: double.infinity,
          height: double.infinity,
        ),
      ),
    ).animate().fadeIn(duration: const Duration(milliseconds: 600));
  }

  Widget _buildOnboardingWalkthrough() {
    return Stack(
      key: const ValueKey('onboarding_walkthrough'),
      children: [
        // Swipable pages with full-bleed background images and copy
        PageView.builder(
          controller: _pageController,
          onPageChanged: (int page) {
            setState(() {
              _currentPage = page;
            });
          },
          itemCount: _onboardingData.length,
          itemBuilder: (context, index) {
            final item = _onboardingData[index];
            return Stack(
              fit: StackFit.expand,
              children: [
                // Background Image
                Image.asset(
                  item['image']!,
                  fit: BoxFit.cover,
                  width: double.infinity,
                  height: double.infinity,
                ),
                // Soft gradient scrim to ensure text readability without dulling artwork
                Container(
                  decoration: const BoxDecoration(
                    gradient: LinearGradient(
                      begin: Alignment.topCenter,
                      end: Alignment.bottomCenter,
                      colors: [
                        Color(0xA6FFFFFF), // ~65% white
                        Color(0x1AFFFFFF), // ~10% white
                        Colors.transparent,
                        Color(0x8CFFFFFF), // ~55% white
                        Color(0xD9FFFFFF), // ~85% white
                      ],
                      stops: [0.0, 0.22, 0.45, 0.8, 1.0],
                    ),
                  ),
                ),
                // Text Copy
                SafeArea(
                  child: Padding(
                    padding: const EdgeInsets.symmetric(horizontal: 28.0),
                    child: Column(
                      children: [
                        const SizedBox(height: 60), // Room for Skip pill
                        Text(
                          item['title']!,
                          textAlign: TextAlign.center,
                          style: const TextStyle(
                            fontSize: 28,
                            fontWeight: FontWeight.w800,
                            color: Color(0xFF0F172A),
                            letterSpacing: -0.5,
                          ),
                        ).animate(key: ValueKey('title_$index')).fadeIn(duration: const Duration(milliseconds: 400)).slideY(begin: 0.15, end: 0),
                        const SizedBox(height: 12),
                        Text(
                          item['subtitle']!,
                          textAlign: TextAlign.center,
                          style: const TextStyle(
                            fontSize: 15,
                            fontWeight: FontWeight.w500,
                            color: Color(0xFF475569),
                            height: 1.5,
                          ),
                        ).animate(key: ValueKey('sub_$index')).fadeIn(duration: const Duration(milliseconds: 400), delay: const Duration(milliseconds: 100)).slideY(begin: 0.15, end: 0),
                      ],
                    ),
                  ),
                ),
              ],
            );
          },
        ),

        // Floating top and bottom controls overlay
        SafeArea(
          child: Column(
            children: [
              // Skip Button
              Align(
                alignment: Alignment.topRight,
                child: Padding(
                  padding: const EdgeInsets.only(top: 8.0, right: 16.0),
                  child: TextButton(
                    onPressed: _navigateToAuth,
                    style: TextButton.styleFrom(
                      backgroundColor: const Color(0xCCFFFFFF), // 80% white
                      padding: const EdgeInsets.symmetric(
                        horizontal: 16,
                        vertical: 8,
                      ),
                      shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(20),
                        side: const BorderSide(
                          color: Color(0xB3CBD5E1), // 70% slate-300
                        ),
                      ),
                    ),
                    child: const Text(
                      'Skip',
                      style: TextStyle(
                        color: Color(0xFF475569),
                        fontWeight: FontWeight.w600,
                        fontSize: 14,
                      ),
                    ),
                  ),
                ),
              ),
              const Spacer(),
              // Indicator Dots and Action Button
              Padding(
                padding: const EdgeInsets.fromLTRB(24, 0, 24, 24),
                child: Column(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    Row(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: List.generate(
                        _onboardingData.length,
                        (index) => AnimatedContainer(
                          duration: const Duration(milliseconds: 300),
                          margin: const EdgeInsets.symmetric(horizontal: 4),
                          width: _currentPage == index ? 24 : 8,
                          height: 8,
                          decoration: BoxDecoration(
                            color: _currentPage == index
                                ? Theme.of(context).colorScheme.primary
                                : const Color(0xFFCBD5E1),
                            borderRadius: BorderRadius.circular(4),
                          ),
                        ),
                      ),
                    ),
                    const SizedBox(height: 24),
                    SizedBox(
                      width: double.infinity,
                      height: 54,
                      child: ElevatedButton(
                        onPressed: () {
                          if (_currentPage == _onboardingData.length - 1) {
                            _navigateToAuth();
                          } else {
                            _pageController.nextPage(
                              duration: const Duration(milliseconds: 350),
                              curve: Curves.easeInOut,
                            );
                          }
                        },
                        style: ElevatedButton.styleFrom(
                          backgroundColor:
                              Theme.of(context).colorScheme.primary,
                          foregroundColor: Colors.white,
                          elevation: 2,
                          shadowColor: Theme.of(context)
                              .colorScheme
                              .primary
                              .withValues(alpha: 0.35),
                          shape: RoundedRectangleBorder(
                            borderRadius: BorderRadius.circular(16),
                          ),
                        ),
                        child: Text(
                          _currentPage == _onboardingData.length - 1
                              ? 'Login'
                              : 'Next',
                          style: const TextStyle(
                            fontSize: 16,
                            fontWeight: FontWeight.w700,
                          ),
                        ),
                      ),
                    ),
                  ],
                ),
              ),
            ],
          ),
        ),
      ],
    );
  }
}
