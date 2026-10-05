import 'package:flutter/material.dart';
import 'package:flexicon/flexicon.dart';
import 'package:mobile_customer/utils/icon_util.dart';

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
        return fixIcon(FlexIcon.remix.shirt);
      case StoreVertical.cars:
        return fixIcon(FlexIcon.remix.carTaxi1);
      case StoreVertical.food:
        return fixIcon(FlexIcon.remix.forkKnife);
      case StoreVertical.property:
        return fixIcon(FlexIcon.remix.building1);
      case StoreVertical.gadgets:
        return fixIcon(FlexIcon.remix.iphone);
      case StoreVertical.beauty:
        return fixIcon(FlexIcon.remix.flower);
      case StoreVertical.homeLiving:
        return fixIcon(FlexIcon.remix.sofa);
      case StoreVertical.pharmacy:
        return fixIcon(FlexIcon.remix.hospitalSign);
      case StoreVertical.hardware:
        return fixIcon(FlexIcon.remix.flash3);
      case StoreVertical.retail:
        return fixIcon(FlexIcon.remix.store2);
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
