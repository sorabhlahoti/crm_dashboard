const express = require('express');
const router = express.Router();
const { pool } = require('../db');
const { validateCustomer } = require('../middleware/validation');

// Get all customers
router.get('/', async (req, res) => {
  try {
    const { page = 1, limit = 10, status, search } = req.query;
    const offset = (page - 1) * limit;
    
    let query = 'SELECT * FROM customers';
    const queryParams = [];
    const conditions = [];
    
    // Add filters
    if (status) {
      conditions.push(`status = $${queryParams.length + 1}`);
      queryParams.push(status);
    }
    
    if (search) {
      conditions.push(`(name ILIKE $${queryParams.length + 1} OR email ILIKE $${queryParams.length + 1})`);
      queryParams.push(`%${search}%`);
    }
    
    // Build the final query
    if (conditions.length > 0) {
      query += ' WHERE ' + conditions.join(' AND ');
    }
    
    // Add pagination
    query += ` ORDER BY created_at DESC LIMIT $${queryParams.length + 1} OFFSET $${queryParams.length + 2}`;
    queryParams.push(limit, offset);
    
    // Execute query
    const result = await pool.query(query, queryParams);
    
    // Get total count for pagination
    const countQuery = 'SELECT COUNT(*) FROM customers' + (conditions.length > 0 ? ' WHERE ' + conditions.join(' AND ') : '');
    const countResult = await pool.query(countQuery, queryParams.slice(0, conditions.length));
    const totalCount = parseInt(countResult.rows[0].count);
    
    res.status(200).json({
      data: result.rows,
      pagination: {
        total: totalCount,
        pages: Math.ceil(totalCount / limit),
        page: parseInt(page),
        limit: parseInt(limit)
      }
    });
  } catch (error) {
    console.error('Error fetching customers:', error);
    res.status(500).json({ error: 'Failed to fetch customers' });
  }
});

// Get customer by ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query(`
      SELECT c.*, 
        (SELECT json_agg(co.*) FROM contacts co WHERE co.customer_id = c.id) as contacts,
        (SELECT COUNT(*) FROM orders o WHERE o.customer_id = c.id) as order_count,
        (SELECT SUM(amount) FROM orders o WHERE o.customer_id = c.id) as total_spent
      FROM customers c 
      WHERE c.id = $1
    `, [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Customer not found' });
    }
    
    res.status(200).json(result.rows[0]);
  } catch (error) {
    console.error('Error fetching customer:', error);
    res.status(500).json({ error: 'Failed to fetch customer' });
  }
});

// Create new customer
router.post('/', validateCustomer, async (req, res) => {
  const client = await pool.getClient();
  
  try {
    await client.query('BEGIN');
    
    const { name, email, phone, status, notes, contacts } = req.body;
    
    // Insert customer
    const customerResult = await client.query(
      'INSERT INTO customers (name, email, phone, status, notes) VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [name, email, phone, status || 'Active', notes]
    );
    
    const customer = customerResult.rows[0];
    
    // Insert contacts if provided
    if (contacts && Array.isArray(contacts) && contacts.length > 0) {
      for (const contact of contacts) {
        await client.query(
          'INSERT INTO contacts (customer_id, name, title, email, phone, is_primary) VALUES ($1, $2, $3, $4, $5, $6)',
          [customer.id, contact.name, contact.title, contact.email, contact.phone, contact.is_primary]
        );
      }
    }
    
    await client.query('COMMIT');
    
    // Fetch the complete customer data with contacts
    const completeCustomer = await pool.query(`
      SELECT c.*, 
        (SELECT json_agg(co.*) FROM contacts co WHERE co.customer_id = c.id) as contacts
      FROM customers c 
      WHERE c.id = $1
    `, [customer.id]);
    
    res.status(201).json(completeCustomer.rows[0]);
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error creating customer:', error);
    
    if (error.code === '23505') { // Unique violation
      return res.status(409).json({ error: 'A customer with this email already exists' });
    }
    
    res.status(500).json({ error: 'Failed to create customer' });
  } finally {
    client.release();
  }
});

// Update customer
router.put('/:id', validateCustomer, async (req, res) => {
  const client = await pool.getClient();
  
  try {
    await client.query('BEGIN');
    
    const { id } = req.params;
    const { name, email, phone, status, notes } = req.body;
    
    // Check if customer exists
    const checkResult = await client.query('SELECT * FROM customers WHERE id = $1', [id]);
    if (checkResult.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ error: 'Customer not found' });
    }
    
    // Update customer
    const result = await client.query(
      'UPDATE customers SET name = $1, email = $2, phone = $3, status = $4, notes = $5, updated_at = NOW() WHERE id = $6 RETURNING *',
      [name, email, phone, status, notes, id]
    );
    
    await client.query('COMMIT');
    
    res.status(200).json(result.rows[0]);
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error updating customer:', error);
    
    if (error.code === '23505') { // Unique violation
      return res.status(409).json({ error: 'A customer with this email already exists' });
    }
    
    res.status(500).json({ error: 'Failed to update customer' });
  } finally {
    client.release();
  }
});

// Delete customer
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    // Check if customer exists
    const checkResult = await pool.query('SELECT * FROM customers WHERE id = $1', [id]);
    if (checkResult.rows.length === 0) {
      return res.status(404).json({ error: 'Customer not found' });
    }
    
    await pool.query('DELETE FROM customers WHERE id = $1', [id]);
    
    res.status(200).json({ message: 'Customer deleted successfully' });
  } catch (error) {
    console.error('Error deleting customer:', error);
    res.status(500).json({ error: 'Failed to delete customer' });
  }
});

module.exports = router;