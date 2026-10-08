import 'package:flutter_test/flutter_test.dart';
import 'package:mobile_mobility/main.dart';

void main() {
  testWidgets('Mobile mobility app smoke test', (WidgetTester tester) async {
    await tester.pumpWidget(const TransportMobilityApp());
    expect(find.byType(TransportMobilityApp), findsOneWidget);
  });
}
