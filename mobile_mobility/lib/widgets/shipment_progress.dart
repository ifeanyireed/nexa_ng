import 'package:flutter/material.dart';

class ShipmentProgressTracker extends StatelessWidget {
  final int currentStep; // 1 to 4
  final int totalSteps;

  const ShipmentProgressTracker({
    super.key,
    required this.currentStep,
    this.totalSteps = 4,
  });

  @override
  Widget build(BuildContext context) {
    return LayoutBuilder(
      builder: (context, constraints) {
        final totalWidth = constraints.maxWidth;
        return SizedBox(
          width: totalWidth,
          height: 24,
          child: CustomPaint(
            painter: _ProgressPainter(
              currentStep: currentStep,
              totalSteps: totalSteps,
            ),
          ),
        );
      },
    );
  }
}

class _ProgressPainter extends CustomPainter {
  final int currentStep;
  final int totalSteps;

  _ProgressPainter({
    required this.currentStep,
    required this.totalSteps,
  });

  @override
  void paint(Canvas canvas, Size size) {
    const nodeRadius = 5.5;
    final y = size.height / 2;
    final stepDistance = (size.width - 2 * nodeRadius) / (totalSteps - 1);
    const activeBlue = Color(0xFF1B62F0);
    const inactiveGrey = Color(0xFFCBD5E1);

    // Draw dashed lines between nodes
    for (int i = 0; i < totalSteps - 1; i++) {
      final startX = nodeRadius + (i * stepDistance) + nodeRadius + 3;
      final endX = nodeRadius + ((i + 1) * stepDistance) - nodeRadius - 3;
      final isCompletedLine = i < currentStep - 1;

      final linePaint = Paint()
        ..color = isCompletedLine ? activeBlue : inactiveGrey
        ..strokeWidth = 1.8
        ..style = PaintingStyle.stroke;

      _drawDashedLine(canvas, Offset(startX, y), Offset(endX, y), linePaint);
    }

    // Draw nodes
    for (int i = 0; i < totalSteps; i++) {
      final x = nodeRadius + (i * stepDistance);
      final isCompleted = i < currentStep;
      final isCurrent = i == currentStep - 1;
      final isFinalNode = i == totalSteps - 1;

      if (isFinalNode) {
        // Final node checkmark circle
        final bgPaint = Paint()
          ..color = isCompleted ? activeBlue : const Color(0xFFF1F5F9)
          ..style = PaintingStyle.fill;
        canvas.drawCircle(Offset(x, y), nodeRadius + 2.5, bgPaint);

        final borderPaint = Paint()
          ..color = isCompleted ? activeBlue : const Color(0xFFCBD5E1)
          ..strokeWidth = 1.2
          ..style = PaintingStyle.stroke;
        canvas.drawCircle(Offset(x, y), nodeRadius + 2.5, borderPaint);

        // Checkmark
        final checkPaint = Paint()
          ..color = isCompleted ? Colors.white : const Color(0xFF94A3B8)
          ..strokeWidth = 1.4
          ..strokeCap = StrokeCap.round
          ..style = PaintingStyle.stroke;

        final checkPath = Path()
          ..moveTo(x - 2.5, y)
          ..lineTo(x - 0.5, y + 2.2)
          ..lineTo(x + 3.2, y - 2.0);
        canvas.drawPath(checkPath, checkPaint);
      } else if (isCompleted) {
        // Active node
        final nodePaint = Paint()
          ..color = activeBlue
          ..style = PaintingStyle.fill;

        canvas.drawCircle(Offset(x, y), nodeRadius, nodePaint);

        if (isCurrent) {
          // Subtle outer halo ring for the active current step
          final haloPaint = Paint()
            ..color = activeBlue.withOpacity(0.25)
            ..strokeWidth = 2.0
            ..style = PaintingStyle.stroke;
          canvas.drawCircle(Offset(x, y), nodeRadius + 3.5, haloPaint);
        }
      } else {
        // Inactive node
        final nodePaint = Paint()
          ..color = inactiveGrey
          ..style = PaintingStyle.fill;
        canvas.drawCircle(Offset(x, y), nodeRadius - 1.5, nodePaint);
      }
    }
  }

  void _drawDashedLine(Canvas canvas, Offset p1, Offset p2, Paint paint) {
    const dashWidth = 3.5;
    const dashSpace = 2.5;
    double currentX = p1.dx;

    while (currentX < p2.dx) {
      final nextX =
          (currentX + dashWidth > p2.dx) ? p2.dx : currentX + dashWidth;
      canvas.drawLine(Offset(currentX, p1.dy), Offset(nextX, p1.dy), paint);
      currentX += dashWidth + dashSpace;
    }
  }

  @override
  bool shouldRepaint(covariant _ProgressPainter oldDelegate) =>
      oldDelegate.currentStep != currentStep ||
      oldDelegate.totalSteps != totalSteps;
}
