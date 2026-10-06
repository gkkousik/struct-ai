// Pure `skinparam` blocks — no `!theme` directive — so rendering is
// guaranteed to work against any public PlantUML server and always stays
// readable regardless of diagram type.

const THEMES = {
  'Classic Blue': `
skinparam backgroundColor #FFFFFF
skinparam defaultFontName Arial
skinparam defaultFontSize 13
skinparam defaultFontColor #0D47A1
skinparam ArrowColor #1565C0
skinparam ArrowFontColor #0D47A1
skinparam ClassBackgroundColor #E3F2FD
skinparam ClassBorderColor #1565C0
skinparam ClassFontColor #0D47A1
skinparam ActorBackgroundColor #E3F2FD
skinparam ActorBorderColor #1565C0
skinparam ParticipantBackgroundColor #E3F2FD
skinparam ParticipantBorderColor #1565C0
skinparam SequenceLifeLineBorderColor #1565C0
skinparam UsecaseBackgroundColor #E3F2FD
skinparam UsecaseBorderColor #1565C0
skinparam ComponentBackgroundColor #E3F2FD
skinparam ComponentBorderColor #1565C0
skinparam NoteBackgroundColor #FFF9C4
skinparam NoteBorderColor #F9A825
`.trim(),

  'Dark Neon': `
skinparam backgroundColor #0d1117
skinparam defaultFontName "JetBrains Mono"
skinparam defaultFontSize 13
skinparam defaultFontColor #00ff88
skinparam ArrowColor #00ff88
skinparam ArrowFontColor #00ff88
skinparam ClassBackgroundColor #0d1117
skinparam ClassBorderColor #00ff88
skinparam ClassFontColor #00ff88
skinparam ActorBackgroundColor #0d1117
skinparam ActorBorderColor #00ff88
skinparam ParticipantBackgroundColor #0d1117
skinparam ParticipantBorderColor #00ff88
skinparam SequenceLifeLineBorderColor #00ff88
skinparam UsecaseBackgroundColor #0d1117
skinparam UsecaseBorderColor #00ff88
skinparam ComponentBackgroundColor #0d1117
skinparam ComponentBorderColor #00ff88
skinparam NoteBackgroundColor #161b22
skinparam NoteBorderColor #00ff88
skinparam NoteFontColor #00ff88
`.trim(),

  'Sunset Orange': `
skinparam backgroundColor #FFF8F0
skinparam defaultFontName Arial
skinparam defaultFontSize 13
skinparam defaultFontColor #BF360C
skinparam ArrowColor #E65100
skinparam ArrowFontColor #BF360C
skinparam ClassBackgroundColor #FFE0B2
skinparam ClassBorderColor #E65100
skinparam ClassFontColor #BF360C
skinparam ActorBackgroundColor #FFE0B2
skinparam ActorBorderColor #E65100
skinparam ParticipantBackgroundColor #FFE0B2
skinparam ParticipantBorderColor #E65100
skinparam SequenceLifeLineBorderColor #E65100
skinparam UsecaseBackgroundColor #FFE0B2
skinparam UsecaseBorderColor #E65100
skinparam ComponentBackgroundColor #FFE0B2
skinparam ComponentBorderColor #E65100
skinparam NoteBackgroundColor #FFF3E0
skinparam NoteBorderColor #FB8C00
`.trim(),

  'Forest Green': `
skinparam backgroundColor #F1F8F1
skinparam defaultFontName Arial
skinparam defaultFontSize 13
skinparam defaultFontColor #1B5E20
skinparam ArrowColor #2E7D32
skinparam ArrowFontColor #1B5E20
skinparam ClassBackgroundColor #C8E6C9
skinparam ClassBorderColor #2E7D32
skinparam ClassFontColor #1B5E20
skinparam ActorBackgroundColor #C8E6C9
skinparam ActorBorderColor #2E7D32
skinparam ParticipantBackgroundColor #C8E6C9
skinparam ParticipantBorderColor #2E7D32
skinparam SequenceLifeLineBorderColor #2E7D32
skinparam UsecaseBackgroundColor #C8E6C9
skinparam UsecaseBorderColor #2E7D32
skinparam ComponentBackgroundColor #C8E6C9
skinparam ComponentBorderColor #2E7D32
skinparam NoteBackgroundColor #DCEDC8
skinparam NoteBorderColor #689F38
`.trim(),

  'Royal Purple': `
skinparam backgroundColor #F8F3FB
skinparam defaultFontName Arial
skinparam defaultFontSize 13
skinparam defaultFontColor #4A148C
skinparam ArrowColor #6A1B9A
skinparam ArrowFontColor #4A148C
skinparam ClassBackgroundColor #E1BEE7
skinparam ClassBorderColor #6A1B9A
skinparam ClassFontColor #4A148C
skinparam ActorBackgroundColor #E1BEE7
skinparam ActorBorderColor #6A1B9A
skinparam ParticipantBackgroundColor #E1BEE7
skinparam ParticipantBorderColor #6A1B9A
skinparam SequenceLifeLineBorderColor #6A1B9A
skinparam UsecaseBackgroundColor #E1BEE7
skinparam UsecaseBorderColor #6A1B9A
skinparam ComponentBackgroundColor #E1BEE7
skinparam ComponentBorderColor #6A1B9A
skinparam NoteBackgroundColor #F3E5F5
skinparam NoteBorderColor #8E24AA
`.trim(),

  'Midnight Dark': `
skinparam backgroundColor #1a1a2e
skinparam defaultFontName Arial
skinparam defaultFontSize 13
skinparam defaultFontColor #eaeaea
skinparam ArrowColor #e94560
skinparam ArrowFontColor #eaeaea
skinparam ClassBackgroundColor #16213e
skinparam ClassBorderColor #e94560
skinparam ClassFontColor #eaeaea
skinparam ActorBackgroundColor #16213e
skinparam ActorBorderColor #e94560
skinparam ParticipantBackgroundColor #16213e
skinparam ParticipantBorderColor #e94560
skinparam SequenceLifeLineBorderColor #e94560
skinparam UsecaseBackgroundColor #16213e
skinparam UsecaseBorderColor #e94560
skinparam ComponentBackgroundColor #16213e
skinparam ComponentBorderColor #e94560
skinparam NoteBackgroundColor #0f3460
skinparam NoteBorderColor #e94560
skinparam NoteFontColor #eaeaea
`.trim(),

  'Ocean Teal': `
skinparam backgroundColor #F0FAFB
skinparam defaultFontName Arial
skinparam defaultFontSize 13
skinparam defaultFontColor #004D40
skinparam ArrowColor #00695C
skinparam ArrowFontColor #004D40
skinparam ClassBackgroundColor #B2EBF2
skinparam ClassBorderColor #00695C
skinparam ClassFontColor #004D40
skinparam ActorBackgroundColor #B2EBF2
skinparam ActorBorderColor #00695C
skinparam ParticipantBackgroundColor #B2EBF2
skinparam ParticipantBorderColor #00695C
skinparam SequenceLifeLineBorderColor #00695C
skinparam UsecaseBackgroundColor #B2EBF2
skinparam UsecaseBorderColor #00695C
skinparam ComponentBackgroundColor #B2EBF2
skinparam ComponentBorderColor #00695C
skinparam NoteBackgroundColor #E0F7FA
skinparam NoteBorderColor #00838F
`.trim(),

  'Rose Gold': `
skinparam backgroundColor #FFF5F8
skinparam defaultFontName Arial
skinparam defaultFontSize 13
skinparam defaultFontColor #880E4F
skinparam ArrowColor #C2185B
skinparam ArrowFontColor #880E4F
skinparam ClassBackgroundColor #F8BBD9
skinparam ClassBorderColor #C2185B
skinparam ClassFontColor #880E4F
skinparam ActorBackgroundColor #F8BBD9
skinparam ActorBorderColor #C2185B
skinparam ParticipantBackgroundColor #F8BBD9
skinparam ParticipantBorderColor #C2185B
skinparam SequenceLifeLineBorderColor #C2185B
skinparam UsecaseBackgroundColor #F8BBD9
skinparam UsecaseBorderColor #C2185B
skinparam ComponentBackgroundColor #F8BBD9
skinparam ComponentBorderColor #C2185B
skinparam NoteBackgroundColor #FCE4EC
skinparam NoteBorderColor #D81B60
`.trim(),
};

const THEME_NAMES = Object.keys(THEMES);

function getThemeSkinparam(themeName) {
  return THEMES[themeName] || '';
}

module.exports = { THEMES, THEME_NAMES, getThemeSkinparam };
