import { Router, Request, Response } from 'express';
import { Project } from '../models/files_models.js';

const router = Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     Project:
 *       type: object
 *       properties:
 *         ProjectID:
 *           type: integer
 *           description: Auto-generated ID of the project
 *         OwningUserID:
 *           type: integer
 *           description: ID of the user who owns the project
 *         ProjectName:
 *           type: string
 *           description: Name of the project
 *         CreationDate:
 *           type: string
 *           format: date-time
 *           description: Project creation date
 */

/**
 * @swagger
 * /projects/{id}:
 *   get:
 *     summary: Get a project by ID
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: A project object
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Project'
 *       404:
 *         description: Project not found
 */
router.get('/:id', async (req: Request, res: Response): Promise<void> => {
    const projectId = parseInt(req.params.id);
    const project = await Project.find(projectId);
    if (!project) {
        const ret = res.status(404).send('Project not found');
        return;
    }
    res.json(project);
});

export default router;
