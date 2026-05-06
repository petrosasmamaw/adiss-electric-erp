#!/usr/bin/env node

/**
 * Database Setup Script
 * 
 * Creates test users in the database
 * Run: node server/scripts/create-user.js
 */

const bcrypt = require('bcryptjs');
const { pool } = require('../db');

async function createUser(email, password, role = 'user') {
  try {
    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Insert user
    const { rows } = await pool.query(
      'INSERT INTO users (email, password, role) VALUES ($1, $2, $3) RETURNING id, email, role',
      [email.toLowerCase(), hashedPassword, role]
    );

    console.log(`✅ User created successfully!`);
    console.log(`📧 Email: ${rows[0].email}`);
    console.log(`🔐 Role: ${rows[0].role}`);
    console.log(`🆔 ID: ${rows[0].id}`);

    return rows[0];
  } catch (error) {
    if (error.code === '23505') {
      console.error(`❌ Error: User with email "${email}" already exists`);
    } else {
      console.error(`❌ Error creating user:`, error.message);
    }
    throw error;
  }
}

async function main() {
  const email = process.argv[2] || 'admin@example.com';
  const password = process.argv[3] || 'Test@1234';
  const role = process.argv[4] || 'admin';

  console.log(`\n🚀 Creating user...`);
  console.log(`📧 Email: ${email}`);
  console.log(`🔐 Password: ${password}`);
  console.log(`👥 Role: ${role}\n`);

  try {
    await createUser(email, password, role);
    console.log(`\n✨ Setup complete! You can now login with these credentials.`);
  } catch (error) {
    process.exit(1);
  } finally {
    await pool.end();
  }
}

main();
