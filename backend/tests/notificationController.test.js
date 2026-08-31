const {
  getNotifications,
  markAsRead,
  markAllAsRead,
  deleteNotification,
} = require('../src/controllers/notificationController');
const Notification = require('../src/models/Notification');
const { sendSuccess } = require('../src/utils/response');

jest.mock('../src/models/Notification');
jest.mock('../src/utils/response', () => ({
  sendSuccess: jest.fn(),
  sendError: jest.fn(),
}));

describe('Notification Controller Unit Tests', () => {
  let req, res, next;

  beforeEach(() => {
    req = {
      user: { _id: 'mockUserId' },
      query: {},
      params: {},
    };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    next = jest.fn();
    jest.clearAllMocks();
  });

  describe('getNotifications', () => {
    it('should fetch paginated notifications and count unread', async () => {
      req.query = { page: '1', limit: '10', unread: 'true' };
      const mockNotifications = [{ _id: 'notif1', title: 'Task assigned', read: false }];

      const limitMock = jest.fn().mockResolvedValue(mockNotifications);
      const skipMock = jest.fn().mockReturnValue({ limit: limitMock });
      const sortMock = jest.fn().mockReturnValue({ skip: skipMock });
      Notification.find.mockReturnValue({ sort: sortMock });
      Notification.countDocuments
        .mockResolvedValueOnce(1) // total
        .mockResolvedValueOnce(1); // unreadCount

      await getNotifications(req, res, next);

      expect(Notification.find).toHaveBeenCalledWith({ user: 'mockUserId', read: false });
      expect(sendSuccess).toHaveBeenCalledWith(res, {
        notifications: mockNotifications,
        total: 1,
        unreadCount: 1,
      });
    });
  });

  describe('markAsRead', () => {
    it('should mark single notification as read', async () => {
      req.params.id = 'notif123';
      Notification.findOneAndUpdate.mockResolvedValue({});

      await markAsRead(req, res, next);

      expect(Notification.findOneAndUpdate).toHaveBeenCalledWith(
        { _id: 'notif123', user: 'mockUserId' },
        { $set: { read: true, readAt: expect.any(Date) } }
      );
      expect(sendSuccess).toHaveBeenCalledWith(res, {}, 'Notification marked as read');
    });
  });

  describe('markAllAsRead', () => {
    it('should mark all unread notifications as read for current user', async () => {
      Notification.updateMany.mockResolvedValue({ modifiedCount: 5 });

      await markAllAsRead(req, res, next);

      expect(Notification.updateMany).toHaveBeenCalledWith(
        { user: 'mockUserId', read: false },
        { $set: { read: true, readAt: expect.any(Date) } }
      );
      expect(sendSuccess).toHaveBeenCalledWith(res, {}, 'All notifications marked as read');
    });
  });

  describe('deleteNotification', () => {
    it('should delete a notification', async () => {
      req.params.id = 'notif123';
      Notification.findOneAndDelete.mockResolvedValue({});

      await deleteNotification(req, res, next);

      expect(Notification.findOneAndDelete).toHaveBeenCalledWith({
        _id: 'notif123',
        user: 'mockUserId',
      });
      expect(sendSuccess).toHaveBeenCalledWith(res, {}, 'Notification deleted');
    });
  });
});
