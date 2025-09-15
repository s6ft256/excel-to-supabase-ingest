// Helper functions to parse Excel data and generate SQL INSERT statements

export function excelDateToJSDate(excelDate: number): string {
  // Excel date serial number to JavaScript Date
  const utc_days = Math.floor(excelDate - 25569);
  const utc_value = utc_days * 86400; 
  const date_info = new Date(utc_value * 1000);
  const fractional_day = excelDate - Math.floor(excelDate) + 0.0000001;
  let total_seconds = Math.floor(86400 * fractional_day);
  const seconds = total_seconds % 60;
  total_seconds -= seconds;
  const hours = Math.floor(total_seconds / (60 * 60));
  const minutes = Math.floor(total_seconds / 60) % 60;
  
  return new Date(date_info.getFullYear(), date_info.getMonth(), date_info.getDate(), hours, minutes, seconds)
    .toISOString().split('T')[0];
}

export interface ParsedIncident {
  date: string;
  contractor: string;
  activity?: string;
  description?: string;
  severity_level?: number;
  type?: string;
}

export interface ParsedInspection {
  date: string;
  score?: number;
  type?: string;
  inspector?: string;
}

export interface ParsedTrainingSession {
  date: string;
  topic?: string;
  type?: 'internal' | 'external';
  no_of_attendees?: number;
  conductor?: string;
}

// Sample data based on Excel analysis - this would be populated from actual Excel parsing
export const sampleData = {
  contractors: [
    { username: 'trojan_general', company: 'Trojan General Contracting', role: 'contractor' },
    { username: 'bijay_pandit', company: 'Bijay Pandit Contracting', role: 'contractor' },
    { username: 'chandan_kumar', company: 'Chandan Kumar Services', role: 'contractor' },
  ],
  
  incidents: [
    {
      date: '2025-01-03',
      contractor: 'Trojan General Contracting',
      activity: 'Hand / Power Tools use',
      description: 'Finger injury during tool operation',
      severity_level: 2,
      type: 'First Aid Case'
    },
    {
      date: '2025-01-10',
      contractor: 'Trojan General Contracting',
      activity: 'Housekeeping',
      description: 'Slip hazard incident',
      severity_level: 1,
      type: 'Near Miss'
    },
    {
      date: '2025-03-07',
      contractor: 'Trojan General Contracting',
      activity: 'Manual Handling',
      description: 'Back strain from lifting',
      severity_level: 3,
      type: 'Medical Treatment Case'
    },
    {
      date: '2025-03-21',
      contractor: 'Bijay Pandit Contracting',
      activity: 'Environmental Conditions',
      description: 'Heat-related incident',
      severity_level: 2,
      type: 'First Aid Case'
    }
  ] as ParsedIncident[],
  
  inspections: [
    {
      date: '2025-01-03',
      score: 90.0,
      type: 'Weekly Safety Inspection',
      inspector: 'HSE Manager'
    },
    {
      date: '2025-01-10',
      score: 85.5,
      type: 'Weekly Safety Inspection',
      inspector: 'HSE Manager'
    },
    {
      date: '2025-02-15',
      score: 92.3,
      type: 'Monthly Audit',
      inspector: 'External Auditor'
    }
  ] as ParsedInspection[],
  
  trainingSessions: [
    {
      date: '2025-01-15',
      topic: 'Hand Tool Safety',
      type: 'internal' as const,
      no_of_attendees: 25,
      conductor: 'Safety Officer'
    },
    {
      date: '2025-02-01',
      topic: 'Emergency Response Procedures',
      type: 'external' as const,
      no_of_attendees: 40,
      conductor: 'Fire Safety Consultant'
    },
    {
      date: '2025-02-15',
      topic: 'Manual Handling Techniques',
      type: 'internal' as const,
      no_of_attendees: 30,
      conductor: 'Occupational Health Specialist'
    }
  ] as ParsedTrainingSession[]
};

export function parseExcelData() {
  const { incidents, inspections, trainingSessions } = sampleData;
  
  return {
    incidents: incidents.map(incident => ({
      date: incident.date,
      activity: incident.activity,
      description: incident.description,
      severity_level: incident.severity_level,
      type: incident.type
    })),
    incident_details: [], // No incident details in sample data
    inspections: inspections.map(inspection => ({
      date: inspection.date,
      score: inspection.score,
      type: inspection.type,
      inspector: inspection.inspector
    })),
    training_sessions: trainingSessions.map(session => ({
      date: session.date,
      topic: session.topic,
      type: session.type,
      no_of_attendees: session.no_of_attendees,
      conductor: session.conductor
    }))
  };
}

export function generateSQLInserts() {
  const { contractors, incidents, inspections, trainingSessions } = sampleData;
  
  let sql = '-- HSE Statistics Data Import\n\n';
  
  // Generate contractor profiles
  sql += '-- Insert contractor profiles\n';
  contractors.forEach(contractor => {
    sql += `INSERT INTO public.profiles (user_id, username, role, company) VALUES (gen_random_uuid(), '${contractor.username}', '${contractor.role}', '${contractor.company}');\n`;
  });
  
  sql += '\n-- Insert incidents\n';
  incidents.forEach(incident => {
    const contractorId = `(SELECT id FROM public.profiles WHERE company = '${incident.contractor}' LIMIT 1)`;
    sql += `INSERT INTO public.incidents (date, contractor_id, activity, description, severity_level, type) VALUES ('${incident.date}', ${contractorId}, '${incident.activity}', '${incident.description}', ${incident.severity_level}, '${incident.type}');\n`;
  });
  
  sql += '\n-- Insert inspections\n';
  inspections.forEach(inspection => {
    sql += `INSERT INTO public.inspections (date, score, type, inspector) VALUES ('${inspection.date}', ${inspection.score}, '${inspection.type}', '${inspection.inspector}');\n`;
  });
  
  sql += '\n-- Insert training sessions\n';
  trainingSessions.forEach(session => {
    sql += `INSERT INTO public.training_sessions (date, topic, type, no_of_attendees, conductor) VALUES ('${session.date}', '${session.topic}', '${session.type}', ${session.no_of_attendees}, '${session.conductor}');\n`;
  });
  
  return sql;
}