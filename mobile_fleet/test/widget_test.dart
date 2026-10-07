import 'package:flutter_test/flutter_test.dart';
import 'package:mobile_fleet/main.dart';

void main() {
  testWidgets('Mobile customer app smoke test', (WidgetTester tester) async {
    await tester.pumpWidget(const MobileCustomerApp());
    expect(find.byType(MobileCustomerApp), findsOneWidget);
  });
}
