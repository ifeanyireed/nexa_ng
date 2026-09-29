import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:google_fonts/google_fonts.dart';

import 'models/shipment.dart';
import 'screens/home_screen.dart';
import 'screens/shipping_screen.dart';
import 'screens/tracking_screen.dart';

void main() {
  WidgetsFlutterBinding.ensureInitialized();
  SystemChrome.setSystemUIOverlayStyle(
    const SystemUiOverlayStyle(
      statusBarColor: Colors.transparent,
      statusBarIconBrightness: Brightness.dark,
    ),
  );
  runApp(const MobileCustomerApp());
}

class MobileCustomerApp extends StatelessWidget {
  const MobileCustomerApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'Ofia Customer',
      debugShowCheckedModeBanner: false,
      theme: ThemeData(
        useMaterial3: true,
        scaffoldBackgroundColor: const Color(0xFFF6F8FB),
        textTheme: GoogleFonts.plusJakartaSansTextTheme(
          Theme.of(context).textTheme,
        ),
        colorScheme: ColorScheme.fromSeed(
          seedColor: const Color(0xFF1B62F0),
          primary: const Color(0xFF1B62F0),
          surface: Colors.white,
        ),
      ),
      home: const MainAppNavigationScaffold(),
    );
  }
}

class MainAppNavigationScaffold extends StatefulWidget {
  const MainAppNavigationScaffold({super.key});

  @override
  State<MainAppNavigationScaffold> createState() =>
      _MainAppNavigationScaffoldState();
}

class _MainAppNavigationScaffoldState extends State<MainAppNavigationScaffold> {
  int _currentTabIndex = 0; // 0: Home, 1: Shipping, 2: Tracking
  ShipmentItem? _selectedShipment;
  bool _showcaseMode = false; // Side-by-side moodboard view for wide screens

  void _navigateToTab(int index) {
    setState(() {
      _currentTabIndex = index;
    });
  }

  void _onSelectShipment(ShipmentItem item) {
    setState(() {
      _selectedShipment = item;
      _currentTabIndex = 2; // Jump to Tracking screen
    });
  }

  @override
  Widget build(BuildContext context) {
    return LayoutBuilder(
      builder: (context, constraints) {
        final isWideScreen = constraints.maxWidth >= 1000;

        if (isWideScreen && _showcaseMode) {
          return _buildMoodboardShowcase();
        }

        return Scaffold(
          body: Stack(
            children: [
              // Screen Body
              IndexedStack(
                index: _currentTabIndex,
                children: [
                  HomeScreen(
                    onNavigateToTab: _navigateToTab,
                    onSelectShipment: _onSelectShipment,
                  ),
                  ShippingScreen(
                    onBack: () => _navigateToTab(0),
                    onSelectShipment: _onSelectShipment,
                  ),
                  TrackingScreen(
                    onBack: () => _navigateToTab(1),
                    initialShipment: _selectedShipment,
                  ),
                ],
              ),

              // Top Screen Quick Switcher Pill (for rapid review of all 3 screens)
              Positioned(
                top: 50,
                right: 16,
                child: _buildScreenSwitcherPill(isWideScreen),
              ),
            ],
          ),
        );
      },
    );
  }

