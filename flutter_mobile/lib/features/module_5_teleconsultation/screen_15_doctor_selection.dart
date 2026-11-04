import 'package:flutter/material.dart';
import '../../core/constants/app_colors.dart';
import '../../services/mock_data_service.dart';
import 'screen_16_mobile_money_payment.dart';

class Screen15DoctorSelection extends StatelessWidget {
  const Screen15DoctorSelection({super.key});

  @override
  Widget build(BuildContext context) {
    final service = MockDataService();
    final doctors = service.doctors;

    return Scaffold(
      appBar: AppBar(
        title: const Text('Médecins Disponibles'),
      ),
      body: SafeArea(
        child: Column(
          children: [
            Container(
              padding: const EdgeInsets.all(16),
              color: AppColors.primaryGreenLight,
              child: const Row(
                children: [
                  Icon(Icons.video_call_rounded, color: AppColors.primaryGreen, size: 28),
                  SizedBox(width: 12),
                  Expanded(
                    child: Text(
                      'Téléconsultation vidéo de 15 min avec un médecin béninois agréé. Compte-rendu envoyé par SMS.',
                      style: TextStyle(fontSize: 13, color: AppColors.primaryGreenDark, fontWeight: FontWeight.w600),
                    ),
                  ),
                ],
              ),
            ),
            Expanded(
              child: ListView.separated(
                padding: const EdgeInsets.all(18),
                itemCount: doctors.length,
                separatorBuilder: (_, __) => const SizedBox(height: 14),
                itemBuilder: (context, index) {
                  final d = doctors[index];
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
                              radius: 28,
                              backgroundColor: AppColors.primaryGreenLight,
                              child: Text(
                                d.fullName.split(' ').map((e) => e[0]).take(2).join(),
                                style: const TextStyle(fontWeight: FontWeight.bold, color: AppColors.primaryGreenDark),
                              ),
                            ),
                            const SizedBox(width: 14),
                            Expanded(
                              child: Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  Text(d.fullName, style: const TextStyle(fontSize: 16, fontWeight: FontWeight.bold)),
                                  Text(d.specialty, style: const TextStyle(fontSize: 13, color: AppColors.primaryGreenDark, fontWeight: FontWeight.w600)),
                                  Text(d.hospital, style: const TextStyle(fontSize: 12, color: AppColors.textMuted)),
                                ],
                              ),
                            ),
                          ],
                        ),
                        const SizedBox(height: 12),
                        Wrap(
                          spacing: 6,
                          children: d.languages.map((l) => Chip(
                            backgroundColor: AppColors.backgroundLight,
                            label: Text(l, style: const TextStyle(fontSize: 11)),
                            padding: EdgeInsets.zero,
                          )).toList(),
                        ),
                        const Divider(height: 20),
                        Row(
                          mainAxisAlignment: MainAxisAlignment.spaceBetween,
                          children: [
                            Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                const Text('Tarif forfaitaire :', style: TextStyle(fontSize: 11, color: AppColors.textMuted)),
                                Text(
                                  '${d.feeFcfa} FCFA',
                                  style: const TextStyle(fontSize: 18, fontWeight: FontWeight.w900, color: AppColors.textDark),
                                ),
                              ],
                            ),
                            ElevatedButton.icon(
                              style: ElevatedButton.styleFrom(backgroundColor: AppColors.primaryGreen),
                              icon: const Icon(Icons.arrow_forward_rounded, size: 18),
                              label: const Text('Choisir ce médecin'),
                              onPressed: () {
                                Navigator.push(
                                  context,
                                  MaterialPageRoute(
                                    builder: (_) => Screen16MobileMoneyPayment(doctor: d),
                                  ),
                                );
                              },
                            ),
                          ],
                        ),
                      ],
                    ),
                  );
                },
              ),
            ),
          ],
        ),
      ),
    );
  }
}
