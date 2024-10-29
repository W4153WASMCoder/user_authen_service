// routes/user.ts
import { Router, Request, Response } from 'express';
import { User } from '../models/user_models.js'; // Adjust the path according to your project structure

const router = Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     User:
 *       type: object
 *       properties:
 *         UserID:
 *           type: integer
 *           description: Auto-generated ID of the user
 *         sub:
 *           type: string
 *           description: Unique identifier from the OpenID provider
 *         email:
 *           type: string
 *           description: User's email address
 *         name:
 *           type: string
 *           description: User's full name
 *         picture:
 *           type: string
 *           description: URL to the user's profile picture
 *         lastLogin:
 *           type: string
 *           format: date-time
 *           description: Timestamp of the user's last login
 *       example:
 *         UserID: 1
 *         sub: "google-oauth2|1234567890"
 *         email: "user@example.com"
 *         name: "John Doe"
 *         picture: "https://example.com/johndoe.jpg"
 *         lastLogin: "2024-10-28T12:00:00Z"
 */

/**
 * @swagger
 * tags:
 *   name: Users
 *   description: API endpoints for users
 */

/**
 * @swagger
 * /users/{id}:
 *   get:
 *     summary: Get a user by ID
 *     tags: [Users]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: The user ID
 *     responses:
 *       200:
 *         description: A user object
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *       404:
 *         description: User not found
 *   put:
 *     summary: Update a user by ID
 *     tags: [Users]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: The user ID
 *     requestBody:
 *       description: User object to update
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *               name:
 *                 type: string
 *               picture:
 *                 type: string
 *     responses:
 *       200:
 *         description: User updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *       400:
 *         description: Invalid input
 *       404:
 *         description: User not found
 */

/**
 * @swagger
 * /users:
 *   post:
 *     summary: Create or update a user
 *     tags: [Users]
 *     requestBody:
 *       description: User object to create or update
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - sub
 *               - email
 *               - name
 *               - picture
 *             properties:
 *               sub:
 *                 type: string
 *               email:
 *                 type: string
 *               name:
 *                 type: string
 *               picture:
 *                 type: string
 *     responses:
 *       200:
 *         description: User created or updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *       400:
 *         description: Invalid input
 */

router.get('/:id', async (req: Request, res: Response): Promise<void> => {
  const userId = parseInt(req.params.id);
  if (isNaN(userId)) {
    res.status(400).send('Invalid user ID');
    return;
  }

  try {
    const user = await User.findById(userId);
    if (!user) {
      res.status(404).send('User not found');
      return;
    }
    res.json(user);
  } catch (error) {
    console.error(`Error fetching user with ID ${userId}:`, error);
    res.status(500).send('Internal server error');
  }
});

router.post('/', async (req: Request, res: Response): Promise<void> => {
  const { sub, email, name, picture } = req.body;
  if (!sub || !email || !name || !picture) {
    res.status(400).send('Missing required fields');
    return;
  }
  try {
    const user = await User.createOrUpdate({ sub, email, name, picture });
    res.status(200).json(user);
  } catch (error) {
    console.error('Error creating or updating user:', error);
    res.status(500).send('Internal server error');
  }
});

router.put('/:id', async (req: Request, res: Response): Promise<void> => {
  const userId = parseInt(req.params.id);
  if (isNaN(userId)) {
    res.status(400).send('Invalid user ID');
    return;
  }

  try {
    const user = await User.findById(userId);
    if (!user) {
      res.status(404).send('User not found');
      return;
    }

    const { email, name, picture } = req.body;

    if (email !== undefined) user.email = email;
    if (name !== undefined) user.name = name;
    if (picture !== undefined) user.picture = picture;
    user.lastLogin = new Date();

    // Implement an instance method 'update' in the User model to handle updates
    await user.update();

    res.json(user);
  } catch (error) {
    console.error(`Error updating user with ID ${userId}:`, error);
    res.status(500).send('Internal server error');
  }
});

export default router;
