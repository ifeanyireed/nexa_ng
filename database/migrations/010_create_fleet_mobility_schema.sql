-- ==============================================================================
-- MIGRATION 010: Fleet Mobility, Routine Inspections, Compliance & Repairs Schema
-- Target Database: Neon PostgreSQL
-- Multi-Tenant Isolation: Strictly partitioned by tenant_slug with composite indexes
-- ==============================================================================

-- 1. FLEET VEHICLES
CREATE TABLE IF NOT EXISTS fleet_vehicles (
    id VARCHAR(191) PRIMARY KEY,
    tenant_slug VARCHAR(191) NOT NULL,
    plate_number VARCHAR(50) NOT NULL,
    vehicle_type VARCHAR(100) NOT NULL DEFAULT 'Hiace Bus',
    make_model VARCHAR(191) NOT NULL,
    year INT DEFAULT 2020,
    region VARCHAR(100) NOT NULL DEFAULT 'Headquarters',
    assigned_driver_name VARCHAR(191) DEFAULT 'Unassigned',
    assigned_driver_phone VARCHAR(50) DEFAULT '',
    assigned_driver_lasdri BOOLEAN DEFAULT FALSE,
    operational_status VARCHAR(50) NOT NULL DEFAULT 'Operational', -- 'Operational', 'In Workshop', 'Grounded (Papers Expired)', 'Inspection Due'
    current_odometer INT DEFAULT 0,
    fuel_target_km_per_litre NUMERIC(5,2) DEFAULT 8.0,
    total_maintenance_cost NUMERIC(12,2) DEFAULT 0,
    open_repairs_count INT DEFAULT 0,
    last_routine_inspection_json JSONB DEFAULT NULL,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_fleet_vehicles_tenant_plate UNIQUE (tenant_slug, plate_number)
);

CREATE INDEX IF NOT EXISTS idx_fleet_veh_tenant ON fleet_vehicles(tenant_slug);
CREATE INDEX IF NOT EXISTS idx_fleet_veh_region ON fleet_vehicles(tenant_slug, region);
CREATE INDEX IF NOT EXISTS idx_fleet_veh_status ON fleet_vehicles(tenant_slug, operational_status);
CREATE INDEX IF NOT EXISTS idx_fleet_veh_driver ON fleet_vehicles(tenant_slug, assigned_driver_name);

-- 2. FLEET PAPERS & COMPLIANCE EXPIRY TRACKER
CREATE TABLE IF NOT EXISTS fleet_papers (
    id VARCHAR(191) PRIMARY KEY,
    tenant_slug VARCHAR(191) NOT NULL,
    vehicle_id VARCHAR(191) NOT NULL REFERENCES fleet_vehicles(id) ON DELETE CASCADE,
    vehicle_plate VARCHAR(50) NOT NULL,
    paper_type VARCHAR(50) NOT NULL, -- 'vehicleLicense', 'insurance', 'roadWorthiness', 'hackney', 'custom'
    paper_name VARCHAR(100) NOT NULL,
    doc_ref_number VARCHAR(100) DEFAULT '',
    renewed_date DATE NOT NULL,
    expiring_date DATE NOT NULL,
    days_remaining INT DEFAULT 0,
    status VARCHAR(50) NOT NULL DEFAULT 'Valid', -- 'Valid', 'Expiring Soon', 'Expired'
    renewal_amount NUMERIC(12,2) DEFAULT 0,
    document_url TEXT DEFAULT NULL,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_fleet_papers_vehicle_type UNIQUE (tenant_slug, vehicle_id, paper_type)
);

CREATE INDEX IF NOT EXISTS idx_fleet_papers_tenant ON fleet_papers(tenant_slug);
CREATE INDEX IF NOT EXISTS idx_fleet_papers_vehicle ON fleet_papers(tenant_slug, vehicle_id);
CREATE INDEX IF NOT EXISTS idx_fleet_papers_status ON fleet_papers(tenant_slug, status);
CREATE INDEX IF NOT EXISTS idx_fleet_papers_expiry ON fleet_papers(tenant_slug, expiring_date);

