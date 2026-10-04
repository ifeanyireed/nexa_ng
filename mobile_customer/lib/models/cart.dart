import 'package:flutter/foundation.dart';
import 'product.dart';

class CartItem {
  final Product product;
  int quantity;
  final String? selectedVariant;

  CartItem({
    required this.product,
    this.quantity = 1,
    this.selectedVariant,
  });

  double get totalPrice => product.price * quantity;
}

class CartManager extends ChangeNotifier {
  static final CartManager _instance = CartManager._internal();
  factory CartManager() => _instance;
  CartManager._internal();

  final List<CartItem> _items = [];

  List<CartItem> get items => List.unmodifiable(_items);

  int get totalCount => _items.fold(0, (sum, item) => sum + item.quantity);

  double get subtotal => _items.fold(0.0, (sum, item) => sum + item.totalPrice);

  String get formattedSubtotal {
    return '₦${subtotal.toStringAsFixed(0).replaceAllMapped(
      RegExp(r'(\d{1,3})(?=(\d{3})+(?!\d))'),
      (Match m) => '${m[1]},',
    )}';
  }

  void addItem(Product product, {int quantity = 1, String? variant}) {
    final existingIndex = _items.indexWhere(
      (item) => item.product.id == product.id && item.selectedVariant == variant,
    );

    if (existingIndex >= 0) {
      _items[existingIndex].quantity += quantity;
    } else {
      _items.add(CartItem(
        product: product,
        quantity: quantity,
        selectedVariant: variant,
      ));
    }
    notifyListeners();
  }

  void removeItem(String productId, {String? variant}) {
    _items.removeWhere(
      (item) => item.product.id == productId && item.selectedVariant == variant,
    );
    notifyListeners();
  }

  void updateQuantity(String productId, int newQuantity, {String? variant}) {
    if (newQuantity <= 0) {
      removeItem(productId, variant: variant);
      return;
    }
    final existing = _items.firstWhere(
      (item) => item.product.id == productId && item.selectedVariant == variant,
    );
    existing.quantity = newQuantity;
    notifyListeners();
  }

  void clear() {
    _items.clear();
    notifyListeners();
  }
}
