import 'package:flutter/material.dart';
import '../models/store.dart';
import '../models/cart.dart';
import '../data/commerce_data.dart';

class CartScreen extends StatefulWidget {
  const CartScreen({super.key});

  @override
  State<CartScreen> createState() => _CartScreenState();
}

class _CartScreenState extends State<CartScreen> {
  final CartManager _cart = CartManager();
  String _selectedDelivery = 'standard';
  String _selectedPayment = 'card';
  bool _isPlacingOrder = false;

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

  double get _deliveryFee => _selectedDelivery == 'express' ? 3000.0 : 1500.0;
  double get _finalTotal => _cart.subtotal + _deliveryFee;

  String _formatCurrency(double amount) {
    return '₦${amount.toStringAsFixed(0).replaceAllMapped(
      RegExp(r'(\d{1,3})(?=(\d{3})+(?!\d))'),
      (Match m) => '${m[1]},',
    )}';
  }

  void _placeOrder() {
    if (_cart.items.isEmpty) return;

    setState(() => _isPlacingOrder = true);

    Future.delayed(const Duration(milliseconds: 1200), () {
      if (!mounted) return;
      setState(() => _isPlacingOrder = false);
      _cart.clear();

      showDialog(
        context: context,
        barrierDismissible: false,
        builder: (context) {
          return AlertDialog(
            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(24)),
            content: Padding(
              padding: const EdgeInsets.symmetric(vertical: 12),
              child: Column(
                mainAxisSize: MainAxisSize.min,
                children: [
                  Container(
                    width: 64,
                    height: 64,
                    decoration: const BoxDecoration(
                      color: Color(0xFFDCFCE7),
                      shape: BoxShape.circle,
                    ),
                    child: const Icon(Icons.check_circle_rounded, color: Color(0xFF16A34A), size: 40),
                  ),
                  const SizedBox(height: 16),
                  const Text(
                    'Order Confirmed!',
                    style: TextStyle(fontSize: 20, fontWeight: FontWeight.w800, color: Color(0xFF0F172A)),
                  ),
                  const SizedBox(height: 8),
                  const Text(
                    'Order #OFIA-88291 has been dispatched to the vendor. You can track courier delivery in real-time.',
                    textAlign: TextAlign.center,
                    style: TextStyle(fontSize: 12, color: Color(0xFF64748B), height: 1.4),
                  ),
                  const SizedBox(height: 24),
                  SizedBox(
                    width: double.infinity,
                    height: 46,
                    child: ElevatedButton(
                      style: ElevatedButton.styleFrom(
                        backgroundColor: const Color(0xFF1B62F0),
                        foregroundColor: Colors.white,
                        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
                      ),
                      onPressed: () {
                        Navigator.of(context).pop(); // Close dialog
                        Navigator.of(context).pop(); // Return to previous screen
                      },
                      child: const Text('Back to Home', style: TextStyle(fontWeight: FontWeight.w700)),
                    ),
                  ),
                ],
              ),
            ),
          );
        },
      );
    });
  }

  @override
  Widget build(BuildContext context) {
    final items = _cart.items;

    return Scaffold(
      backgroundColor: const Color(0xFFF8FAFC),
      appBar: AppBar(
        backgroundColor: Colors.white,
        elevation: 0,
        scrolledUnderElevation: 1,
        title: const Text(
          'Shopping Bag & Checkout',
          style: TextStyle(fontSize: 18, fontWeight: FontWeight.w800, color: Color(0xFF0F172A)),
        ),
        actions: [
          if (items.isNotEmpty)
            TextButton(
              onPressed: () {
                _cart.clear();
              },
              child: const Text('Clear', style: TextStyle(color: Color(0xFFDC2626), fontWeight: FontWeight.w700)),
            ),
        ],
      ),
      body: items.isEmpty
          ? Center(
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  Container(
                    padding: const EdgeInsets.all(24),
                    decoration: const BoxDecoration(
                      color: Color(0xFFEFF6FF),
                      shape: BoxShape.circle,
                    ),
                    child: const Icon(Icons.shopping_bag_outlined, size: 54, color: Color(0xFF1B62F0)),
                  ),
                  const SizedBox(height: 18),
                  const Text(
                    'Your Shopping Bag is Empty',
                    style: TextStyle(fontSize: 18, fontWeight: FontWeight.w800, color: Color(0xFF0F172A)),
                  ),
                  const SizedBox(height: 6),
                  const Text(
                    'Browse 10 vertical stores and add items to your cart.',
                    style: TextStyle(fontSize: 13, color: Color(0xFF64748B)),
                  ),
                  const SizedBox(height: 24),
                  ElevatedButton(
                    style: ElevatedButton.styleFrom(
                      backgroundColor: const Color(0xFF1B62F0),
                      foregroundColor: Colors.white,
                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
                      padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 12),
                    ),
                    onPressed: () => Navigator.of(context).pop(),
                    child: const Text('Start Shopping', style: TextStyle(fontWeight: FontWeight.w700)),
                  ),
                ],
              ),
            )
          : Column(
              children: [
                Expanded(
                  child: SingleChildScrollView(
                    physics: const BouncingScrollPhysics(),
                    padding: const EdgeInsets.fromLTRB(20, 16, 20, 20),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        // CART ITEMS LIST
                        const Text(
                          'Items in Bag',
                          style: TextStyle(fontSize: 15, fontWeight: FontWeight.w800, color: Color(0xFF0F172A)),
                        ),
                        const SizedBox(height: 12),
                        ListView.separated(
                          shrinkWrap: true,
                          physics: const NeverScrollableScrollPhysics(),
                          itemCount: items.length,
                          separatorBuilder: (_, __) => const SizedBox(height: 12),
                          itemBuilder: (context, index) {
                            final item = items[index];
                            final store = CommerceData.getStoreBySlug(item.product.storeSlug);
                            return _buildCartItemCard(item, store);
                          },
                        ),

                        const SizedBox(height: 24),

                        // DELIVERY ADDRESS SECTION
                        const Text(
                          'Delivery Address',
                          style: TextStyle(fontSize: 15, fontWeight: FontWeight.w800, color: Color(0xFF0F172A)),
                        ),
                        const SizedBox(height: 10),
                        Container(
                          padding: const EdgeInsets.all(16),
                          decoration: BoxDecoration(
                            color: Colors.white,
                            borderRadius: BorderRadius.circular(18),
                            border: Border.all(color: const Color(0xFFE2E8F0)),
                          ),
                          child: Row(
                            children: [
                              Container(
                                padding: const EdgeInsets.all(10),
                                decoration: const BoxDecoration(
                                  color: Color(0xFFEFF6FF),
                                  shape: BoxShape.circle,
                                ),
                                child: const Icon(Icons.home_outlined, color: Color(0xFF1B62F0), size: 20),
                              ),
                              const SizedBox(width: 12),
                              const Expanded(
                                child: Column(
                                  crossAxisAlignment: CrossAxisAlignment.start,
                                  children: [
                                    Text('Home Address', style: TextStyle(fontSize: 13, fontWeight: FontWeight.w800, color: Color(0xFF0F172A))),
                                    SizedBox(height: 2),
                                    Text('14B Admiralty Way, Lekki Phase 1, Lagos', style: TextStyle(fontSize: 12, color: Color(0xFF64748B))),
                                  ],
                                ),
                              ),
                              const Icon(Icons.edit_outlined, size: 18, color: Color(0xFF64748B)),
                            ],
                          ),
                        ),

                        const SizedBox(height: 24),

                        // DELIVERY METHOD
                        const Text(
                          'Delivery Option',
                          style: TextStyle(fontSize: 15, fontWeight: FontWeight.w800, color: Color(0xFF0F172A)),
                        ),
                        const SizedBox(height: 10),
                        Row(
                          children: [
                            Expanded(
                              child: _buildDeliveryPill(
                                id: 'standard',
                                title: 'Standard Courier',
                                subtitle: '24-48 hours',
                                price: '₦1,500',
                              ),
                            ),
                            const SizedBox(width: 12),
                            Expanded(
                              child: _buildDeliveryPill(
                                id: 'express',
                                title: 'Instant Express',
                                subtitle: 'Within 45 mins',
                                price: '₦3,000',
                              ),
                            ),
                          ],
                        ),

                        const SizedBox(height: 24),

                        // PAYMENT METHOD
                        const Text(
                          'Payment Method',
                          style: TextStyle(fontSize: 15, fontWeight: FontWeight.w800, color: Color(0xFF0F172A)),
                        ),
                        const SizedBox(height: 10),
                        Material(
                          color: Colors.white,
                          clipBehavior: Clip.antiAlias,
                          shape: RoundedRectangleBorder(
                            borderRadius: BorderRadius.circular(18),
                            side: const BorderSide(color: Color(0xFFE2E8F0)),
                          ),
                          child: Column(
                            children: [
                              _buildPaymentRadio('card', 'Debit / Credit Card (Paystack)', Icons.credit_card_outlined),
                              const Divider(height: 1, color: Color(0xFFF1F5F9)),
                              _buildPaymentRadio('wallet', 'Ofia Wallet (₦244,000)', Icons.account_balance_wallet_outlined),
                              const Divider(height: 1, color: Color(0xFFF1F5F9)),
                              _buildPaymentRadio('cod', 'Pay on Delivery', Icons.payments_outlined),
                            ],
                          ),
                        ),

                        const SizedBox(height: 24),

                        // ORDER SUMMARY
                        Container(
                          padding: const EdgeInsets.all(18),
                          decoration: BoxDecoration(
                            color: Colors.white,
                            borderRadius: BorderRadius.circular(20),
                            border: Border.all(color: const Color(0xFFE2E8F0)),
                          ),
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              const Text('Order Summary', style: TextStyle(fontSize: 14, fontWeight: FontWeight.w800, color: Color(0xFF0F172A))),
                              const SizedBox(height: 12),
                              Row(
                                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                                children: [
                                  const Text('Subtotal', style: TextStyle(fontSize: 12, color: Color(0xFF64748B))),
                                  Text(_cart.formattedSubtotal, style: const TextStyle(fontSize: 13, fontWeight: FontWeight.w700, color: Color(0xFF0F172A))),
                                ],
                              ),
                              const SizedBox(height: 8),
                              Row(
                                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                                children: [
                                  const Text('Estimated Delivery', style: TextStyle(fontSize: 12, color: Color(0xFF64748B))),
                                  Text(_formatCurrency(_deliveryFee), style: const TextStyle(fontSize: 13, fontWeight: FontWeight.w700, color: Color(0xFF0F172A))),
                                ],
                              ),
                              const SizedBox(height: 12),
                              const Divider(height: 1, color: Color(0xFFE2E8F0)),
                              const SizedBox(height: 12),
                              Row(
                                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                                children: [
                                  const Text('Total Amount', style: TextStyle(fontSize: 15, fontWeight: FontWeight.w900, color: Color(0xFF0F172A))),
                                  Text(_formatCurrency(_finalTotal), style: const TextStyle(fontSize: 18, fontWeight: FontWeight.w900, color: Color(0xFF1B62F0))),
                                ],
                              ),
                            ],
                          ),
                        ),
                      ],
                    ),
                  ),
                ),

                // CHECKOUT ACTION BAR
                Container(
                  padding: const EdgeInsets.fromLTRB(20, 16, 20, 24),
                  decoration: BoxDecoration(
                    color: Colors.white,
                    border: const Border(top: BorderSide(color: Color(0xFFE2E8F0))),
                    boxShadow: [
                      BoxShadow(color: Colors.black.withOpacity(0.04), blurRadius: 10, offset: const Offset(0, -3)),
                    ],
                  ),
                  child: Row(
                    children: [
                      Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          const Text('Total to pay', style: TextStyle(fontSize: 11, color: Color(0xFF64748B))),
                          Text(_formatCurrency(_finalTotal), style: const TextStyle(fontSize: 18, fontWeight: FontWeight.w900, color: Color(0xFF0F172A))),
                        ],
                      ),
                      const SizedBox(width: 20),
                      Expanded(
                        child: SizedBox(
                          height: 48,
                          child: ElevatedButton(
                            style: ElevatedButton.styleFrom(
                              backgroundColor: const Color(0xFF1B62F0),
                              foregroundColor: Colors.white,
                              elevation: 0,
                              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
                            ),
                            onPressed: _isPlacingOrder ? null : _placeOrder,
                            child: _isPlacingOrder
                                ? const SizedBox(width: 20, height: 20, child: CircularProgressIndicator(color: Colors.white, strokeWidth: 2))
                                : const Text('Confirm & Place Order', style: TextStyle(fontSize: 14, fontWeight: FontWeight.w800)),
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

  Widget _buildCartItemCard(CartItem item, VendorStore store) {
    return Container(
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(18),
        border: Border.all(color: const Color(0xFFE2E8F0)),
      ),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.center,
        children: [
          ClipRRect(
            borderRadius: BorderRadius.circular(12),
            child: Image.network(
              item.product.images[0],
              width: 64,
              height: 64,
              fit: BoxFit.cover,
              errorBuilder: (_, __, ___) => Container(width: 64, height: 64, color: const Color(0xFFF1F5F9)),
            ),
          ),
          const SizedBox(width: 12),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  store.name.toUpperCase(),
                  style: TextStyle(fontSize: 9, fontWeight: FontWeight.w800, color: store.primaryColor),
                ),
                const SizedBox(height: 2),
                Text(
                  item.product.title,
                  maxLines: 1,
                  overflow: TextOverflow.ellipsis,
                  style: const TextStyle(fontSize: 13, fontWeight: FontWeight.w700, color: Color(0xFF0F172A)),
                ),
                const SizedBox(height: 4),
                Text(
                  item.product.formattedPrice,
                  style: const TextStyle(fontSize: 13, fontWeight: FontWeight.w900, color: Color(0xFF0F172A)),
                ),
              ],
            ),
          ),
          // Quantity Controls
          Row(
            children: [
              IconButton(
                visualDensity: VisualDensity.compact,
                icon: const Icon(Icons.remove_circle_outline, size: 20, color: Color(0xFF64748B)),
                onPressed: () {
                  _cart.updateQuantity(item.product.id, item.quantity - 1);
                },
              ),
              Text('${item.quantity}', style: const TextStyle(fontSize: 13, fontWeight: FontWeight.w800)),
              IconButton(
                visualDensity: VisualDensity.compact,
                icon: const Icon(Icons.add_circle_outline, size: 20, color: Color(0xFF1B62F0)),
                onPressed: () {
                  _cart.updateQuantity(item.product.id, item.quantity + 1);
                },
              ),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildDeliveryPill({
    required String id,
    required String title,
    required String subtitle,
    required String price,
  }) {
    final isSelected = _selectedDelivery == id;
    return GestureDetector(
      onTap: () => setState(() => _selectedDelivery = id),
      child: Container(
        padding: const EdgeInsets.all(14),
        decoration: BoxDecoration(
          color: isSelected ? const Color(0xFFEFF6FF) : Colors.white,
          borderRadius: BorderRadius.circular(16),
          border: Border.all(
            color: isSelected ? const Color(0xFF1B62F0) : const Color(0xFFE2E8F0),
            width: isSelected ? 1.5 : 1,
          ),
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(title, style: TextStyle(fontSize: 12, fontWeight: FontWeight.w800, color: isSelected ? const Color(0xFF1B62F0) : const Color(0xFF0F172A))),
            const SizedBox(height: 2),
            Text(subtitle, style: const TextStyle(fontSize: 11, color: Color(0xFF64748B))),
            const SizedBox(height: 8),
            Text(price, style: TextStyle(fontSize: 13, fontWeight: FontWeight.w900, color: isSelected ? const Color(0xFF1B62F0) : const Color(0xFF0F172A))),
          ],
        ),
      ),
    );
  }

  Widget _buildPaymentRadio(String id, String label, IconData icon) {
    final isSelected = _selectedPayment == id;
    return ListTile(
      leading: Icon(icon, color: isSelected ? const Color(0xFF1B62F0) : const Color(0xFF64748B), size: 20),
      title: Text(label, style: TextStyle(fontSize: 12, fontWeight: isSelected ? FontWeight.w800 : FontWeight.w600, color: const Color(0xFF0F172A))),
      trailing: isSelected
          ? const Icon(Icons.check_circle_rounded, color: Color(0xFF1B62F0), size: 18)
          : const Icon(Icons.radio_button_unchecked_rounded, color: Color(0xFFCBD5E1), size: 18),
      onTap: () => setState(() => _selectedPayment = id),
    );
  }
}
