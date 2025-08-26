const mysql = require('mysql2/promise');
require('dotenv').config();

async function removeDuplicateDoctors() {
  let connection;
  
  try {
    // Create database connection
    connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'dash.doctorphc.id',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || 'pr1k1t1w',
      database: process.env.DB_NAME || 'phc_dashboard',
      port: process.env.DB_PORT || 3306
    });

    console.log('🔍 Starting duplicate doctors identification and removal...\n');

    // Check current data count
    const [totalCount] = await connection.execute('SELECT COUNT(*) as count FROM doctors');
    console.log(`📊 Total doctors in database: ${totalCount[0].count}`);

    // 1. Find duplicates based on email (most reliable identifier)
    console.log('\n🔍 Step 1: Finding duplicates based on email...');
    const [emailDuplicates] = await connection.execute(`
      SELECT email, COUNT(*) as count, GROUP_CONCAT(id ORDER BY id) as ids
      FROM doctors 
      WHERE email IS NOT NULL AND email != ''
      GROUP BY email 
      HAVING COUNT(*) > 1
    `);

    console.log(`📋 Found ${emailDuplicates.length} email duplicates:`);
    emailDuplicates.forEach(dup => {
      console.log(`   - Email: ${dup.email} (${dup.count} records, IDs: ${dup.ids})`);
    });

    // 2. Find duplicates based on license_number
    console.log('\n🔍 Step 2: Finding duplicates based on license number...');
    const [licenseDuplicates] = await connection.execute(`
      SELECT license_number, COUNT(*) as count, GROUP_CONCAT(id ORDER BY id) as ids
      FROM doctors 
      WHERE license_number IS NOT NULL AND license_number != ''
      GROUP BY license_number 
      HAVING COUNT(*) > 1
    `);

    console.log(`📋 Found ${licenseDuplicates.length} license number duplicates:`);
    licenseDuplicates.forEach(dup => {
      console.log(`   - License: ${dup.license_number} (${dup.count} records, IDs: ${dup.ids})`);
    });

    // 3. Find duplicates based on name + phone combination
    console.log('\n🔍 Step 3: Finding duplicates based on name + phone...');
    const [namePhoneDuplicates] = await connection.execute(`
      SELECT name, phone, COUNT(*) as count, GROUP_CONCAT(id ORDER BY id) as ids
      FROM doctors 
      WHERE name IS NOT NULL AND phone IS NOT NULL AND phone != ''
      GROUP BY name, phone 
      HAVING COUNT(*) > 1
    `);

    console.log(`📋 Found ${namePhoneDuplicates.length} name+phone duplicates:`);
    namePhoneDuplicates.forEach(dup => {
      console.log(`   - Name: ${dup.name}, Phone: ${dup.phone} (${dup.count} records, IDs: ${dup.ids})`);
    });

    // 4. Find duplicates based on name + specialist combination
    console.log('\n🔍 Step 4: Finding duplicates based on name + specialist...');
    const [nameSpecialistDuplicates] = await connection.execute(`
      SELECT name, specialist, COUNT(*) as count, GROUP_CONCAT(id ORDER BY id) as ids
      FROM doctors 
      WHERE name IS NOT NULL AND specialist IS NOT NULL AND specialist != ''
      GROUP BY name, specialist 
      HAVING COUNT(*) > 1
    `);

    console.log(`📋 Found ${nameSpecialistDuplicates.length} name+specialist duplicates:`);
    nameSpecialistDuplicates.forEach(dup => {
      console.log(`   - Name: ${dup.name}, Specialist: ${dup.specialist} (${dup.count} records, IDs: ${dup.ids})`);
    });

    // Calculate total duplicates to be removed
    const totalDuplicates = emailDuplicates.length + licenseDuplicates.length + 
                           namePhoneDuplicates.length + nameSpecialistDuplicates.length;

    if (totalDuplicates === 0) {
      console.log('\n✅ No duplicates found! Database is clean.');
      return;
    }

    console.log(`\n⚠️  Found ${totalDuplicates} types of duplicates.`);
    console.log('Press Ctrl+C to cancel, or wait 5 seconds to continue with removal...');
    
    // Wait 5 seconds for user to cancel
    await new Promise(resolve => setTimeout(resolve, 5000));

    // 5. Remove duplicates (keep the record with the lowest ID)
    console.log('\n🗑️  Step 5: Removing duplicates...');

    // Remove email duplicates
    for (const dup of emailDuplicates) {
      const ids = dup.ids.split(',').map(id => parseInt(id.trim()));
      const keepId = Math.min(...ids);
      const deleteIds = ids.filter(id => id !== keepId);
      
      console.log(`   - Email ${dup.email}: Keeping ID ${keepId}, removing IDs: ${deleteIds.join(', ')}`);
      
      // Check if any of these doctors are referenced in other tables
      for (const deleteId of deleteIds) {
        const [visits] = await connection.execute('SELECT COUNT(*) as count FROM visits WHERE doctor_id = ?', [deleteId]);
        const [consultations] = await connection.execute('SELECT COUNT(*) as count FROM consultations WHERE doctor_id = ?', [deleteId]);
        
        if (visits[0].count > 0 || consultations[0].count > 0) {
          console.log(`     ⚠️  Warning: Doctor ID ${deleteId} has ${visits[0].count} visits and ${consultations[0].count} consultations`);
          console.log(`     🔄 Updating references to point to ID ${keepId}...`);
          
          // Update references to point to the kept record
          if (visits[0].count > 0) {
            await connection.execute('UPDATE visits SET doctor_id = ? WHERE doctor_id = ?', [keepId, deleteId]);
            console.log(`     ✅ Updated ${visits[0].count} visits`);
          }
          
          if (consultations[0].count > 0) {
            await connection.execute('UPDATE consultations SET doctor_id = ? WHERE doctor_id = ?', [keepId, deleteId]);
            console.log(`     ✅ Updated ${consultations[0].count} consultations`);
          }
        }
      }
      
      // Delete the duplicate records
      const placeholders = deleteIds.map(() => '?').join(',');
      await connection.execute(`DELETE FROM doctors WHERE id IN (${placeholders})`, deleteIds);
      console.log(`     ✅ Deleted ${deleteIds.length} duplicate records`);
    }

    // Remove license number duplicates
    for (const dup of licenseDuplicates) {
      const ids = dup.ids.split(',').map(id => parseInt(id.trim()));
      const keepId = Math.min(...ids);
      const deleteIds = ids.filter(id => id !== keepId);
      
      console.log(`   - License ${dup.license_number}: Keeping ID ${keepId}, removing IDs: ${deleteIds.join(', ')}`);
      
      // Update references and delete (same logic as above)
      for (const deleteId of deleteIds) {
        const [visits] = await connection.execute('SELECT COUNT(*) as count FROM visits WHERE doctor_id = ?', [deleteId]);
        const [consultations] = await connection.execute('SELECT COUNT(*) as count FROM consultations WHERE doctor_id = ?', [deleteId]);
        
        if (visits[0].count > 0 || consultations[0].count > 0) {
          await connection.execute('UPDATE visits SET doctor_id = ? WHERE doctor_id = ?', [keepId, deleteId]);
          await connection.execute('UPDATE consultations SET doctor_id = ? WHERE doctor_id = ?', [keepId, deleteId]);
        }
      }
      
      const placeholders = deleteIds.map(() => '?').join(',');
      await connection.execute(`DELETE FROM doctors WHERE id IN (${placeholders})`, deleteIds);
      console.log(`     ✅ Deleted ${deleteIds.length} duplicate records`);
    }

    // Remove name+phone duplicates
    for (const dup of namePhoneDuplicates) {
      const ids = dup.ids.split(',').map(id => parseInt(id.trim()));
      const keepId = Math.min(...ids);
      const deleteIds = ids.filter(id => id !== keepId);
      
      console.log(`   - Name+Phone ${dup.name} (${dup.phone}): Keeping ID ${keepId}, removing IDs: ${deleteIds.join(', ')}`);
      
      // Update references and delete
      for (const deleteId of deleteIds) {
        const [visits] = await connection.execute('SELECT COUNT(*) as count FROM visits WHERE doctor_id = ?', [deleteId]);
        const [consultations] = await connection.execute('SELECT COUNT(*) as count FROM consultations WHERE doctor_id = ?', [deleteId]);
        
        if (visits[0].count > 0 || consultations[0].count > 0) {
          await connection.execute('UPDATE visits SET doctor_id = ? WHERE doctor_id = ?', [keepId, deleteId]);
          await connection.execute('UPDATE consultations SET doctor_id = ? WHERE doctor_id = ?', [keepId, deleteId]);
        }
      }
      
      const placeholders = deleteIds.map(() => '?').join(',');
      await connection.execute(`DELETE FROM doctors WHERE id IN (${placeholders})`, deleteIds);
      console.log(`     ✅ Deleted ${deleteIds.length} duplicate records`);
    }

    // Remove name+specialist duplicates
    for (const dup of nameSpecialistDuplicates) {
      const ids = dup.ids.split(',').map(id => parseInt(id.trim()));
      const keepId = Math.min(...ids);
      const deleteIds = ids.filter(id => id !== keepId);
      
      console.log(`   - Name+Specialist ${dup.name} (${dup.specialist}): Keeping ID ${keepId}, removing IDs: ${deleteIds.join(', ')}`);
      
      // Update references and delete
      for (const deleteId of deleteIds) {
        const [visits] = await connection.execute('SELECT COUNT(*) as count FROM visits WHERE doctor_id = ?', [deleteId]);
        const [consultations] = await connection.execute('SELECT COUNT(*) as count FROM consultations WHERE doctor_id = ?', [deleteId]);
        
        if (visits[0].count > 0 || consultations[0].count > 0) {
          await connection.execute('UPDATE visits SET doctor_id = ? WHERE doctor_id = ?', [keepId, deleteId]);
          await connection.execute('UPDATE consultations SET doctor_id = ? WHERE doctor_id = ?', [keepId, deleteId]);
        }
      }
      
      const placeholders = deleteIds.map(() => '?').join(',');
      await connection.execute(`DELETE FROM doctors WHERE id IN (${placeholders})`, deleteIds);
      console.log(`     ✅ Deleted ${deleteIds.length} duplicate records`);
    }

    // 6. Verify results
    console.log('\n📊 Step 6: Verifying results...');
    const [finalCount] = await connection.execute('SELECT COUNT(*) as count FROM doctors');
    console.log(`📊 Final doctor count: ${finalCount[0].count}`);
    console.log(`📊 Total records removed: ${totalCount[0].count - finalCount[0].count}`);

    // 7. Show remaining doctors
    console.log('\n📋 Remaining doctors:');
    const [remainingDoctors] = await connection.execute(`
      SELECT id, name, specialist, email, license_number, phone 
      FROM doctors 
      ORDER BY id
    `);

    remainingDoctors.forEach(doctor => {
      console.log(`   - ID ${doctor.id}: ${doctor.name} (${doctor.specialist || 'No specialist'})`);
      console.log(`     Email: ${doctor.email || 'No email'}, License: ${doctor.license_number || 'No license'}`);
    });

    console.log('\n✅ Duplicate removal completed successfully!');

  } catch (error) {
    console.error('❌ Error removing duplicates:', error);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

// Run the script
removeDuplicateDoctors()
  .then(() => {
    console.log('\n🎉 Script completed!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n💥 Script failed:', error);
    process.exit(1);
  });
