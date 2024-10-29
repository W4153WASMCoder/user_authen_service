import { Router, Request, Response } from 'express';
import { ProjectFile } from '../models/files_models.js';

const router = Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     ProjectFile:
 *       type: object
 *       properties:
 *         FileID:
 *           type: integer
 *           description: Auto-generated ID of the file
 *         ProjectID:
 *           type: integer
 *           description: The ID of the project the file belongs to
 *         FileName:
 *           type: string
 *           description: The name of the file
 *         IsDirectory:
 *           type: boolean
 *           description: True if the file is a directory, false otherwise
 *         CreationDate:
 *           type: string
 *           format: date-time
 *           description: File creation date
 */

/**
 * @swagger
 * /projectfiles/{id}:
 *   get:
 *     summary: Get a project file by ID
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: A project file object
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ProjectFile'
 *       404:
 *         description: Project file not found
 */
router.get('/:id', async (req: Request, res: Response): Promise<void> => {
    const fileId = parseInt(req.params.id);
    const file = await ProjectFile.find(fileId);
    if (!file) {
        res.status(404).send('Project file not found');
        return;
    }
    res.json(file);
});

export default router;
