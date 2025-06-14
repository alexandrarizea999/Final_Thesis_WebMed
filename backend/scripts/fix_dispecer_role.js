const mysql = require('mysql2/promise');
const dbConfig = require('../config/db.config');

const email = 'dispecer@test.com';
const correctRole = 'dispecer';

async function fixDispecerRole() {
  const connection = await mysql.createConnection(dbConfig);
  try {
    const [users] = await connection.execute(
      'SELECT id, email, role FROM users WHERE email = ?',
      [email]
    );
    if (users.length === 0) {
      console.log(`No user found with email: ${email}`);
      return;
    }
    const user = users[0];
    if (user.role === correctRole) {
      console.log(`User '${email}' already has role '${correctRole}'. No changes needed.`);
    } else {
      await connection.execute(
        'UPDATE users SET role = ? WHERE id = ?',
        [correctRole, user.id]
      );
      console.log(`Updated user '${email}' role from '${user.role}' to '${correctRole}'.`);
    }
  } catch (err) {
    console.error('Error updating dispatcher role:', err);
  } finally {
    await connection.end();
  }
}

fixDispecerRole(); 