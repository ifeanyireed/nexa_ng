with open('mobile_fleet/lib/data/transport_mock_data.dart', 'r') as f:
    content = f.read()

new_services = """    ServiceModule(
      id: 'srv_5',
      name: 'Interstate',
      description: 'Travel between cities',
      type: ServiceType.interstate,
      icon: Icons.map,
      color: const Color(0xFFF59E0B),
    ),
    ServiceModule(
      id: 'srv_6',
      name: 'School',
      description: 'School transport',
      type: ServiceType.school,
      icon: Icons.school,
      color: const Color(0xFF10B981),
    ),
  ];"""

content = content.replace("  ];", new_services, 1)

with open('mobile_fleet/lib/data/transport_mock_data.dart', 'w') as f:
    f.write(content)
