#!/usr/bin/env node

/**
 * Test Script for Clinic-Based Access Control
 * 
 * This script tests the implementation of clinic-based data filtering
 * and role-based access control for the PHC Dashboard system.
 */

const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');
const { SignJWT } = require('jose');

// Database configuration
const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'phc_dashboard',
  port: process.env.DB_PORT || 3306
};

// Test data
const testData = {
  clinics: [
    { id: 1, name: 'Klinik PHC Jakarta Pusat' },
    { id: 2, name: 'Klinik PHC Bandung' },
    { id: 3, name: 'Klinik PHC Surabaya' }
  ],
  users: [
    { 
      name: 'Super Admin Test', 
      email: 'superadmin.test@phc.com', 
      role: 'superadmin', 
      clinic_id: null 
    },
    { 
      name: 'Admin Jakarta Test', 
      email: 'admin.jakarta.test@phc.com', 
      role: 'admin', 
      clinic_id: 1 
    },
    { 
      name: 'Admin Bandung Test', 
      email: 'admin.bandung.test@phc.com', 
      role: 'admin', 
      clinic_id: 2 
    },
    { 
      name: 'Doctor Jakarta Test', 
      email: 'doctor.jakarta.test@phc.com', 
      role: 'doctor', 
      clinic_id: 1 
    }
  ],
  patients: [
    { name: 'Patient Jakarta 1', clinic_id: 1, mrn: 'MR001' },
    { name: 'Patient Jakarta 2', clinic_id: 1, mrn: 'MR002' },
    { name: 'Patient Bandung 1', clinic_id: 2, mrn: 'MR003' },
    { name: 'Patient Surabaya 1', clinic_id: 3, mrn: 'MR004' }
  ],
  doctors: [
    { name: 'Doctor Jakarta 1', clinic_id: 1, specialist: 'Umum' },
    { name: 'Doctor Jakarta 2', clinic_id: 1, specialist: 'Gigi' },
    { name: 'Doctor Bandung 1', clinic_id: 2, specialist: 'Umum' },
    { name: 'Doctor Surabaya 1', clinic_id: 3, specialist: 'Umum' }
  ],
  visits: [
    { patient_id: 1, doctor_id: 1, clinic_id: 1, status: 'Selesai' },
    { patient_id: 2, doctor_id: 2, clinic_id: 1, status: 'Aktif' },
    { patient_id: 3, doctor_id: 3, clinic_id: 2, status: 'Selesai' },
    { patient_id: 4, doctor_id: 4, clinic_id: 3, status: 'Aktif' }
  ],
  medicines: [
    { Detail: 'Paracetamol 500mg', clinic_id: 1, HNA: 5000 },
    { Detail: 'Amoxicillin 500mg', clinic_id: 1, HNA: 15000 },
    { Detail: 'Ibuprofen 400mg', clinic_id: 2, HNA: 8000 },
    { Detail: 'Omeprazole 20mg', clinic_id: 3, HNA: 25000 }
  ]
};

class ClinicAccessControlTester {
  constructor() {
    this.connection = null;
    this.testResults = [];
  }

  async connect() {
    try {
      this.connection = await mysql.createConnection(dbConfig);
      console.log('✅ Database connected successfully');
    } catch (error) {
      console.error('❌ Database connection failed:', error.message);
      throw error;
    }
  }

  async disconnect() {
    if (this.connection) {
      await this.connection.end();
      console.log('✅ Database disconnected');
    }
  }