-- 3. ROUTINE INSPECTIONS (Strict Non-Repair Safety Audits)
CREATE TABLE IF NOT EXISTS routine_inspections (
    id VARCHAR(191) PRIMARY KEY,
    tenant_slug VARCHAR(191) NOT NULL,
    vehicle_id VARCHAR(191) NOT NULL REFERENCES fleet_vehicles(id) ON DELETE CASCADE,
    vehicle_plate VARCHAR(50) NOT NULL,
    inspector_name VARCHAR(191) NOT NULL,
    inspection_date DATE NOT NULL,
    inspection_type VARCHAR(100) NOT NULL DEFAULT 'Non-Repair Pre-Trip Audit',
    odometer_reading_km INT DEFAULT 0,
    fuel_level VARCHAR(50) NOT NULL DEFAULT 'Full', -- '1/4', '1/2', '3/4', 'Full'
    body_condition VARCHAR(50) NOT NULL DEFAULT 'Clean',
    tires_condition VARCHAR(50) NOT NULL DEFAULT 'Good',
    fluids_level VARCHAR(50) NOT NULL DEFAULT 'Optimal',
    lights_condition VARCHAR(50) NOT NULL DEFAULT 'All Working',
    brakes_condition VARCHAR(50) NOT NULL DEFAULT 'Responsive',
    checklist_json JSONB DEFAULT NULL,
    overall_status VARCHAR(50) NOT NULL DEFAULT 'Passed', -- 'Passed', 'Failed', 'Defect Flagged'
    findings_notes TEXT DEFAULT NULL,
    notes TEXT DEFAULT NULL,
    escalated_to_repair BOOLEAN DEFAULT FALSE,
    escalated_to_repair_id VARCHAR(191) DEFAULT NULL,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_inspections_tenant ON routine_inspections(tenant_slug);
CREATE INDEX IF NOT EXISTS idx_inspections_vehicle ON routine_inspections(tenant_slug, vehicle_id);
CREATE INDEX IF NOT EXISTS idx_inspections_plate ON routine_inspections(tenant_slug, vehicle_plate);
CREATE INDEX IF NOT EXISTS idx_inspections_date ON routine_inspections(tenant_slug, inspection_date);
CREATE INDEX IF NOT EXISTS idx_inspections_status ON routine_inspections(tenant_slug, overall_status);

-- 4. MAINTENANCE REPAIRS & WORKSHOP TAT TRACKER
CREATE TABLE IF NOT EXISTS maintenance_repairs (
    id VARCHAR(191) PRIMARY KEY,
    tenant_slug VARCHAR(191) NOT NULL,
    vehicle_id VARCHAR(191) NOT NULL REFERENCES fleet_vehicles(id) ON DELETE CASCADE,
    vehicle_plate VARCHAR(50) NOT NULL,
    work_order_number VARCHAR(100) DEFAULT NULL,
    part_name VARCHAR(255) NOT NULL,
    category VARCHAR(100) NOT NULL DEFAULT 'Preventive Service', -- 'Engine & Powertrain', 'Brakes & Suspension', 'Electrical & Battery', 'Tires & Wheels', 'Transmission', 'Body & Paint', 'Preventive Service'
    damaged_date DATE NOT NULL,
    repaired_date DATE DEFAULT NULL,
    turnaround_time_days INT DEFAULT NULL,
    cost_amount NUMERIC(12,2) NOT NULL DEFAULT 0,
    workshop_vendor VARCHAR(191) NOT NULL,
    driver_at_fault VARCHAR(191) DEFAULT NULL,
    mechanic_notes TEXT DEFAULT NULL,
    remark TEXT DEFAULT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'In Workshop', -- 'In Workshop', 'Repaired & Cleared', 'Pending Approval', 'Awaiting Parts'
    jcc_signed_off BOOLEAN DEFAULT FALSE,
    origin_inspection_id VARCHAR(191) DEFAULT NULL,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_repairs_tenant ON maintenance_repairs(tenant_slug);
CREATE INDEX IF NOT EXISTS idx_repairs_vehicle ON maintenance_repairs(tenant_slug, vehicle_id);
CREATE INDEX IF NOT EXISTS idx_repairs_plate ON maintenance_repairs(tenant_slug, vehicle_plate);
CREATE INDEX IF NOT EXISTS idx_repairs_status ON maintenance_repairs(tenant_slug, status);
CREATE INDEX IF NOT EXISTS idx_repairs_category ON maintenance_repairs(tenant_slug, category);
CREATE INDEX IF NOT EXISTS idx_repairs_damaged_date ON maintenance_repairs(tenant_slug, damaged_date);

-- 5. FLEET DRIVERS (Roster & Certifications)
CREATE TABLE IF NOT EXISTS fleet_drivers (
    id VARCHAR(191) PRIMARY KEY,
    tenant_slug VARCHAR(191) NOT NULL,
    name VARCHAR(191) NOT NULL,
    phone VARCHAR(50) DEFAULT '',
    assigned_plate VARCHAR(50) DEFAULT NULL,
    assigned_vehicle_type VARCHAR(100) DEFAULT NULL,
    region VARCHAR(100) DEFAULT 'General',
    license_number VARCHAR(100) DEFAULT '',
    license_expiry VARCHAR(50) DEFAULT '',
    lasdri_certified BOOLEAN DEFAULT FALSE,
    status VARCHAR(50) DEFAULT 'Active',
    assigned_date DATE DEFAULT NULL,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_fleet_drivers_tenant_name UNIQUE (tenant_slug, name)
);

CREATE INDEX IF NOT EXISTS idx_fleet_drivers_tenant ON fleet_drivers(tenant_slug);
CREATE INDEX IF NOT EXISTS idx_fleet_drivers_plate ON fleet_drivers(tenant_slug, assigned_plate);
