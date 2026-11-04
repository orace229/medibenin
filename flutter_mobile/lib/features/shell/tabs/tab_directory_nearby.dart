import 'package:flutter/material.dart';
import '../../../core/constants/app_colors.dart';
import '../../../services/mock_data_service.dart';

class TabDirectoryNearby extends StatefulWidget {
  const TabDirectoryNearby({super.key});

  @override
  State<TabDirectoryNearby> createState() => _TabDirectoryNearbyState();
}

class _TabDirectoryNearbyState extends State<TabDirectoryNearby> {
  final MockDataService _service = MockDataService();
  int _selectedSegment = 0; // 0: Hôpitaux, 1: Pharmacies

  @override
  Widget build(BuildContext context) {
    final hospitals = _service.hospitals;
    final pharmacies = _service.pharmacies;

    return LayoutBuilder(
      builder: (context, constraints) {
        final isWide = constraints.maxWidth >= 700;
        final itemCount = _selectedSegment == 0 ? hospitals.length : pharmacies.length;

        return Column(
          children: [
            // Sélecteur Onglet Hôpitaux / Pharmacies
            Padding(
              padding: const EdgeInsets.fromLTRB(20, 16, 20, 12),
              child: Container(
                constraints: const BoxConstraints(maxWidth: 500),
                padding: const EdgeInsets.all(4),
                decoration: BoxDecoration(
                  color: Colors.white,
                  borderRadius: BorderRadius.circular(16),
                  border: Border.all(color: AppColors.borderSubtle),
                ),
                child: Row(
                  children: [
                    Expanded(
                      child: _buildSegmentButton(
                        index: 0,
                        icon: Icons.local_hospital_rounded,
                        label: 'Hôpitaux (${hospitals.length})',
                      ),
                    ),
                    Expanded(
                      child: _buildSegmentButton(
                        index: 1,
                        icon: Icons.local_pharmacy_rounded,
                        label: 'Pharmacies (${pharmacies.length})',
                      ),
                    ),
                  ],
                ),
              ),
            ),

            // Liste / Grille Responsive des établissements
            Expanded(
              child: isWide
                  ? GridView.builder(
                      padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 8),
                      gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
                        crossAxisCount: 2,
                        crossAxisSpacing: 14,
                        mainAxisSpacing: 14,
                        mainAxisExtent: 195,
                      ),
                      itemCount: itemCount,
                      itemBuilder: (context, index) => _buildItemAt(index),
                    )
                  : ListView.separated(
                      padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 8),
                      itemCount: itemCount,
                      separatorBuilder: (_, __) => const SizedBox(height: 12),
                      itemBuilder: (context, index) => _buildItemAt(index),
                    ),
            ),
          ],
        );
      },
    );
  }

  Widget _buildItemAt(int index) {
    if (_selectedSegment == 0) {
      final h = _service.hospitals[index];
      return _buildFacilityCard(
        name: h.name,
        subtitle: '${h.commune} • ${h.departement} (${h.distanceKm} km)',
        tag: h.hasEmergencyService ? 'Urgences Pédiatriques 24/7' : 'Ouvert 24h/24',
        tagColor: h.hasEmergencyService ? AppColors.statusRed : AppColors.primaryGreen,
        tagBg: h.hasEmergencyService ? AppColors.statusRedLight : AppColors.primaryGreenLight,
        icon: Icons.local_hospital_rounded,
        iconColor: Colors.blue.shade800,
        iconBg: Colors.blue.shade100,
        phone: h.phoneNumber,
      );
    } else {
      final p = _service.pharmacies[index];
      return _buildFacilityCard(
        name: p.name,
        subtitle: '${p.commune} • ${p.departement} (${p.distanceKm} km)',
        tag: p.isOpen247 ? 'Pharmacie de Garde' : 'Partenaire CareX',
        tagColor: p.isOpen247 ? Colors.amber.shade900 : AppColors.primaryGreenDark,
        tagBg: p.isOpen247 ? Colors.amber.shade100 : AppColors.primaryGreenLight,
        icon: Icons.local_pharmacy_rounded,
        iconColor: Colors.teal.shade800,
        iconBg: Colors.teal.shade100,
        phone: p.phoneNumber,
      );
    }
  }

  Widget _buildSegmentButton({
    required int index,
    required IconData icon,
    required String label,
  }) {
    final isSelected = _selectedSegment == index;
    return InkWell(
      onTap: () => setState(() => _selectedSegment = index),
      borderRadius: BorderRadius.circular(12),
      child: Container(
        padding: const EdgeInsets.symmetric(vertical: 10),
        decoration: BoxDecoration(
          color: isSelected ? AppColors.primaryGreen : Colors.transparent,
          borderRadius: BorderRadius.circular(12),
        ),
        child: Row(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(icon, size: 18, color: isSelected ? Colors.white : AppColors.textDark),
            const SizedBox(width: 8),
            Text(
              label,
              style: TextStyle(
                fontSize: 13,
                fontWeight: isSelected ? FontWeight.bold : FontWeight.w600,
                color: isSelected ? Colors.white : AppColors.textDark,
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildFacilityCard({
    required String name,
    required String subtitle,
    required String tag,
    required Color tagColor,
    required Color tagBg,
    required IconData icon,
    required Color iconColor,
    required Color iconBg,
    required String phone,
  }) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: AppColors.borderSubtle),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(0.02),
            blurRadius: 8,
            offset: const Offset(0, 2),
          ),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Row(
            children: [
              CircleAvatar(backgroundColor: iconBg, child: Icon(icon, color: iconColor)),
              const SizedBox(width: 12),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(name, style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 15), maxLines: 1, overflow: TextOverflow.ellipsis),
                    Text(subtitle, style: const TextStyle(fontSize: 12, color: AppColors.textMuted), maxLines: 1, overflow: TextOverflow.ellipsis),
                  ],
                ),
              ),
            ],
          ),
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
            decoration: BoxDecoration(color: tagBg, borderRadius: BorderRadius.circular(6)),
            child: Text(tag, style: TextStyle(fontSize: 11, color: tagColor, fontWeight: FontWeight.bold)),
          ),
          Row(
            children: [
              Expanded(
                child: OutlinedButton.icon(
                  style: OutlinedButton.styleFrom(padding: const EdgeInsets.symmetric(vertical: 8)),
                  icon: const Icon(Icons.call, size: 16),
                  label: const Text('Appeler', style: TextStyle(fontSize: 12)),
                  onPressed: () {
                    ScaffoldMessenger.of(context).showSnackBar(
                      SnackBar(content: Text('Appel de $name : $phone')),
                    );
                  },
                ),
              ),
              const SizedBox(width: 8),
              Expanded(
                child: ElevatedButton.icon(
                  style: ElevatedButton.styleFrom(
                    backgroundColor: AppColors.primaryGreen,
                    padding: const EdgeInsets.symmetric(vertical: 8),
                  ),
                  icon: const Icon(Icons.directions, size: 16),
                  label: const Text('Itinéraire', style: TextStyle(fontSize: 12)),
                  onPressed: () {
                    ScaffoldMessenger.of(context).showSnackBar(
                      SnackBar(content: Text('Calcul d\'itinéraire vers $name...')),
                    );
                  },
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }
}
