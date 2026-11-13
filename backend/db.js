const Database = require('better-sqlite3');
const bcrypt = require('bcryptjs');
const path = require('path');

const db = new Database(path.join(__dirname, 'hospital.db'));
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

db.exec(`
CREATE TABLE IF NOT EXISTS departments (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL UNIQUE,
  head TEXT,
  description TEXT
);

CREATE TABLE IF NOT EXISTS doctors (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  specialization TEXT,
  department_id INTEGER REFERENCES departments(id) ON DELETE SET NULL,
  qualification TEXT,
  experience INTEGER DEFAULT 0,
  fee REAL DEFAULT 0,
  available_days TEXT,
  timings TEXT,
  status TEXT DEFAULT 'Active'
);

CREATE TABLE IF NOT EXISTS patients (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  age INTEGER,
  gender TEXT,
  blood_group TEXT,
  phone TEXT,
  email TEXT,
  address TEXT,
  emergency_contact TEXT,
  allergies TEXT,
  medical_history TEXT,
  registered_on TEXT,
  status TEXT DEFAULT 'Outpatient'
);

CREATE TABLE IF NOT EXISTS appointments (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  patient_id INTEGER NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  doctor_id INTEGER NOT NULL REFERENCES doctors(id) ON DELETE CASCADE,
  date TEXT NOT NULL,
  time TEXT NOT NULL,
  reason TEXT,
  status TEXT DEFAULT 'Scheduled',
  notes TEXT
);

CREATE TABLE IF NOT EXISTS records (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  patient_id INTEGER NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  doctor_id INTEGER REFERENCES doctors(id) ON DELETE SET NULL,
  date TEXT,
  diagnosis TEXT,
  prescription TEXT,
  notes TEXT,
  follow_up TEXT
);

CREATE TABLE IF NOT EXISTS bills (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  patient_id INTEGER NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  date TEXT,
  items TEXT,
  total REAL DEFAULT 0,
  paid REAL DEFAULT 0,
  payment_method TEXT,
  status TEXT DEFAULT 'Unpaid'
);

CREATE TABLE IF NOT EXISTS medicines (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  category TEXT,
  stock INTEGER DEFAULT 0,
  price REAL DEFAULT 0,
  expiry TEXT,
  supplier TEXT
);

CREATE TABLE IF NOT EXISTS beds (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  ward TEXT NOT NULL,
  bed_no TEXT NOT NULL,
  type TEXT DEFAULT 'General',
  status TEXT DEFAULT 'Available',
  patient_id INTEGER REFERENCES patients(id) ON DELETE SET NULL,
  charge REAL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS lab_tests (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  patient_id INTEGER NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  test_name TEXT NOT NULL,
  date TEXT,
  status TEXT DEFAULT 'Pending',
  result TEXT,
  cost REAL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  password TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'receptionist',
  doctor_id INTEGER REFERENCES doctors(id) ON DELETE SET NULL
);
`);

// ---------- Seed demo data (only on first run) ----------
function localDate(offsetDays = 0) {
  const d = new Date();
  d.setDate(d.getDate() + offsetDays);
  const off = d.getTimezoneOffset() * 60000;
  return new Date(d.getTime() - off).toISOString().slice(0, 10);
}

