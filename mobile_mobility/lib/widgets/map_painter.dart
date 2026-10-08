import 'package:flutter/material.dart';
import 'package:flexicon/flexicon.dart';
import 'package:mobile_mobility/utils/icon_util.dart';

class VectorMapPainter extends CustomPainter {
  @override
  void paint(Canvas canvas, Size size) {
    final w = size.width;
    final h = size.height;

    // 1. Land / Base background
    final bgPaint = Paint()..color = const Color(0xFFE8EDF2);
    canvas.drawRect(Rect.fromLTWH(0, 0, w, h), bgPaint);

    // 2. City Blocks / Neighborhood Polygons (soft off-white/light grey blocks)
    final blockPaint = Paint()
      ..color = const Color(0xFFDDE3EB)
      ..style = PaintingStyle.fill;

    // A collection of stylized urban blocks
    final blocks = [
      // Top Left block
      Path()
        ..moveTo(0, 0)
        ..lineTo(w * 0.32, 0)
        ..lineTo(w * 0.28, h * 0.16)
        ..lineTo(0, h * 0.12)
        ..close(),

      // Top Center block
      Path()
        ..moveTo(w * 0.38, 0)
        ..lineTo(w * 0.72, 0)
        ..lineTo(w * 0.65, h * 0.18)
        ..lineTo(w * 0.34, h * 0.14)
        ..close(),

      // Top Right block
      Path()
        ..moveTo(w * 0.78, 0)
        ..lineTo(w, 0)
        ..lineTo(w, h * 0.20)
        ..lineTo(w * 0.72, h * 0.15)
        ..close(),

      // Middle Left block 1
      Path()
        ..moveTo(0, h * 0.16)
        ..lineTo(w * 0.25, h * 0.18)
        ..lineTo(w * 0.22, h * 0.38)
        ..lineTo(0, h * 0.40)
        ..close(),

      // Center block 1
      Path()
        ..moveTo(w * 0.32, h * 0.18)
        ..lineTo(w * 0.64, h * 0.22)
        ..lineTo(w * 0.58, h * 0.42)
        ..lineTo(w * 0.28, h * 0.36)
        ..close(),

      // Right block 1
      Path()
        ..moveTo(w * 0.70, h * 0.19)
        ..lineTo(w, h * 0.24)
        ..lineTo(w, h * 0.44)
        ..lineTo(w * 0.66, h * 0.40)
        ..close(),

      // Center-Left block 2
      Path()
        ..moveTo(0, h * 0.44)
        ..lineTo(w * 0.24, h * 0.42)
        ..lineTo(w * 0.30, h * 0.62)
        ..lineTo(0, h * 0.68)
        ..close(),

      // Center block 2
      Path()
        ..moveTo(w * 0.32, h * 0.46)
        ..lineTo(w * 0.62, h * 0.45)
        ..lineTo(w * 0.68, h * 0.66)
        ..lineTo(w * 0.36, h * 0.68)
        ..close(),

      // Right block 2
      Path()
        ..moveTo(w * 0.72, h * 0.44)
        ..lineTo(w, h * 0.48)
        ..lineTo(w, h * 0.72)
        ..lineTo(w * 0.74, h * 0.70)
        ..close(),

      // Bottom Left
      Path()
        ..moveTo(0, h * 0.72)
        ..lineTo(w * 0.32, h * 0.74)
        ..lineTo(w * 0.28, h)
        ..lineTo(0, h)
        ..close(),

      // Bottom Center
      Path()
        ..moveTo(w * 0.38, h * 0.74)
        ..lineTo(w * 0.72, h * 0.73)
        ..lineTo(w * 0.68, h)
        ..lineTo(w * 0.34, h)
        ..close(),

      // Bottom Right
      Path()
        ..moveTo(w * 0.78, h * 0.74)
        ..lineTo(w, h * 0.75)
        ..lineTo(w, h)
        ..lineTo(w * 0.74, h)
        ..close(),
    ];

    for (final b in blocks) {
      canvas.drawPath(b, blockPaint);
    }

    // 3. Roads (Crisp White Paths)
    final mainRoadPaint = Paint()
      ..color = Colors.white
      ..strokeWidth = 14
      ..strokeCap = StrokeCap.round
      ..strokeJoin = StrokeJoin.round
      ..style = PaintingStyle.stroke;

    final secondaryRoadPaint = Paint()
      ..color = Colors.white.withOpacity(0.92)
      ..strokeWidth = 8
      ..strokeCap = StrokeCap.round
      ..strokeJoin = StrokeJoin.round
      ..style = PaintingStyle.stroke;

    final roadPaths = [
      // Diagonal main arterial from top left to bottom right
      Path()
        ..moveTo(-20, h * 0.14)
        ..cubicTo(w * 0.35, h * 0.17, w * 0.25, h * 0.42, w * 0.70, h * 0.44)
        ..cubicTo(w * 0.85, h * 0.45, w * 0.75, h * 0.72, w + 20, h * 0.74),

      // Diagonal main arterial from bottom left to top right
      Path()
        ..moveTo(-20, h * 0.69)
        ..cubicTo(w * 0.30, h * 0.65, w * 0.40, h * 0.38, w * 0.68, h * 0.20)
        ..cubicTo(w * 0.80, h * 0.10, w * 0.90, h * 0.05, w + 20, h * 0.04),

      // Vertical connector 1
      Path()
        ..moveTo(w * 0.34, -10)
        ..cubicTo(w * 0.27, h * 0.35, w * 0.33, h * 0.65, w * 0.34, h + 10),

      // Vertical connector 2
      Path()
        ..moveTo(w * 0.73, -10)
        ..cubicTo(w * 0.67, h * 0.35, w * 0.71, h * 0.65, w * 0.74, h + 10),

      // Horizontal connector middle
      Path()
        ..moveTo(-20, h * 0.42)
        ..lineTo(w + 20, h * 0.45),
    ];

    for (final r in roadPaths) {
      canvas.drawPath(r, mainRoadPaint);
    }

    // Secondary smaller roads
    final subRoads = [
      Path()
        ..moveTo(w * 0.12, h * 0.16)
        ..lineTo(w * 0.30, h * 0.36),
      Path()
        ..moveTo(w * 0.55, h * 0.20)
        ..lineTo(w * 0.60, h * 0.44),
      Path()
        ..moveTo(w * 0.45, h * 0.45)
        ..lineTo(w * 0.50, h * 0.68),
      Path()
        ..moveTo(w * 0.80, h * 0.46)
        ..lineTo(w * 0.92, h * 0.65),
    ];

    for (final sr in subRoads) {
      canvas.drawPath(sr, secondaryRoadPaint);
    }

    // 4. Subtle building footprint stamps (little rounded rects inside blocks)
    final buildingPaint = Paint()
      ..color = const Color(0xFFD2D9E2)
      ..style = PaintingStyle.fill;

    final buildings = [
      RRect.fromRectAndRadius(
          Rect.fromLTWH(w * 0.06, h * 0.04, 28, 22), const Radius.circular(3)),
      RRect.fromRectAndRadius(
          Rect.fromLTWH(w * 0.15, h * 0.05, 34, 18), const Radius.circular(3)),
      RRect.fromRectAndRadius(
          Rect.fromLTWH(w * 0.44, h * 0.04, 38, 26), const Radius.circular(3)),
      RRect.fromRectAndRadius(
          Rect.fromLTWH(w * 0.56, h * 0.06, 24, 20), const Radius.circular(3)),
      RRect.fromRectAndRadius(
          Rect.fromLTWH(w * 0.84, h * 0.06, 32, 28), const Radius.circular(3)),
      RRect.fromRectAndRadius(
          Rect.fromLTWH(w * 0.05, h * 0.24, 26, 30), const Radius.circular(3)),
      RRect.fromRectAndRadius(
          Rect.fromLTWH(w * 0.14, h * 0.28, 30, 22), const Radius.circular(3)),
      RRect.fromRectAndRadius(
          Rect.fromLTWH(w * 0.38, h * 0.26, 36, 28), const Radius.circular(3)),
      RRect.fromRectAndRadius(
          Rect.fromLTWH(w * 0.50, h * 0.30, 28, 24), const Radius.circular(3)),
      RRect.fromRectAndRadius(
          Rect.fromLTWH(w * 0.82, h * 0.28, 32, 34), const Radius.circular(3)),
      RRect.fromRectAndRadius(
          Rect.fromLTWH(w * 0.08, h * 0.50, 36, 24), const Radius.circular(3)),
      RRect.fromRectAndRadius(
          Rect.fromLTWH(w * 0.44, h * 0.52, 40, 30), const Radius.circular(3)),
      RRect.fromRectAndRadius(
          Rect.fromLTWH(w * 0.56, h * 0.56, 32, 22), const Radius.circular(3)),
      RRect.fromRectAndRadius(
          Rect.fromLTWH(w * 0.82, h * 0.56, 38, 28), const Radius.circular(3)),
    ];

    for (final b in buildings) {
      canvas.drawRRect(b, buildingPaint);
    }
  }