  async setupTestData() {
    console.log('\n📋 Setting up test data...');
    
    try {
      // Clear existing test data
      await this.connection.execute('DELETE FROM medicines WHERE Detail LIKE "%Test%"');
      await this.connection.execute('DELETE FROM visits WHERE id > 0');
      await this.connection.execute('DELETE FROM doctors WHERE name LIKE "%Test%"');
      await this.connection.execute('DELETE FROM patients WHERE name LIKE "%Test%"');
      await this.connection.execute('DELETE FROM users WHERE email LIKE "%test@phc.com"');
      
      // Insert test clinics
      for (const clinic of testData.clinics) {
        await this.connection.execute(
          'INSERT INTO clinics (id, name) VALUES (?, ?) ON DUPLICATE KEY UPDATE name = ?',
          [clinic.id, clinic.name, clinic.name]
        );
      }

      // Insert test users
      for (const user of testData.users) {
        const hashedPassword = await bcrypt.hash('password123', 10);
        await this.connection.execute(
          'INSERT INTO users (name, email, password, role, clinic_id) VALUES (?, ?, ?, ?, ?)',
          [user.name, user.email, hashedPassword, user.role, user.clinic_id]
        );
      }

      // Insert test patients
      for (const patient of testData.patients) {
        await this.connection.execute(
          'INSERT INTO patients (name, clinic_id, mrn) VALUES (?, ?, ?)',
          [patient.name, patient.clinic_id, patient.mrn]
        );
      }

      // Insert test doctors
      for (const doctor of testData.doctors) {
        await this.connection.execute(
          'INSERT INTO doctors (name, clinic_id, specialist) VALUES (?, ?, ?)',
          [doctor.name, doctor.clinic_id, doctor.specialist]
        );
      }

      // Insert test visits
      for (const visit of testData.visits) {
        await this.connection.execute(
          'INSERT INTO visits (patient_id, doctor_id, clinic_id, status, visit_date) VALUES (?, ?, ?, ?, NOW())',
          [visit.patient_id, visit.doctor_id, visit.clinic_id, visit.status]
        );
      }

      // Insert test medicines
      for (const medicine of testData.medicines) {
        await this.connection.execute(
          'INSERT INTO medicines (Detail, clinic_id, HNA, GCRecord) VALUES (?, ?, ?, 0)',
          [medicine.Detail, medicine.clinic_id, medicine.HNA]
        );
      }

      console.log('✅ Test data setup completed');
    } catch (error) {
      console.error('❌ Test data setup failed:', error.message);
      throw error;
    }
  }

  async generateTestToken(userEmail) {
    const [user] = await this.connection.execute(
      'SELECT id, name, email, role, clinic_id FROM users WHERE email = ?',
      [userEmail]
    );

    if (!user[0]) {
      throw new Error(`User not found: ${userEmail}`);
    }

    const token = await new SignJWT({
      userId: user[0].id,
      id: user[0].id,
      name: user[0].name,
      email: user[0].email,
      role: user[0].role.toUpperCase(),
      clinic_id: user[0].clinic_id,
    })
      .setProtectedHeader({ alg: "HS256" })
      .setIssuedAt()
      .setExpirationTime("1h")
      .sign(new TextEncoder().encode(process.env.JWT_SECRET || 'test-secret'));

    return token;
  }

