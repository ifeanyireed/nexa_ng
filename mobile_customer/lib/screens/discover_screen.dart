import 'package:flutter/material.dart';
import 'package:flutter_animate/flutter_animate.dart';
import '../data/commerce_data.dart';
import '../models/store.dart';
import 'storefront_screen.dart';
import 'package:flexicon/flexicon.dart';
import 'package:mobile_customer/utils/icon_util.dart';

class DiscoverScreen extends StatefulWidget {
  final String? initialQuery;
  final StoreVertical? initialVertical;

  const DiscoverScreen({
    super.key,
    this.initialQuery,
    this.initialVertical,
  });

  @override
  State<DiscoverScreen> createState() => _DiscoverScreenState();
}

class _DiscoverScreenState extends State<DiscoverScreen> {
  late TextEditingController _searchController;
  StoreVertical? _selectedVertical;
  String _selectedSort = 'Recommended';

  @override
  void initState() {
    super.initState();
    _searchController = TextEditingController(text: widget.initialQuery ?? '');
    _selectedVertical = widget.initialVertical;
  }

  @override
  void dispose() {
    _searchController.dispose();
    super.dispose();
  }

  void _openStore(VendorStore store) {
    Navigator.of(context).push(
      MaterialPageRoute(
        builder: (context) => StorefrontScreen(store: store),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final query = _searchController.text.trim().toLowerCase();

    var filtered = CommerceData.stores.where((store) {
      final matchesVertical = _selectedVertical == null || store.vertical == _selectedVertical;
      final matchesQuery = query.isEmpty ||
          store.name.toLowerCase().contains(query) ||
          store.tagline.toLowerCase().contains(query) ||
          store.description.toLowerCase().contains(query) ||
          store.vertical.displayName.toLowerCase().contains(query);
      return matchesVertical && matchesQuery;
    }).toList();

    if (_selectedSort == 'Rating') {
      filtered.sort((a, b) => b.rating.compareTo(a.rating));
    } else if (_selectedSort == 'Reviews') {
      filtered.sort((a, b) => b.reviewsCount.compareTo(a.reviewsCount));
    }

    return Scaffold(
      backgroundColor: const Color(0xFFF8FAFC),
      appBar: AppBar(
        backgroundColor: Colors.white,
        elevation: 0,
        scrolledUnderElevation: 1,
        title: const Text(
          'Discover Stores',
          style: TextStyle(
            fontSize: 18,
            fontWeight: FontWeight.w800,
            color: Color(0xFF0F172A),
          ),
        ),
        actions: [
          PopupMenuButton<String>(
            icon: Icon(fixIcon(FlexIcon.remix.alignTop1), color: Color(0xFF0F172A)),
            onSelected: (val) {
              setState(() => _selectedSort = val);
            },
            itemBuilder: (context) => [
              const PopupMenuItem(value: 'Recommended', child: Text('Recommended')),
              const PopupMenuItem(value: 'Rating', child: Text('Highest Rated')),
              const PopupMenuItem(value: 'Reviews', child: Text('Most Popular')),
            ],
          ),
        ],
      ),
      body: Column(
        children: [
          // SEARCH INPUT
          Container(
            color: Colors.white,
            padding: const EdgeInsets.fromLTRB(20, 4, 20, 12),
            child: Container(
              height: 46,
              decoration: BoxDecoration(
                color: const Color(0xFFF1F5F9),
                borderRadius: BorderRadius.circular(14),
                border: Border.all(color: const Color(0xFFE2E8F0)),
              ),
              child: Row(
                children: [
                  const SizedBox(width: 12),
                  Icon(fixIcon(FlexIcon.remix.magnifyingGlass), color: Color(0xFF64748B), size: 20),
                  const SizedBox(width: 8),
                  Expanded(
                    child: TextField(
                      controller: _searchController,
                      decoration: const InputDecoration(
                        hintText: 'Search vendors by name, service or vertical...',
                        hintStyle: TextStyle(fontSize: 13, color: Color(0xFF94A3B8)),
                        border: InputBorder.none,
                        isDense: true,
                      ),
                      onChanged: (_) => setState(() {}),
                    ),
                  ),
                  if (_searchController.text.isNotEmpty)
                    IconButton(
                      icon: Icon(fixIcon(FlexIcon.remix.deleteTag), size: 18, color: Color(0xFF94A3B8)),
                      onPressed: () {
                        _searchController.clear();
                        setState(() {});
                      },
                    ),
                ],
              ),
            ),
          ),

          // 10 VERTICAL FILTER TABS
          Container(
            color: Colors.white,
            padding: const EdgeInsets.only(bottom: 12),
            child: SizedBox(
              height: 38,
              child: ListView.separated(
                scrollDirection: Axis.horizontal,
                physics: const BouncingScrollPhysics(),
                padding: const EdgeInsets.symmetric(horizontal: 20),
                itemCount: StoreVertical.values.length + 1,
                separatorBuilder: (_, __) => const SizedBox(width: 8),
                itemBuilder: (context, index) {
                  if (index == 0) {
                    final isSel = _selectedVertical == null;
                    return _buildFilterPill('All (${CommerceData.stores.length})', isSel, () {
                      setState(() => _selectedVertical = null);
                    });
                  }
                  final vert = StoreVertical.values[index - 1];
                  final isSel = _selectedVertical == vert;
                  final count = CommerceData.stores.where((s) => s.vertical == vert).length;
                  return _buildFilterPill('${vert.shortName} ($count)', isSel, () {
                    setState(() => _selectedVertical = isSel ? null : vert);
                  });
                },
              ),
            ),
          ),

          const Divider(height: 1, color: Color(0xFFE2E8F0)),

          // STORES LIST
          Expanded(
            child: filtered.isEmpty
                ? Center(
                    child: Column(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        Icon(fixIcon(FlexIcon.remix.store2), size: 54, color: Color(0xFFCBD5E1)),
                        const SizedBox(height: 12),
                        const Text(
                          'No stores match your search',
                          style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold, color: Color(0xFF475569)),
                        ),
                        const SizedBox(height: 6),
                        Text(
                          'Try clearing your search query or selecting another category.',
                          style: TextStyle(fontSize: 12, color: Colors.grey.shade500),
                        ),
                      ],
                    ),
                  )
                : ListView.separated(
                    physics: const BouncingScrollPhysics(),
                    padding: const EdgeInsets.fromLTRB(20, 16, 20, 100),
                    itemCount: filtered.length,
                    separatorBuilder: (_, __) => const SizedBox(height: 16),
                    itemBuilder: (context, index) {
                      final store = filtered[index];
                      return _buildStoreDirectoryCard(store);
                    },
                  ),
          ),
        ],
      ),
    ).animate().fadeIn(duration: const Duration(milliseconds: 400)).slideY(begin: 0.05, end: 0);
  }