  @override
  bool shouldRepaint(covariant CustomPainter oldDelegate) => false;
}

class CourierPinWidget extends StatelessWidget {
  final String imageAsset;
  final bool isSelected;
  final VoidCallback? onTap;

  const CourierPinWidget({
    super.key,
    required this.imageAsset,
    this.isSelected = false,
    this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      child: SizedBox(
        width: 46,
        height: 58,
        child: Stack(
          alignment: Alignment.topCenter,
          children: [
            // Teardrop pin shadow & shape
            CustomPaint(
              size: const Size(44, 56),
              painter: _TeardropPinPainter(
                pinColor: const Color(0xFF102A72),
                shadowColor: Colors.black.withOpacity(0.22),
              ),
            ),
            // Avatar inside circular portion
            Positioned(
              top: 4.5,
              child: Container(
                width: 32,
                height: 32,
                decoration: BoxDecoration(
                  shape: BoxShape.circle,
                  border: Border.all(color: Colors.white, width: 2),
                  color: Colors.amber.shade200,
                ),
                child: ClipOval(
                  child: Image.asset(
                    imageAsset,
                    fit: BoxFit.cover,
                    errorBuilder: (ctx, err, stack) => Icon(
                      fixIcon(FlexIcon.remix.userFullBody),
                      size: 20,
                      color: Color(0xFF1E293B),
                    ),
                  ),
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class _TeardropPinPainter extends CustomPainter {
  final Color pinColor;
  final Color shadowColor;

  _TeardropPinPainter({
    required this.pinColor,
    required this.shadowColor,
  });

  @override
  void paint(Canvas canvas, Size size) {
    final w = size.width;
    final h = size.height;
    final r = w / 2;

    // Drop shadow
    final shadowPaint = Paint()
      ..color = shadowColor
      ..maskFilter = const MaskFilter.blur(BlurStyle.normal, 5);

    final pinPath = Path()
      ..moveTo(r, h) // bottom point
      ..cubicTo(r - 1.5, h - 10, 0, r + 8, 0, r)
      ..arcToPoint(
        Offset(w, r),
        radius: Radius.circular(r),
        clockwise: true,
      )
      ..cubicTo(w, r + 8, r + 1.5, h - 10, r, h)
      ..close();

    canvas.drawPath(pinPath.shift(const Offset(0, 3)), shadowPaint);

    final fillPaint = Paint()
      ..shader = const LinearGradient(
        begin: Alignment.topCenter,
        end: Alignment.bottomCenter,
        colors: [
          Color(0xFF1D4ED8),
          Color(0xFF0F1E4A),
        ],
      ).createShader(Rect.fromLTWH(0, 0, w, h))
      ..style = PaintingStyle.fill;

    canvas.drawPath(pinPath, fillPaint);

    // Subtle white border highlight
    final borderPaint = Paint()
      ..color = Colors.white.withOpacity(0.35)
      ..strokeWidth = 1.0
      ..style = PaintingStyle.stroke;

    canvas.drawPath(pinPath, borderPaint);
  }

  @override
  bool shouldRepaint(covariant CustomPainter oldDelegate) => false;
}
