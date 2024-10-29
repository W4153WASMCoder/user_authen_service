// routes/projectfile.ts
import { Router, Request, Response } from 'express';
import { ProjectFile } from '../models/files_models.js';
import { paginate } from '../middleware/pagination.js';

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
 *   - name: ProjectFiles
 *     description: API endpoints for project files
 */

/**
 * @swagger
 * /projectfiles:
 *   get:
 *     summary: Get a list of project files with pagination
 *     tags:
 *       - ProjectFiles
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Maximum number of project files to return
 *       - in: query
 *         name: offset
 *         schema:
 *           type: integer
 *           default: 0
 *         description: Number of project files to skip
 *     responses:
 *       '200':
 *         description: A paginated list of project files
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 total:
 *                   type: integer
 *                 limit:
 *                   type: integer
 *                 offset:
 *                   type: integer
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/ProjectFile'
 *                 links:
 *                   type: object
 *                   properties:
 *                     self:
 *                       type: string
 *                     next:
 *                       type: string
 *                       nullable: true
 *                     prev:
 *                       type: string
 *                       nullable: true
 *                     first:
 *                       type: string
 *                     last:
 *                       type: string
 *       '500':
 *         description: Internal server error
 */

/**
 * @swagger
 * /projectfiles/{id}:
 *   get:
 *     summary: Get a project file by ID
 *     tags:
 *       - ProjectFiles
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: The project file ID
 *     responses:
 *       '200':
 *         description: A project file object
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ProjectFile'
 *       '404':
 *         description: Project file not found
 *   put:
 *     summary: Update a project file by ID
 *     tags:
 *       - ProjectFiles
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
 *             type: object
 *             properties:
 *               ParentDirectory:
 *                 type: integer
 *                 nullable: true
 *               FileName:
 *                 type: string
 *               IsDirectory:
 *                 type: boolean
 *     responses:
 *       '200':
 *         description: Project file updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ProjectFile'
 *       '400':
 *         description: Invalid input
 *       '404':
 *         description: Project file not found
 *   delete:
 *     summary: Delete a project file by ID
 *     tags:
 *       - ProjectFiles
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: The project file ID
 *     responses:
 *       '204':
 *         description: Project file deleted successfully
 *       '404':
 *         description: Project file not found
 *       '500':
 *         description: Internal server error
 */

/**
 * @swagger
 * /projectfiles:
 *   post:
 *     summary: Create a new project file
 *     tags:
 *       - ProjectFiles
 *     requestBody:
 *       description: Project file object to create
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - ProjectID
 *               - FileName
 *               - IsDirectory
 *             properties:
 *               ProjectID:
 *                 type: integer
 *               ParentDirectory:
 *                 type: integer
 *                 nullable: true
 *               FileName:
 *                 type: string
 *               IsDirectory:
 *                 type: boolean
 *     responses:
 *       '201':
 *         description: Project file created successfully
 *         headers:
 *           Location:
 *             description: URL of the created project file
 *             schema:
 *               type: string
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ProjectFile'
 *       '400':
 *         description: Invalid input
 */

router.get('/', paginate, async (req: Request, res: Response): Promise<void> => {
  const { limit, offset } = (req as any).pagination;

  try {
    // Fetch project files with pagination
    const { files, total } = await ProjectFile.findAll(limit, offset);

    // Generate HATEOAS links
    const baseUrl = `${req.protocol}://${req.get('host')}${req.baseUrl}`;
    const links: any = {
      self: `${baseUrl}?limit=${limit}&offset=${offset}`,
      first: `${baseUrl}?limit=${limit}&offset=0`,
      last: `${baseUrl}?limit=${limit}&offset=${Math.floor((total - 1) / limit) * limit}`,
    };

    // Conditionally add 'next' link if the offset is within range
    if (offset + limit < total) {
      links.next = `${baseUrl}?limit=${limit}&offset=${offset + limit}`;
    }

    // Conditionally add 'prev' link if the offset is within range
    if (offset - limit >= 0) {
      links.prev = `${baseUrl}?limit=${limit}&offset=${offset - limit}`;
    }

    res.json({
      total,
      limit,
      offset,
      data: files,
      links,
    });
  } catch (error) {
    console.error('Error fetching project files:', error);
    res.status(500).send('Internal server error');
  }
});

router.get('/:id', async (req: Request, res: Response): Promise<void> => {
  const fileId = parseInt(req.params.id);
  if (isNaN(fileId)) {
    res.status(400).send('Invalid project file ID');
    return;
  }

  try {
    const file = await ProjectFile.find(fileId);
    if (!file) {
      res.status(404).send('Project file not found');
      return;
    }
    res.json(file);
  } catch (error) {
    console.error(`Error fetching project file with ID ${fileId}:`, error);
    res.status(500).send('Internal server error');
  }
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

  try {
    await newFile.save();
    const location = `${req.protocol}://${req.get('host')}${req.baseUrl}/${newFile.FileID}`;
    res.status(201)
      .header('Location', location)
      .json(newFile);
  } catch (error) {
    console.error('Error creating project file:', error);
    res.status(500).send('Internal server error');
  }
});

router.put('/:id', async (req: Request, res: Response): Promise<void> => {
  const fileId = parseInt(req.params.id);
  if (isNaN(fileId)) {
    res.status(400).send('Invalid project file ID');
    return;
  }

  try {
    const file = await ProjectFile.find(fileId);
    if (!file) {
      res.status(404).send('Project file not found');
      return;
    }

    const { ParentDirectory, FileName, IsDirectory } = req.body;

    if (ParentDirectory !== undefined) file.ParentDirectory = ParentDirectory;
    if (FileName != null) file.FileName = FileName;
    if (IsDirectory != null) file.IsDirectory = IsDirectory;

    await file.save();
    res.json(file);
  } catch (error) {
    console.error(`Error updating project file with ID ${fileId}:`, error);
    res.status(500).send('Internal server error');
  }
});

router.delete('/:id', async (req: Request, res: Response): Promise<void> => {
  const fileId = parseInt(req.params.id);
  if (isNaN(fileId)) {
    res.status(400).send('Invalid project file ID');
    return;
  }

  try {
    const result = await ProjectFile.deleteById(fileId);
    if (result) {
      res.status(204).send();
    } else {
      res.status(404).send('Project file not found');
    }
  } catch (error) {
    console.error(`Error deleting project file with ID ${fileId}:`, error);
    res.status(500).send('Internal server error');
  }
});

export default router;
