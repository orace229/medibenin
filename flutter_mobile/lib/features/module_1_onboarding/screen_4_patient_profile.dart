import 'package:flutter/material.dart';
import '../../core/constants/app_colors.dart';
import '../../core/widgets/medi_big_button.dart';
import '../../services/mock_data_service.dart';
import '../module_2_symptoms/screen_5_home_dashboard.dart';

class Screen4PatientProfile extends StatefulWidget {
  const Screen4PatientProfile({super.key});

  @override
  State<Screen4PatientProfile> createState() => _Screen4PatientProfileState();
}

class _Screen4PatientProfileState extends State<Screen4PatientProfile> {
  final MockDataService _service = MockDataService();
  late TextEditingController _nameController;
  late TextEditingController _ageController;
  String _gender = 'M';
  bool _isRelative = true;
  String _departement = 'Atlantique';
  String _commune = 'Abomey-Calavi';

  final List<String> _departements = [
    'Atlantique', 'Littoral', 'Ouémé', 'Borgou', 'Zou', 'Mono', 'Couffo',
    'Atacora', 'Donga', 'Alibori', 'Collines', 'Plateau'
  ];

  @override
  void initState() {
    super.initState();
    final p = _service.currentPatient;
    _nameController = TextEditingController(text: p.nameOrNickname);
    _ageController = TextEditingController(text: p.age.toString());
    _gender = p.gender;
    _isRelative = p.isRepresentedByRelative;
    _departement = p.departement;
    _commune = p.commune;
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Informations Patient'),
      ),
      body: SafeArea(
        child: SingleChildScrollView(
          padding: const EdgeInsets.all(22),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // Switch Représentant
              Container(
                padding: const EdgeInsets.all(14),
                decoration: BoxDecoration(
                  color: Colors.white,
                  borderRadius: BorderRadius.circular(16),
                  border: Border.all(color: AppColors.borderSubtle),
                ),
                child: Row(
                  children: [
                    const Icon(Icons.family_restroom_rounded, color: AppColors.primaryGreen, size: 30),
                    const SizedBox(width: 12),
                    const Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text('Pour qui est la consultation ?', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 15)),
                          Text('Remplissez-vous pour un enfant ou un proche ?', style: TextStyle(fontSize: 12, color: AppColors.textMuted)),
                        ],
                      ),
                    ),
                    Switch(
                      value: _isRelative,
                      activeColor: AppColors.primaryGreen,
                      onChanged: (val) {
                        setState(() {
                          _isRelative = val;
                        });
                      },
                    ),
                  ],
                ),
              ),
              const SizedBox(height: 18),
              Text(
                _isRelative ? 'Prénom ou surnom du malade (enfant/parent) :' : 'Votre prénom ou surnom d\'usage :',
                style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 14),
              ),
              const SizedBox(height: 6),
              TextField(
                controller: _nameController,
                decoration: InputDecoration(
                  filled: true,
                  fillColor: Colors.white,
                  hintText: 'Ex: Koffi / Maman',
                  border: OutlineInputBorder(borderRadius: BorderRadius.circular(12)),
                ),
              ),
              const SizedBox(height: 16),
              Row(
                children: [
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        const Text('Âge (années) :', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 14)),
                        const SizedBox(height: 6),
                        TextField(
                          controller: _ageController,
                          keyboardType: TextInputType.number,
                          decoration: InputDecoration(
                            filled: true,
                            fillColor: Colors.white,
                            hintText: 'Ex: 3',
                            border: OutlineInputBorder(borderRadius: BorderRadius.circular(12)),
                          ),
                        ),
                      ],
                    ),
                  ),
                  const SizedBox(width: 16),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        const Text('Sexe :', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 14)),
                        const SizedBox(height: 6),
                        Container(
                          padding: const EdgeInsets.symmetric(horizontal: 12),
                          decoration: BoxDecoration(
                            color: Colors.white,
                            borderRadius: BorderRadius.circular(12),
                            border: Border.all(color: AppColors.borderSubtle),
                          ),
                          child: DropdownButtonHideUnderline(
                            child: DropdownButton<String>(
                              value: _gender,
                              isExpanded: true,
                              items: const [
                                DropdownMenuItem(value: 'M', child: Text('Masculin')),
                                DropdownMenuItem(value: 'F', child: Text('Féminin')),
                              ],
                              onChanged: (val) {
                                if (val != null) setState(() => _gender = val);
                              },
                            ),
                          ),
                        ),
                      ],
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 18),
              const Text('Département de résidence au Bénin :', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 14)),
              const SizedBox(height: 6),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 14),
                decoration: BoxDecoration(
                  color: Colors.white,
                  borderRadius: BorderRadius.circular(12),
                  border: Border.all(color: AppColors.borderSubtle),
                ),
                child: DropdownButtonHideUnderline(
                  child: DropdownButton<String>(
                    value: _departement,
                    isExpanded: true,
                    items: _departements.map((d) => DropdownMenuItem(value: d, child: Text(d))).toList(),
                    onChanged: (val) {
                      if (val != null) setState(() => _departement = val);
                    },
                  ),
                ),
              ),
              const SizedBox(height: 28),
              MediBigButton(
                label: 'Accéder à l\'Accueil',
                icon: Icons.check_circle_rounded,
                onTap: () {
                  _service.updatePatientProfile(
                    name: _nameController.text.trim().isEmpty ? 'Patient' : _nameController.text.trim(),
                    age: int.tryParse(_ageController.text) ?? 25,
                    gender: _gender,
                    isRelative: _isRelative,
                    phone: _service.currentPatient.phoneNumber,
                    commune: _commune,
                    departement: _departement,
                  );
                  Navigator.pushAndRemoveUntil(
                    context,
                    MaterialPageRoute(builder: (_) => const Screen5HomeDashboard()),
                    (route) => false,
                  );
                },
              ),
            ],
          ),
        ),
      ),
    );
  }
}