  // Floating screen switcher for rapid demo / switching
  Widget _buildScreenSwitcherPill(bool isWideScreen) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
      decoration: BoxDecoration(
        color: const Color(0xFF0F172A).withOpacity(0.85),
        borderRadius: BorderRadius.circular(24),
        boxShadow: const [
          BoxShadow(
            color: Color(0x24000000),
            blurRadius: 12,
            offset: Offset(0, 4),
          ),
        ],
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          _switcherOption(index: 0, label: 'Home'),
          _switcherOption(index: 1, label: 'Shipping'),
          _switcherOption(index: 2, label: 'Map'),
          if (isWideScreen) ...[
            Container(
              margin: const EdgeInsets.symmetric(horizontal: 4),
              width: 1,
              height: 16,
              color: Colors.white24,
            ),
            GestureDetector(
              onTap: () {
                setState(() {
                  _showcaseMode = !_showcaseMode;
                });
              },
              child: Container(
                padding:
                    const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                decoration: BoxDecoration(
                  color: _showcaseMode
                      ? const Color(0xFF1D64F2)
                      : Colors.transparent,
                  borderRadius: BorderRadius.circular(16),
                ),
                child: const Text(
                  '3-Screen Moodboard',
                  style: TextStyle(
                    color: Colors.white,
                    fontSize: 11,
                    fontWeight: FontWeight.w600,
                  ),
                ),
              ),
            ),
          ],
        ],
      ),
    );
  }

  Widget _switcherOption({required int index, required String label}) {
    final isSelected = _currentTabIndex == index && !_showcaseMode;
    return GestureDetector(
      onTap: () {
        setState(() {
          _showcaseMode = false;
          _currentTabIndex = index;
        });
      },
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 5),
        decoration: BoxDecoration(
          color: isSelected ? const Color(0xFF1D64F2) : Colors.transparent,
          borderRadius: BorderRadius.circular(16),
        ),
        child: Text(
          label,
          style: TextStyle(
            color: isSelected ? Colors.white : Colors.white70,
            fontSize: 11.5,
            fontWeight: isSelected ? FontWeight.w700 : FontWeight.w500,
          ),
        ),
      ),
    );
  }

  // 3-Screen Moodboard View (recreating the exact presentation in mob.jpg)
  Widget _buildMoodboardShowcase() {
    return Scaffold(
      backgroundColor: const Color(0xFFD6DBE2),
      body: Stack(
        children: [
          // Background
          Positioned.fill(
            child: Container(
              color: const Color(0xFFD3D8E0),
            ),
          ),

          // Top Header
          Positioned(
            top: 24,
            left: 32,
            right: 32,
            child: Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                const Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      'Ofia Customer Mobile App',
                      style: TextStyle(
                        fontSize: 20,
                        fontWeight: FontWeight.w800,
                        color: Color(0xFF0F172A),
                      ),
                    ),
                    Text(
                      'Moodboard Replica (Home • My Shipping • Live Tracking)',
                      style: TextStyle(
                        fontSize: 13,
                        color: Color(0xFF475569),
                      ),
                    ),
                  ],
                ),
                GestureDetector(
                  onTap: () {
                    setState(() {
                      _showcaseMode = false;
                    });
                  },
                  child: Container(
                    padding: const EdgeInsets.symmetric(
                        horizontal: 16, vertical: 8),
                    decoration: BoxDecoration(
                      color: const Color(0xFF0F172A),
                      borderRadius: BorderRadius.circular(20),
                    ),
                    child: const Text(
                      'Interactive Device Mode',
                      style: TextStyle(
                        color: Colors.white,
                        fontSize: 13,
                        fontWeight: FontWeight.w600,
                      ),
                    ),
                  ),
                ),
              ],
            ),
          ),

          // 3 Side-by-Side Phone Mockups
          Center(
            child: SingleChildScrollView(
              scrollDirection: Axis.horizontal,
              padding: const EdgeInsets.symmetric(horizontal: 40, vertical: 60),
              child: Row(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  _phoneMockup(
                    title: '1. Home Dashboard',
                    screen: HomeScreen(
                      onNavigateToTab: _navigateToTab,
                      onSelectShipment: _onSelectShipment,
                    ),
                  ),
                  const SizedBox(width: 36),
                  _phoneMockup(
                    title: '2. My Shipping',
                    screen: ShippingScreen(
                      onBack: () => _navigateToTab(0),
                      onSelectShipment: _onSelectShipment,
                    ),
                  ),
                  const SizedBox(width: 36),
                  _phoneMockup(
                    title: '3. Live Tracking Map',
                    screen: TrackingScreen(
                      onBack: () => _navigateToTab(1),
                      initialShipment: _selectedShipment,
                    ),
                  ),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _phoneMockup({required String title, required Widget screen}) {
    return Column(
      mainAxisSize: MainAxisSize.min,
      children: [
        Text(
          title,
          style: const TextStyle(
            fontSize: 14,
            fontWeight: FontWeight.w600,
            color: Color(0xFF334155),
          ),
        ),
        const SizedBox(height: 12),
        Container(
          width: 375,
          height: 760,
          decoration: BoxDecoration(
            borderRadius: BorderRadius.circular(46),
            border: Border.all(color: Colors.white, width: 4),
            boxShadow: [
              BoxShadow(
                color: Colors.black.withOpacity(0.18),
                blurRadius: 36,
                offset: const Offset(0, 16),
              ),
            ],
          ),
          child: ClipRRect(
            borderRadius: BorderRadius.circular(42),
            child: screen,
          ),
        ),
      ],
    );
  }
}
