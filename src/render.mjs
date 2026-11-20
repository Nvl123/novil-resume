/**
 * Escapes special HTML characters to safely interpolate CV data into HTML.
 * @param {string} value
 * @returns {string}
 */
function escapeHtml(value) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function renderContact(contact) {
  const label = escapeHtml(contact.label);
  if (!contact.href) {
    return `<span>${label}</span>`;
  }

  const href = escapeHtml(contact.href);
  const isExternal = /^https?:\/\//i.test(contact.href);
  const externalAttrs = isExternal ? ' target="_blank" rel="noopener noreferrer"' : '';
  return `<a href="${href}"${externalAttrs}>${label}</a>`;
}

function renderEntries(items) {
  return items
    .map((item) => {
      const highlights = Array.isArray(item.highlights) ? item.highlights : [];
      const isCompact = highlights.length <= 3;
      const compactClass = isCompact ? ' entry--compact' : '';

      const orgHtml = `<strong>${escapeHtml(item.organization)}</strong>${
        item.location ? `<span class="entry-location"> - ${escapeHtml(item.location)}</span>` : ''
      }`;
      const periodHtml = item.period ? `<div class="entry-period">${escapeHtml(item.period)}</div>` : '';
      const roleHtml = item.role ? `<div class="entry-role">${escapeHtml(item.role)}</div>` : '';
      const descHtml = item.description
        ? `<p class="entry-description">${escapeHtml(item.description)}</p>`
        : '';

      const listHtml =
        highlights.length > 0
          ? `<ul class="entry-list">\n${highlights
              .map((bullet) => `          <li>${escapeHtml(bullet)}</li>`)
              .join('\n')}\n        </ul>`
          : '';

      return `      <article class="entry${compactClass}">
        <div class="entry-head">
          <div class="entry-header">
            <div class="entry-org">${orgHtml}</div>
            ${periodHtml}
          </div>
          ${roleHtml}
          ${descHtml}
        </div>
        ${listHtml}
      </article>`;
    })
    .join('\n');
}

function renderSkills(items) {
  const listItems = items
    .map((item) => {
      const yearPart = item.year ? ` (${escapeHtml(item.year)})` : '';
      return `        <li><strong>${escapeHtml(item.category)}</strong>${yearPart}: ${escapeHtml(item.detail)}</li>`;
    })
    .join('\n');

  return `      <ul class="skill-list">\n${listItems}\n      </ul>`;
}

function renderSection(section) {
  const id = escapeHtml(section.id || '');
  const title = escapeHtml(section.title || '');
  const items = Array.isArray(section.items) ? section.items : [];

  let bodyHtml = '';
  if (section.type === 'skills') {
    bodyHtml = renderSkills(items);
  } else {
    bodyHtml = renderEntries(items);
  }

  return `    <section class="cv-section" id="${id}">
      <h2 class="section-title">${title}</h2>
${bodyHtml}
    </section>`;
}

/**
 * Renders the complete HTML5 document for the CV from JSON data.
 * @param {object} cvData
 * @returns {string}
 */
export function renderCvHtml(cvData) {
  const meta = cvData.meta || {};
  const profile = cvData.profile || {};
  const sections = Array.isArray(cvData.sections) ? cvData.sections : [];

  const lang = escapeHtml(meta.lang || 'id');
  const title = escapeHtml(meta.documentTitle || profile.name || 'CV');
  const pdfFileName = escapeHtml(meta.pdfFileName || 'CV.pdf');

  const contacts = Array.isArray(profile.contacts) ? profile.contacts : [];
  const contactsHtml = contacts.map(renderContact).join('<span class="sep"> | </span>');
  const summaryHtml = profile.summary
    ? `      <p class="summary">${escapeHtml(profile.summary)}</p>`
    : '';
  const sectionsHtml = sections.map(renderSection).join('\n');

  return `<!DOCTYPE html>
<html lang="${lang}">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
  <link rel="stylesheet" href="./styles.css">
</head>
<body>
  <div class="toolbar no-print">
    <span class="toolbar-title">${escapeHtml(profile.name || title)}</span>
    <div class="toolbar-actions">
      <a class="btn btn-primary" href="./${pdfFileName}" download>Download PDF</a>
      <button type="button" class="btn btn-secondary" onclick="window.print()">Print / Save PDF</button>
    </div>
  </div>

  <main class="cv-sheet">
    <header class="cv-header">
      <h1>${escapeHtml(profile.name || '')}</h1>
      <p class="contact-line">${contactsHtml}</p>
${summaryHtml}
    </header>

${sectionsHtml}
  </main>
</body>
</html>
`;
}
