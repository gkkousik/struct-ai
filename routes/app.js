const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const multer = require('multer');

// The generator form is submitted via JS `FormData`, which the browser
// encodes as multipart/form-data — express.urlencoded() (in server.js)
// only parses application/x-www-form-urlencoded, so multipart fields would
// otherwise arrive as `undefined`. upload.none() parses multipart text
// fields (no file uploads involved) into req.body.
const upload = multer();

const Diagram = require('../models/Diagram');
const { loginRequired, apiLoginRequired } = require('../middleware/auth');
const { DIAGRAM_TYPES } = require('../utils/diagramCatalogue');
const { THEME_NAMES } = require('../utils/themes');
const { generateAiSyntax } = require('../utils/groq');
const { renderDiagram } = require('../utils/plantuml');

router.get('/', (req, res) => {
  res.render('index', { title: 'Structura AI – AI-Powered UML Generator' });
});

router.get('/try', loginRequired, (req, res) => {
  res.render('generate', {
    title: 'UML Generator – Structura AI',
    diagram_types: DIAGRAM_TYPES,
    themes: THEME_NAMES,
    username: req.session.username,
  });
});

router.get('/history', loginRequired, async (req, res) => {
  const diagrams = await Diagram.find({ user: req.session.userId })
    .sort({ createdAt: -1 })
    .limit(100);

  res.render('history', {
    title: 'My Diagrams – Structura AI',
    history: diagrams.map((d) => d.toDict(req.session.username)),
    username: req.session.username,
  });
});

router.post('/generate', loginRequired, upload.none(), async (req, res) => {
  const projectName = (req.body.project_name || '').trim();
  const diagramType = (req.body.diagram_type || '').trim();
  let theme = (req.body.theme || '').trim() || null;

  if (!projectName || !diagramType) {
    return res.status(400).json({ error: 'Project title and diagram type are required.' });
  }
  if (!DIAGRAM_TYPES.includes(diagramType)) {
    return res.status(400).json({ error: 'Invalid diagram type.' });
  }
  if (theme && !THEME_NAMES.includes(theme)) {
    theme = null;
  }

  try {
    console.log(
      `[generate] user=${req.session.username} project=${projectName} type=${diagramType} theme=${theme}`
    );
    const syntax = await generateAiSyntax(projectName, diagramType, theme);
    const pngBuffer = await renderDiagram(syntax);
    const b64 = pngBuffer.toString('base64');

    const diagram = await Diagram.create({
      user: req.session.userId,
      project: projectName,
      diagramType,
      theme: theme || 'Default',
      syntax,
      imageData: pngBuffer,
      imageMimeType: 'image/png',
    });

    res.json({ diagram: b64, syntax, entry_id: diagram._id.toString() });
  } catch (err) {
    console.error('[generate] error:', err.message);
    if (err.name === 'ValidationError') {
      return res.status(422).json({ error: err.message });
    }
    res.status(500).json({ error: err.message || 'Unexpected error during generation.' });
  }
});

router.get('/api/history', apiLoginRequired, async (req, res) => {
  const diagrams = await Diagram.find({ user: req.session.userId })
    .sort({ createdAt: -1 })
    .limit(50);
  res.json(diagrams.map((d) => d.toDict(req.session.username)));
});

router.delete('/api/history/:entryId', apiLoginRequired, async (req, res) => {
  const { entryId } = req.params;
  if (!mongoose.Types.ObjectId.isValid(entryId)) {
    return res.status(404).json({ error: 'Not found.' });
  }

  const diagram = await Diagram.findOneAndDelete({
    _id: entryId,
    user: req.session.userId,
  });

  if (!diagram) {
    return res.status(404).json({ error: 'Not found.' });
  }
  res.json({ deleted: entryId });
});

// Serves the diagram PNG straight out of MongoDB.
router.get('/diagram/:entryId/image', loginRequired, async (req, res) => {
  const { entryId } = req.params;
  if (!mongoose.Types.ObjectId.isValid(entryId)) {
    return res.status(404).end();
  }

  const diagram = await Diagram.findById(entryId);
  if (!diagram) return res.status(404).end();

  if (diagram.user.toString() !== req.session.userId) {
    return res.status(403).json({ error: 'Forbidden' });
  }

  res.set('Content-Type', diagram.imageMimeType || 'image/png');
  res.send(diagram.imageData);
});

router.get('/health', async (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

module.exports = router;
