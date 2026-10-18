class RiderWorkspace {
  final String orgId;
  final String tenantSlug;
  final String tenantName;
  final String? logo;
  final String primaryColor;
  final String riderId;
  final String riderName;
  final String vehicleType;
  final String plateNumber;
  final double rating;

  RiderWorkspace({
    required this.orgId,
    required this.tenantSlug,
    required this.tenantName,
    this.logo,
    required this.primaryColor,
    required this.riderId,
    required this.riderName,
    required this.vehicleType,
    required this.plateNumber,
    required this.rating,
  });

  factory RiderWorkspace.fromJson(Map<String, dynamic> json) {
    return RiderWorkspace(
      orgId: json['org_id']?.toString() ?? '',
      tenantSlug: json['tenant_slug']?.toString() ?? '',
      tenantName: json['tenant_name']?.toString() ?? 'Ofia Fleet',
      logo: json['logo']?.toString(),
      primaryColor: json['primary_color']?.toString() ?? '#146EF5',
      riderId: json['rider_id']?.toString() ?? '',
      riderName: json['rider_name']?.toString() ?? 'Courier',
      vehicleType: json['vehicle_type']?.toString() ?? 'MOTORBIKE',
      plateNumber: json['plate_number']?.toString() ?? 'KJA-000-XX',
      rating: (json['rating'] as num?)?.toDouble() ?? 5.0,
    );
  }
}

class RiderJob {
  final String id;
  final String orderNumber;
  final String trackingNumber;
  final String status;
  final String priority;
  final String senderName;
  final String senderPhone;
  final String pickupAddress;
  final double pickupLat;
  final double pickupLng;
  final String recipientName;
  final String recipientPhone;
  final String recipientAddress;
  final double dropoffLat;
  final double dropoffLng;
  final String deliveryOtp;
  final double shippingFee;
  final double weightKg;
  final String? parcelDescription;
  final String? notes;

  RiderJob({
    required this.id,
    required this.orderNumber,
    required this.trackingNumber,
    required this.status,
    required this.priority,
    required this.senderName,
    required this.senderPhone,
    required this.pickupAddress,
    required this.pickupLat,
    required this.pickupLng,
    required this.recipientName,
    required this.recipientPhone,
    required this.recipientAddress,
    required this.dropoffLat,
    required this.dropoffLng,
    required this.deliveryOtp,
    required this.shippingFee,
    required this.weightKg,
    this.parcelDescription,
    this.notes,
  });

  factory RiderJob.fromJson(Map<String, dynamic> json) {
    return RiderJob(
      id: json['id']?.toString() ?? '',
      orderNumber: json['order_id']?.toString() ?? json['id']?.toString() ?? '',
      trackingNumber: json['tracking_number']?.toString() ?? '',
      status: json['status']?.toString() ?? 'PENDING',
      priority: json['priority']?.toString() ?? 'STANDARD',
      senderName: json['sender_name']?.toString() ?? 'Merchant Hub',
      senderPhone: json['sender_phone']?.toString() ?? '',
      pickupAddress: json['pickup_address']?.toString() ?? json['sender_address']?.toString() ?? 'Pickup Point',
      pickupLat: (json['pickup_lat'] as num?)?.toDouble() ?? 6.4698,
      pickupLng: (json['pickup_lng'] as num?)?.toDouble() ?? 3.5852,
      recipientName: json['recipient_name']?.toString() ?? 'Customer',
      recipientPhone: json['recipient_phone']?.toString() ?? '',
      recipientAddress: json['recipient_address']?.toString() ?? 'Drop-off Destination',
      dropoffLat: (json['dropoff_lat'] as num?)?.toDouble() ?? 6.4281,
      dropoffLng: (json['dropoff_lng'] as num?)?.toDouble() ?? 3.4219,
      deliveryOtp: json['delivery_otp']?.toString() ?? '8491',
      shippingFee: (json['shipping_fee'] as num?)?.toDouble() ?? 3000.0,
      weightKg: (json['weight_kg'] as num?)?.toDouble() ?? 1.5,
      parcelDescription: json['parcel_description']?.toString(),
      notes: json['notes']?.toString(),
    );
  }
}
