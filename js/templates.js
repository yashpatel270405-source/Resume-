/**
 * RESUBUILD LAYOUT COMPILER ENGINE
 * Translates JSON resume state into highly polished semantic HTML.
 * Includes SVGs and layouts: Minimalist, Professional, Creative, Executive.
 */

// SVG Icon templates
const ICONS = {
  email: `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" width="12" height="12"><path stroke-linecap="round" stroke-linejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 0 1-2.25 2.25h-15a2.25 2.25 0 0 1-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25m19.5 0v.243a2.25 2.25 0 0 1-1.07 1.916l-7.5 4.615a2.25 2.25 0 0 1-2.36 0L3.32 8.91a2.25 2.25 0 0 1-1.07-1.916V6.75" /></svg>`,
  phone: `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" width="12" height="12"><path stroke-linecap="round" stroke-linejoin="round" d="M2.25 6.622A17.514 17.514 0 0 0 19.5 21.75c.912 0 1.792-.098 2.643-.287c.833-.186 1.478-.83 1.618-1.678l.5-3a2.25 2.25 0 0 0-1.35-2.545l-3-1.125a2.25 2.25 0 0 0-2.484.534l-1.24 1.24a12.13 12.13 0 0 1-5.385-5.385l1.24-1.24a2.25 2.25 0 0 0 .534-2.484l-1.125-3a2.25 2.25 0 0 0-2.545-1.35l-3 .5c-.847.14-1.492.785-1.678 1.618A17.513 17.513 0 0 0 2.25 6.622z" /></svg>`,
  location: `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" width="12" height="12"><path stroke-linecap="round" stroke-linejoin="round" d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0z" /><path stroke-linecap="round" stroke-linejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25s-7.5-4.108-7.5-11.25a7.5 7.5 0 1 1 15 0z" /></svg>`,
  website: `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" width="12" height="12"><path stroke-linecap="round" stroke-linejoin="round" d="M12 21a9.004 9.004 0 0 0 8.716-6.747M12 21a9.004 9.004 0 0 1-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 0 1 7.843 4.582M12 3a8.997 8.997 0 0 0-7.843 4.582m15.686 0A11.953 11.953 0 0 1 12 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0 1 21 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0 1 12 16.5c-3.162 0-6.133-.815-8.716-2.247m0 0A9.015 9.015 0 0 1 3 12c0-.778.099-1.533.284-2.253" /></svg>`,
  linkedin: `<svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 24 24" width="12" height="12"><path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.779-1.75-1.75s.784-1.75 1.75-1.75 1.75.779 1.75 1.75-.784 1.75-1.75 1.75zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/></svg>`,
  github: `<svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 24 24" width="12" height="12"><path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/></svg>`
};

/**
 * Builds standard contact list HTML
 */
function renderContactList(pi) {
  let html = '';
  if (pi.email) html += `<span class="resume-contact-item">${ICONS.email}<span contenteditable="true" data-path="personal.email">${pi.email}</span></span>`;
  if (pi.phone) html += `<span class="resume-contact-item">${ICONS.phone}<span contenteditable="true" data-path="personal.phone">${pi.phone}</span></span>`;
  if (pi.location) html += `<span class="resume-contact-item">${ICONS.location}<span contenteditable="true" data-path="personal.location">${pi.location}</span></span>`;
  if (pi.website) html += `<span class="resume-contact-item">${ICONS.website}<span contenteditable="true" data-path="personal.website">${pi.website}</span></span>`;
  if (pi.linkedin) html += `<span class="resume-contact-item">${ICONS.linkedin}<span contenteditable="true" data-path="personal.linkedin">${pi.linkedin}</span></span>`;
  if (pi.github) html += `<span class="resume-contact-item">${ICONS.github}<span contenteditable="true" data-path="personal.github">${pi.github}</span></span>`;
  return html;
}

/**
 * Helper to split summary or multi-line text into array bullets
 */
function splitBullets(descText) {
  if (!descText) return [];
  if (Array.isArray(descText)) return descText;
  return descText.split('\n').map(line => line.trim()).filter(line => line.length > 0);
}

/**
 * Renders bullet points for experiences or projects
 */
function renderBullets(bullets, basePath = '') {
  const list = splitBullets(bullets);
  if (list.length === 0) return '';
  return `<ul class="resume-item-desc">${list.map((bullet, bIndex) => `<li contenteditable="true" data-path="${basePath ? `${basePath}.${bIndex}` : ''}">${bullet}</li>`).join('')}</ul>`;
}