  Widget _buildFilterPill(String label, bool isSelected, VoidCallback onTap) {
    return GestureDetector(
      onTap: onTap,
      child: AnimatedContainer(
        duration: const Duration(milliseconds: 180),
        padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 8),
        decoration: BoxDecoration(
          color: isSelected ? const Color(0xFF1B62F0) : const Color(0xFFF1F5F9),
          borderRadius: BorderRadius.circular(100),
          border: Border.all(
            color: isSelected ? const Color(0xFF1B62F0) : const Color(0xFFE2E8F0),
          ),
        ),
        child: Text(
          label,
          style: TextStyle(
            fontSize: 11,
            fontWeight: isSelected ? FontWeight.w700 : FontWeight.w600,
            color: isSelected ? Colors.white : const Color(0xFF475569),
          ),
        ),
      ),
    );
  }

  Widget _buildStoreDirectoryCard(VendorStore store) {
    return GestureDetector(
      onTap: () => _openStore(store),
      child: Container(
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(22),
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
            // Cover Image + Floating Logo + Rating
            ClipRRect(
              borderRadius: const BorderRadius.vertical(top: Radius.circular(22)),
              child: Stack(
                children: [
                  Image.network(
                    store.coverImage,
                    height: 135,
                    width: double.infinity,
                    fit: BoxFit.cover,
                    errorBuilder: (_, __, ___) => Container(
                      height: 135,
                      color: store.primaryColor.withOpacity(0.2),
                      child: Icon(store.vertical.icon, size: 40, color: store.primaryColor),
                    ),
                  ),
                  Positioned(
                    top: 12,
                    left: 12,
                    child: Container(
                      padding: const EdgeInsets.symmetric(horizontal: 9, vertical: 4),
                      decoration: BoxDecoration(
                        color: Colors.black.withOpacity(0.7),
                        borderRadius: BorderRadius.circular(8),
                      ),
                      child: Row(
                        children: [
                          Icon(store.vertical.icon, size: 12, color: Colors.white),
                          const SizedBox(width: 5),
                          Text(
                            store.vertical.displayName,
                            style: const TextStyle(
                              color: Colors.white,
                              fontSize: 10,
                              fontWeight: FontWeight.w700,
                            ),
                          ),
                        ],
                      ),
                    ),
                  ),
                  Positioned(
                    top: 12,
                    right: 12,
                    child: Container(
                      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                      decoration: BoxDecoration(
                        color: Colors.white,
                        borderRadius: BorderRadius.circular(8),
                        boxShadow: [
                          BoxShadow(color: Colors.black.withOpacity(0.1), blurRadius: 4),
                        ],
                      ),
                      child: Row(
                        children: [
                          Icon(fixIcon(FlexIcon.remix.starCircle), size: 14, color: Color(0xFFF59E0B)),
                          const SizedBox(width: 3),
                          Text(
                            '${store.rating}',
                            style: const TextStyle(
                              fontSize: 11,
                              fontWeight: FontWeight.w900,
                              color: Color(0xFF0F172A),
                            ),
                          ),
                          Text(
                            ' (${store.reviewsCount})',
                            style: const TextStyle(
                              fontSize: 10,
                              fontWeight: FontWeight.w500,
                              color: Color(0xFF64748B),
                            ),
                          ),
                        ],
                      ),
                    ),
                  ),
                ],
              ),
            ),

            // Store Info & Entry Button
            Padding(
              padding: const EdgeInsets.all(16),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Expanded(
                        child: Text(
                          store.name,
                          style: const TextStyle(
                            fontSize: 16,
                            fontWeight: FontWeight.w800,
                            color: Color(0xFF0F172A),
                          ),
                        ),
                      ),
                      Container(
                        padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 5),
                        decoration: BoxDecoration(
                          color: const Color(0xFF1B62F0).withOpacity(0.08),
                          borderRadius: BorderRadius.circular(8),
                        ),
                        child: Row(
                          children: [
                            Text(
                              'Visit Store',
                              style: TextStyle(
                                fontSize: 11,
                                fontWeight: FontWeight.w800,
                                color: Theme.of(context).colorScheme.primary,
                              ),
                            ),
                            const SizedBox(width: 4),
                            Icon(
                              Icons.chevron_right,
                              size: 13,
                              color: Theme.of(context).colorScheme.primary,
                            ),
                          ],
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 4),
                  Text(
                    store.tagline,
                    maxLines: 2,
                    overflow: TextOverflow.ellipsis,
                    style: const TextStyle(
                      fontSize: 12,
                      color: Color(0xFF475569),
                      height: 1.3,
                    ),
                  ),
                  const SizedBox(height: 12),

                  // Feature Badges Chips
                  Wrap(
                    spacing: 6,
                    runSpacing: 6,
                    children: store.badges.take(2).map((badge) {
                      return Container(
                        padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                        decoration: BoxDecoration(
                          color: const Color(0xFFF1F5F9),
                          borderRadius: BorderRadius.circular(6),
                          border: Border.all(color: const Color(0xFFE2E8F0)),
                        ),
                        child: Text(
                          badge,
                          style: const TextStyle(
                            fontSize: 10,
                            fontWeight: FontWeight.w600,
                            color: Color(0xFF475569),
                          ),
                        ),
                      );
                    }).toList(),
                  ),
                  const SizedBox(height: 12),

                  // Address & Hours Footer
                  Row(
                    children: [
                      Icon(fixIcon(FlexIcon.remix.locationPin3), size: 13, color: Color(0xFF94A3B8)),
                      const SizedBox(width: 3),
                      Expanded(
                        child: Text(
                          store.contact.address,
                          maxLines: 1,
                          overflow: TextOverflow.ellipsis,
                          style: const TextStyle(fontSize: 11, color: Color(0xFF64748B)),
                        ),
                      ),
                      const SizedBox(width: 8),
                      Text(
                        store.distance,
                        style: const TextStyle(
                          fontSize: 11,
                          fontWeight: FontWeight.w700,
                          color: Color(0xFF0F172A),
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
