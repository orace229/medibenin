import 'package:flutter_test/flutter_test.dart';
import 'package:medibenin_app/main.dart';

void main() {
  testWidgets('MediBenin smoke test', (WidgetTester tester) async {
    await tester.pumpWidget(const MediBeninApp());
    expect(find.text('MEDIBENIN'), findsOneWidget);
  });
}
