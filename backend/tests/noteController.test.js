const {
  getNotes,
  searchNotes,
  getFolders,
  getNote,
  createNote,
  updateNote,
  deleteNote,
  togglePin,
} = require('../src/controllers/noteController');
const Note = require('../src/models/Note');
const { sendSuccess, sendError, sendPaginated } = require('../src/utils/response');

jest.mock('../src/models/Note');
jest.mock('../src/utils/response', () => ({
  sendSuccess: jest.fn(),
  sendError: jest.fn(),
  sendPaginated: jest.fn(),
}));

describe('Note Controller Unit Tests', () => {
  let req, res, next;

  beforeEach(() => {
    req = {
      user: { _id: 'userId123' },
      query: {},
      params: {},
      body: {},
    };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    next = jest.fn();
    jest.clearAllMocks();
  });

  describe('getNotes', () => {
    it('should fetch paginated notes with folder, tag, and pinned filters', async () => {
      req.query = { folder: 'Tech', tag: 'node', pinned: 'true', page: '1', limit: '10' };
      const mockNotes = [{ _id: 'n1', title: 'Jest Testing' }];
      Note.countDocuments.mockResolvedValue(1);

      const selectMock = jest.fn().mockResolvedValue(mockNotes);
      const limitMock = jest.fn().mockReturnValue({ select: selectMock });
      const skipMock = jest.fn().mockReturnValue({ limit: limitMock });
      const sortMock = jest.fn().mockReturnValue({ skip: skipMock });
      Note.find.mockReturnValue({ sort: sortMock });

      await getNotes(req, res, next);

      expect(Note.countDocuments).toHaveBeenCalledWith({
        owner: 'userId123',
        folder: 'Tech',
        tags: 'node',
        isPinned: true,
      });
      expect(sendPaginated).toHaveBeenCalledWith(
        res,
        mockNotes,
        { total: 1, page: 1, limit: 10, pages: 1 }
      );
    });
  });

  describe('searchNotes', () => {
    it('should return 400 when search query string is missing', async () => {
      req.query = {};

      await searchNotes(req, res, next);

      expect(sendError).toHaveBeenCalledWith(res, 'Search query required', 400);
    });

    it('should search notes using text index score', async () => {
      req.query = { q: 'architecture' };
      const mockNotes = [{ _id: 'n1', title: 'System Architecture' }];

      const selectMock = jest.fn().mockResolvedValue(mockNotes);
      const limitMock = jest.fn().mockReturnValue({ select: selectMock });
      const sortMock = jest.fn().mockReturnValue({ limit: limitMock });
      Note.find.mockReturnValue({ sort: sortMock });

      await searchNotes(req, res, next);

      expect(Note.find).toHaveBeenCalledWith(
        { owner: 'userId123', $text: { $search: 'architecture' } },
        { score: { $meta: 'textScore' } }
      );
      expect(sendSuccess).toHaveBeenCalledWith(res, { notes: mockNotes, count: 1 });
    });
  });

  describe('getFolders', () => {
    it('should return distinct folders for the current user', async () => {
      Note.distinct.mockResolvedValue(['Work', 'Personal', 'Ideas']);

      await getFolders(req, res, next);

      expect(Note.distinct).toHaveBeenCalledWith('folder', { owner: 'userId123' });
      expect(sendSuccess).toHaveBeenCalledWith(res, { folders: ['Work', 'Personal', 'Ideas'] });
    });
  });

  describe('getNote', () => {
    it('should return 404 if note is not found', async () => {
      req.params.id = 'missingId';
      Note.findOne.mockResolvedValue(null);

      await getNote(req, res, next);

      expect(sendError).toHaveBeenCalledWith(res, 'Note not found', 404);
    });

    it('should return note when found', async () => {
      req.params.id = 'note123';
      const mockNote = { _id: 'note123', title: 'My Note', content: 'Content' };
      Note.findOne.mockResolvedValue(mockNote);

      await getNote(req, res, next);

      expect(sendSuccess).toHaveBeenCalledWith(res, { note: mockNote });
    });
  });

  describe('createNote', () => {
    it('should create note and return 201', async () => {
      req.body = { title: 'Docker Guide', content: 'docker build ...' };
      const createdNote = { ...req.body, _id: 'n123', owner: 'userId123' };
      Note.create.mockResolvedValue(createdNote);

      await createNote(req, res, next);

      expect(Note.create).toHaveBeenCalledWith({ ...req.body, owner: 'userId123' });
      expect(sendSuccess).toHaveBeenCalledWith(res, { note: createdNote }, 'Note created', 201);
    });
  });

  describe('updateNote', () => {
    it('should return 404 if note to update not found', async () => {
      req.params.id = 'missingId';
      req.body = { title: 'New' };
      Note.findOneAndUpdate.mockResolvedValue(null);

      await updateNote(req, res, next);

      expect(sendError).toHaveBeenCalledWith(res, 'Note not found', 404);
    });

    it('should update note successfully', async () => {
      req.params.id = 'note123';
      req.body = { title: 'Updated' };
      const updatedNote = { _id: 'note123', title: 'Updated' };
      Note.findOneAndUpdate.mockResolvedValue(updatedNote);

      await updateNote(req, res, next);

      expect(sendSuccess).toHaveBeenCalledWith(res, { note: updatedNote }, 'Note updated');
    });
  });

  describe('deleteNote', () => {
    it('should return 404 if note to delete not found', async () => {
      req.params.id = 'missingId';
      Note.findOneAndDelete.mockResolvedValue(null);

      await deleteNote(req, res, next);

      expect(sendError).toHaveBeenCalledWith(res, 'Note not found', 404);
    });

    it('should delete note successfully', async () => {
      req.params.id = 'note123';
      Note.findOneAndDelete.mockResolvedValue({ _id: 'note123' });

      await deleteNote(req, res, next);

      expect(sendSuccess).toHaveBeenCalledWith(res, {}, 'Note deleted');
    });
  });

  describe('togglePin', () => {
    it('should return 404 if note not found', async () => {
      req.params.id = 'missingId';
      Note.findOne.mockResolvedValue(null);

      await togglePin(req, res, next);

      expect(sendError).toHaveBeenCalledWith(res, 'Note not found', 404);
    });

    it('should toggle pin state and save', async () => {
      req.params.id = 'note123';
      const mockNote = { _id: 'note123', isPinned: false, save: jest.fn().mockResolvedValue(true) };
      Note.findOne.mockResolvedValue(mockNote);

      await togglePin(req, res, next);

      expect(mockNote.isPinned).toBe(true);
      expect(mockNote.save).toHaveBeenCalled();
      expect(sendSuccess).toHaveBeenCalledWith(res, { note: mockNote }, 'Note pinned');
    });
  });
});
