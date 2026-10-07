import os
import re

mapping = {
    "Icons.local_taxi": "fixIcon(FlexIcon.remix.carTaxi1)",
    "Icons.directions_bus": "fixIcon(FlexIcon.remix.transferTruckTime)",
    "Icons.car_rental": "fixIcon(FlexIcon.remix.carTaxi1)",
    "Icons.business_center": "fixIcon(FlexIcon.remix.store2)",
    "Icons.school": "fixIcon(FlexIcon.remix.building1)",
    "Icons.map": "fixIcon(FlexIcon.remix.mapLocation)",
    "Icons.location_on": "fixIcon(FlexIcon.remix.locationPin3)",
    "Icons.my_location": "fixIcon(FlexIcon.remix.focus)",
    "Icons.trip_origin": "fixIcon(FlexIcon.remix.roundAnchorPoint)",
    "Icons.access_time": "fixIcon(FlexIcon.remix.countdownTimer)",
    "Icons.person": "fixIcon(FlexIcon.remix.userCircleSingle)",
    "Icons.person_outline": "fixIcon(FlexIcon.remix.userCircleSingle)",
    "Icons.arrow_forward": "fixIcon(FlexIcon.remix.lineArrowExpand)",
    "Icons.arrow_back": "fixIcon(FlexIcon.remix.lessThanSignCircle)",
    "Icons.keyboard_arrow_down": "fixIcon(FlexIcon.remix.downloadArrow)",
    "Icons.keyboard_arrow_up": "fixIcon(FlexIcon.remix.alignTop1)",
    "Icons.star": "fixIcon(FlexIcon.remix.starCircle)",
    "Icons.stars": "fixIcon(FlexIcon.remix.starCircle)",
    "Icons.wb_sunny": "fixIcon(FlexIcon.remix.flower)",
    "Icons.receipt": "fixIcon(FlexIcon.remix.receipt)",
    "Icons.headset_mic": "fixIcon(FlexIcon.remix.customerSupport5)",
    "Icons.headset_mic_outlined": "fixIcon(FlexIcon.remix.customerSupport5)",
    "Icons.notifications_outlined": "fixIcon(FlexIcon.remix.bellNotification)",
    "Icons.search": "fixIcon(FlexIcon.remix.magnifyingGlass)",
    "Icons.ac_unit": "fixIcon(FlexIcon.remix.flower)",
    "Icons.electrical_services": "fixIcon(FlexIcon.remix.flash3)",
    "Icons.check_circle": "fixIcon(FlexIcon.remix.autoCorrectionCheck)",
    "Icons.radio_button_unchecked": "fixIcon(FlexIcon.remix.roundAnchorPoint)",
    "Icons.close": "fixIcon(FlexIcon.remix.deleteTag)",
    "Icons.calendar_today": "fixIcon(FlexIcon.remix.blankCalendar)",
    "Icons.calendar_month": "fixIcon(FlexIcon.remix.calendarMark)",
    "Icons.email_outlined": "fixIcon(FlexIcon.remix.inbox)",
    "Icons.lock_outline": "fixIcon(FlexIcon.remix.shield1)",
    "Icons.visibility": "fixIcon(FlexIcon.remix.scanner)",
    "Icons.visibility_off": "fixIcon(FlexIcon.remix.scanner)",
    "Icons.security": "fixIcon(FlexIcon.remix.shield1)",
    "Icons.directions_car": "fixIcon(FlexIcon.remix.carTaxi1)",
    "Icons.emergency": "fixIcon(FlexIcon.remix.warningDiamond)",
    "Icons.logout": "fixIcon(FlexIcon.remix.logout1)",
    "Icons.credit_card": "fixIcon(FlexIcon.remix.creditCard4)",
    "Icons.card_giftcard": "fixIcon(FlexIcon.remix.newStickyNote)",
    "Icons.account_balance_wallet": "fixIcon(FlexIcon.remix.wallet)",
    "Icons.alt_route": "fixIcon(FlexIcon.remix.lineArrowRoadmap)",
    "Icons.route": "fixIcon(FlexIcon.remix.lineArrowRoadmap)",
    "Icons.circle_outlined": "fixIcon(FlexIcon.remix.roundAnchorPoint)",
    "Icons.event_seat": "fixIcon(FlexIcon.remix.sofa)",
    "Icons.add_circle": "fixIcon(FlexIcon.remix.applicationAdd)",
    "Icons.navigation": "fixIcon(FlexIcon.remix.locationTarget2)",
    "Icons.qr_code": "fixIcon(FlexIcon.remix.scanner)",
    "Icons.shield": "fixIcon(FlexIcon.remix.shield1)",
    "Icons.directions_transit": "fixIcon(FlexIcon.remix.transferTruckTime)",
    "Icons.settings": "fixIcon(FlexIcon.remix.tuneAdjustVolume)",
}

def process_file(filepath, app_name):
    with open(filepath, 'r') as f:
        content = f.read()

    changed = False
    for k, v in mapping.items():
        if k in content:
            content = content.replace(k, v)
            changed = True
            
    # Also if there's any Icon(...) missing fixIcon, we've replaced Icons.* with fixIcon(...) so the resulting string is Icon(fixIcon(...))
    
    if changed:
        imports = []
        if "import 'package:flexicon/flexicon.dart';" not in content:
            imports.append("import 'package:flexicon/flexicon.dart';")
            
        icon_util_import = f"import 'package:{app_name}/utils/icon_util.dart';"
        if icon_util_import not in content:
            # Check if there is already a relative import to icon_util.dart
            if "icon_util.dart" not in content and "main_layout.dart" not in filepath:
                imports.append(icon_util_import)
                
        if imports:
            # Find the last import line
            lines = content.split('\n')
            last_import_idx = 0
            for i, line in enumerate(lines):
                if line.startswith('import '):
                    last_import_idx = i
            
            for imp in imports:
                lines.insert(last_import_idx + 1, imp)
                
            content = '\n'.join(lines)
            
        with open(filepath, 'w') as f:
            f.write(content)

for root, _, files in os.walk('mobile_fleet/lib'):
    for file in files:
        if file.endswith('.dart'):
            process_file(os.path.join(root, file), 'mobile_fleet')
            
for root, _, files in os.walk('mobile_driver/lib'):
    for file in files:
        if file.endswith('.dart'):
            process_file(os.path.join(root, file), 'mobile_driver')

