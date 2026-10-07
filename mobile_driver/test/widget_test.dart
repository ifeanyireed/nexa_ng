import 'package:flutter_test/flutter_test.dart';
import 'package:mobile_driver/main.dart';

void main() {
  testWidgets('Mobile driver app smoke test', (WidgetTester tester) async {
    await tester.pumpWidget(const DriverApp());
    expect(find.byType(DriverApp), findsOneWidget);
  });
}
