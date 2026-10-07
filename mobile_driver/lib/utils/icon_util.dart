import 'package:flutter/widgets.dart';
import 'package:flexicon/flexicon.dart';

/// Helper to fix the fontPackage missing in flexicon package
IconData fixIcon(IconData icon) => IconData(
      icon.codePoint,
      fontFamily: icon.fontFamily,
      fontPackage: 'flexicon',
    );