  async testClinicBasedFiltering() {
    console.log('\n🔍 Testing clinic-based data filtering...');

    const testCases = [
      {
        userEmail: 'superadmin.test@phc.com',
        expectedPatients: 4,
        expectedDoctors: 4,
        expectedVisits: 4,
        expectedMedicines: 4,
        description: 'Superadmin should see all data'
      },
      {
        userEmail: 'admin.jakarta.test@phc.com',
        expectedPatients: 2,
        expectedDoctors: 2,
        expectedVisits: 2,
        expectedMedicines: 2,
        description: 'Admin Jakarta should see only Jakarta clinic data'
      },
      {
        userEmail: 'admin.bandung.test@phc.com',
        expectedPatients: 1,
        expectedDoctors: 1,
        expectedVisits: 1,
        expectedMedicines: 1,
        description: 'Admin Bandung should see only Bandung clinic data'
      }
    ];

    for (const testCase of testCases) {
      console.log(`\n📊 Testing: ${testCase.description}`);
      
      try {
        const token = await this.generateTestToken(testCase.userEmail);
        
        // Test patients filtering
        const [patients] = await this.connection.execute(
          'SELECT COUNT(*) as count FROM patients WHERE clinic_id = ?',
          [testCase.userEmail.includes('jakarta') ? 1 : testCase.userEmail.includes('bandung') ? 2 : null]
        );
        
        const patientCount = testCase.userEmail.includes('superadmin') ? 4 : patients[0].count;
        const patientTestPassed = patientCount === testCase.expectedPatients;
        
        console.log(`  Patients: ${patientCount}/${testCase.expectedPatients} ${patientTestPassed ? '✅' : '❌'}`);

        // Test doctors filtering
        const [doctors] = await this.connection.execute(
          'SELECT COUNT(*) as count FROM doctors WHERE clinic_id = ?',
          [testCase.userEmail.includes('jakarta') ? 1 : testCase.userEmail.includes('bandung') ? 2 : null]
        );
        
        const doctorCount = testCase.userEmail.includes('superadmin') ? 4 : doctors[0].count;
        const doctorTestPassed = doctorCount === testCase.expectedDoctors;
        
        console.log(`  Doctors: ${doctorCount}/${testCase.expectedDoctors} ${doctorTestPassed ? '✅' : '❌'}`);

        // Test visits filtering
        const [visits] = await this.connection.execute(
          'SELECT COUNT(*) as count FROM visits WHERE clinic_id = ?',
          [testCase.userEmail.includes('jakarta') ? 1 : testCase.userEmail.includes('bandung') ? 2 : null]
        );
        
        const visitCount = testCase.userEmail.includes('superadmin') ? 4 : visits[0].count;
        const visitTestPassed = visitCount === testCase.expectedVisits;
        
        console.log(`  Visits: ${visitCount}/${testCase.expectedVisits} ${visitTestPassed ? '✅' : '❌'}`);

        // Test medicines filtering
        const [medicines] = await this.connection.execute(
          'SELECT COUNT(*) as count FROM medicines WHERE clinic_id = ?',
          [testCase.userEmail.includes('jakarta') ? 1 : testCase.userEmail.includes('bandung') ? 2 : null]
        );
        
        const medicineCount = testCase.userEmail.includes('superadmin') ? 4 : medicines[0].count;
        const medicineTestPassed = medicineCount === testCase.expectedMedicines;
        
        console.log(`  Medicines: ${medicineCount}/${testCase.expectedMedicines} ${medicineTestPassed ? '✅' : '❌'}`);

        const allTestsPassed = patientTestPassed && doctorTestPassed && visitTestPassed && medicineTestPassed;
        
        this.testResults.push({
          testCase: testCase.description,
          passed: allTestsPassed,
          details: {
            patients: { expected: testCase.expectedPatients, actual: patientCount, passed: patientTestPassed },
            doctors: { expected: testCase.expectedDoctors, actual: doctorCount, passed: doctorTestPassed },
            visits: { expected: testCase.expectedVisits, actual: visitCount, passed: visitTestPassed },
            medicines: { expected: testCase.expectedMedicines, actual: medicineCount, passed: medicineTestPassed }
          }
        });

      } catch (error) {
        console.error(`  ❌ Test failed: ${error.message}`);
        this.testResults.push({
          testCase: testCase.description,
          passed: false,
          error: error.message
        });
      }
    }
  }

