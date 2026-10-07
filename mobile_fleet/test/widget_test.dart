import 'package:flutter_test/flutter_test.dart';
import 'package:mobile_fleet/main.dart';

void main() {
  testWidgets('Mobile fleet app smoke test', (WidgetTester tester) async {
    await tester.pumpWidget(const TransportFleetApp());
    expect(find.byType(TransportFleetApp), findsOneWidget);
  });
}
