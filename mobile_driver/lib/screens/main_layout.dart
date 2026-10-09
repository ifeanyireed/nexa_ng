import 'package:flutter/material.dart';
import 'package:flutter_animate/flutter_animate.dart';
import 'package:flexicon/flexicon.dart';
import 'home_screen.dart';
import 'profile_screen.dart';
import 'all_trips_screen.dart';
// Copy fixIcon since we didn't add icon_util.dart to mobile_driver main_layout.dart
IconData fixIcon(IconData icon) => IconData(
      icon.codePoint,
      fontFamily: icon.fontFamily,
      fontPackage: 'flexicon',
    );

class MainLayout extends StatefulWidget {
  const MainLayout({Key? key}) : super(key: key);

  @override
  State<MainLayout> createState() => _MainLayoutState();
}

class _MainLayoutState extends State<MainLayout> {
  int _currentIndex = 0;
  
  final List<Widget> _screens = [
    const HomeScreen(),
    const AllTripsScreen(),
    const ProfileScreen(),
  ];

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: _screens[_currentIndex],
      bottomNavigationBar: NavigationBar(
        selectedIndex: _currentIndex,
        onDestinationSelected: (index) => setState(() => _currentIndex = index),
        height: 66,
        elevation: 0,
        destinations: [
          NavigationDestination(
            icon: Icon(fixIcon(FlexIcon.remix.home2)),
            selectedIcon: Icon(fixIcon(FlexIcon.solid.home2)),
            label: 'Home',
          ),
          NavigationDestination(
            icon: Icon(fixIcon(FlexIcon.remix.schoolBusSide)),
            selectedIcon: Icon(fixIcon(FlexIcon.solid.schoolBusSide)),
            label: 'Trips',
          ),
          NavigationDestination(
            icon: Icon(fixIcon(FlexIcon.remix.userCircleSingle)),
            selectedIcon: Icon(fixIcon(FlexIcon.solid.userCircleSingle)),
            label: 'Profile',
          ),
        ],
      ),
    );
  }
}
