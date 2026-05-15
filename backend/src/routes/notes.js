const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const {
  getNotes, searchNotes, getFolders, getNote, createNote, updateNote, deleteNote, togglePin
} = require('../controllers/noteController');

router.use(protect);

router.get('/search', searchNotes);
router.get('/folders', getFolders);
router.get('/', getNotes);
router.post('/', createNote);
router.get('/:id', getNote);
router.put('/:id', updateNote);
router.delete('/:id', deleteNote);
router.put('/:id/pin', togglePin);

module.exports = router;