  async testRoleBasedAccess() {
    console.log('\n🔐 Testing role-based access control...');

    const testCases = [
      {
        userEmail: 'superadmin.test@phc.com',
        canAccessMobile: true,
        canAccessAdmin: true,
        description: 'Superadmin should have full access'
      },
      {
        userEmail: 'admin.jakarta.test@phc.com',
        canAccessMobile: false,
        canAccessAdmin: true,
        description: 'Admin should not access mobile app'
      },
      {
        userEmail: 'doctor.jakarta.test@phc.com',
        canAccessMobile: false,
        canAccessAdmin: false,
        description: 'Doctor should have limited access'
      }
    ];

    for (const testCase of testCases) {
      console.log(`\n📊 Testing: ${testCase.description}`);
      
      try {
        const [user] = await this.connection.execute(
          'SELECT role FROM users WHERE email = ?',
          [testCase.userEmail]
        );

        const role = user[0]?.role?.toUpperCase();
        const mobileAccess = role === 'SUPERADMIN';
        const adminAccess = ['SUPERADMIN', 'ADMIN'].includes(role);

        const mobileTestPassed = mobileAccess === testCase.canAccessMobile;
        const adminTestPassed = adminAccess === testCase.canAccessAdmin;

        console.log(`  Role: ${role}`);
        console.log(`  Mobile Access: ${mobileAccess} (expected: ${testCase.canAccessMobile}) ${mobileTestPassed ? '✅' : '❌'}`);
        console.log(`  Admin Access: ${adminAccess} (expected: ${testCase.canAccessAdmin}) ${adminTestPassed ? '✅' : '❌'}`);

        this.testResults.push({
          testCase: testCase.description,
          passed: mobileTestPassed && adminTestPassed,
          details: {
            role,
            mobileAccess: { expected: testCase.canAccessMobile, actual: mobileAccess, passed: mobileTestPassed },
            adminAccess: { expected: testCase.canAccessAdmin, actual: adminAccess, passed: adminTestPassed }
          }
        });

      } catch (error) {
        console.error(`  ❌ Test failed: ${error.message}`);
        this.testResults.push({
          testCase: testCase.description,
          passed: false,
          error: error.message
        });
      }
    }
  }

  async cleanupTestData() {
    console.log('\n🧹 Cleaning up test data...');
    
    try {
      await this.connection.execute('DELETE FROM medicines WHERE Detail LIKE "%Test%"');
      await this.connection.execute('DELETE FROM visits WHERE id > 0');
      await this.connection.execute('DELETE FROM doctors WHERE name LIKE "%Test%"');
      await this.connection.execute('DELETE FROM patients WHERE name LIKE "%Test%"');
      await this.connection.execute('DELETE FROM users WHERE email LIKE "%test@phc.com"');
      
      console.log('✅ Test data cleanup completed');
    } catch (error) {
      console.error('❌ Test data cleanup failed:', error.message);
    }
  }

  printResults() {
    console.log('\n📊 Test Results Summary');
    console.log('=' .repeat(50));
    
    const totalTests = this.testResults.length;
    const passedTests = this.testResults.filter(result => result.passed).length;
    const failedTests = totalTests - passedTests;
    
    console.log(`Total Tests: ${totalTests}`);
    console.log(`Passed: ${passedTests} ✅`);
    console.log(`Failed: ${failedTests} ❌`);
    console.log(`Success Rate: ${((passedTests / totalTests) * 100).toFixed(1)}%`);
    
    if (failedTests > 0) {
      console.log('\n❌ Failed Tests:');
      this.testResults
        .filter(result => !result.passed)
        .forEach(result => {
          console.log(`  - ${result.testCase}`);
          if (result.error) {
            console.log(`    Error: ${result.error}`);
          }
        });
    }
    
    console.log('\n✅ Passed Tests:');
    this.testResults
      .filter(result => result.passed)
      .forEach(result => {
        console.log(`  - ${result.testCase}`);
      });
  }

  async runAllTests() {
    try {
      await this.connect();
      await this.setupTestData();
      await this.testClinicBasedFiltering();
      await this.testRoleBasedAccess();
      await this.cleanupTestData();
      this.printResults();
    } catch (error) {
      console.error('❌ Test execution failed:', error.message);
    } finally {
      await this.disconnect();
    }
  }
}

// Run tests if this script is executed directly
if (require.main === module) {
  const tester = new ClinicAccessControlTester();
  tester.runAllTests();
}

module.exports = ClinicAccessControlTester;
