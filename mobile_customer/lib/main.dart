import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flexicon/flexicon.dart';


import 'data/commerce_data.dart';
import 'screens/home_screen.dart';
import 'screens/discover_screen.dart';
import 'screens/orders_screen.dart';
import 'screens/logistics_screen.dart';
import 'screens/account_screen.dart';
import 'screens/storefront_screen.dart';

IconData _fixIcon(IconData icon) => IconData(icon.codePoint, fontFamily: icon.fontFamily, fontPackage: 'flexicon');

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
        scaffoldBackgroundColor: const Color(0xFFF8FAFC),
        fontFamily: 'Dropa',
        colorScheme: ColorScheme.fromSeed(
          seedColor: const Color(0xFF1B62F0),
          primary: const Color(0xFF1B62F0),
          surface: Colors.white,
        ),
        navigationBarTheme: NavigationBarThemeData(
          backgroundColor: Colors.white,
          indicatorColor: const Color(0xFFEBF2FE),
          iconTheme: WidgetStateProperty.resolveWith((states) {
            if (states.contains(WidgetState.selected)) {
              return const IconThemeData(color: Color(0xFF1B62F0), size: 23);
            }
            return const IconThemeData(color: Color(0xFF64748B), size: 23);
          }),
          labelTextStyle: WidgetStateProperty.resolveWith((states) {
            if (states.contains(WidgetState.selected)) {
              return const TextStyle(
                fontSize: 11,
                fontWeight: FontWeight.w700,
                color: Color(0xFF1B62F0),
              );
            }
            return const TextStyle(
              fontSize: 11,
              fontWeight: FontWeight.w500,
              color: Color(0xFF64748B),
            );
          }),
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
  // Blueprint Section 6.1 Main Navigation:
  // 0: Home, 1: Discover, 2: Orders, 3: Logistics, 4: Account
  int _currentTabIndex = 0;
  bool _showcaseMode = false; // Side-by-side showcase view for wide screens

  void _navigateToTab(int index) {
    if (index >= 0 && index < 5) {
      setState(() {
        _currentTabIndex = index;
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    return LayoutBuilder(
      builder: (context, constraints) {
        final isWideScreen = constraints.maxWidth >= 1000;

        if (isWideScreen && _showcaseMode) {
          return _buildShowcaseMode();
        }

        if (isWideScreen) {
          return _buildDeviceFrameView(isWideScreen);
        }

        return _buildMobileShell();
      },
    );
  }

  // Standard Mobile Device View (Material 3 with NavigationBar)
  Widget _buildMobileShell() {
    return Scaffold(
      body: IndexedStack(
        index: _currentTabIndex,
        children: [
          HomeScreen(onNavigateToTab: _navigateToTab),
          const DiscoverScreen(),
          const OrdersScreen(),
          LogisticsScreen(onNavigateToTab: _navigateToTab),
          AccountScreen(onNavigateToTab: _navigateToTab),
        ],
      ),
      bottomNavigationBar: Container(
        decoration: const BoxDecoration(
          color: Colors.white,
          border: Border(
            top: BorderSide(color: Color(0xFFE2E8F0), width: 1),
          ),
          boxShadow: [
            BoxShadow(
              color: Color(0x0A000000),
              blurRadius: 10,
              offset: Offset(0, -3),
            ),
          ],
        ),
        child: NavigationBar(
          selectedIndex: _currentTabIndex,
          onDestinationSelected: _navigateToTab,
          height: 66,
          elevation: 0,
          destinations: [
            NavigationDestination(
              icon: Icon(_fixIcon(FlexIcon.remix.home2)),
              selectedIcon: Icon(_fixIcon(FlexIcon.solid.home2)),
              label: 'Home',
            ),
            NavigationDestination(
              icon: Icon(_fixIcon(FlexIcon.remix.locationCompass1)),
              selectedIcon: Icon(_fixIcon(FlexIcon.solid.locationCompass1)),
              label: 'Discover',
            ),
            NavigationDestination(
              icon: Icon(_fixIcon(FlexIcon.remix.receipt)),
              selectedIcon: Icon(_fixIcon(FlexIcon.solid.receipt)),
              label: 'Orders',
            ),
            NavigationDestination(
              icon: Icon(_fixIcon(FlexIcon.remix.transferTruckTime)),
              selectedIcon: Icon(_fixIcon(FlexIcon.solid.transferTruckTime)),
              label: 'Logistics',
            ),
            NavigationDestination(
              icon: Icon(_fixIcon(FlexIcon.remix.userCircleSingle)),
              selectedIcon: Icon(_fixIcon(FlexIcon.solid.userCircleSingle)),
              label: 'Account',
            ),
          ],
        ),
      ),
    );
  }

  // Interactive Device Frame for wide desktop/web view
  Widget _buildDeviceFrameView(bool isWideScreen) {
    return Scaffold(
      backgroundColor: const Color(0xFFE2E8F0),
      body: Stack(
        children: [
          Center(
            child: SingleChildScrollView(
              padding: const EdgeInsets.symmetric(vertical: 40),
              child: Column(
                mainAxisSize: MainAxisSize.min,
                children: [
                  Container(
                    width: 390,
                    height: 820,
                    decoration: BoxDecoration(
                      color: Colors.white,
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
                      child: _buildMobileShell(),
                    ),
                  ),
                ],
              ),
            ),
          ),

          // Top Header Switcher
          Positioned(
            top: 24,
            left: 24,
            right: 24,
            child: Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                const Row(
                  children: [
                    CircleAvatar(
                      radius: 14,
                      backgroundColor: Color(0xFF1B62F0),
                      child: Text('O', style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 13)),
                    ),
                    SizedBox(width: 10),
                    Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          'Ofia Customer Mobile App',
                          style: TextStyle(
                            fontSize: 16,
                            fontWeight: FontWeight.w800,
                            color: Color(0xFF0F172A),
                          ),
                        ),
                        Text(
                          'Section 6 Native Commerce Architecture',
                          style: TextStyle(
                            fontSize: 12,
                            color: Color(0xFF64748B),
                          ),
                        ),
                      ],
                    ),
                  ],
                ),
                GestureDetector(
                  onTap: () {
                    setState(() {
                      _showcaseMode = true;
                    });
                  },
                  child: Container(
                    padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
                    decoration: BoxDecoration(
                      color: const Color(0xFF0F172A),
                      borderRadius: BorderRadius.circular(20),
                      boxShadow: const [
                        BoxShadow(
                          color: Color(0x1A000000),
                          blurRadius: 8,
                          offset: Offset(0, 2),
                        ),
                      ],
                    ),
                    child: const Row(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        Icon(Icons.view_carousel_rounded, color: Colors.white, size: 16),
                        SizedBox(width: 8),
                        Text(
                          '5-Screen Moodboard',
                          style: TextStyle(
                            color: Colors.white,
                            fontSize: 12,
                            fontWeight: FontWeight.w600,
                          ),
                        ),
                      ],
                    ),
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  // 5-Screen Side-by-Side Moodboard Showcase for presentations & blueprint audit
  Widget _buildShowcaseMode() {
    final sampleStore = CommerceData.getFeaturedStores().first; // Lumina Solar & Power

    return Scaffold(
      backgroundColor: const Color(0xFFD6DBE2),
      body: Stack(
        children: [
          // Header Bar
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
                      'Ofia Customer Ecosystem — Section 6 Blueprint Showcase',
                      style: TextStyle(
                        fontSize: 20,
                        fontWeight: FontWeight.w800,
                        color: Color(0xFF0F172A),
                      ),
                    ),
                    Text(
                      'Native Multi-Vertical Commerce · Dynamic Storefront · Order Tracking · Independent Logistics',
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
                    padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
                    decoration: BoxDecoration(
                      color: const Color(0xFF0F172A),
                      borderRadius: BorderRadius.circular(20),
                    ),
                    child: const Row(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        Icon(Icons.smartphone_rounded, color: Colors.white, size: 16),
                        SizedBox(width: 8),
                        Text(
                          'Interactive Device Mode',
                          style: TextStyle(
                            color: Colors.white,
                            fontSize: 13,
                            fontWeight: FontWeight.w600,
                          ),
                        ),
                      ],
                    ),
                  ),
                ),
              ],
            ),
          ),

          // 5 Side-by-Side Phone Mockups
          Center(
            child: SingleChildScrollView(
              scrollDirection: Axis.horizontal,
              padding: const EdgeInsets.symmetric(horizontal: 40, vertical: 70),
              child: Row(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  _phoneMockup(
                    title: '1. Multi-Vertical Home',
                    subtitle: '10 Verticals, Search, Featured Stores',
                    screen: HomeScreen(onNavigateToTab: _navigateToTab),
                  ),
                  const SizedBox(width: 32),
                  _phoneMockup(
                    title: '2. Store Directory',
                    subtitle: 'Vertical Filters, Live Search & Sort',
                    screen: const DiscoverScreen(),
                  ),
                  const SizedBox(width: 32),
                  _phoneMockup(
                    title: '3. Dynamic Storefront',
                    subtitle: 'Vertical Template (Hardware & Energy)',
                    screen: StorefrontScreen(store: sampleStore),
                  ),
                  const SizedBox(width: 32),
                  _phoneMockup(
                    title: '4. Orders & Bookings',
                    subtitle: 'Purchases, Services & GPS Tracking',
                    screen: const OrdersScreen(),
                  ),
                  const SizedBox(width: 32),
                  _phoneMockup(
                    title: '5. Independent Logistics',
                    subtitle: 'Section 6.4 Courier Dispatch Hub',
                    screen: LogisticsScreen(onNavigateToTab: _navigateToTab),
                  ),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _phoneMockup({
    required String title,
    required String subtitle,
    required Widget screen,
  }) {
    return Column(
      mainAxisSize: MainAxisSize.min,
      children: [
        Text(
          title,
          style: const TextStyle(
            fontSize: 14,
            fontWeight: FontWeight.w700,
            color: Color(0xFF0F172A),
          ),
        ),
        const SizedBox(height: 2),
        Text(
          subtitle,
          style: const TextStyle(
            fontSize: 11,
            color: Color(0xFF64748B),
          ),
        ),
        const SizedBox(height: 12),
        Container(
          width: 375,
          height: 760,
          decoration: BoxDecoration(
            borderRadius: BorderRadius.circular(44),
            border: Border.all(color: Colors.white, width: 4),
            boxShadow: [
              BoxShadow(
                color: Colors.black.withOpacity(0.18),
                blurRadius: 32,
                offset: const Offset(0, 14),
              ),
            ],
          ),
          child: ClipRRect(
            borderRadius: BorderRadius.circular(40),
            child: screen,
          ),
        ),
      ],
    );
  }
}
