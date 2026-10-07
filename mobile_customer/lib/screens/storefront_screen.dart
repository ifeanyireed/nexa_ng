import 'package:flutter/material.dart';
import 'package:flutter_animate/flutter_animate.dart';
import '../data/commerce_data.dart';
import '../models/store.dart';
import '../models/product.dart';
import '../models/cart.dart';
import 'product_details_screen.dart';
import 'cart_screen.dart';
import 'package:flexicon/flexicon.dart';
import 'package:mobile_customer/utils/icon_util.dart';

class StorefrontScreen extends StatefulWidget {
  final VendorStore store;

  const StorefrontScreen({
    super.key,
    required this.store,
  });

  @override
  State<StorefrontScreen> createState() => _StorefrontScreenState();
}

class _StorefrontScreenState extends State<StorefrontScreen> {
  final CartManager _cart = CartManager();
  bool _isFollowing = false;
  String _activeCategory = 'All';

  @override
  void initState() {
    super.initState();
    _cart.addListener(_onCartChanged);
  }

  @override
  void dispose() {
    _cart.removeListener(_onCartChanged);
    super.dispose();
  }

  void _onCartChanged() {
    if (mounted) setState(() {});
  }

  void _openProduct(Product product) {
    Navigator.of(context).push(
      MaterialPageRoute(
        builder: (context) => ProductDetailsScreen(product: product),
      ),
    );
  }

  void _openCart() {
    Navigator.of(context).push(
      MaterialPageRoute(
        builder: (context) => const CartScreen(),
      ),
    );
  }

