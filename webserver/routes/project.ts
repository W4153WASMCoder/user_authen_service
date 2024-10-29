import { Router, Request, Response } from 'express';
import { Project } from '../models/files_models.js';

const router = Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     Project:
 *       type: object
 *       required:
 *         - OwningUserID
 *         - ProjectName
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
 *       example:
 *         ProjectID: 1
 *         OwningUserID: 42
 *         ProjectName: "My Project"
 *         CreationDate: "2024-10-28T12:00:00Z"
 */

/**
 * @swagger
 * tags:
 *   name: Projects
 *   description: API endpoints for projects
 */

/**
 * @swagger
 * /projects/{id}:
 *   get:
 *     summary: Get a project by ID
 *     tags: [Projects]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: The project ID
 *     responses:
 *       200:
 *         description: A project object
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Project'
 *       404:
 *         description: Project not found
 *   put:
 *     summary: Update a project by ID
 *     tags: [Projects]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: The project ID
 *     requestBody:
 *       description: Project object to update
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Project'
 *     responses:
 *       200:
 *         description: Project updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Project'
 *       400:
 *         description: Invalid input
 *       404:
 *         description: Project not found
 */

/**
 * @swagger
 * /projects:
 *   post:
 *     summary: Create a new project
 *     tags: [Projects]
 *     requestBody:
 *       description: Project object to create
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             allOf:
 *               - $ref: '#/components/schemas/Project'
 *               - type: object
 *                 required:
 *                   - OwningUserID
 *                   - ProjectName
 *                 properties:
 *                   ProjectID:
 *                     type: integer
 *                     readOnly: true
 *     responses:
 *       201:
 *         description: Project created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Project'
 *       400:
 *         description: Invalid input
 */

router.get('/:id', async (req: Request, res: Response): Promise<void> => {
    const projectId = parseInt(req.params.id);
    const project = await Project.find(projectId);
    if (!project) {
        res.status(404).send('Project not found');
        return;
    }
    res.json(project);
});

router.post('/', async (req: Request, res: Response): Promise<void> => {
    const { OwningUserID, ProjectName } = req.body;
    if (OwningUserID == null || ProjectName == null) {
        res.status(400).send('Missing required fields');
        return;
    }

    const newProject = new Project(
        null, // ProjectID will be auto-generated
        OwningUserID,
        ProjectName,
        new Date()
    );
    await newProject.save();
    res.status(201).json(newProject);
});

router.put('/:id', async (req: Request, res: Response): Promise<void> => {
    const projectId = parseInt(req.params.id);
    const project = await Project.find(projectId);
    if (!project) {
        res.status(404).send('Project not found');
        return;
    }

    const { OwningUserID, ProjectName } = req.body;

    if (OwningUserID != null) project.OwningUserID = OwningUserID;
    if (ProjectName != null) project.ProjectName = ProjectName;

    await project.save();
    res.json(project);
});

export default router;
