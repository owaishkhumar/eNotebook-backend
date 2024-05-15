const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const fetchuser = require('../middleware/fetchuser');
const Notes = require('../models/Notes');


// ROUTE 1: Get All the Notes using: GET "/api/notes/getuser". Login required
router.get('/fetchallnotes', fetchuser, async (req, res) => {
    try {
        const notes = await Notes.find({ user: req.user.id });
        res.json(notes);
    } catch (error) {
        console.log(error.message);
        res.status(500).send("Internal Server Error");
    }
})

// ROUTE 2: Add a new Note using: POST "/api/notes/addnote". Login required
router.post('/addnote', fetchuser,
    body('title', 'Enter a title').isLength({ min: 3 }),
    body('description', 'Enter a description of min 6 characters').isLength({ min: 6 }),
    async (req, res) => {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({ errors: errors.array() });
            }

            const { title, description, tag } = req.body;

            const notes = new Notes({
                title, description, tag, user: req.user.id
            })

            const savedNotes = await notes.save();
            res.status(200).json(savedNotes);

        } catch (error) {
            console.log(error.message);
            res.status(500).send("Internal Server Error");
        }


    })

// ROUTE 3: Update an existing Note using: PUT "/api/notes/updatenote". Login required
router.put('/updatenote/:id', fetchuser, async (req, res) => {
    try {
        const { title, description, tag } = req.body;

        const newNote = {};
        if (title) { newNote.title = title }
        if (description) { newNote.description = description }
        if (tag) { newNote.tag = tag }

        let note = await Notes.findById(req.params.id);
        if (!note) return res.status(404).send("Note not found");

        if (note.user.toString() !== req.user.id) return res.status(404).send("Not Allowed");

        note = await Notes.findByIdAndUpdate(req.params.id, newNote, { new: true });
        res.status(200).json({ note });
    } catch (error) {
        console.log(error.message);
        res.status(500).send("Internal Server Error");
    }
});

// ROUTE 4: Delete an existing Note using: DELETE "/api/notes/deletenote". Login required
router.delete('/deletenote/:id', fetchuser, async (req, res) => {
    try {
        let note = await Notes.findById(req.params.id);
        if (!note) return res.status(404).send("Note not found");

        if (note.user.toString() !== req.user.id) return res.status(404).send("Not Allowed");

        note = await Notes.findByIdAndDelete(req.params.id);
        res.status(200).json({ Success: "Notes id deleted", note: note });
    } catch (error) {
        console.log(error.message);
        res.status(500).send("Internal Server Error");
    }
})
module.exports = router;