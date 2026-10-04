import 'store.dart';

class Product {
  final String id;
  final String storeSlug;
  final StoreVertical vertical;
  final String title;
  final String subtitle;
  final double price;
  final double? originalPrice;
  final String category;
  final List<String> images;
  final double rating;
  final int reviewsCount;
  final bool inStock;
  final bool isFeatured;
  final bool isNewDrop;
  final String description;
  final List<String> highlights;
  final List<String> tags;

  // Vertical specific metadata
  final Map<String, dynamic>? meta;

  const Product({
    required this.id,
    required this.storeSlug,
    required this.vertical,
    required this.title,
    required this.subtitle,
    required this.price,
    this.originalPrice,
    required this.category,
    required this.images,
    this.rating = 4.9,
    this.reviewsCount = 45,
    this.inStock = true,
    this.isFeatured = false,
    this.isNewDrop = false,
    required this.description,
    this.highlights = const [],
    this.tags = const [],
    this.meta,
  });

  String get formattedPrice {
    return '₦${price.toStringAsFixed(0).replaceAllMapped(
      RegExp(r'(\d{1,3})(?=(\d{3})+(?!\d))'),
      (Match m) => '${m[1]},',
    )}';
  }

  String? get formattedOriginalPrice {
    if (originalPrice == null) return null;
    return '₦${originalPrice!.toStringAsFixed(0).replaceAllMapped(
      RegExp(r'(\d{1,3})(?=(\d{3})+(?!\d))'),
      (Match m) => '${m[1]},',
    )}';
  }
}

class StoreService {
  final String id;
  final String storeSlug;
  final StoreVertical vertical;
  final String title;
  final String category;
  final String description;
  final double price;
  final int durationMinutes;
  final String specialistName;
  final String specialistRole;
  final String specialistAvatar;
  final String image;

  const StoreService({
    required this.id,
    required this.storeSlug,
    required this.vertical,
    required this.title,
    required this.category,
    required this.description,
    required this.price,
    required this.durationMinutes,
    required this.specialistName,
    required this.specialistRole,
    required this.specialistAvatar,
    required this.image,
  });

  String get formattedPrice {
    return '₦${price.toStringAsFixed(0).replaceAllMapped(
      RegExp(r'(\d{1,3})(?=(\d{3})+(?!\d))'),
      (Match m) => '${m[1]},',
    )}';
  }
}
