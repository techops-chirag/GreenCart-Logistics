const request = require('supertest');
const app = require('../app');
const User = require('../models/User');

describe('Authentication', () => {
  test('should register a new user', async () => {
    const userData = {
      name: 'Test Manager',
      email: 'test@greencart.com',
      password: 'password123',
      role: 'manager'
    };

    const response = await request(app)
      .post('/api/auth/register')
      .send(userData)
      .expect(201);

    expect(response.body.success).toBe(true);
    expect(response.body.data.token).toBeDefined();
    expect(response.body.data.user.email).toBe(userData.email);
    expect(response.body.data.user.password).toBeUndefined(); // Password should not be returned
  });

  test('should login with valid credentials', async () => {
    // Create a user first
    const user = new User({
      name: 'Test Manager',
      email: 'test@greencart.com',
      password: 'password123',
      role: 'manager'
    });
    await user.save();

    const response = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'test@greencart.com',
        password: 'password123'
      })
      .expect(200);

    expect(response.body.success).toBe(true);
    expect(response.body.data.token).toBeDefined();
    expect(response.body.data.user.email).toBe('test@greencart.com');
  });

  test('should reject login with invalid credentials', async () => {
    const response = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'wrong@email.com',
        password: 'wrongpassword'
      })
      .expect(401);

    expect(response.body.success).toBe(false);
    expect(response.body.message).toContain('Invalid email or password');
  });

  test('should protect routes requiring authentication', async () => {
    const response = await request(app)
      .get('/api/drivers')
      .expect(401);

    expect(response.body.success).toBe(false);
    expect(response.body.message).toContain('Access token required');
  });
});
