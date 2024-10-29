// routes/project.ts
import { Router, Request, Response } from 'express';
import { Project } from '../models/files_models.js';
import { paginate } from '../middleware/pagination.js';

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
 *   - name: Projects
 *     description: API endpoints for projects
 */

/**
 * @swagger
 * /projects:
 *   get:
 *     summary: Get a list of projects with pagination
 *     tags:
 *       - Projects
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Maximum number of projects to return
 *       - in: query
 *         name: offset
 *         schema:
 *           type: integer
 *           default: 0
 *         description: Number of projects to skip
 *     responses:
 *       '200':
 *         description: A paginated list of projects
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
 *                     $ref: '#/components/schemas/Project'
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
router.get('/', paginate, async (req: Request, res: Response): Promise<void> => {
  const { limit, offset } = (req as any).pagination;

  try {
    // Fetch projects with pagination
    const { projects, total } = await Project.findAll(limit, offset);

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
      data: projects,
      links,
    });
  } catch (error) {
    console.error('Error fetching projects:', error);
    res.status(500).send('Internal server error');
  }
});

/**
 * @swagger
 * /projects/{id}:
 *   get:
 *     summary: Get a project by ID
 *     tags:
 *       - Projects
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: The project ID
 *     responses:
 *       '200':
 *         description: A project object
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Project'
 *       '404':
 *         description: Project not found
 *   put:
 *     summary: Update a project by ID
 *     tags:
 *       - Projects
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
 *             type: object
 *             properties:
 *               OwningUserID:
 *                 type: integer
 *               ProjectName:
 *                 type: string
 *     responses:
 *       '200':
 *         description: Project updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Project'
 *       '400':
 *         description: Invalid input
 *       '404':
 *         description: Project not found
 *   delete:
 *     summary: Delete a project by ID
 *     tags:
 *       - Projects
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: The project ID
 *     responses:
 *       '204':
 *         description: Project deleted successfully
 *       '404':
 *         description: Project not found
 *       '500':
 *         description: Internal server error
 */

/**
 * @swagger
 * /projects:
 *   post:
 *     summary: Create a new project
 *     tags:
 *       - Projects
 *     requestBody:
 *       description: Project object to create
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - OwningUserID
 *               - ProjectName
 *             properties:
 *               OwningUserID:
 *                 type: integer
 *               ProjectName:
 *                 type: string
 *     responses:
 *       '201':
 *         description: Project created successfully
 *         headers:
 *           Location:
 *             description: URL of the created project
 *             schema:
 *               type: string
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Project'
 *       '400':
 *         description: Invalid input
 */

router.get('/:id', async (req: Request, res: Response): Promise<void> => {
  const projectId = parseInt(req.params.id);
  if (isNaN(projectId)) {
    res.status(400).send('Invalid project ID');
    return;
  }

  try {
    const project = await Project.find(projectId);
    if (!project) {
      res.status(404).send('Project not found');
      return;
    }
    res.json(project);
  } catch (error) {
    console.error(`Error fetching project with ID ${projectId}:`, error);
    res.status(500).send('Internal server error');
  }
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

  try {
    await newProject.save();
    const location = `${req.protocol}://${req.get('host')}${req.baseUrl}/${newProject.ProjectID}`;
    res.status(201)
      .header('Location', location)
      .json(newProject);
  } catch (error) {
    console.error('Error creating project:', error);
    res.status(500).send('Internal server error');
  }
});

router.put('/:id', async (req: Request, res: Response): Promise<void> => {
  const projectId = parseInt(req.params.id);
  if (isNaN(projectId)) {
    res.status(400).send('Invalid project ID');
    return;
  }

  try {
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
  } catch (error) {
    console.error(`Error updating project with ID ${projectId}:`, error);
    res.status(500).send('Internal server error');
  }
});

router.delete('/:id', async (req: Request, res: Response): Promise<void> => {
  const projectId = parseInt(req.params.id);
  if (isNaN(projectId)) {
    res.status(400).send('Invalid project ID');
    return;
  }

  try {
    const result = await Project.deleteById(projectId);
    if (result) {
      res.status(204).send();
    } else {
      res.status(404).send('Project not found');
    }
  } catch (error) {
    console.error(`Error deleting project with ID ${projectId}:`, error);
    res.status(500).send('Internal server error');
  }
});

export default router;
