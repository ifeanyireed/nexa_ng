import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flexicon/flexicon.dart';
import 'utils/icon_util.dart';

import 'screens/dashboard_screen.dart';
import 'screens/job_offers_screen.dart';
import 'screens/performance_screen.dart';
import 'screens/account_screen.dart';
import 'screens/splash_screen.dart';

void main() {
  WidgetsFlutterBinding.ensureInitialized();
  SystemChrome.setSystemUIOverlayStyle(
    const SystemUiOverlayStyle(
      statusBarColor: Colors.transparent,
      statusBarIconBrightness: Brightness.dark,
    ),
  );
  runApp(const MobileRiderApp());
}

class MobileRiderApp extends StatelessWidget {
  const MobileRiderApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'Ofia Rider',
      debugShowCheckedModeBanner: false,
      theme: ThemeData(
        useMaterial3: true,
        scaffoldBackgroundColor: const Color(0xFFF8FAFC),
        fontFamily: 'Dropa',
        colorScheme: ColorScheme.fromSeed(
          seedColor: const Color(0xFF16A34A), // Green color for Rider app
          primary: const Color(0xFF16A34A),
          surface: Colors.white,
        ),
        navigationBarTheme: NavigationBarThemeData(
          backgroundColor: Colors.white,
          indicatorColor: const Color(0xFFDCFCE7),
          iconTheme: WidgetStateProperty.resolveWith((states) {
            if (states.contains(WidgetState.selected)) {
              return const IconThemeData(color: Color(0xFF16A34A), size: 23);
            }
            return const IconThemeData(color: Color(0xFF64748B), size: 23);
          }),
          labelTextStyle: WidgetStateProperty.resolveWith((states) {
            if (states.contains(WidgetState.selected)) {
              return const TextStyle(
                fontSize: 11,
                fontWeight: FontWeight.w700,
                color: Color(0xFF16A34A),
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
      home: const SplashScreen(),
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
  int _currentTabIndex = 0;

  void _navigateToTab(int index) {
    if (index >= 0 && index < 4) {
      setState(() {
        _currentTabIndex = index;
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: IndexedStack(
        index: _currentTabIndex,
        children: [
          DashboardScreen(onNavigateToTab: _navigateToTab),
          JobOffersScreen(onNavigateToTab: _navigateToTab),
          PerformanceScreen(onNavigateToTab: _navigateToTab),
          AccountScreen(onNavigateToTab: _navigateToTab),
        ],
      ),
      bottomNavigationBar: Container(
        decoration: const BoxDecoration(
          boxShadow: [
            BoxShadow(
              color: Color(0x0A000000),
              blurRadius: 10,
              offset: Offset(0, -5),
            ),
          ],
        ),
        child: NavigationBar(
          selectedIndex: _currentTabIndex,
          onDestinationSelected: (index) {
            setState(() {
              _currentTabIndex = index;
            });
          },
          destinations: [
            NavigationDestination(
              icon: Icon(fixIcon(FlexIcon.remix.home2)),
              selectedIcon: Icon(fixIcon(FlexIcon.solid.home2)),
              label: 'Dashboard',
            ),
            NavigationDestination(
              icon: Icon(fixIcon(FlexIcon.remix.locationPin3)),
              selectedIcon: Icon(fixIcon(FlexIcon.solid.locationPin3)),
              label: 'Job Offers',
            ),
            NavigationDestination(
              icon: Icon(fixIcon(FlexIcon.remix.pieChart)),
              selectedIcon: Icon(fixIcon(FlexIcon.solid.pieChart)),
              label: 'Performance',
            ),
            NavigationDestination(
              icon: Icon(fixIcon(FlexIcon.remix.userCircleSingle)),
              selectedIcon: Icon(fixIcon(FlexIcon.solid.userCircleSingle)),
              label: 'Account',
            ),
          ],
        ),
      ),
    );
  }
}
