import 'package:flutter/material.dart';
import 'core/theme/app_theme.dart';
import 'core/widgets/mobile_app_frame.dart';
import 'features/shell/main_navigation_shell.dart';

void main() {
  WidgetsFlutterBinding.ensureInitialized();
  runApp(const MediBeninApp());
}

class MediBeninApp extends StatelessWidget {
  const MediBeninApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'MediBenin - CareX',
      debugShowCheckedModeBanner: false,
      theme: AppTheme.lightTheme,
      home: const ResponsiveAppFrame(
        child: MainNavigationShell(),
      ),
    );
  }
}
