import 'package:flutter/material.dart';
import 'screens/splash_screen.dart';

void main() {
  runApp(const TransportFleetApp());
}

class TransportFleetApp extends StatelessWidget {
  const TransportFleetApp({Key? key}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'Transport OS Fleet',
      debugShowCheckedModeBanner: false,
      theme: ThemeData(
        primaryColor: const Color(0xFF1B62F0),
        scaffoldBackgroundColor: const Color(0xFFF8FAFC),
        fontFamily: 'Inter',
        colorScheme: ColorScheme.fromSeed(seedColor: const Color(0xFF1B62F0)),
        useMaterial3: true,
      ),
      home: const SplashScreen(),
    );
  }
}
