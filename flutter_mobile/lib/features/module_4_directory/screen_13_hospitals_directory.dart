import 'package:flutter/material.dart';
import '../../core/constants/app_colors.dart';
import '../../services/mock_data_service.dart';

class Screen13HospitalsDirectory extends StatelessWidget {
  const Screen13HospitalsDirectory({super.key});

  @override
  Widget build(BuildContext context) {
    final service = MockDataService();
    final hospitals = service.hospitals;

    return Scaffold(
      appBar: AppBar(
        title: const Text('Centres de Santé & Hôpitaux'),
      ),
      body: SafeArea(
        child: ListView.separated(
          padding: const EdgeInsets.all(18),
          itemCount: hospitals.length,
          separatorBuilder: (_, __) => const SizedBox(height: 14),
          itemBuilder: (context, index) {
            final h = hospitals[index];
            return Container(
              padding: const EdgeInsets.all(16),
              decoration: BoxDecoration(
                color: Colors.white,
                borderRadius: BorderRadius.circular(16),
                border: Border.all(color: AppColors.borderSubtle),
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    children: [
                      CircleAvatar(
                        backgroundColor: Colors.blue.shade100,
                        child: Icon(Icons.local_hospital_rounded, color: Colors.blue.shade800),
                      ),
                      const SizedBox(width: 12),
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(
                              h.name,
                              style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 16),
                            ),
                            Text(
                              '${h.commune} • ${h.departement} (${h.distanceKm} km)',
                              style: const TextStyle(fontSize: 13, color: AppColors.textMuted),
                            ),
                          ],
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 12),
                  Row(
                    children: [
                      if (h.isOpen247)
                        Container(
                          padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                          decoration: BoxDecoration(
                            color: AppColors.primaryGreenLight,
                            borderRadius: BorderRadius.circular(6),
                          ),
                          child: const Text('Ouvert 24h/24', style: TextStyle(fontSize: 11, color: AppColors.primaryGreenDark, fontWeight: FontWeight.bold)),
                        ),
                      const SizedBox(width: 8),
                      if (h.hasEmergencyService)
                        Container(
                          padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                          decoration: BoxDecoration(
                            color: AppColors.statusRedLight,
                            borderRadius: BorderRadius.circular(6),
                          ),
                          child: const Text('Urgences Pédiatriques', style: TextStyle(fontSize: 11, color: AppColors.statusRed, fontWeight: FontWeight.bold)),
                        ),
                    ],
                  ),
                  const Divider(height: 20),
                  Row(
                    children: [
                      Expanded(
                        child: OutlinedButton.icon(
                          icon: const Icon(Icons.call_rounded, size: 18),
                          label: const Text('Appeler'),
                          onPressed: () {
                            ScaffoldMessenger.of(context).showSnackBar(
                              SnackBar(content: Text('Appel de ${h.name} : ${h.phoneNumber}')),
                            );
                          },
                        ),
                      ),
                      const SizedBox(width: 10),
                      Expanded(
                        child: ElevatedButton.icon(
                          style: ElevatedButton.styleFrom(backgroundColor: Colors.blue.shade800),
                          icon: const Icon(Icons.directions_rounded, size: 18),
                          label: const Text('Itinéraire'),
                          onPressed: () {
                            ScaffoldMessenger.of(context).showSnackBar(
                              SnackBar(content: Text('Calcul d\'itinéraire vers ${h.name}...')),
                            );
                          },
                        ),
                      ),
                    ],
                  ),
                ],
              ),
            );
          },
        ),
      ),
    );
  }
}