/**
 * Render templates switcher engine
 */
const TEMPLATE_RENDERERS = {
  
  // 1. MINIMALIST LAYOUT
  minimalist: function(data) {
    const contactHtml = renderContactList(data.personal);
    
    return `
      <!-- Header -->
      <header class="resume-header">
        <h1 class="resume-header-name" contenteditable="true" data-path="personal.name">${data.personal.name || 'John Doe'}</h1>
        <div class="resume-header-title" contenteditable="true" data-path="personal.title">${data.personal.title || 'Professional Title'}</div>
        <div class="resume-contact-grid">${contactHtml}</div>
      </header>

      <!-- Professional Summary -->
      ${data.personal.summary ? `
      <section class="resume-section">
        <h2 class="resume-section-title">Summary</h2>
        <p class="resume-item-desc-text" contenteditable="true" data-path="personal.summary">${data.personal.summary}</p>
      </section>` : ''}

      <!-- Work Experience -->
      ${data.experience && data.experience.length > 0 ? `
      <section class="resume-section">
        <h2 class="resume-section-title">Experience</h2>
        ${data.experience.map((exp, index) => `
          <div class="resume-item-block">
            <div class="resume-item-header">
              <span class="resume-item-role" contenteditable="true" data-path="experience.${index}.role">${exp.role}</span>
              <span class="resume-item-org" contenteditable="true" data-path="experience.${index}.company">${exp.company}</span>
            </div>
            <div class="resume-item-meta">
              <span contenteditable="true" data-path="experience.${index}.location">${exp.location || ''}</span>
              <span>
                <span contenteditable="true" data-path="experience.${index}.startDate">${exp.startDate}</span> – 
                <span contenteditable="true" data-path="experience.${index}.endDate">${exp.endDate || 'Present'}</span>
              </span>
            </div>
            ${renderBullets(exp.description, `experience.${index}.description`)}
          </div>
        `).join('')}
      </section>` : ''}

      <!-- Education -->
      ${data.education && data.education.length > 0 ? `
      <section class="resume-section">
        <h2 class="resume-section-title">Education</h2>
        ${data.education.map((edu, index) => `
          <div class="resume-item-block">
            <div class="resume-item-header">
              <span class="resume-item-role" contenteditable="true" data-path="education.${index}.degree">${edu.degree}</span>
              <span class="resume-item-org" contenteditable="true" data-path="education.${index}.institution">${edu.institution}</span>
            </div>
            <div class="resume-item-meta">
              <span contenteditable="true" data-path="education.${index}.location">${edu.location || ''}</span>
              <span>
                <span contenteditable="true" data-path="education.${index}.startDate">${edu.startDate}</span> – 
                <span contenteditable="true" data-path="education.${index}.endDate">${edu.endDate || ''}</span>
              </span>
            </div>
            ${edu.gpa ? `<div class="resume-item-desc-text" style="font-size:8.5pt; color:#6b7280;">GPA: <span contenteditable="true" data-path="education.${index}.gpa">${edu.gpa}</span></div>` : ''}
          </div>
        `).join('')}
      </section>` : ''}

      <!-- Projects -->
      ${data.projects && data.projects.length > 0 ? `
      <section class="resume-section">
        <h2 class="resume-section-title">Projects</h2>
        ${data.projects.map((proj, index) => `
          <div class="resume-item-block">
            <div class="resume-item-header">
              <span class="resume-item-role">
                <span contenteditable="true" data-path="projects.${index}.name">${proj.name}</span>
                ${proj.link ? `<span style="font-size: 8.5pt; font-weight: normal; color:#6b7280;">(<span contenteditable="true" data-path="projects.${index}.link">${proj.link}</span>)</span>` : ''}
              </span>
              <span class="resume-item-org" style="font-weight: 500; font-size:9pt;" contenteditable="true" data-path="projects.${index}.role">${proj.role || ''}</span>
            </div>
            <div class="resume-item-meta">
              <span></span>
              <span>
                <span contenteditable="true" data-path="projects.${index}.startDate">${proj.startDate || ''}</span> – 
                <span contenteditable="true" data-path="projects.${index}.endDate">${proj.endDate || ''}</span>
              </span>
            </div>
            ${renderBullets(proj.description, `projects.${index}.description`)}
          </div>
        `).join('')}
      </section>` : ''}

      <!-- Skills -->
      ${data.skills && data.skills.length > 0 ? `
      <section class="resume-section">
        <h2 class="resume-section-title">Skills</h2>
        <div class="resume-skills-container">
          ${data.skills.map((sk, index) => `<span class="resume-skill-tag"><span contenteditable="true" data-path="skills.${index}.name">${sk.name}</span>${sk.level ? ` (<span contenteditable="true" data-path="skills.${index}.level">${sk.level}</span>)` : ''}</span>`).join('')}
        </div>
      </section>` : ''}

      <!-- Extra Information: Languages & Certs -->
      ${(data.languages && data.languages.length > 0) || (data.certifications && data.certifications.length > 0) ? `
      <section class="resume-section">
        <h2 class="resume-section-title">Additional Info</h2>
        <div class="resume-bullets-list">
          <!-- Languages -->
          ${data.languages && data.languages.map((lang, index) => `
            <div class="resume-bullet-item">
              <span class="resume-bullet-dot"></span>
              <span><strong contenteditable="true" data-path="languages.${index}.name">${lang.name}</strong>: <span contenteditable="true" data-path="languages.${index}.level">${lang.level}</span></span>
            </div>
          `).join('')}
          <!-- Certifications -->
          ${data.certifications && data.certifications.map((cert, index) => `
            <div class="resume-bullet-item">
              <span class="resume-bullet-dot"></span>
              <span><strong contenteditable="true" data-path="certifications.${index}.name">${cert.name}</strong> – <span contenteditable="true" data-path="certifications.${index}.issuer">${cert.issuer}</span> (<span contenteditable="true" data-path="certifications.${index}.date">${cert.date}</span>)</span>
            </div>
          `).join('')}
        </div>
      </section>` : ''}
    `;
  },

  // 2. PROFESSIONAL (ATS SPLIT) LAYOUT
  professional: function(data) {
    const contactHtml = renderContactList(data.personal);
    
    return `
      <!-- Header -->
      <header class="resume-header">
        <h1 class="resume-header-name">${data.personal.name || 'John Doe'}</h1>
        <div class="resume-header-title">${data.personal.title || 'Professional Title'}</div>
        <div class="resume-contact-grid" style="font-size: 8.5pt; gap: 8px 16px;">${contactHtml}</div>
      </header>

      <!-- Body columns -->
      <div class="resume-grid-layout">
        
        <!-- Left Side: Experience & Projects -->
        <div class="resume-left-col">
          
          <!-- Summary -->
          ${data.personal.summary ? `
          <section class="resume-section">
            <h2 class="resume-section-title">Profile</h2>
            <p class="resume-item-desc-text" style="margin-bottom: 12px; text-align: justify;">${data.personal.summary}</p>
          </section>` : ''}

          <!-- Experience -->
          ${data.experience && data.experience.length > 0 ? `
          <section class="resume-section">
            <h2 class="resume-section-title">Experience</h2>
            ${data.experience.map(exp => `
              <div class="resume-item-block">
                <div class="resume-item-header">
                  <span class="resume-item-role">${exp.role}</span>
                </div>
                <div class="resume-item-header" style="font-size: 9pt; font-weight:600; color:var(--primary-color); margin-top: -2px;">
                  <span>${exp.company}</span>
                  <span style="font-weight: normal; color:#6b7280; font-size: 8.5pt;">${exp.startDate} – ${exp.endDate || 'Present'}</span>
                </div>
                ${renderBullets(exp.description)}
              </div>
            `).join('')}
          </section>` : ''}

          <!-- Projects -->
          ${data.projects && data.projects.length > 0 ? `
          <section class="resume-section">
            <h2 class="resume-section-title">Projects</h2>
            ${data.projects.map(proj => `
              <div class="resume-item-block">
                <div class="resume-item-header">
                  <span class="resume-item-role" style="font-size: 9.5pt;">${proj.name}</span>
                </div>
                <div class="resume-item-header" style="font-size:8.5pt; font-weight:normal; color:#6b7280; margin-top:-2px;">
                  <span>${proj.role || ''}</span>
                  <span>${proj.startDate || ''} – ${proj.endDate || ''}</span>
                </div>
                ${renderBullets(proj.description)}
              </div>
            `).join('')}
          </section>` : ''}
        </div>

        <!-- Right Side: Contact details, Education, Skills, and More -->
        <div class="resume-right-col">
          
          <!-- Education -->
          ${data.education && data.education.length > 0 ? `
          <section class="resume-section">
            <h2 class="resume-section-title">Education</h2>
            ${data.education.map(edu => `
              <div class="resume-item-block" style="margin-bottom: 8px;">
                <div style="font-weight: 700; font-size: 9pt; color:#111827;">${edu.degree}</div>
                <div style="font-size: 8.5pt; font-weight:600; color:var(--primary-color);">${edu.institution}</div>
                <div style="font-size: 7.5pt; color:#6b7280;">${edu.startDate} – ${edu.endDate || ''}</div>
                ${edu.gpa ? `<div style="font-size: 7.5pt; color:#9ca3af;">GPA: ${edu.gpa}</div>` : ''}
              </div>
            `).join('')}
          </section>` : ''}

          <!-- Skills with levels -->
          ${data.skills && data.skills.length > 0 ? `
          <section class="resume-section">
            <h2 class="resume-section-title">Skills</h2>
            <div class="resume-skills-container" style="flex-direction: column; gap: 0;">
              ${data.skills.map(sk => `
                <div class="resume-skill-tag">
                  <span>${sk.name}</span>
                  ${sk.level ? `<span class="resume-skill-level">${sk.level}</span>` : ''}
                </div>
              `).join('')}
            </div>
          </section>` : ''}

          <!-- Languages -->
          ${data.languages && data.languages.length > 0 ? `
          <section class="resume-section">
            <h2 class="resume-section-title">Languages</h2>
            <div style="font-size:8.5pt; color:#4b5563; display: flex; flex-direction:column; gap:4px;">
              ${data.languages.map(lang => `
                <div><strong>${lang.name}:</strong> <span style="color:#6b7280">${lang.level}</span></div>
              `).join('')}
            </div>
          </section>` : ''}

          <!-- Certifications -->
          ${data.certifications && data.certifications.length > 0 ? `
          <section class="resume-section">
            <h2 class="resume-section-title">Awards</h2>
            <div style="font-size:8pt; color:#4b5563; display: flex; flex-direction:column; gap:6px;">
              ${data.certifications.map(cert => `
                <div>
                  <div style="font-weight:700; color:#111827;">${cert.name}</div>
                  <div style="color:#6b7280; font-size:7.5pt;">${cert.issuer} (${cert.date})</div>
                </div>
              `).join('')}
            </div>
          </section>` : ''}
        </div>
      </div>
    `;
  },

  // 3. CREATIVE SIDEBAR LAYOUT
  creative: function(data) {
    const contactHtml = renderContactList(data.personal);
    
    return `
      <!-- LEFT SIDEBAR PANEL -->
      <aside class="resume-sidebar-left">
        <h1 class="resume-header-name">${data.personal.name || 'John Doe'}</h1>
        <div class="resume-header-title">${data.personal.title || 'Professional Title'}</div>

        <!-- Contact Links -->
        <div class="resume-contact-grid">${contactHtml}</div>

        <!-- Education Sidebar -->
        ${data.education && data.education.length > 0 ? `
        <section class="resume-section">
          <h2 class="resume-section-title">Education</h2>
          ${data.education.map(edu => `
            <div class="resume-item-block" style="margin-bottom: 10px;">
              <div style="font-weight: 700; font-size: 8.5pt; color:#ffffff;">${edu.degree}</div>
              <div style="font-size: 8pt; color:var(--primary-color); font-weight:600;">${edu.institution}</div>
              <div style="font-size: 7.5pt; color:#94a3b8;">${edu.startDate} – ${edu.endDate || ''}</div>
            </div>
          `).join('')}
        </section>` : ''}

        <!-- Skills Sidebar -->
        ${data.skills && data.skills.length > 0 ? `
        <section class="resume-section">
          <h2 class="resume-section-title">Skills</h2>
          <div class="resume-skills-container">
            ${data.skills.map(sk => `<span class="resume-skill-tag">${sk.name}</span>`).join('')}
          </div>
        </section>` : ''}

        <!-- Languages -->
        ${data.languages && data.languages.length > 0 ? `
        <section class="resume-section">
          <h2 class="resume-section-title">Languages</h2>
          <div class="resume-bullets-list">
            ${data.languages.map(lang => `
              <div class="resume-bullet-item">
                <span class="resume-bullet-dot"></span>
                <span style="font-size: 8.5pt;"><strong>${lang.name}:</strong> ${lang.level}</span>
              </div>
            `).join('')}
          </div>
        </section>` : ''}
      </aside>

      <!-- MAIN CONTENT PANEL -->
      <main class="resume-main-right">
        
        <!-- Summary Profile -->
        ${data.personal.summary ? `
        <section class="resume-section">
          <h2 class="resume-section-title">Summary</h2>
          <p class="resume-item-desc-text" style="font-size: 9.5pt; line-height: 1.45;">${data.personal.summary}</p>
        </section>` : ''}

        <!-- Work Experience -->
        ${data.experience && data.experience.length > 0 ? `
        <section class="resume-section">
          <h2 class="resume-section-title">Professional Experience</h2>
          ${data.experience.map(exp => `
            <div class="resume-item-block">
              <div class="resume-item-header">
                <span class="resume-item-role">${exp.role}</span>
                <span class="resume-item-org" style="font-weight:500;">${exp.company}</span>
              </div>
              <div class="resume-item-meta" style="margin-top: -2px;">
                <span>${exp.location || ''}</span>
                <span>${exp.startDate} – ${exp.endDate || 'Present'}</span>
              </div>
              ${renderBullets(exp.description)}
            </div>
          `).join('')}
        </section>` : ''}

        <!-- Projects -->
        ${data.projects && data.projects.length > 0 ? `
        <section class="resume-section">
          <h2 class="resume-section-title">Projects</h2>
          ${data.projects.map(proj => `
            <div class="resume-item-block">
              <div class="resume-item-header">
                <span class="resume-item-role">${proj.name}</span>
                <span class="resume-item-org" style="font-weight: 500; font-size:9pt;">${proj.role || ''}</span>
              </div>
              <div class="resume-item-meta" style="margin-top: -2px;">
                <span>${proj.link || ''}</span>
                <span>${proj.startDate || ''} – ${proj.endDate || ''}</span>
              </div>
              ${renderBullets(proj.description)}
            </div>
          `).join('')}
        </section>` : ''}

        <!-- Certifications -->
        ${data.certifications && data.certifications.length > 0 ? `
        <section class="resume-section">
          <h2 class="resume-section-title">Certifications</h2>
          <div class="resume-bullets-list" style="grid-template-columns: 1fr;">
            ${data.certifications.map(cert => `
              <div class="resume-bullet-item" style="margin-bottom: 2px;">
                <span class="resume-bullet-dot"></span>
                <span><strong>${cert.name}</strong> – ${cert.issuer} (${cert.date})</span>
              </div>
            `).join('')}
          </div>
        </section>` : ''}
      </main>
    `;
  },

  // 4. EXECUTIVE CLASSICAL LAYOUT
  executive: function(data) {
    let contactHtml = '';
    if (data.personal.email) contactHtml += `<span class="resume-contact-item">${data.personal.email}</span>`;
    if (data.personal.phone) contactHtml += `<span class="resume-contact-item">${data.personal.phone}</span>`;
    if (data.personal.location) contactHtml += `<span class="resume-contact-item">${data.personal.location}</span>`;
    if (data.personal.website) contactHtml += `<span class="resume-contact-item">${data.personal.website}</span>`;
    
    // Add additional links if available (centered list representation)
    let linksHtml = '';
    if (data.personal.linkedin) linksHtml += `<span class="resume-contact-item">LinkedIn: ${data.personal.linkedin}</span>`;
    if (data.personal.github) linksHtml += `<span class="resume-contact-item">GitHub: ${data.personal.github}</span>`;

    return `
      <!-- Header -->
      <header class="resume-header">
        <h1 class="resume-header-name">${data.personal.name || 'John Doe'}</h1>
        <div class="resume-header-title">${data.personal.title || 'Professional Title'}</div>
        <div class="resume-contact-grid" style="font-size: 8.5pt; font-weight:500;">
          ${contactHtml}
        </div>
        ${linksHtml ? `
        <div class="resume-contact-grid" style="font-size: 8.5pt; font-weight:500; margin-top: -8px;">
          ${linksHtml}
        </div>` : ''}
      </header>

      <!-- Summary -->
      ${data.personal.summary ? `
      <section class="resume-section">
        <h2 class="resume-section-title">Executive Summary</h2>
        <p class="resume-item-desc-text" style="font-size: 10pt; text-align: justify; line-height: 1.5;">${data.personal.summary}</p>
      </section>` : ''}

      <!-- Experience -->
      ${data.experience && data.experience.length > 0 ? `
      <section class="resume-section">
        <h2 class="resume-section-title">Professional Experience</h2>
        ${data.experience.map(exp => `
          <div class="resume-item-block" style="margin-bottom: 14px;">
            <div class="resume-item-header" style="font-size: 10pt;">
              <span class="resume-item-role">${exp.role}</span>
              <span class="resume-item-org">${exp.company}</span>
            </div>
            <div class="resume-item-meta" style="margin-top:-2px;">
              <span>${exp.location || ''}</span>
              <span>${exp.startDate} – ${exp.endDate || 'Present'}</span>
            </div>
            ${renderBullets(exp.description)}
          </div>
        `).join('')}
      </section>` : ''}

      <!-- Education -->
      ${data.education && data.education.length > 0 ? `
      <section class="resume-section">
        <h2 class="resume-section-title">Academic Credentials</h2>
        ${data.education.map(edu => `
          <div class="resume-item-block">
            <div class="resume-item-header">
              <span class="resume-item-role">${edu.degree}</span>
              <span class="resume-item-org">${edu.institution}</span>
            </div>
            <div class="resume-item-meta">
              <span>${edu.location || ''}</span>
              <span>${edu.startDate} – ${edu.endDate || ''}</span>
            </div>
            ${edu.gpa ? `<div class="resume-item-desc-text" style="font-size:8.5pt; color:#6b7280;">GPA: ${edu.gpa}</div>` : ''}
          </div>
        `).join('')}
      </section>` : ''}

      <!-- Projects -->
      ${data.projects && data.projects.length > 0 ? `
      <section class="resume-section">
        <h2 class="resume-section-title">Key Projects & Initiatives</h2>
        ${data.projects.map(proj => `
          <div class="resume-item-block">
            <div class="resume-item-header">
              <span class="resume-item-role">${proj.name}</span>
              <span class="resume-item-org" style="font-weight: 500; font-size:9pt;">${proj.role || ''}</span>
            </div>
            <div class="resume-item-meta">
              <span>${proj.link || ''}</span>
              <span>${proj.startDate || ''} – ${proj.endDate || ''}</span>
            </div>
            ${renderBullets(proj.description)}
          </div>
        `).join('')}
      </section>` : ''}

      <!-- Skills -->
      ${data.skills && data.skills.length > 0 ? `
      <section class="resume-section">
        <h2 class="resume-section-title">Core Competencies</h2>
        <div class="resume-skills-container" style="justify-content: center;">
          ${data.skills.map(sk => `<span class="resume-skill-tag" style="border-radius: 0; border: 1px solid #374151; background: transparent;">${sk.name}${sk.level ? ` (${sk.level})` : ''}</span>`).join('')}
        </div>
      </section>` : ''}

      <!-- Languages & Certifications Combined -->
      ${(data.languages && data.languages.length > 0) || (data.certifications && data.certifications.length > 0) ? `
      <section class="resume-section">
        <h2 class="resume-section-title">Qualifications & Affiliations</h2>
        <div class="resume-bullets-list" style="margin-top: 6px;">
          <!-- Languages -->
          ${data.languages && data.languages.map(lang => `
            <div class="resume-bullet-item">
              <span class="resume-bullet-dot"></span>
              <span><strong>${lang.name}:</strong> ${lang.level}</span>
            </div>
          `).join('')}
          <!-- Certifications -->
          ${data.certifications && data.certifications.map(cert => `
            <div class="resume-bullet-item">
              <span class="resume-bullet-dot"></span>
              <span><strong>${cert.name}</strong> – ${cert.issuer} (${cert.date})</span>
            </div>
          `).join('')}
        </div>
      </section>` : ''}
    `;
  }

};

/**
 * Main Global Render Entry Point
 * @param {Object} data JSON Resume State
 * @returns {string} Compiled HTML
 */
function renderResume(data) {
  const template = data.template || 'minimalist';
  const renderer = TEMPLATE_RENDERERS[template];
  if (renderer) {
    return renderer(data);
  }
  return TEMPLATE_RENDERERS.minimalist(data);
}

// Bind to window to allow editor.js access
window.renderResume = renderResume;
