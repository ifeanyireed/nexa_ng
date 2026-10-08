import 'package:flutter/material.dart';
import 'package:flexicon/flexicon.dart';
import 'package:mobile_mobility/utils/icon_util.dart';

class CustomStatusBar extends StatelessWidget {
  final Color textColor;
  final bool showNotch;

  const CustomStatusBar({
    super.key,
    this.textColor = const Color(0xFF0F172A),
    this.showNotch = true,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 10),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          // Time
          Text(
            '11:30',
            style: TextStyle(
              fontSize: 14.5,
              fontWeight: FontWeight.w700,
              letterSpacing: -0.2,
              color: textColor,
            ),
          ),

          // Dynamic Island Notch
          if (showNotch)
            Container(
              width: 100,
              height: 26,
              decoration: BoxDecoration(
                color: Colors.black,
                borderRadius: BorderRadius.circular(20),
              ),
              child: Row(
                mainAxisAlignment: MainAxisAlignment.end,
                children: [
                  Container(
                    margin: const EdgeInsets.only(right: 12),
                    width: 10,
                    height: 10,
                    decoration: const BoxDecoration(
                      color: Color(0xFF1E293B),
                      shape: BoxShape.circle,
                    ),
                  ),
                ],
              ),
            )
          else
            const SizedBox(width: 100),

          // Connectivity Icons
          Row(
            mainAxisSize: MainAxisSize.min,
            children: [
              // Cellular signal bars
              Row(
                crossAxisAlignment: CrossAxisAlignment.end,
                children: [
                  _bar(3, 4, textColor),
                  const SizedBox(width: 1.5),
                  _bar(3, 6, textColor),
                  const SizedBox(width: 1.5),
                  _bar(3, 8, textColor),
                  const SizedBox(width: 1.5),
                  _bar(3, 10, textColor),
                ],
              ),
              const SizedBox(width: 6),
              // Wifi
              Icon(fixIcon(FlexIcon.remix.wifiAntenna), size: 15, color: textColor),
              const SizedBox(width: 6),
              // Battery
              Container(
                width: 20,
                height: 10.5,
                padding: const EdgeInsets.all(1.5),
                decoration: BoxDecoration(
                  borderRadius: BorderRadius.circular(3),
                  border: Border.all(color: textColor, width: 1.2),
                ),
                child: Container(
                  decoration: BoxDecoration(
                    color: textColor,
                    borderRadius: BorderRadius.circular(1),
                  ),
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }

  Widget _bar(double width, double height, Color color) {
    return Container(
      width: width,
      height: height,
      decoration: BoxDecoration(
        color: color,
        borderRadius: BorderRadius.circular(0.8),
      ),
    );
  }
}
