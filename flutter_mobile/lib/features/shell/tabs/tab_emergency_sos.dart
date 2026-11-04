import 'package:flutter/material.dart';
import '../../../core/constants/app_colors.dart';
import '../../../core/widgets/medi_big_button.dart';
import '../../../services/mock_data_service.dart';
import '../../module_4_directory/screen_13_hospitals_directory.dart';

class TabEmergencySos extends StatefulWidget {
  const TabEmergencySos({super.key});

  @override
  State<TabEmergencySos> createState() => _TabEmergencySosState();
}

class _TabEmergencySosState extends State<TabEmergencySos> {
  final MockDataService _service = MockDataService();
  bool _gpsSent = false;

  @override
  Widget build(BuildContext context) {
    final patient = _service.currentPatient;

    return LayoutBuilder(
      builder: (context, constraints) {
        final isWide = constraints.maxWidth >= 768;

        return SingleChildScrollView(
          padding: EdgeInsets.symmetric(horizontal: isWide ? 28 : 20, vertical: 18),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // Bannière Urgence Vitale
              Container(
                width: double.infinity,
                padding: const EdgeInsets.all(22),
                decoration: BoxDecoration(
                  gradient: const LinearGradient(
                    colors: [Color(0xFFD32F2F), Color(0xFFB71C1C)],
                    begin: Alignment.topLeft,
                    end: Alignment.bottomRight,
                  ),
                  borderRadius: BorderRadius.circular(24),
                  boxShadow: [
                    BoxShadow(
                      color: AppColors.statusRed.withOpacity(0.35),
                      blurRadius: 18,
                      offset: const Offset(0, 6),
                    ),
                  ],
                ),
                child: Column(
                  children: [
                    const Icon(Icons.emergency_rounded, color: Colors.white, size: 54),
                    const SizedBox(height: 10),
                    const Text(
                      'URGENCE MÉDICALE VITALE',
                      style: TextStyle(
                        color: Colors.white,
                        fontSize: 22,
                        fontWeight: FontWeight.w900,
                        letterSpacing: 0.5,
                      ),
                    ),
                    const SizedBox(height: 4),
                    Text(
                      'En cas de perte de connaissance, convulsion ou détresse respiratoire',
                      textAlign: TextAlign.center,
                      style: TextStyle(color: Colors.white.withOpacity(0.92), fontSize: 13),
                    ),
                  ],
                ),
              ),
              const SizedBox(height: 20),

              // Boutons d'action : Grille 2 colonnes sur Desktop, empilés sur Mobile
              if (isWide)
                Row(
                  children: [
                    Expanded(
                      child: MediBigButton(
                        label: 'Appeler le SAMU Bénin (112)',
                        subtitle: 'Numéro d\'urgence gratuit 24h/24',
                        icon: Icons.phone_in_talk_rounded,
                        backgroundColor: AppColors.statusRed,
                        onTap: () {
                          ScaffoldMessenger.of(context).showSnackBar(
                            const SnackBar(
                              backgroundColor: AppColors.statusRed,
                              content: Text('📞 Appel d\'urgence SAMU Bénin (112) en cours...'),
                            ),
                          );
                        },
                      ),
                    ),
                    const SizedBox(width: 16),
                    Expanded(
                      child: MediBigButton(
                        label: _gpsSent ? 'Position GPS transmise' : 'Alerter un Proche par SMS',
                        subtitle: 'Envoie votre localisation (${patient.commune})',
                        icon: _gpsSent ? Icons.check_circle_rounded : Icons.share_location_rounded,
                        backgroundColor: Colors.deepOrange.shade800,
                        onTap: () {
                          setState(() => _gpsSent = true);
                          ScaffoldMessenger.of(context).showSnackBar(
                            SnackBar(
                              backgroundColor: Colors.deepOrange.shade800,
                              content: Text('📍 Alerte SMS et coordonnées GPS envoyées pour ${patient.nameOrNickname} !'),
                            ),
                          );
                        },
                      ),
                    ),
                  ],
                )
              else ...[
                MediBigButton(
                  label: 'Appeler le SAMU Bénin (112)',
                  subtitle: 'Numéro d\'urgence gratuit 24h/24',
                  icon: Icons.phone_in_talk_rounded,
                  backgroundColor: AppColors.statusRed,
                  onTap: () {
                    ScaffoldMessenger.of(context).showSnackBar(
                      const SnackBar(
                        backgroundColor: AppColors.statusRed,
                        content: Text('📞 Appel d\'urgence SAMU Bénin (112) en cours...'),
                      ),
                    );
                  },
                ),
                const SizedBox(height: 14),
                MediBigButton(
                  label: _gpsSent ? 'Position GPS transmise' : 'Alerter un Proche par SMS',
                  subtitle: 'Envoie votre localisation (${patient.commune})',
                  icon: _gpsSent ? Icons.check_circle_rounded : Icons.share_location_rounded,
                  backgroundColor: Colors.deepOrange.shade800,
                  onTap: () {
                    setState(() => _gpsSent = true);
                    ScaffoldMessenger.of(context).showSnackBar(
                      SnackBar(
                        backgroundColor: Colors.deepOrange.shade800,
                        content: Text('📍 Alerte SMS et coordonnées GPS envoyées pour ${patient.nameOrNickname} !'),
                      ),
                    );
                  },
                ),
              ],

              const SizedBox(height: 24),

              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  const Text(
                    'Hôpitaux d\'Urgence Proches',
                    style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
                  ),
                  TextButton(
                    child: const Text('Tout voir'),
                    onPressed: () {
                      Navigator.push(
                        context,
                        MaterialPageRoute(builder: (_) => const Screen13HospitalsDirectory()),
                      );
                    },
                  ),
                ],
              ),
              const SizedBox(height: 10),

              // Liste / Grille des hôpitaux
              if (isWide)
                Row(
                  children: _service.hospitals.take(2).map((h) => Expanded(
                    child: Container(
                      margin: const EdgeInsets.symmetric(horizontal: 6),
                      padding: const EdgeInsets.all(16),
                      decoration: BoxDecoration(
                        color: Colors.white,
                        borderRadius: BorderRadius.circular(16),
                        border: Border.all(color: AppColors.borderSubtle),
                      ),
                      child: Row(
                        children: [
                          CircleAvatar(
                            backgroundColor: Colors.blue.shade100,
                            child: Icon(Icons.local_hospital_rounded, color: Colors.blue.shade800),
                          ),
                          const SizedBox(width: 14),
                          Expanded(
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Text(h.name, style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 15), maxLines: 1, overflow: TextOverflow.ellipsis),
                                Text('${h.commune} (${h.distanceKm} km) • Urgences 24/7', style: const TextStyle(fontSize: 12, color: AppColors.textMuted)),
                              ],
                            ),
                          ),
                          IconButton.filled(
                            style: IconButton.styleFrom(backgroundColor: Colors.blue.shade800),
                            icon: const Icon(Icons.call, size: 20, color: Colors.white),
                            onPressed: () {
                              ScaffoldMessenger.of(context).showSnackBar(
                                SnackBar(content: Text('Appel vers ${h.name} : ${h.phoneNumber}')),
                              );
                            },
                          ),
                        ],
                      ),
                    ),
                  )).toList(),
                )
              else
                ..._service.hospitals.take(2).map((h) => Container(
                  margin: const EdgeInsets.only(bottom: 12),
                  padding: const EdgeInsets.all(16),
                  decoration: BoxDecoration(
                    color: Colors.white,
                    borderRadius: BorderRadius.circular(16),
                    border: Border.all(color: AppColors.borderSubtle),
                  ),
                  child: Row(
                    children: [
                      CircleAvatar(
                        backgroundColor: Colors.blue.shade100,
                        child: Icon(Icons.local_hospital_rounded, color: Colors.blue.shade800),
                      ),
                      const SizedBox(width: 14),
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(h.name, style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 15)),
                            Text('${h.commune} (${h.distanceKm} km) • Urgences 24/7', style: const TextStyle(fontSize: 12, color: AppColors.textMuted)),
                          ],
                        ),
                      ),
                      IconButton.filled(
                        style: IconButton.styleFrom(backgroundColor: Colors.blue.shade800),
                        icon: const Icon(Icons.call, size: 20, color: Colors.white),
                        onPressed: () {
                          ScaffoldMessenger.of(context).showSnackBar(
                            SnackBar(content: Text('Appel vers ${h.name} : ${h.phoneNumber}')),
                          );
                        },
                      ),
                    ],
                  ),
                )),
            ],
          ),
        );
      },
    );
  }
}
