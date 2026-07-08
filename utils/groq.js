const axios = require('axios');
const { DIAGRAM_PROMPTS, SYSTEM_PROMPT, GROQ_MODELS } = require('./diagramCatalogue');
const { getThemeSkinparam } = require('./themes');

async function callGroq(projectName, diagramType) {
  const apiKey = process.env.GROQ_API_KEY || '';
  if (!apiKey) {
    throw new Error('GROQ_API_KEY not set. Add it to your .env file.');
  }
  if (!apiKey.startsWith('gsk_')) {
    throw new Error("Invalid GROQ_API_KEY — must start with 'gsk_'.");
  }

  const template = DIAGRAM_PROMPTS[diagramType] || '';
  const userPrompt = template.replace(/PROJECT_NAME/g, projectName);

  let lastError = null;

  for (const model of GROQ_MODELS) {
    const payload = {
      model,
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: userPrompt },
      ],
      max_tokens: 2048,
      temperature: 0.2,
    };

    try {
      console.log(`[groq] model=${model} diagram=${diagramType}`);
      const resp = await axios.post(
        'https://api.groq.com/openai/v1/chat/completions',
        payload,
        {
          headers: {
            Authorization: `Bearer ${apiKey}`,
            'Content-Type': 'application/json',
          },
          timeout: 60000,
          validateStatus: () => true,
        }
      );

      if (resp.status === 401) {
        throw new Error('Groq API key rejected (401).');
      }
      if (resp.status === 429) {
        throw new Error('Groq rate limit (429). Wait a few seconds.');
      }
      if (resp.status === 404) {
        lastError = `Model ${model} not available`;
        continue;
      }
      if (resp.status < 200 || resp.status >= 300) {
        lastError = `HTTP ${resp.status}: ${JSON.stringify(resp.data).slice(0, 200)}`;
        continue;
      }

      const text = resp.data.choices[0].message.content;
      console.log(`[groq] success model=${model}`);
      return text;
    } catch (err) {
      if (err.message.startsWith('Groq')) throw err;
      if (err.code === 'ECONNABORTED') {
        lastError = `Timeout on ${model}`;
      } else {
        lastError = err.message;
      }
    }
  }

  throw new Error(`All Groq models failed. Last error: ${lastError}.`);
}

/**
 * Strips markdown fences, normalizes @startuml/@enduml blocks, removes any
 * stray !theme directives, collapses double braces, and injects our own
 * skinparam theme block. Mirrors the original Python clean_syntax() logic.
 */
function cleanSyntax(raw, themeSkinparam) {
  let text = raw.trim();
  text = text.replace(/^```[a-zA-Z]*\s*/gm, '');
  text = text.replace(/```\s*$/gm, '');
  text = text.trim();

  const tagPairs = [
    ['@startuml', '@enduml'],
    ['@startmindmap', '@endmindmap'],
  ];

  for (const [openTag, closeTag] of tagPairs) {
    const pattern = new RegExp(
      `(${escapeRegex(openTag)}[\\s\\S]*?${escapeRegex(closeTag)})`,
      'i'
    );
    const match = text.match(pattern);
    if (match) {
      let block = match[1].trim();
      block = block.replace(/!theme\s+\S+\n?/g, '');
      block = block.replace(/\{\{/g, '{').replace(/\}\}/g, '}');
      if (themeSkinparam && openTag === '@startuml') {
        block = block.replace('@startuml', `@startuml\n${themeSkinparam}`);
      }
      return block;
    }
  }

  let inner = text.replace(/@start\w+\s*/gi, '');
  inner = inner.replace(/@end\w+\s*/gi, '');
  inner = inner.replace(/!theme\s+\S+\n?/g, '');
  inner = inner.replace(/\{\{/g, '{').replace(/\}\}/g, '}').trim();

  if (!inner) {
    throw new Error('AI returned empty diagram content — please try again.');
  }

  const header = themeSkinparam ? `@startuml\n${themeSkinparam}\n` : '@startuml\n';
  return `${header}${inner}\n@enduml`;
}

function escapeRegex(str) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

async function generateAiSyntax(projectName, diagramType, themeName) {
  const raw = await callGroq(projectName, diagramType);
  const themeSkinparam = themeName ? getThemeSkinparam(themeName) : '';
  let block = cleanSyntax(raw, themeSkinparam);
  block = block.replace(/\{\{/g, '{').replace(/\}\}/g, '}');
  return block;
}

module.exports = { callGroq, cleanSyntax, generateAiSyntax };
