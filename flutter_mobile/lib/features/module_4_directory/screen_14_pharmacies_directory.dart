import 'package:flutter/material.dart';
import '../../core/constants/app_colors.dart';
import '../../services/mock_data_service.dart';

class Screen14PharmaciesDirectory extends StatelessWidget {
  const Screen14PharmaciesDirectory({super.key});

  @override
  Widget build(BuildContext context) {
    final service = MockDataService();
    final pharmacies = service.pharmacies;

    return Scaffold(
      appBar: AppBar(
        title: const Text('Pharmacies Partenaires'),
      ),
      body: SafeArea(
        child: ListView.separated(
          padding: const EdgeInsets.all(18),
          itemCount: pharmacies.length,
          separatorBuilder: (_, __) => const SizedBox(height: 14),
          itemBuilder: (context, index) {
            final p = pharmacies[index];
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
                        backgroundColor: Colors.teal.shade100,
                        child: Icon(Icons.local_pharmacy_rounded, color: Colors.teal.shade800),
                      ),
                      const SizedBox(width: 12),
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(
                              p.name,
                              style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 16),
                            ),
                            Text(
                              '${p.commune} (${p.distanceKm} km)',
                              style: const TextStyle(fontSize: 13, color: AppColors.textMuted),
                            ),
                          ],
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 10),
                  Row(
                    children: [
                      Container(
                        padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                        decoration: BoxDecoration(
                          color: AppColors.primaryGreenLight,
                          borderRadius: BorderRadius.circular(6),
                        ),
                        child: const Text('Partenaire Agréé CareX', style: TextStyle(fontSize: 11, color: AppColors.primaryGreenDark, fontWeight: FontWeight.bold)),
                      ),
                      const SizedBox(width: 8),
                      if (p.isOpen247)
                        Container(
                          padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                          decoration: BoxDecoration(
                            color: Colors.amber.shade100,
                            borderRadius: BorderRadius.circular(6),
                          ),
                          child: Text('Pharmacie de Garde', style: TextStyle(fontSize: 11, color: Colors.amber.shade900, fontWeight: FontWeight.bold)),
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
                              SnackBar(content: Text('Appel de ${p.name} : ${p.phoneNumber}')),
                            );
                          },
                        ),
                      ),
                      const SizedBox(width: 10),
                      Expanded(
                        child: ElevatedButton.icon(
                          style: ElevatedButton.styleFrom(backgroundColor: Colors.teal.shade700),
                          icon: const Icon(Icons.receipt_long_rounded, size: 18),
                          label: const Text('Ordonnance'),
                          onPressed: () {
                            ScaffoldMessenger.of(context).showSnackBar(
                              SnackBar(content: Text('Ordonnance électronique transmise à ${p.name} !')),
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
