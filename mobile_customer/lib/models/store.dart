import 'package:flutter/material.dart';

enum StoreVertical {
  fashion,
  cars,
  food,
  property,
  gadgets,
  beauty,
  homeLiving,
  pharmacy,
  hardware,
  retail,
}

extension StoreVerticalExtension on StoreVertical {
  String get id {
    switch (this) {
      case StoreVertical.fashion:
        return 'fashion';
      case StoreVertical.cars:
        return 'cars';
      case StoreVertical.food:
        return 'food';
      case StoreVertical.property:
        return 'property';
      case StoreVertical.gadgets:
        return 'gadgets';
      case StoreVertical.beauty:
        return 'beauty';
      case StoreVertical.homeLiving:
        return 'home-living';
      case StoreVertical.pharmacy:
        return 'pharmacy';
      case StoreVertical.hardware:
        return 'hardware';
      case StoreVertical.retail:
        return 'retail';
    }
  }

  String get displayName {
    switch (this) {
      case StoreVertical.fashion:
        return 'Fashion & Apparel';
      case StoreVertical.cars:
        return 'Cars & Motors';
      case StoreVertical.food:
        return 'Food & Bistro';
      case StoreVertical.property:
        return 'Property & Rentals';
      case StoreVertical.gadgets:
        return 'Gadgets & Tech';
      case StoreVertical.beauty:
        return 'Beauty & Wellness';
      case StoreVertical.homeLiving:
        return 'Home & Living';
      case StoreVertical.pharmacy:
        return 'Pharmacy & Health';
      case StoreVertical.hardware:
        return 'Hardware & Energy';
      case StoreVertical.retail:
        return 'General Retail';
    }
  }

  String get shortName {
    switch (this) {
      case StoreVertical.fashion:
        return 'Fashion';
      case StoreVertical.cars:
        return 'Cars';
      case StoreVertical.food:
        return 'Food';
      case StoreVertical.property:
        return 'Property';
      case StoreVertical.gadgets:
        return 'Gadgets';
      case StoreVertical.beauty:
        return 'Beauty';
      case StoreVertical.homeLiving:
        return 'Home';
      case StoreVertical.pharmacy:
        return 'Pharmacy';
      case StoreVertical.hardware:
        return 'Hardware';
      case StoreVertical.retail:
        return 'Retail';
    }
  }

  IconData get icon {
    switch (this) {
      case StoreVertical.fashion:
        return Icons.checkroom_outlined;
      case StoreVertical.cars:
        return Icons.directions_car_outlined;
      case StoreVertical.food:
        return Icons.restaurant_outlined;
      case StoreVertical.property:
        return Icons.apartment_outlined;
      case StoreVertical.gadgets:
        return Icons.devices_outlined;
      case StoreVertical.beauty:
        return Icons.spa_outlined;
      case StoreVertical.homeLiving:
        return Icons.chair_outlined;
      case StoreVertical.pharmacy:
        return Icons.local_pharmacy_outlined;
      case StoreVertical.hardware:
        return Icons.bolt_outlined;
      case StoreVertical.retail:
        return Icons.storefront_outlined;
    }
  }
}

class StoreContact {
  final String phone;
  final String email;
  final String address;
  final String whatsapp;
  final String operatingHours;

  const StoreContact({
    required this.phone,
    required this.email,
    required this.address,
    required this.whatsapp,
    required this.operatingHours,
  });
}

class VendorStore {
  final String id;
  final String slug;
  final String name;
  final StoreVertical vertical;
  final String tagline;
  final String description;
  final String logo;
  final String coverImage;
  final Color primaryColor;
  final Color accentColor;
  final String currency;
  final StoreContact contact;
  final List<String> badges;
  final List<String> features;
  final double rating;
  final int reviewsCount;
  final String distance;

  const VendorStore({
    required this.id,
    required this.slug,
    required this.name,
    required this.vertical,
    required this.tagline,
    required this.description,
    required this.logo,
    required this.coverImage,
    required this.primaryColor,
    required this.accentColor,
    this.currency = '₦',
    required this.contact,
    required this.badges,
    required this.features,
    this.rating = 4.9,
    this.reviewsCount = 120,
    this.distance = '1.8 km',
  });
}
