import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { ProjectsService } from './projects.service';
import { DatabaseService } from '@database/database.service';
import { TeamType, ProjectStatus } from './dto/projects.dto';

describe('ProjectsService', () => {
  let service: ProjectsService;
  let dbMock: { query: jest.Mock };

  const mockProject = {
    id: '550e8400-e29b-41d4-a716-446655440001',
    name: 'Test Project',
    description: 'A test project',
    team_type: 'solo',
    github_link: null,
    design_link: null,
    status: 'progress',
    experience: null,
    owner_id: null,
    created_at: new Date(),
    updated_at: new Date(),
  };

  const mockTech = { id: 'tech-1', name: 'React', slug: 'react', icon_url: null };
  const mockImage = { id: 'img-1', url: 'https://example.com/img.png', image_type: 'mockup', created_at: new Date() };

  beforeEach(async () => {
    dbMock = { query: jest.fn() };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProjectsService,
        { provide: DatabaseService, useValue: dbMock },
      ],
    }).compile();

    service = module.get<ProjectsService>(ProjectsService);
  });

  describe('create', () => {
    it('should create a project with techs', async () => {
      dbMock.query
        .mockResolvedValueOnce({ rows: [mockProject] })
        .mockResolvedValueOnce({ rows: [] })
        .mockResolvedValueOnce({ rows: [mockProject] })
        .mockResolvedValueOnce({ rows: [mockTech] })
        .mockResolvedValueOnce({ rows: [mockImage] });

      const result = await service.create({
        name: 'Test Project',
        description: 'A test project',
        teamType: TeamType.SOLO,
        techIds: ['tech-1'],
      });

      expect(result!.name).toBe(mockProject.name);
    });

    it('should create a project without techs', async () => {
      dbMock.query
        .mockResolvedValueOnce({ rows: [mockProject] })
        .mockResolvedValueOnce({ rows: [mockProject] })
        .mockResolvedValueOnce({ rows: [mockTech] })
        .mockResolvedValueOnce({ rows: [mockImage] });

      const result = await service.create({
        name: 'Test Project',
        description: 'A test project',
        teamType: TeamType.SOLO,
      });

      expect(result!.name).toBe(mockProject.name);
    });
  });

  describe('findAll', () => {
    it('should return paginated projects', async () => {
      dbMock.query
        .mockResolvedValueOnce({ rows: [{ count: '1' }] })
        .mockResolvedValueOnce({ rows: [mockProject] })
        .mockResolvedValueOnce({ rows: [mockTech] })
        .mockResolvedValueOnce({ rows: [mockImage] });

      const result = await service.findAll({ page: 1, limit: 10 });

      expect(result.data).toHaveLength(1);
      expect(result.meta.total).toBe(1);
    });

    it('should filter by status', async () => {
      dbMock.query
        .mockResolvedValueOnce({ rows: [{ count: '1' }] })
        .mockResolvedValueOnce({ rows: [mockProject] })
        .mockResolvedValueOnce({ rows: [mockTech] })
        .mockResolvedValueOnce({ rows: [mockImage] });

      const result = await service.findAll({ page: 1, limit: 10, status: ProjectStatus.PROGRESS });

      expect(result.data).toHaveLength(1);
    });
  });

  describe('findOne', () => {
    it('should return a project with relations', async () => {
      dbMock.query
        .mockResolvedValueOnce({ rows: [mockProject] })
        .mockResolvedValueOnce({ rows: [mockTech] })
        .mockResolvedValueOnce({ rows: [mockImage] });

      const result = await service.findOne(mockProject.id);

      expect(result.id).toBe(mockProject.id);
      expect(result.techs).toHaveLength(1);
      expect(result.images).toHaveLength(1);
    });

    it('should throw NotFoundException if not found', async () => {
      dbMock.query.mockResolvedValueOnce({ rows: [] });

      await expect(service.findOne('nonexistent')).rejects.toThrow(NotFoundException);
    });
  });

  describe('update', () => {
    it('should update a project', async () => {
      dbMock.query
        .mockResolvedValueOnce({ rows: [{ id: mockProject.id }] })
        .mockResolvedValueOnce({ rows: [{ ...mockProject, name: 'Updated' }] })
        .mockResolvedValueOnce({ rows: [mockProject] })
        .mockResolvedValueOnce({ rows: [mockTech] })
        .mockResolvedValueOnce({ rows: [mockImage] });

      const result = await service.update(mockProject.id, { name: 'Updated', status: ProjectStatus.COMPLETE });

      expect(result).toBeDefined();
    });

    it('should throw NotFoundException', async () => {
      dbMock.query.mockResolvedValueOnce({ rows: [] });

      await expect(service.update('nonexistent', { name: 'Updated' })).rejects.toThrow(NotFoundException);
    });

    it('should sync techIds when provided', async () => {
      dbMock.query
        .mockResolvedValueOnce({ rows: [{ id: mockProject.id }] })
        .mockResolvedValueOnce({ rows: [] })
        .mockResolvedValueOnce({ rows: [] })
        .mockResolvedValueOnce({ rows: [] })
        .mockResolvedValueOnce({ rows: [mockProject] })
        .mockResolvedValueOnce({ rows: [mockTech] })
        .mockResolvedValueOnce({ rows: [mockImage] });

      const result = await service.update(mockProject.id, { techIds: ['tech-1', 'tech-2'] });

      expect(result).toBeDefined();
    });
  });

  describe('remove', () => {
    it('should delete a project', async () => {
      dbMock.query.mockResolvedValueOnce({ rows: [{ id: mockProject.id }] });

      const result = await service.remove(mockProject.id);

      expect(result.deleted).toBe(true);
    });

    it('should throw NotFoundException', async () => {
      dbMock.query.mockResolvedValueOnce({ rows: [] });

      await expect(service.remove('nonexistent')).rejects.toThrow(NotFoundException);
    });
  });
});
