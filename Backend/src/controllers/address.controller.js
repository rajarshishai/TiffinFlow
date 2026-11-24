const { pool } = require('../config/db');

async function listAddresses(req, res) {
  const [rows] = await pool.query(
    `SELECT id, label, address_line AS addressLine, city, state, postal_code AS postalCode,
            latitude, longitude, is_default AS isDefault
     FROM addresses WHERE user_id = ? ORDER BY is_default DESC, id DESC`,
    [req.user.id]
  );
  res.json({ success: true, addresses: rows });
}

async function createAddress(req, res) {
  const { label, addressLine, city, state, postalCode, latitude, longitude, isDefault } = req.body;
  if (!label || !addressLine || !city || !state || !postalCode) {
    return res.status(400).json({ success: false, message: 'label, addressLine, city, state and postalCode are required' });
  }

  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    if (isDefault) {
      await connection.query('UPDATE addresses SET is_default = 0 WHERE user_id = ?', [req.user.id]);
    }

    const [result] = await connection.query(
      `INSERT INTO addresses
       (user_id, label, address_line, city, state, postal_code, latitude, longitude, is_default)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [req.user.id, label, addressLine, city, state, postalCode, latitude || null, longitude || null, !!isDefault]
    );

    await connection.commit();
    res.status(201).json({ success: true, id: result.insertId, message: 'Address created' });
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
}

async function updateAddress(req, res) {
  const { label, addressLine, city, state, postalCode, latitude, longitude, isDefault } = req.body;
  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();

    const [owned] = await connection.query(
      'SELECT id FROM addresses WHERE id = ? AND user_id = ?',
      [req.params.id, req.user.id]
    );
    if (!owned.length) {
      await connection.rollback();
      return res.status(404).json({ success: false, message: 'Address not found' });
    }

    if (isDefault) {
      await connection.query('UPDATE addresses SET is_default = 0 WHERE user_id = ?', [req.user.id]);
    }

    await connection.query(
      `UPDATE addresses
       SET label = ?, address_line = ?, city = ?, state = ?, postal_code = ?,
           latitude = ?, longitude = ?, is_default = ?
       WHERE id = ? AND user_id = ?`,
      [label, addressLine, city, state, postalCode, latitude || null, longitude || null, !!isDefault, req.params.id, req.user.id]
    );

    await connection.commit();
    res.json({ success: true, message: 'Address updated' });
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
}

async function deleteAddress(req, res) {
  const [result] = await pool.query(
    'DELETE FROM addresses WHERE id = ? AND user_id = ?',
    [req.params.id, req.user.id]
  );
  if (!result.affectedRows) return res.status(404).json({ success: false, message: 'Address not found' });
  res.json({ success: true, message: 'Address deleted' });
}

module.exports = { listAddresses, createAddress, updateAddress, deleteAddress };