function seed() {
  const hasData = db.prepare('SELECT COUNT(*) AS c FROM users').get().c > 0;
  if (hasData) return;

  const insert = (sql, rows) => {
    const st = db.prepare(sql);
    rows.forEach(r => st.run(...r));
  };

  insert('INSERT INTO departments (name, head, description) VALUES (?,?,?)', [
    ['Cardiology', 'Dr. Aarav Mehta', 'Heart and cardiovascular care'],
    ['Neurology', 'Dr. Sneha Kapoor', 'Brain, spine and nervous system'],
    ['Orthopedics', 'Dr. Rohit Sharma', 'Bones, joints and muscles'],
    ['Pediatrics', 'Dr. Neha Gupta', 'Child health and development'],
    ['Dermatology', 'Dr. Kabir Singh', 'Skin, hair and nails'],
    ['General Medicine', 'Dr. Priya Nair', 'Primary care and internal medicine'],
    ['Gynecology', 'Dr. Anjali Verma', "Women's health and maternity"],
    ['Emergency', 'Dr. Vikram Rao', '24x7 emergency and trauma care']
  ]);

  insert(`INSERT INTO doctors (name,email,phone,specialization,department_id,qualification,experience,fee,available_days,timings,status)
          VALUES (?,?,?,?,?,?,?,?,?,?,?)`, [
    ['Dr. Aarav Mehta', 'aarav@cityhospital.com', '9876500001', 'Cardiologist', 1, 'MBBS, MD, DM Cardiology', 15, 800, 'Mon,Tue,Wed,Fri', '09:00 - 14:00', 'Active'],
    ['Dr. Sneha Kapoor', 'sneha@cityhospital.com', '9876500002', 'Neurologist', 2, 'MBBS, MD, DM Neurology', 12, 900, 'Mon,Wed,Thu,Sat', '10:00 - 16:00', 'Active'],
    ['Dr. Rohit Sharma', 'rohit@cityhospital.com', '9876500003', 'Orthopedic Surgeon', 3, 'MBBS, MS Ortho', 10, 700, 'Tue,Thu,Fri,Sat', '09:00 - 15:00', 'Active'],
    ['Dr. Neha Gupta', 'neha@cityhospital.com', '9876500004', 'Pediatrician', 4, 'MBBS, MD Pediatrics', 8, 500, 'Mon,Tue,Wed,Thu,Fri', '09:00 - 17:00', 'Active'],
    ['Dr. Kabir Singh', 'kabir@cityhospital.com', '9876500005', 'Dermatologist', 5, 'MBBS, MD Dermatology', 7, 600, 'Mon,Wed,Fri', '11:00 - 17:00', 'Active'],
    ['Dr. Priya Nair', 'priya@cityhospital.com', '9876500006', 'General Physician', 6, 'MBBS, MD Medicine', 9, 400, 'Mon,Tue,Wed,Thu,Fri,Sat', '09:00 - 18:00', 'Active'],
    ['Dr. Anjali Verma', 'anjali@cityhospital.com', '9876500007', 'Gynecologist', 7, 'MBBS, MS OBG', 14, 750, 'Tue,Thu,Sat', '10:00 - 15:00', 'Active'],
    ['Dr. Vikram Rao', 'vikram@cityhospital.com', '9876500008', 'Emergency Physician', 8, 'MBBS, MD Emergency Medicine', 11, 1000, 'Mon,Tue,Wed,Thu,Fri,Sat,Sun', '24x7', 'On Leave']
  ]);

  const today = localDate(0);
  insert(`INSERT INTO patients (name,age,gender,blood_group,phone,email,address,emergency_contact,allergies,medical_history,registered_on,status)
          VALUES (?,?,?,?,?,?,?,?,?,?,?,?)`, [
    ['Rahul Verma', 34, 'Male', 'B+', '9810011001', 'rahul@mail.com', 'Model Town, Ludhiana', '9810011099', 'Penicillin', 'Hypertension', localDate(-60), 'Outpatient'],
    ['Simran Kaur', 28, 'Female', 'O+', '9810011002', 'simran@mail.com', 'Sarabha Nagar, Ludhiana', '9810011098', 'None', 'Asthma', localDate(-45), 'Outpatient'],
    ['Amit Patel', 52, 'Male', 'A+', '9810011003', 'amit@mail.com', 'BRS Nagar, Ludhiana', '9810011097', 'Dust', 'Diabetes Type 2, Heart disease', localDate(-30), 'Admitted'],
    ['Priya Singh', 8, 'Female', 'AB+', '9810011004', 'parent.priya@mail.com', 'Civil Lines, Ludhiana', '9810011096', 'Peanuts', 'Frequent fever', localDate(-20), 'Outpatient'],
    ['Harpreet Gill', 45, 'Male', 'O-', '9810011005', 'harpreet@mail.com', 'Dugri, Ludhiana', '9810011095', 'None', 'Knee injury', localDate(-15), 'Admitted'],
    ['Meera Joshi', 61, 'Female', 'A-', '9810011006', 'meera@mail.com', 'Pakhowal Road, Ludhiana', '9810011094', 'Sulfa drugs', 'Arthritis, Migraine', localDate(-12), 'Outpatient'],
    ['Karan Malhotra', 30, 'Male', 'B-', '9810011007', 'karan@mail.com', 'Ferozepur Road, Ludhiana', '9810011093', 'None', 'Skin allergy', localDate(-8), 'Outpatient'],
    ['Anita Sharma', 26, 'Female', 'O+', '9810011008', 'anita@mail.com', 'Haibowal, Ludhiana', '9810011092', 'None', 'Pregnancy (6 months)', localDate(-5), 'Outpatient'],
    ['Suresh Kumar', 67, 'Male', 'A+', '9810011009', 'suresh@mail.com', 'Jamalpur, Ludhiana', '9810011091', 'Aspirin', 'COPD', localDate(-3), 'Admitted'],
    ['Divya Rani', 22, 'Female', 'B+', '9810011010', 'divya@mail.com', 'Kitchlu Nagar, Ludhiana', '9810011090', 'None', 'None', localDate(-1), 'Outpatient']
  ]);

  insert('INSERT INTO appointments (patient_id,doctor_id,date,time,reason,status,notes) VALUES (?,?,?,?,?,?,?)', [
    [1, 1, localDate(-3), '10:00', 'BP follow-up', 'Completed', 'BP under control'],
    [2, 6, localDate(-2), '11:30', 'Cough and breathlessness', 'Completed', ''],
    [3, 1, today, '09:30', 'Chest pain evaluation', 'Scheduled', 'ECG required'],
    [4, 4, today, '10:00', 'Fever for 3 days', 'Scheduled', ''],
    [5, 3, today, '11:00', 'Knee pain review', 'Scheduled', 'Bring X-ray'],
    [6, 2, today, '12:00', 'Migraine', 'Completed', ''],
    [7, 5, today, '14:00', 'Skin rash', 'Scheduled', ''],
    [8, 7, localDate(1), '10:30', 'Prenatal checkup', 'Scheduled', ''],
    [9, 6, localDate(1), '09:00', 'Breathing difficulty', 'Scheduled', ''],
    [10, 6, localDate(2), '15:00', 'General checkup', 'Scheduled', ''],
    [1, 1, localDate(5), '10:00', 'Routine check', 'Scheduled', ''],
    [2, 6, localDate(-1), '16:00', 'Follow-up', 'Cancelled', 'Patient requested cancel'],
    [6, 3, localDate(3), '13:00', 'Joint pain', 'Scheduled', ''],
    [4, 4, localDate(-6), '10:00', 'Vaccination', 'Completed', '']
  ]);

  insert('INSERT INTO records (patient_id,doctor_id,date,diagnosis,prescription,notes,follow_up) VALUES (?,?,?,?,?,?,?)', [
    [1, 1, localDate(-3), 'Essential hypertension', 'Amlodipine 5mg - once daily\nTelmisartan 40mg - once daily', 'Reduce salt intake, walk 30 mins daily', localDate(27)],
    [2, 6, localDate(-2), 'Mild asthma exacerbation', 'Salbutamol inhaler - SOS\nMontelukast 10mg - at night', 'Avoid dust and cold air', localDate(12)],
    [6, 2, today, 'Chronic migraine', 'Sumatriptan 50mg - at onset\nPropranolol 20mg - twice daily', 'Maintain sleep schedule', localDate(30)],
    [4, 4, localDate(-6), 'Routine vaccination', 'Paracetamol syrup if fever', 'MMR dose given', localDate(180)]
  ]);

  insert('INSERT INTO bills (patient_id,date,items,total,paid,payment_method,status) VALUES (?,?,?,?,?,?,?)', [
    [1, localDate(-3), JSON.stringify([{ description: 'Consultation - Cardiology', qty: 1, price: 800 }, { description: 'ECG', qty: 1, price: 350 }]), 1150, 1150, 'UPI', 'Paid'],
    [2, localDate(-2), JSON.stringify([{ description: 'Consultation - General Medicine', qty: 1, price: 400 }, { description: 'Chest X-Ray', qty: 1, price: 600 }]), 1000, 500, 'Cash', 'Partial'],
    [3, localDate(-1), JSON.stringify([{ description: 'ICU Bed (2 days)', qty: 2, price: 5000 }, { description: 'Medicines', qty: 1, price: 2400 }]), 12400, 0, '', 'Unpaid'],
    [6, today, JSON.stringify([{ description: 'Consultation - Neurology', qty: 1, price: 900 }]), 900, 900, 'Card', 'Paid'],
    [4, localDate(-6), JSON.stringify([{ description: 'Consultation - Pediatrics', qty: 1, price: 500 }, { description: 'MMR Vaccine', qty: 1, price: 900 }]), 1400, 1400, 'Cash', 'Paid']
  ]);

  insert('INSERT INTO medicines (name,category,stock,price,expiry,supplier) VALUES (?,?,?,?,?,?)', [
    ['Paracetamol 500mg', 'Analgesic', 500, 2.5, '2027-08-30', 'MediSupply Co.'],
    ['Amoxicillin 250mg', 'Antibiotic', 220, 8, '2027-03-15', 'PharmaCare Ltd.'],
    ['Amlodipine 5mg', 'Cardiac', 300, 4, '2027-11-01', 'HeartMeds Inc.'],
    ['Metformin 500mg', 'Antidiabetic', 18, 3.5, '2027-05-20', 'PharmaCare Ltd.'],
    ['Salbutamol Inhaler', 'Respiratory', 45, 120, '2027-01-10', 'BreathWell'],
    ['Cetirizine 10mg', 'Antihistamine', 400, 1.5, '2027-09-09', 'MediSupply Co.'],
    ['Omeprazole 20mg', 'Antacid', 12, 5, '2026-12-20', 'GastroPharma'],
    ['Insulin Glargine', 'Antidiabetic', 60, 650, '2026-12-01', 'DiabeCare'],
    ['Ibuprofen 400mg', 'Analgesic', 350, 3, '2027-06-18', 'MediSupply Co.'],
    ['Azithromycin 500mg', 'Antibiotic', 150, 22, '2027-02-27', 'PharmaCare Ltd.'],
    ['Atorvastatin 10mg', 'Cardiac', 8, 9, '2027-04-04', 'HeartMeds Inc.'],
    ['ORS Sachet', 'Supplement', 600, 12, '2027-10-10', 'HydraLife']
  ]);

  const beds = [];
  for (let i = 1; i <= 6; i++) beds.push(['General Ward', 'G-' + String(i).padStart(2, '0'), 'General', 'Available', null, 1000]);
  for (let i = 1; i <= 4; i++) beds.push(['Private Ward', 'P-' + String(i).padStart(2, '0'), 'Private', 'Available', null, 2500]);
  for (let i = 1; i <= 4; i++) beds.push(['ICU', 'ICU-' + String(i).padStart(2, '0'), 'ICU', 'Available', null, 5000]);
  for (let i = 1; i <= 2; i++) beds.push(['Maternity', 'M-' + String(i).padStart(2, '0'), 'Maternity', 'Available', null, 3000]);
  insert('INSERT INTO beds (ward,bed_no,type,status,patient_id,charge) VALUES (?,?,?,?,?,?)', beds);
  db.prepare("UPDATE beds SET status='Occupied', patient_id=3 WHERE bed_no='ICU-01'").run();
  db.prepare("UPDATE beds SET status='Occupied', patient_id=5 WHERE bed_no='G-01'").run();
  db.prepare("UPDATE beds SET status='Occupied', patient_id=9 WHERE bed_no='P-01'").run();
  db.prepare("UPDATE beds SET status='Maintenance' WHERE bed_no='G-06'").run();

  insert('INSERT INTO lab_tests (patient_id,test_name,date,status,result,cost) VALUES (?,?,?,?,?,?)', [
    [3, 'Complete Blood Count (CBC)', localDate(-1), 'Completed', 'Hb 12.8 g/dL, WBC 9,200 - Normal', 350],
    [3, 'HbA1c', localDate(-1), 'Completed', '7.9% - Above target', 500],
    [1, 'Lipid Profile', localDate(-3), 'Completed', 'LDL 142 mg/dL - Borderline high', 700],
    [2, 'Chest X-Ray', localDate(-2), 'Completed', 'No consolidation', 600],
    [5, 'Knee MRI', today, 'In Progress', '', 4500],
    [7, 'Skin Allergy Panel', today, 'Pending', '', 1800]
  ]);

  insert('INSERT INTO users (name,email,password,role,doctor_id) VALUES (?,?,?,?,?)', [
    ['System Admin', 'admin@hospital.com', bcrypt.hashSync('admin123', 10), 'admin', null],
    ['Dr. Aarav Mehta', 'doctor@hospital.com', bcrypt.hashSync('doctor123', 10), 'doctor', 1],
    ['Front Desk', 'reception@hospital.com', bcrypt.hashSync('reception123', 10), 'receptionist', null]
  ]);

  console.log('Demo data inserted.');
}

seed();

module.exports = db;
module.exports.localDate = localDate;
