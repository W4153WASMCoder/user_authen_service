// routes/active_token.ts
import { Router, Request, Response } from 'express';
import { ActiveToken } from '../models/user_models.js'; // Adjust the path according to your project structure

const router = Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     ActiveToken:
 *       type: object
 *       properties:
 *         TokenID:
 *           type: integer
 *           description: Auto-generated ID of the token
 *         UserID:
 *           type: integer
 *           description: ID of the user the token belongs to
 *         TTL:
 *           type: integer
 *           description: Time to live in seconds
 *         CreationDate:
 *           type: string
 *           format: date-time
 *           description: Token creation date
 *       example:
 *         TokenID: 1
 *         UserID: 1
 *         TTL: 3600
 *         CreationDate: "2024-10-28T12:00:00Z"
 */

/**
 * @swagger
 * tags:
 *   name: ActiveTokens
 *   description: API endpoints for active tokens
 */

/**
 * @swagger
 * /tokens/{id}:
 *   get:
 *     summary: Get an active token by ID
 *     tags: [ActiveTokens]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: The token ID
 *     responses:
 *       200:
 *         description: An active token object
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ActiveToken'
 *       404:
 *         description: Token not found
 *   put:
 *     summary: Update an active token by ID
 *     tags: [ActiveTokens]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: The token ID
 *     requestBody:
 *       description: Active token object to update
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               UserID:
 *                 type: integer
 *               TTL:
 *                 type: integer
 *     responses:
 *       200:
 *         description: Token updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ActiveToken'
 *       400:
 *         description: Invalid input
 *       404:
 *         description: Token not found
 */

/**
 * @swagger
 * /tokens:
 *   post:
 *     summary: Create a new active token
 *     tags: [ActiveTokens]
 *     requestBody:
 *       description: Active token object to create
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - UserID
 *             properties:
 *               UserID:
 *                 type: integer
 *               TTL:
 *                 type: integer
 *     responses:
 *       201:
 *         description: Token created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ActiveToken'
 *       400:
 *         description: Invalid input
 */

router.get('/:id', async (req: Request, res: Response): Promise<void> => {
  const tokenId = parseInt(req.params.id);
  if (isNaN(tokenId)) {
    res.status(400).send('Invalid token ID');
    return;
  }

  try {
    const token = await ActiveToken.findById(tokenId);
    if (!token) {
      res.status(404).send('Token not found');
      return;
    }
    res.json(token);
  } catch (error) {
    console.error(`Error fetching token with ID ${tokenId}:`, error);
    res.status(500).send('Internal server error');
  }
});

router.post('/', async (req: Request, res: Response): Promise<void> => {
  const { UserID, TTL } = req.body;
  if (!UserID) {
    res.status(400).send('Missing required field: UserID');
    return;
  }

  const ttlValue = TTL || 3600; // Default TTL if not provided
  const newToken = new ActiveToken(null, UserID, ttlValue);

  try {
    await newToken.save();
    res.status(201).json(newToken);
  } catch (error) {
    console.error('Error creating token:', error);
    res.status(500).send('Internal server error');
  }
});

router.put('/:id', async (req: Request, res: Response): Promise<void> => {
  const tokenId = parseInt(req.params.id);
  if (isNaN(tokenId)) {
    res.status(400).send('Invalid token ID');
    return;
  }

  try {
    const token = await ActiveToken.findById(tokenId);
    if (!token) {
      res.status(404).send('Token not found');
      return;
    }

    const { UserID, TTL } = req.body;

    if (UserID !== undefined) token.UserID = UserID;
    if (TTL !== undefined) token.TTL = TTL;
    token.CreationDate = new Date();

    await token.save();
    res.json(token);
  } catch (error) {
    console.error(`Error updating token with ID ${tokenId}:`, error);
    res.status(500).send('Internal server error');
  }
});

export default router;
