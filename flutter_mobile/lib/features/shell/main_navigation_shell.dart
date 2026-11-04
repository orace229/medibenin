import 'package:flutter/material.dart';
import '../../core/constants/app_colors.dart';
import '../../core/widgets/language_bottom_sheet.dart';
import '../../services/mock_data_service.dart';
import 'tabs/tab_home_triage.dart';
import 'tabs/tab_emergency_sos.dart';
import 'tabs/tab_directory_nearby.dart';
import 'tabs/tab_family_followup.dart';

class MainNavigationShell extends StatefulWidget {
  const MainNavigationShell({super.key});

  @override
  State<MainNavigationShell> createState() => _MainNavigationShellState();
}

class _MainNavigationShellState extends State<MainNavigationShell> {
  int _currentIndex = 0;
  final MockDataService _service = MockDataService();

  @override
  void initState() {
    super.initState();
    _service.addListener(_onServiceUpdate);
  }

  void _onServiceUpdate() {
    if (mounted) setState(() {});
  }

  @override
  void dispose() {
    _service.removeListener(_onServiceUpdate);
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final lang = _service.currentLanguage;

    final List<Widget> tabs = [
      TabHomeTriage(
        onEmergencyTap: () => setState(() => _currentIndex = 1),
      ),
      const TabEmergencySos(),
      const TabDirectoryNearby(),
      const TabFamilyFollowup(),
    ];

    return LayoutBuilder(
      builder: (context, constraints) {
        final isDesktop = constraints.maxWidth >= 768;

        // Version Tablette / Desktop (NavigationRail à gauche)
        if (isDesktop) {
          return Scaffold(
            backgroundColor: AppColors.backgroundLight,
            appBar: AppBar(
              backgroundColor: Colors.white,
              elevation: 0.5,
              title: const Row(
                children: [
                  CircleAvatar(
                    backgroundColor: AppColors.primaryGreen,
                    radius: 16,
                    child: Icon(Icons.health_and_safety_rounded, color: Colors.white, size: 20),
                  ),
                  SizedBox(width: 10),
                  Text(
                    'MEDIBENIN',
                    style: TextStyle(
                      fontSize: 18,
                      fontWeight: FontWeight.w900,
                      letterSpacing: 1.2,
                      color: AppColors.primaryGreenDark,
                    ),
                  ),
                ],
              ),
              actions: [
                _buildLanguageChip(context, lang),
                const SizedBox(width: 20),
              ],
            ),
            body: Row(
              children: [
                NavigationRail(
                  selectedIndex: _currentIndex,
                  backgroundColor: Colors.white,
                  elevation: 1,
                  extended: constraints.maxWidth >= 1024,
                  minExtendedWidth: 220,
                  indicatorColor: _currentIndex == 1 ? AppColors.statusRedLight : AppColors.primaryGreenLight,
                  onDestinationSelected: (idx) => setState(() => _currentIndex = idx),
                  destinations: const [
                    NavigationRailDestination(
                      icon: Icon(Icons.home_outlined),
                      selectedIcon: Icon(Icons.home_rounded, color: AppColors.primaryGreen),
                      label: Text('Accueil & Triage'),
                    ),
                    NavigationRailDestination(
                      icon: Icon(Icons.emergency_outlined, color: AppColors.statusRed),
                      selectedIcon: Icon(Icons.emergency_rounded, color: AppColors.statusRed),
                      label: Text('SOS Urgence'),
                    ),
                    NavigationRailDestination(
                      icon: Icon(Icons.location_on_outlined),
                      selectedIcon: Icon(Icons.location_on_rounded, color: AppColors.primaryGreen),
                      label: Text('À Proximité'),
                    ),
                    NavigationRailDestination(
                      icon: Icon(Icons.folder_shared_outlined),
                      selectedIcon: Icon(Icons.folder_shared_rounded, color: AppColors.primaryGreen),
                      label: Text('Mon Foyer & Suivi'),
                    ),
                  ],
                ),
                const VerticalDivider(thickness: 1, width: 1, color: AppColors.borderSubtle),
                Expanded(
                  child: Center(
                    child: ConstrainedBox(
                      constraints: const BoxConstraints(maxWidth: 1100),
                      child: IndexedStack(
                        index: _currentIndex,
                        children: tabs,
                      ),
                    ),
                  ),
                ),
              ],
            ),
          );
        }

        // Version Mobile (< 768px) : AppBar en haut et NavigationBar en bas
        return Scaffold(
          backgroundColor: AppColors.backgroundLight,
          appBar: AppBar(
            backgroundColor: Colors.white,
            elevation: 0.5,
            titleSpacing: 10,
            leading: const Padding(
              padding: EdgeInsets.only(left: 10),
              child: CircleAvatar(
                backgroundColor: AppColors.primaryGreen,
                child: Icon(Icons.health_and_safety_rounded, color: Colors.white, size: 20),
              ),
            ),
            title: const Text(
              'MEDIBENIN',
              style: TextStyle(
                fontSize: 16,
                fontWeight: FontWeight.w900,
                letterSpacing: 1.2,
                color: AppColors.primaryGreenDark,
              ),
            ),
            actions: [
              _buildLanguageChip(context, lang),
              const SizedBox(width: 14),
            ],
          ),
          body: IndexedStack(
            index: _currentIndex,
            children: tabs,
          ),
          bottomNavigationBar: NavigationBar(
            selectedIndex: _currentIndex,
            backgroundColor: Colors.white,
            elevation: 8,
            indicatorColor: _currentIndex == 1 ? AppColors.statusRedLight : AppColors.primaryGreenLight,
            onDestinationSelected: (idx) {
              setState(() {
                _currentIndex = idx;
              });
            },
            destinations: const [
              NavigationDestination(
                icon: Icon(Icons.home_outlined),
                selectedIcon: Icon(Icons.home_rounded, color: AppColors.primaryGreen),
                label: 'Accueil',
              ),
              NavigationDestination(
                icon: Icon(Icons.emergency_outlined, color: AppColors.statusRed),
                selectedIcon: Icon(Icons.emergency_rounded, color: AppColors.statusRed),
                label: 'SOS Urgence',
              ),
              NavigationDestination(
                icon: Icon(Icons.location_on_outlined),
                selectedIcon: Icon(Icons.location_on_rounded, color: AppColors.primaryGreen),
                label: 'À Proximité',
              ),
              NavigationDestination(
                icon: Icon(Icons.folder_shared_outlined),
                selectedIcon: Icon(Icons.folder_shared_rounded, color: AppColors.primaryGreen),
                label: 'Mon Foyer',
              ),
            ],
          ),
        );
      },
    );
  }

  Widget _buildLanguageChip(BuildContext context, dynamic lang) {
    return InkWell(
      onTap: () => LanguageBottomSheet.show(context),
      borderRadius: BorderRadius.circular(20),
      child: Container(
        margin: const EdgeInsets.symmetric(vertical: 8),
        padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
        decoration: BoxDecoration(
          color: AppColors.primaryGreenLight,
          borderRadius: BorderRadius.circular(20),
          border: Border.all(color: AppColors.primaryGreen.withOpacity(0.3)),
        ),
        child: Row(
          mainAxisSize: MainAxisSize.min,
          children: [
            Text(lang.flag, style: const TextStyle(fontSize: 14)),
            const SizedBox(width: 4),
            Text(
              lang.displayName,
              style: const TextStyle(
                fontSize: 12,
                fontWeight: FontWeight.bold,
                color: AppColors.primaryGreenDark,
              ),
            ),
            const SizedBox(width: 2),
            const Icon(Icons.keyboard_arrow_down_rounded, size: 16, color: AppColors.primaryGreenDark),
          ],
        ),
      ),
    );
  }
}
