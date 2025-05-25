const request = require('supertest');
const app = require('../../server');
const { pool } = require('../../server/db');

// Sample test customer
const testCustomer = {
  name: 'Test Customer',
  email: 'test@example.com',
  phone: '555-123-4567',
  status: 'Active'
};

let customerId;

// Clean up before tests
beforeAll(async () => {
  // Clear test data
  await pool.query("DELETE FROM customers WHERE email = $1", [testCustomer.email]);
});

// Clean up after tests
afterAll(async () => {
  // Clear test data
  await pool.query("DELETE FROM customers WHERE email = $1", [testCustomer.email]);
});

describe('Customer API', () => {
  
  describe('POST /api/customers', () => {
    it('should create a new customer', async () => {
      const res = await request(app)
        .post('/api/customers')
        .send(testCustomer);
      
      expect(res.statusCode).toEqual(201);
      expect(res.body).toHaveProperty('id');
      expect(res.body.name).toEqual(testCustomer.name);
      expect(res.body.email).toEqual(testCustomer.email);
      
      // Save the ID for future tests
      customerId = res.body.id;
    });
    
    it('should return 400 if required fields are missing', async () => {
      const res = await request(app)
        .post('/api/customers')
        .send({ name: 'Incomplete Customer' });
      
      expect(res.statusCode).toEqual(400);
      expect(res.body).toHaveProperty('error');
    });
  });
  
  describe('GET /api/customers', () => {
    it('should retrieve all customers', async () => {
      const res = await request(app).get('/api/customers');
      
      expect(res.statusCode).toEqual(200);
      expect(Array.isArray(res.body)).toBeTruthy();
      expect(res.body.length).toBeGreaterThan(0);
    });
  });
  
  describe('GET /api/customers/:id', () => {
    it('should retrieve a specific customer', async () => {
      const res = await request(app).get(`/api/customers/${customerId}`);
      
      expect(res.statusCode).toEqual(200);
      expect(res.body).toHaveProperty('id', customerId);
      expect(res.body.name).toEqual(testCustomer.name);
    });
    
    it('should return 404 for non-existent customer', async () => {
      const res = await request(app).get('/api/customers/999999');
      
      expect(res.statusCode).toEqual(404);
      expect(res.body).toHaveProperty('error');
    });
  });
  
  describe('PUT /api/customers/:id', () => {
    it('should update a customer', async () => {
      const updatedData = {
        ...testCustomer,
        name: 'Updated Test Customer',
        status: 'Inactive'
      };
      
      const res = await request(app)
        .put(`/api/customers/${customerId}`)
        .send(updatedData);
      
      expect(res.statusCode).toEqual(200);
      expect(res.body.name).toEqual(updatedData.name);
      expect(res.body.status).toEqual(updatedData.status);
    });
  });
  
  describe('DELETE /api/customers/:id', () => {
    it('should delete a customer', async () => {
      const res = await request(app).delete(`/api/customers/${customerId}`);
      
      expect(res.statusCode).toEqual(200);
      expect(res.body).toHaveProperty('message');
      
      // Verify the customer is deleted
      const checkRes = await request(app).get(`/api/customers/${customerId}`);
      expect(checkRes.statusCode).toEqual(404);
    });
  });
});