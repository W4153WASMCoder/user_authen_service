import { Router, Request, Response } from 'express';
import { ProjectFile } from '../models/files_models.js';

const router = Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     ProjectFile:
 *       type: object
 *       required:
 *         - ProjectID
 *         - FileName
 *         - IsDirectory
 *       properties:
 *         FileID:
 *           type: integer
 *           description: Auto-generated ID of the file
 *         ProjectID:
 *           type: integer
 *           description: The ID of the project the file belongs to
 *         ParentDirectory:
 *           type: integer
 *           nullable: true
 *           description: The ID of the parent directory, if any
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
 *       example:
 *         FileID: 1
 *         ProjectID: 1
 *         ParentDirectory: null
 *         FileName: "example.txt"
 *         IsDirectory: false
 *         CreationDate: "2024-10-28T12:00:00Z"
 */

/**
 * @swagger
 * tags:
 *   name: ProjectFiles
 *   description: API endpoints for project files
 */

/**
 * @swagger
 * /projectfiles/{id}:
 *   get:
 *     summary: Get a project file by ID
 *     tags: [ProjectFiles]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: The project file ID
 *     responses:
 *       200:
 *         description: A project file object
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ProjectFile'
 *       404:
 *         description: Project file not found
 *   put:
 *     summary: Update a project file by ID
 *     tags: [ProjectFiles]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: The project file ID
 *     requestBody:
 *       description: Project file object to update
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ProjectFile'
 *     responses:
 *       200:
 *         description: Project file updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ProjectFile'
 *       400:
 *         description: Invalid input
 *       404:
 *         description: Project file not found
 */

/**
 * @swagger
 * /projectfiles:
 *   post:
 *     summary: Create a new project file
 *     tags: [ProjectFiles]
 *     requestBody:
 *       description: Project file object to create
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             allOf:
 *               - $ref: '#/components/schemas/ProjectFile'
 *               - type: object
 *                 required:
 *                   - ProjectID
 *                   - FileName
 *                   - IsDirectory
 *                 properties:
 *                   FileID:
 *                     type: integer
 *                     readOnly: true
 *     responses:
 *       201:
 *         description: Project file created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ProjectFile'
 *       400:
 *         description: Invalid input
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

router.post('/', async (req: Request, res: Response): Promise<void> => {
    const { ProjectID, ParentDirectory, FileName, IsDirectory } = req.body;
    if (ProjectID == null || FileName == null || IsDirectory == null) {
        res.status(400).send('Missing required fields');
        return;
    }

    const newFile = new ProjectFile(
        null, // FileID will be auto-generated
        ProjectID,
        ParentDirectory || null,
        FileName,
        IsDirectory,
        new Date()
    );
    await newFile.save();
    res.status(201).json(newFile);
});

router.put('/:id', async (req: Request, res: Response): Promise<void> => {
    const fileId = parseInt(req.params.id);
    const file = await ProjectFile.find(fileId);
    if (!file) {
        res.status(404).send('Project file not found');
        return;
    }

    const { _, ParentDirectory, FileName, IsDirectory } = req.body;

    if (ParentDirectory !== undefined) file.ParentDirectory = ParentDirectory;
    if (FileName != null) file.FileName = FileName;
    if (IsDirectory != null) file.IsDirectory = IsDirectory;

    await file.save();
    res.json(file);
});

export default router;
