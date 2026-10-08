import 'package:flutter/material.dart';

class IsometricPackageBox extends StatelessWidget {
  final double width;
  final double height;

  const IsometricPackageBox({
    super.key,
    this.width = 72,
    this.height = 72,
  });

  @override
  Widget build(BuildContext context) {
    return SizedBox(
      width: width,
      height: height,
      child: CustomPaint(
        painter: _IsometricBoxPainter(),
      ),
    );
  }
}

class _IsometricBoxPainter extends CustomPainter {
  @override
  void paint(Canvas canvas, Size size) {
    final w = size.width;
    final h = size.height;

    // Ambient drop shadow beneath the box
    final shadowPaint = Paint()
      ..color = const Color(0x331046A0)
      ..maskFilter = const MaskFilter.blur(BlurStyle.normal, 6);

    final shadowPath = Path()
      ..addOval(Rect.fromCenter(
        center: Offset(w * 0.5, h * 0.88),
        width: w * 0.82,
        height: h * 0.22,
      ));
    canvas.drawPath(shadowPath, shadowPaint);

    // Box geometry points
    final center = Offset(w * 0.48, h * 0.44);

    // Top face vertices:
    final topTop = Offset(w * 0.48, h * 0.12);
    final topLeft = Offset(w * 0.08, h * 0.28);
    final topRight = Offset(w * 0.88, h * 0.28);

    // Bottom vertices:
    final bottomLeft = Offset(w * 0.08, h * 0.74);
    final bottomCenter = Offset(w * 0.48, h * 0.90);
    final bottomRight = Offset(w * 0.88, h * 0.74);

    // 1. TOP FACE
    final topPath = Path()
      ..moveTo(center.dx, center.dy)
      ..lineTo(topLeft.dx, topLeft.dy)
      ..lineTo(topTop.dx, topTop.dy)
      ..lineTo(topRight.dx, topRight.dy)
      ..close();

    final topPaint = Paint()
      ..shader = const LinearGradient(
        begin: Alignment.topLeft,
        end: Alignment.bottomRight,
        colors: [
          Color(0xFF3B82F6),
          Color(0xFF2563EB),
        ],
      ).createShader(Rect.fromLTRB(topLeft.dx, topTop.dy, topRight.dx, center.dy));

    canvas.drawPath(topPath, topPaint);

    // 2. LEFT FACE (Front-Left)
    final leftPath = Path()
      ..moveTo(center.dx, center.dy)
      ..lineTo(topLeft.dx, topLeft.dy)
      ..lineTo(bottomLeft.dx, bottomLeft.dy)
      ..lineTo(bottomCenter.dx, bottomCenter.dy)
      ..close();

    final leftPaint = Paint()
      ..shader = const LinearGradient(
        begin: Alignment.topCenter,
        end: Alignment.bottomCenter,
        colors: [
          Color(0xFF1D64F2),
          Color(0xFF1452D8),
        ],
      ).createShader(Rect.fromLTRB(bottomLeft.dx, topLeft.dy, center.dx, bottomCenter.dy));

    canvas.drawPath(leftPath, leftPaint);

    // 3. RIGHT FACE (Front-Right)
    final rightPath = Path()
      ..moveTo(center.dx, center.dy)
      ..lineTo(topRight.dx, topRight.dy)
      ..lineTo(bottomRight.dx, bottomRight.dy)
      ..lineTo(bottomCenter.dx, bottomCenter.dy)
      ..close();

    final rightPaint = Paint()
      ..shader = const LinearGradient(
        begin: Alignment.topCenter,
        end: Alignment.bottomCenter,
        colors: [
          Color(0xFF1142BC),
          Color(0xFF0B2E8C),
        ],
      ).createShader(Rect.fromLTRB(center.dx, topRight.dy, bottomRight.dx, bottomCenter.dy));

    canvas.drawPath(rightPath, rightPaint);

    // 4. PACKAGING TAPE
    final tapePaint = Paint()
      ..color = const Color(0xFF0F172A)
      ..style = PaintingStyle.fill;

    // A subtle dark navy tape band down the center of top face
    final topTape = Path()
      ..moveTo(w * 0.43, h * 0.14)
      ..lineTo(w * 0.53, h * 0.14)
      ..lineTo(w * 0.53, center.dy)
      ..lineTo(w * 0.43, center.dy)
      ..close();
    canvas.drawPath(topTape, tapePaint);

    // Tape down the front-left face
    final leftTape = Path()
      ..moveTo(w * 0.43, center.dy)
      ..lineTo(w * 0.53, center.dy)
      ..lineTo(w * 0.53, bottomCenter.dy)
      ..lineTo(w * 0.43, bottomCenter.dy)
      ..close();
    canvas.drawPath(leftTape, Paint()..color = const Color(0xFF0A0F1D));

    // Subtle edge highlight
    final edgePaint = Paint()
      ..color = Colors.white.withOpacity(0.18)
      ..strokeWidth = 1.0
      ..style = PaintingStyle.stroke;

    canvas.drawLine(center, topTop, edgePaint);
    canvas.drawLine(center, topLeft, edgePaint);
    canvas.drawLine(center, topRight, edgePaint);
    canvas.drawLine(center, bottomCenter, edgePaint);
  }

  @override
  bool shouldRepaint(covariant CustomPainter oldDelegate) => false;
}
