// ignore_for_file: non_const_argument_for_const_parameter
import 'package:flutter/widgets.dart';

/// Helper to fix the fontPackage missing in flexicon package
IconData fixIcon(IconData icon) => IconData(
      icon.codePoint,
      fontFamily: icon.fontFamily,
      fontPackage: 'flexicon',
    );
