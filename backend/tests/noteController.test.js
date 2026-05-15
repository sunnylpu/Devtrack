const { getNotes, createNote, deleteNote, togglePin } = require('../src/controllers/noteController');
const Note = require('../src/models/Note');
const { sendSuccess, sendError, sendPaginated } = require('../src/utils/response');

jest.mock('../src/models/Note');
jest.mock('../src/utils/response', () => ({
  sendSuccess: jest.fn(),
  sendError: jest.fn(),
  sendPaginated: jest.fn(),
}));

describe('Note Controller', () => {
  let req, res, next;

  beforeEach(() => {
    req = { user: { _id: 'userId' }, query: {}, body: {}, params: {} };
    res = {};
    next = jest.fn();
    jest.clearAllMocks();
  });

  describe('createNote', () => {
    it('should create a note and return 201', async () => {
      req.body = { title: 'Test Note', content: '# Hello', folder: 'General' };
      const mockNote = { ...req.body, _id: 'noteId', owner: 'userId' };
      Note.create.mockResolvedValue(mockNote);

      await createNote(req, res, next);

      expect(Note.create).toHaveBeenCalledWith({ ...req.body, owner: 'userId' });
      expect(sendSuccess).toHaveBeenCalledWith(res, { note: mockNote }, 'Note created', 201);
    });

    it('should call next on error', async () => {
      Note.create.mockRejectedValue(new Error('DB error'));
      await createNote(req, res, next);
      expect(next).toHaveBeenCalled();
    });
  });

  describe('deleteNote', () => {
    it('should delete a note', async () => {
      req.params.id = 'noteId';
      Note.findOneAndDelete.mockResolvedValue({ _id: 'noteId' });

      await deleteNote(req, res, next);

      expect(Note.findOneAndDelete).toHaveBeenCalledWith({ _id: 'noteId', owner: 'userId' });
      expect(sendSuccess).toHaveBeenCalledWith(res, {}, 'Note deleted');
    });

    it('should return 404 if note not found', async () => {
      req.params.id = 'missingId';
      Note.findOneAndDelete.mockResolvedValue(null);

      await deleteNote(req, res, next);

      expect(sendError).toHaveBeenCalledWith(res, 'Note not found', 404);
    });
  });

  describe('togglePin', () => {
    it('should toggle pin status', async () => {
      req.params.id = 'noteId';
      const mockNote = { _id: 'noteId', isPinned: false, save: jest.fn() };
      Note.findOne.mockResolvedValue(mockNote);

      await togglePin(req, res, next);

      expect(mockNote.isPinned).toBe(true);
      expect(mockNote.save).toHaveBeenCalled();
      expect(sendSuccess).toHaveBeenCalled();
    });
  });
});