  void _triggerVerticalAction() {
    // Contextual modal according to Section 6.3
    switch (widget.store.vertical) {
      case StoreVertical.hardware:
        _showHardwareCalculatorModal();
        break;
      case StoreVertical.pharmacy:
        _showPrescriptionUploadModal();
        break;
      case StoreVertical.cars:
        _showBookingModal('Schedule Vehicle Test-Drive', 'Select your preferred date to test-drive.');
        break;
      case StoreVertical.property:
        _showBookingModal('Schedule Property Viewing', 'Book an in-person or virtual walkthrough.');
        break;
      case StoreVertical.beauty:
        _showBookingModal('Book Spa & Aesthetic Appointment', 'Select a specialist and time slot.');
        break;
      default:
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('${widget.store.name} concierge service is available!'),
            behavior: SnackBarBehavior.floating,
          ),
        );
    }
  }

  void _showBookingModal(String title, String subtitle) {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.white,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(24)),
      ),
      builder: (context) {
        return Padding(
          padding: EdgeInsets.fromLTRB(20, 20, 20, MediaQuery.of(context).viewInsets.bottom + 24),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Center(
                child: Container(
                  width: 40,
                  height: 4,
                  decoration: BoxDecoration(color: const Color(0xFFCBD5E1), borderRadius: BorderRadius.circular(2)),
                ),
              ),
              const SizedBox(height: 16),
              Text(
                title,
                style: const TextStyle(fontSize: 18, fontWeight: FontWeight.w800, color: Color(0xFF0F172A)),
              ),
              const SizedBox(height: 4),
              Text(
                subtitle,
                style: const TextStyle(fontSize: 12, color: Color(0xFF64748B)),
              ),
              const SizedBox(height: 20),
              TextField(
                decoration: InputDecoration(
                  labelText: 'Your Full Name',
                  border: OutlineInputBorder(borderRadius: BorderRadius.circular(12)),
                  prefixIcon: Icon(fixIcon(FlexIcon.remix.userCircleSingle)),
                ),
              ),
              const SizedBox(height: 12),
              TextField(
                decoration: InputDecoration(
                  labelText: 'Phone Number (WhatsApp)',
                  border: OutlineInputBorder(borderRadius: BorderRadius.circular(12)),
                  prefixIcon: Icon(fixIcon(FlexIcon.remix.phone)),
                ),
                keyboardType: TextInputType.phone,
              ),
              const SizedBox(height: 12),
              TextField(
                decoration: InputDecoration(
                  labelText: 'Preferred Date & Time',
                  border: OutlineInputBorder(borderRadius: BorderRadius.circular(12)),
                  prefixIcon: Icon(fixIcon(FlexIcon.remix.blankCalendar)),
                ),
              ),
              const SizedBox(height: 20),
              SizedBox(
                width: double.infinity,
                height: 48,
                child: ElevatedButton(
                  style: ElevatedButton.styleFrom(
                    backgroundColor: widget.store.primaryColor,
                    foregroundColor: Colors.white,
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
                    elevation: 0,
                  ),
                  onPressed: () {
                    Navigator.of(context).pop();
                    ScaffoldMessenger.of(context).showSnackBar(
                      const SnackBar(
                        content: Text('Appointment request sent! The store concierge will contact you on WhatsApp.'),
                        backgroundColor: Color(0xFF0F766E),
                        behavior: SnackBarBehavior.floating,
                      ),
                    );
                  },
                  child: const Text('Confirm Request', style: TextStyle(fontWeight: FontWeight.w700)),
                ),
              ),
            ],
          ),
        ).animate().fadeIn(duration: const Duration(milliseconds: 400)).slideY(begin: 0.05, end: 0);
      },
    );
  }

  void _showPrescriptionUploadModal() {
    showModalBottomSheet(
      context: context,
      backgroundColor: Colors.white,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(24)),
      ),
      builder: (context) {
        return Padding(
          padding: const EdgeInsets.all(24),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Center(
                child: Container(
                  width: 40,
                  height: 4,
                  decoration: BoxDecoration(color: const Color(0xFFCBD5E1), borderRadius: BorderRadius.circular(2)),
                ),
              ),
              const SizedBox(height: 16),
              const Text(
                'Upload Doctor Prescription (Rx)',
                style: TextStyle(fontSize: 18, fontWeight: FontWeight.w800, color: Color(0xFF0F172A)),
              ),
              const SizedBox(height: 6),
              const Text(
                'Our registered pharmacists verify prescriptions within 15 minutes before dispensing cold-chain verified medications.',
                style: TextStyle(fontSize: 12, color: Color(0xFF64748B), height: 1.4),
              ),
              const SizedBox(height: 20),
              Container(
                width: double.infinity,
                padding: const EdgeInsets.all(24),
                decoration: BoxDecoration(
                  color: const Color(0xFFF0FDFA),
                  borderRadius: BorderRadius.circular(16),
                  border: Border.all(color: const Color(0xFF99F6E4), style: BorderStyle.solid),
                ),
                child: Column(
                  children: [
                    Icon(fixIcon(FlexIcon.remix.scanner), size: 40, color: Color(0xFF0D9488)),
                    const SizedBox(height: 10),
                    const Text(
                      'Tap to take photo or choose document',
                      style: TextStyle(fontSize: 13, fontWeight: FontWeight.w700, color: Color(0xFF0D9488)),
                    ),
                    const SizedBox(height: 4),
                    Text(
                      'Supports JPG, PNG, PDF up to 10MB',
                      style: TextStyle(fontSize: 11, color: Colors.teal.shade700),
                    ),
                  ],
                ),
              ),
              const SizedBox(height: 20),
              SizedBox(
                width: double.infinity,
                height: 48,
                child: ElevatedButton.icon(
                  style: ElevatedButton.styleFrom(
                    backgroundColor: const Color(0xFF0D9488),
                    foregroundColor: Colors.white,
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
                  ),
                  icon: Icon(fixIcon(FlexIcon.remix.photoCamera)),
                  label: const Text('Capture with Camera', style: TextStyle(fontWeight: FontWeight.w700)),
                  onPressed: () {
                    Navigator.of(context).pop();
                    ScaffoldMessenger.of(context).showSnackBar(
                      const SnackBar(
                        content: Text('Prescription received! A clinical pharmacist will review it immediately.'),
                        backgroundColor: Color(0xFF0D9488),
                        behavior: SnackBarBehavior.floating,
                      ),
                    );
                  },
                ),
              ),
            ],
          ),
        );
      },
    );
  }

  void _showHardwareCalculatorModal() {
    double selectedKw = 5.0;
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.white,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(24)),
      ),
      builder: (context) {
        return StatefulBuilder(
          builder: (context, setModalState) {
            return Padding(
              padding: const EdgeInsets.all(24),
              child: Column(
                mainAxisSize: MainAxisSize.min,
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Center(
                    child: Container(
                      width: 40,
                      height: 4,
                      decoration: BoxDecoration(color: const Color(0xFFCBD5E1), borderRadius: BorderRadius.circular(2)),
                    ),
                  ),
                  const SizedBox(height: 16),
                  const Text(
                    'Solar Power & Inverter Sizing Calculator',
                    style: TextStyle(fontSize: 18, fontWeight: FontWeight.w800, color: Color(0xFF0F172A)),
                  ),
                  const SizedBox(height: 6),
                  const Text(
                    'Calculate continuous load and discover guaranteed inverter & battery bundles.',
                    style: TextStyle(fontSize: 12, color: Color(0xFF64748B)),
                  ),
                  const SizedBox(height: 24),
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      const Text(
                        'Estimated Peak Load:',
                        style: TextStyle(fontSize: 14, fontWeight: FontWeight.w700, color: Color(0xFF0F172A)),
                      ),
                      Text(
                        '${selectedKw.toStringAsFixed(1)} kVA',
                        style: const TextStyle(fontSize: 18, fontWeight: FontWeight.w900, color: Color(0xFFEA580C)),
                      ),
                    ],
                  ),
                  Slider(
                    value: selectedKw,
                    min: 1.5,
                    max: 20.0,
                    divisions: 37,
                    activeColor: const Color(0xFFEA580C),
                    onChanged: (val) {
                      setModalState(() => selectedKw = val);
                    },
                  ),
                  Container(
                    padding: const EdgeInsets.all(16),
                    decoration: BoxDecoration(
                      color: const Color(0xFFFFF7ED),
                      borderRadius: BorderRadius.circular(16),
                      border: Border.all(color: const Color(0xFFFFEDD5)),
                    ),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        const Text(
                          'Recommended System Package:',
                          style: TextStyle(fontSize: 12, fontWeight: FontWeight.w800, color: Color(0xFF9A3412)),
                        ),
                        const SizedBox(height: 6),
                        Text(
                          selectedKw <= 5.0
                              ? '• 5kVA Pure Sine Inverter + 5kWh LiFePO4 Battery + 6x 550W Panels'
                              : '• 10kVA Hybrid Commercial Inverter + 10kWh LiFePO4 Rack + 12x 550W Panels',
                          style: const TextStyle(fontSize: 12, color: Color(0xFF7C2D12), fontWeight: FontWeight.w600),
                        ),
                      ],
                    ),
                  ),
                  const SizedBox(height: 20),
                  SizedBox(
                    width: double.infinity,
                    height: 48,
                    child: ElevatedButton(
                      style: ElevatedButton.styleFrom(
                        backgroundColor: const Color(0xFFEA580C),
                        foregroundColor: Colors.white,
                        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
                      ),
                      onPressed: () {
                        Navigator.of(context).pop();
                        ScaffoldMessenger.of(context).showSnackBar(
                          const SnackBar(
                            content: Text('Engineering site survey requested! COREN engineer assigned.'),
                            backgroundColor: Color(0xFFEA580C),
                            behavior: SnackBarBehavior.floating,
                          ),
                        );
                      },
                      child: const Text('Book COREN Engineering Site Audit', style: TextStyle(fontWeight: FontWeight.w700)),
                    ),
                  ),
                ],
              ),
            );
          },
        );
      },
    );
  }

  @override
  Widget build(BuildContext context) {
    final products = CommerceData.getProductsForStore(widget.store.slug);
    final categories = ['All', ...products.map((p) => p.category).toSet()];

    final displayedProducts = _activeCategory == 'All'
        ? products
        : products.where((p) => p.category == _activeCategory).toList();

    return Scaffold(
      backgroundColor: const Color(0xFFF8FAFC),
      body: CustomScrollView(
        physics: const BouncingScrollPhysics(),
        slivers: [
          // STORE APP BAR WITH COVER IMAGE
          SliverAppBar(
            expandedHeight: 220,
            pinned: true,
            backgroundColor: widget.store.primaryColor,
            elevation: 0,
            leading: IconButton(
              icon: Container(
                padding: const EdgeInsets.all(6),
                decoration: BoxDecoration(
                  color: Colors.black.withOpacity(0.5),
                  shape: BoxShape.circle,
                ),
                child: Icon(Icons.arrow_back, color: Colors.white, size: 20),
              ),
              onPressed: () => Navigator.of(context).pop(),
            ),
            actions: [
              IconButton(
                icon: Container(
                  padding: const EdgeInsets.all(6),
                  decoration: BoxDecoration(
                    color: Colors.black.withOpacity(0.5),
                    shape: BoxShape.circle,
                  ),
                  child: Icon(
                    _isFollowing ? fixIcon(FlexIcon.remix.heart) : fixIcon(FlexIcon.remix.heart),
                    color: _isFollowing ? Colors.redAccent : Colors.white,
                    size: 20,
                  ),
                ),
                onPressed: () {
                  setState(() => _isFollowing = !_isFollowing);
                  ScaffoldMessenger.of(context).showSnackBar(
                    SnackBar(
                      content: Text(_isFollowing ? 'Added to favorites' : 'Removed from favorites'),
                      duration: const Duration(seconds: 1),
                      behavior: SnackBarBehavior.floating,
                    ),
                  );
                },
              ),
              IconButton(
                icon: Container(
                  padding: const EdgeInsets.all(6),
                  decoration: BoxDecoration(
                    color: Colors.black.withOpacity(0.5),
                    shape: BoxShape.circle,
                  ),
                  child: Stack(
                    alignment: Alignment.center,
                    children: [
                      Icon(fixIcon(FlexIcon.remix.bag), color: Colors.white, size: 20),
                      if (_cart.totalCount > 0)
                        Positioned(
                          top: 0,
                          right: 0,
                          child: Container(
                            padding: const EdgeInsets.all(3),
                            decoration: const BoxDecoration(color: Colors.amber, shape: BoxShape.circle),
                            child: Text(
                              '${_cart.totalCount}',
                              style: const TextStyle(fontSize: 8, color: Colors.black, fontWeight: FontWeight.bold),
                            ),
                          ),
                        ),
                    ],
                  ),
                ),
                onPressed: _openCart,
              ),
              const SizedBox(width: 8),
            ],
            flexibleSpace: FlexibleSpaceBar(
              background: Stack(
                fit: StackFit.expand,
                children: [
                  Image.network(
                    widget.store.coverImage,
                    fit: BoxFit.cover,
                    errorBuilder: (_, __, ___) => Container(color: widget.store.primaryColor),
                  ),
                  Container(
                    decoration: BoxDecoration(
                      gradient: LinearGradient(
                        colors: [Colors.black.withOpacity(0.7), Colors.transparent, Colors.black.withOpacity(0.8)],
                        begin: Alignment.topCenter,
                        end: Alignment.bottomCenter,
                      ),
                    ),
                  ),
                  Positioned(
                    bottom: 16,
                    left: 20,
                    right: 20,
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Container(
                          padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                          decoration: BoxDecoration(
                            color: Colors.white.withOpacity(0.2),
                            borderRadius: BorderRadius.circular(6),
                            border: Border.all(color: Colors.white.withOpacity(0.4)),
                          ),
                          child: Text(
                            widget.store.vertical.displayName.toUpperCase(),
                            style: const TextStyle(color: Colors.white, fontSize: 9, fontWeight: FontWeight.w800, letterSpacing: 0.5),
                          ),
                        ),
                        const SizedBox(height: 6),
                        Text(
                          widget.store.name,
                          style: const TextStyle(color: Colors.white, fontSize: 22, fontWeight: FontWeight.w900),
                        ),
                      ],
                    ),
                  ),
                ],
              ),
            ),
          ),

          // STORE IDENTITY & METRICS CARD
          SliverToBoxAdapter(
            child: Container(
              color: Colors.white,
              padding: const EdgeInsets.all(20),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    widget.store.tagline,
                    style: const TextStyle(fontSize: 13, fontWeight: FontWeight.w600, color: Color(0xFF334155)),
                  ),
                  const SizedBox(height: 10),
                  Text(
                    widget.store.description,
                    style: const TextStyle(fontSize: 12, color: Color(0xFF64748B), height: 1.4),
                  ),
                  const SizedBox(height: 14),

                  // Store Badges Row
                  Wrap(
                    spacing: 6,
                    runSpacing: 6,
                    children: widget.store.badges.map((badge) {
                      return Container(
                        padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                        decoration: BoxDecoration(
                          color: const Color(0xFFF1F5F9),
                          borderRadius: BorderRadius.circular(8),
                          border: Border.all(color: const Color(0xFFE2E8F0)),
                        ),
                        child: Text(
                          badge,
                          style: const TextStyle(fontSize: 10, fontWeight: FontWeight.w700, color: Color(0xFF475569)),
                        ),
                      );
                    }).toList(),
                  ),
                  const SizedBox(height: 14),

                  // Operating Hours & Rating Strip
                  Row(
                    children: [
                      Icon(fixIcon(FlexIcon.remix.starCircle), size: 16, color: Color(0xFFF59E0B)),
                      const SizedBox(width: 4),
                      Text(
                        '${widget.store.rating} (${widget.store.reviewsCount} reviews)',
                        style: const TextStyle(fontSize: 12, fontWeight: FontWeight.w700, color: Color(0xFF0F172A)),
                      ),
                      const SizedBox(width: 12),
                      Container(width: 4, height: 4, decoration: const BoxDecoration(color: Color(0xFFCBD5E1), shape: BoxShape.circle)),
                      const SizedBox(width: 12),
                      Expanded(
                        child: Text(
                          widget.store.contact.operatingHours,
                          maxLines: 1,
                          overflow: TextOverflow.ellipsis,
                          style: const TextStyle(fontSize: 11, color: Color(0xFF64748B)),
                        ),
                      ),
                    ],
                  ),
                ],
              ),
            ),
          ),

          // CONTEXTUAL VERTICAL ACTION CALLOUT (Section 6.3)
          SliverToBoxAdapter(
            child: Padding(
              padding: const EdgeInsets.fromLTRB(20, 16, 20, 4),
              child: GestureDetector(
                onTap: _triggerVerticalAction,
                child: Container(
                  padding: const EdgeInsets.all(16),
                  decoration: BoxDecoration(
                    color: widget.store.primaryColor.withOpacity(0.08),
                    borderRadius: BorderRadius.circular(18),
                    border: Border.all(color: widget.store.primaryColor.withOpacity(0.2)),
                  ),
                  child: Row(
                    children: [
                      Container(
                        padding: const EdgeInsets.all(10),
                        decoration: BoxDecoration(
                          color: widget.store.primaryColor,
                          shape: BoxShape.circle,
                        ),
                        child: Icon(
                          widget.store.vertical == StoreVertical.hardware
                              ? fixIcon(FlexIcon.remix.calculator1)
                              : widget.store.vertical == StoreVertical.pharmacy
                                  ? fixIcon(FlexIcon.remix.uploadBox1)
                                  : fixIcon(FlexIcon.remix.calendarMark),
                          color: Colors.white,
                          size: 20,
                        ),
                      ),
                      const SizedBox(width: 12),
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(
                              widget.store.vertical == StoreVertical.hardware
                                  ? 'Solar Sizing & Load Calculator'
                                  : widget.store.vertical == StoreVertical.pharmacy
                                      ? 'Upload Prescription (Rx)'
                                      : widget.store.vertical == StoreVertical.cars
                                          ? 'Book Test-Drive Inspection'
                                          : 'Concierge Booking & Consultation',
                              style: TextStyle(
                                fontSize: 13,
                                fontWeight: FontWeight.w800,
                                color: widget.store.primaryColor,
                              ),
                            ),
                            const SizedBox(height: 2),
                            Text(
                              widget.store.vertical == StoreVertical.hardware
                                  ? 'Calculate home or factory solar requirements'
                                  : widget.store.vertical == StoreVertical.pharmacy
                                      ? 'Direct 15-minute pharmacist review'
                                      : 'Direct appointment with store specialists',
                              style: const TextStyle(fontSize: 11, color: Color(0xFF64748B)),
                            ),
                          ],
                        ),
                      ),
                      Icon(Icons.chevron_right, size: 14, color: widget.store.primaryColor),
                    ],
                  ),
                ),
              ),
            ),
          ),

          // CATEGORIES HORIZONTAL FILTER
          if (categories.length > 1)
            SliverToBoxAdapter(
              child: Padding(
                padding: const EdgeInsets.only(top: 16),
                child: SizedBox(
                  height: 36,
                  child: ListView.separated(
                    scrollDirection: Axis.horizontal,
                    physics: const BouncingScrollPhysics(),
                    padding: const EdgeInsets.symmetric(horizontal: 20),
                    itemCount: categories.length,
                    separatorBuilder: (_, __) => const SizedBox(width: 8),
                    itemBuilder: (context, index) {
                      final cat = categories[index];
                      final isSel = _activeCategory == cat;
                      return GestureDetector(
                        onTap: () => setState(() => _activeCategory = cat),
                        child: Container(
                          padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 8),
                          decoration: BoxDecoration(
                            color: isSel ? widget.store.primaryColor : Colors.white,
                            borderRadius: BorderRadius.circular(100),
                            border: Border.all(
                              color: isSel ? widget.store.primaryColor : const Color(0xFFE2E8F0),
                            ),
                          ),
                          child: Text(
                            cat,
                            style: TextStyle(
                              fontSize: 11,
                              fontWeight: isSel ? FontWeight.w700 : FontWeight.w600,
                              color: isSel ? Colors.white : const Color(0xFF475569),
                            ),
                          ),
                        ),
                      );
                    },
                  ),
                ),
              ),
            ),

          // PRODUCTS TITLE
          SliverToBoxAdapter(
            child: Padding(
              padding: const EdgeInsets.fromLTRB(20, 20, 20, 10),
              child: Text(
                'Available Products & Inventory (${displayedProducts.length})',
                style: const TextStyle(fontSize: 15, fontWeight: FontWeight.w800, color: Color(0xFF0F172A)),
              ),
            ),
          ),

          // PRODUCTS GRID
          SliverPadding(
            padding: const EdgeInsets.fromLTRB(20, 0, 20, 100),
            sliver: displayedProducts.isEmpty
                ? SliverToBoxAdapter(
                    child: Container(
                      padding: const EdgeInsets.all(40),
                      alignment: Alignment.center,
                      child: const Text('No products in this category yet', style: TextStyle(color: Colors.grey)),
                    ),
                  )
                : SliverGrid(
                    gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
                      crossAxisCount: 2,
                      childAspectRatio: 0.68,
                      crossAxisSpacing: 14,
                      mainAxisSpacing: 16,
                    ),
                    delegate: SliverChildBuilderDelegate(
                      (context, index) {
                        final product = displayedProducts[index];
                        return _buildProductCard(product);
                      },
                      childCount: displayedProducts.length,
                    ),
                  ),
          ),
        ],
      ),
    );
  }

  Widget _buildProductCard(Product product) {
    return GestureDetector(
      onTap: () => _openProduct(product),
      child: Container(
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(20),
          border: Border.all(color: const Color(0xFFE2E8F0)),
          boxShadow: [
            BoxShadow(
              color: Colors.black.withOpacity(0.03),
              blurRadius: 10,
              offset: const Offset(0, 3),
            ),
          ],
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Expanded(
              child: ClipRRect(
                borderRadius: const BorderRadius.vertical(top: Radius.circular(20)),
                child: Image.network(
                  product.images[0],
                  fit: BoxFit.cover,
                  width: double.infinity,
                  errorBuilder: (_, __, ___) => Container(
                    color: const Color(0xFFF1F5F9),
                    child: Icon(fixIcon(FlexIcon.remix.archiveBox), color: Color(0xFF94A3B8)),
                  ),
                ),
              ),
            ),
            Padding(
              padding: const EdgeInsets.all(10),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    product.category.toUpperCase(),
                    maxLines: 1,
                    style: TextStyle(
                      fontSize: 9,
                      fontWeight: FontWeight.w800,
                      color: widget.store.primaryColor,
                      letterSpacing: 0.3,
                    ),
                  ),
                  const SizedBox(height: 3),
                  Text(
                    product.title,
                    maxLines: 1,
                    overflow: TextOverflow.ellipsis,
                    style: const TextStyle(fontSize: 12, fontWeight: FontWeight.w700, color: Color(0xFF0F172A)),
                  ),
                  const SizedBox(height: 6),
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Text(
                        product.formattedPrice,
                        style: const TextStyle(fontSize: 13, fontWeight: FontWeight.w900, color: Color(0xFF0F172A)),
                      ),
                      GestureDetector(
                        onTap: () {
                          _cart.addItem(product);
                          ScaffoldMessenger.of(context).showSnackBar(
                            SnackBar(
                              content: Text('Added ${product.title} to bag'),
                              duration: const Duration(seconds: 1),
                              behavior: SnackBarBehavior.floating,
                            ),
                          );
                        },
                        child: Container(
                          padding: const EdgeInsets.all(6),
                          decoration: BoxDecoration(
                            color: widget.store.primaryColor,
                            borderRadius: BorderRadius.circular(10),
                          ),
                          child: Icon(fixIcon(FlexIcon.remix.applicationAdd), size: 16, color: Colors.white),
                        ),
                      ),
                    ],
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}
