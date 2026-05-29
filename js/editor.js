/**
 * RESUBUILD LIVE EDITOR MANAGER
 * Handles input bindings, dynamic sub-lists (Experience, Edu, Projects, Skills),
 * custom style swatches, zoom levels, and live preview renders.
 */

let currentResume = null;
let saveTimeout = null;

// DOM Elements cache
const DOM = {
  // Navigation / Toolbar
  titleInput: document.getElementById('resume-title-input'),
  saveStatus: document.getElementById('save-status'),
  templateSelect: document.getElementById('template-select'),
  btnSave: document.getElementById('btn-save-resume'),
  btnExport: document.getElementById('btn-export-json'),
  btnPrint: document.getElementById('btn-print'),
  btnDownloadPdf: document.getElementById('btn-download-pdf'),
  
  // Forms fields
  piName: document.getElementById('pi-name'),
  piTitle: document.getElementById('pi-title'),
  piEmail: document.getElementById('pi-email'),
  piPhone: document.getElementById('pi-phone'),
  piLocation: document.getElementById('pi-location'),
  piWebsite: document.getElementById('pi-website'),
  piLinkedin: document.getElementById('pi-linkedin'),
  piGithub: document.getElementById('pi-github'),
  piSummary: document.getElementById('pi-summary'),
  
  // Dynamic Lists containers
  experienceList: document.getElementById('experience-list'),
  educationList: document.getElementById('education-list'),
  projectsList: document.getElementById('projects-list'),
  skillsList: document.getElementById('skills-list'),
  languagesList: document.getElementById('languages-list'),
  certificationsList: document.getElementById('certifications-list'),
  
  // Add item buttons
  btnAddExp: document.getElementById('btn-add-exp'),
  btnAddEdu: document.getElementById('btn-add-edu'),
  btnAddProject: document.getElementById('btn-add-project'),
  btnAddSkill: document.getElementById('btn-add-skill'),
  btnAddLang: document.getElementById('btn-add-lang'),
  btnAddCert: document.getElementById('btn-add-cert'),
  
  // Styling selectors
  marginSelect: document.getElementById('setting-margins'),
  lineHeightSelect: document.getElementById('setting-lineheight'),
  customColorPicker: document.getElementById('custom-color-picker'),
  
  // Preview
  zoomSlider: document.getElementById('zoom-slider'),
  zoomPercentText: document.getElementById('zoom-percent-text'),
  btnFitZoom: document.getElementById('btn-fit-zoom'),
  previewSheet: document.getElementById('a4-printable-document'),
  previewContainer: document.querySelector('.a4-document-viewport')
};

/**
 * Initializes the editor with specific resume data
 * @param {Object} resumeData Resume object
 */
function initEditor(resumeData) {
  if (!resumeData) return;
  
  // Normalize and safeguard all fields and lists to prevent runtime TypeErrors
  currentResume = {
    id: resumeData.id || Date.now(),
    title: resumeData.title || 'Untitled Resume',
    template: resumeData.template || 'minimalist',
    fontPair: resumeData.fontPair || 'inter-sans',
    color: resumeData.color || '#3b82f6',
    margin: resumeData.margin || 'normal',
    lineHeight: resumeData.lineHeight || '1.4',
    personal: {
      name: '',
      title: '',
      email: '',
      phone: '',
      location: '',
      website: '',
      linkedin: '',
      github: '',
      summary: '',
      ...(resumeData.personal || {})
    },
    experience: (Array.isArray(resumeData.experience) ? resumeData.experience : []).map(exp => ({
      company: exp.company || '',
      role: exp.role || '',
      startDate: exp.startDate || '',
      endDate: exp.endDate || '',
      location: exp.location || '',
      description: Array.isArray(exp.description) ? exp.description : (exp.description ? [exp.description] : [])
    })),
    education: (Array.isArray(resumeData.education) ? resumeData.education : []).map(edu => ({
      institution: edu.institution || '',
      degree: edu.degree || '',
      startDate: edu.startDate || '',
      endDate: edu.endDate || '',
      location: edu.location || '',
      gpa: edu.gpa || ''
    })),
    projects: (Array.isArray(resumeData.projects) ? resumeData.projects : []).map(proj => ({
      name: proj.name || '',
      role: proj.role || '',
      link: proj.link || '',
      startDate: proj.startDate || '',
      endDate: proj.endDate || '',
      description: Array.isArray(proj.description) ? proj.description : (proj.description ? [proj.description] : [])
    })),
    skills: (Array.isArray(resumeData.skills) ? resumeData.skills : []).map(sk => ({
      name: sk.name || '',
      level: sk.level || ''
    })),
    languages: (Array.isArray(resumeData.languages) ? resumeData.languages : []).map(lang => ({
      name: lang.name || '',
      level: lang.level || ''
    })),
    certifications: (Array.isArray(resumeData.certifications) ? resumeData.certifications : []).map(cert => ({
      name: cert.name || '',
      issuer: cert.issuer || '',
      date: cert.date || ''
    }))
  };
  
  // 1. Populate basic text/meta properties
  DOM.titleInput.value = currentResume.title;
  DOM.templateSelect.value = currentResume.template;
  DOM.marginSelect.value = currentResume.margin;
  DOM.lineHeightSelect.value = currentResume.lineHeight;
  
  // 2. Populate personal details form fields
  DOM.piName.value = currentResume.personal.name;
  DOM.piTitle.value = currentResume.personal.title;
  DOM.piEmail.value = currentResume.personal.email;
  DOM.piPhone.value = currentResume.personal.phone;
  DOM.piLocation.value = currentResume.personal.location;
  DOM.piWebsite.value = currentResume.personal.website;
  DOM.piLinkedin.value = currentResume.personal.linkedin;
  DOM.piGithub.value = currentResume.personal.github;
  DOM.piSummary.value = currentResume.personal.summary;
  
  // 3. Highlight active style selectors
  // Template layout
  document.querySelectorAll('.layout-card-btn').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.layout === currentResume.template);
  });
  
  // Font Pair
  document.querySelectorAll('.font-pair-btn').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.fontPair === currentResume.fontPair);
  });
  
  // Brand color swatch
  let matchingSwatch = false;
  document.querySelectorAll('.color-swatch-btn').forEach(btn => {
    const active = btn.dataset.color.toLowerCase() === currentResume.color.toLowerCase();
    btn.classList.toggle('active', active);
    if (active) matchingSwatch = true;
  });
  DOM.customColorPicker.value = currentResume.color;
  
  // 4. Render Dynamic Lists
  renderSubFormLists();
  
  // 5. Build Initial Preview & Zoom
  updatePreview();
  fitZoom();
}

/**
 * Recalculates A4 styles and triggers HTML rendering
 */
function updatePreview() {
  if (!currentResume) return;
  
  // Compile new HTML using templates.js engine
  DOM.previewSheet.innerHTML = window.renderResume(currentResume);
  
  // Reset previous style classes
  DOM.previewSheet.className = 'a4-sheet';
  
  // Apply layout theme
  DOM.previewSheet.classList.add(`theme-${currentResume.template}`);
  
  // Apply font family pairings
  DOM.previewSheet.classList.add(`font-pair-${currentResume.fontPair}`);
  
  // Set custom brand color property
  DOM.previewSheet.style.setProperty('--primary-color', currentResume.color);
  
  // Set margins variable
  let marginSize = '24px';
  if (currentResume.margin === 'compact') marginSize = '15px';
  if (currentResume.margin === 'spacious') marginSize = '32px';
  DOM.previewSheet.style.setProperty('--page-margin', marginSize);
  
  // Set line height spacing variable
  DOM.previewSheet.style.setProperty('--line-height-factor', currentResume.lineHeight);
}

/**
 * Triggers standard save timeout with dynamic notification states
 */
function triggerSave() {
  if (saveTimeout) clearTimeout(saveTimeout);
  
  DOM.saveStatus.className = 'save-status-badge saving';
  DOM.saveStatus.innerHTML = '<span class="dot"></span> Saving...';
  
  saveTimeout = setTimeout(() => {
    if (window.saveResumeToStorage) {
      window.saveResumeToStorage(currentResume);
      DOM.saveStatus.className = 'save-status-badge success';
      DOM.saveStatus.innerHTML = '<span class="dot"></span> Saved locally';
    }
  }, 1000);
}

/**
 * Event bindings for profile field edits
 */
document.querySelectorAll('.bind-val').forEach(field => {
  field.addEventListener('input', (e) => {
    const key = e.target.id.replace('pi-', '');
    currentResume.personal[key] = e.target.value;
    updatePreview();
    triggerSave();
  });
});

/**
 * Toolbar bindings
 */
DOM.titleInput.addEventListener('input', (e) => {
  currentResume.title = e.target.value;
  triggerSave();
});

DOM.btnSave.addEventListener('click', () => {
  if (saveTimeout) clearTimeout(saveTimeout);
  
  if (window.saveResumeToStorage) {
    window.saveResumeToStorage(currentResume);
    DOM.saveStatus.className = 'save-status-badge success';
    DOM.saveStatus.innerHTML = '<span class="dot"></span> Saved manually';
    
    // Revert status message after 2.5 seconds
    setTimeout(() => {
      if (DOM.saveStatus.innerHTML.includes('Saved manually')) {
        DOM.saveStatus.innerHTML = '<span class="dot"></span> Saved locally';
      }
    }, 2500);
  }
});

if (DOM.btnExport) {
  DOM.btnExport.addEventListener('click', () => {
    if (!currentResume) return;
    
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(currentResume, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href",     dataStr);
    downloadAnchor.setAttribute("download", `${currentResume.title.replace(/\s+/g, '_')}_resu_backup.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  });
}

DOM.templateSelect.addEventListener('change', (e) => {
  currentResume.template = e.target.value;
  
  // Sync layout buttons highlighted states
  document.querySelectorAll('.layout-card-btn').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.layout === currentResume.template);
  });
  
  updatePreview();
  triggerSave();
});

// Layout buttons triggers
document.querySelectorAll('.layout-card-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    const layout = btn.dataset.layout;
    currentResume.template = layout;
    DOM.templateSelect.value = layout;
    
    document.querySelectorAll('.layout-card-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    
    updatePreview();
    triggerSave();
  });
});

// Font pairing buttons triggers
document.querySelectorAll('.font-pair-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    currentResume.fontPair = btn.dataset.fontPair;
    
    document.querySelectorAll('.font-pair-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    
    updatePreview();
    triggerSave();
  });
});

// Color swatch triggers
document.querySelectorAll('.color-swatch-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    const color = btn.dataset.color;
    currentResume.color = color;
    DOM.customColorPicker.value = color;
    
    document.querySelectorAll('.color-swatch-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    
    updatePreview();
    triggerSave();
  });
});

DOM.customColorPicker.addEventListener('input', (e) => {
  const color = e.target.value;
  currentResume.color = color;
  
  // De-activate pre-set swatches
  document.querySelectorAll('.color-swatch-btn').forEach(b => b.classList.remove('active'));
  
  updatePreview();
  triggerSave();
});

// Margins and line heights triggers
DOM.marginSelect.addEventListener('change', (e) => {
  currentResume.margin = e.target.value;
  updatePreview();
  triggerSave();
});

DOM.lineHeightSelect.addEventListener('change', (e) => {
  currentResume.lineHeight = e.target.value;
  updatePreview();
  triggerSave();
});


/* ==========================================================================
   DYNAMIC SUB-FORM RENDER ENGINES
   ========================================================================== */

function renderSubFormLists() {
  renderExperienceList();
  renderEducationList();
  renderProjectsList();
  renderSkillsList();
  renderLanguagesList();
  renderCertificationsList();
}

/**
 * 1. EXPERIENCE RENDERER
 */
function renderExperienceList() {
  DOM.experienceList.innerHTML = '';
  currentResume.experience.forEach((exp, index) => {
    const card = document.createElement('div');
    card.className = 'dynamic-card-item';
    card.innerHTML = `
      <div class="card-drag-controls">
        <button type="button" class="btn-card-action" onclick="moveItem('experience', ${index}, -1)" title="Move Up">▲</button>
        <button type="button" class="btn-card-action" onclick="moveItem('experience', ${index}, 1)" title="Move Down">▼</button>
        <button type="button" class="btn-card-action danger" onclick="removeItem('experience', ${index})" title="Delete Position">🗑️</button>
      </div>
      <div class="card-item-title">💼 Position #${index + 1}</div>
      
      <div class="form-row">
        <div class="form-col-6">
          <label class="field-label">Company Name</label>
          <input type="text" class="form-control" value="${exp.company || ''}" oninput="updateItemField('experience', ${index}, 'company', this.value)">
        </div>
        <div class="form-col-6">
          <label class="field-label">Job Role Title</label>
          <input type="text" class="form-control" value="${exp.role || ''}" oninput="updateItemField('experience', ${index}, 'role', this.value)">
        </div>
      </div>
      
      <div class="form-row mt-3">
        <div class="form-col-6">
          <label class="field-label">Start Date</label>
          <input type="text" class="form-control" placeholder="Jan 2024" value="${exp.startDate || ''}" oninput="updateItemField('experience', ${index}, 'startDate', this.value)">
        </div>
        <div class="form-col-6">
          <label class="field-label">End Date</label>
          <input type="text" class="form-control" placeholder="Present" value="${exp.endDate || ''}" oninput="updateItemField('experience', ${index}, 'endDate', this.value)">
        </div>
      </div>

      <div class="form-row mt-3">
        <div class="form-col-6">
          <label class="field-label">Location (Optional)</label>
          <input type="text" class="form-control" placeholder="New York, NY" value="${exp.location || ''}" oninput="updateItemField('experience', ${index}, 'location', this.value)">
        </div>
      </div>
      
      <div class="form-group mt-3">
        <label class="field-label">Responsibilities (One bullet per line)</label>
        <textarea class="form-control" rows="4" placeholder="Developed web application using HTML/CSS/JS...&#10;Led a engineering squad of 3 members..." oninput="updateItemField('experience', ${index}, 'description', this.value)">${Array.isArray(exp.description) ? exp.description.join('\n') : exp.description || ''}</textarea>
      </div>
    `;
    DOM.experienceList.appendChild(card);
  });
}

/**
 * 2. EDUCATION RENDERER
 */
function renderEducationList() {
  DOM.educationList.innerHTML = '';
  currentResume.education.forEach((edu, index) => {
    const card = document.createElement('div');
    card.className = 'dynamic-card-item';
    card.innerHTML = `
      <div class="card-drag-controls">
        <button type="button" class="btn-card-action" onclick="moveItem('education', ${index}, -1)">▲</button>
        <button type="button" class="btn-card-action" onclick="moveItem('education', ${index}, 1)">▼</button>
        <button type="button" class="btn-card-action danger" onclick="removeItem('education', ${index})">🗑️</button>
      </div>
      <div class="card-item-title">🎓 Education #${index + 1}</div>
      
      <div class="form-row">
        <div class="form-col-6">
          <label class="field-label">Institution / University</label>
          <input type="text" class="form-control" value="${edu.institution || ''}" oninput="updateItemField('education', ${index}, 'institution', this.value)">
        </div>
        <div class="form-col-6">
          <label class="field-label">Degree & Field of Study</label>
          <input type="text" class="form-control" placeholder="B.S. in Computer Science" value="${edu.degree || ''}" oninput="updateItemField('education', ${index}, 'degree', this.value)">
        </div>
      </div>
      
      <div class="form-row mt-3">
        <div class="form-col-6">
          <label class="field-label">Start Year</label>
          <input type="text" class="form-control" placeholder="2020" value="${edu.startDate || ''}" oninput="updateItemField('education', ${index}, 'startDate', this.value)">
        </div>
        <div class="form-col-6">
          <label class="field-label">End Year</label>
          <input type="text" class="form-control" placeholder="2024" value="${edu.endDate || ''}" oninput="updateItemField('education', ${index}, 'endDate', this.value)">
        </div>
      </div>
      
      <div class="form-row mt-3">
        <div class="form-col-6">
          <label class="field-label">Location (Optional)</label>
          <input type="text" class="form-control" placeholder="Boston, MA" value="${edu.location || ''}" oninput="updateItemField('education', ${index}, 'location', this.value)">
        </div>
        <div class="form-col-6">
          <label class="field-label">GPA (Optional)</label>
          <input type="text" class="form-control" placeholder="3.8 / 4.0" value="${edu.gpa || ''}" oninput="updateItemField('education', ${index}, 'gpa', this.value)">
        </div>
      </div>
    `;
    DOM.educationList.appendChild(card);
  });
}

/**
 * 3. PROJECTS RENDERER
 */
function renderProjectsList() {
  DOM.projectsList.innerHTML = '';
  currentResume.projects.forEach((proj, index) => {
    const card = document.createElement('div');
    card.className = 'dynamic-card-item';
    card.innerHTML = `
      <div class="card-drag-controls">
        <button type="button" class="btn-card-action" onclick="moveItem('projects', ${index}, -1)">▲</button>
        <button type="button" class="btn-card-action" onclick="moveItem('projects', ${index}, 1)">▼</button>
        <button type="button" class="btn-card-action danger" onclick="removeItem('projects', ${index})">🗑️</button>
      </div>
      <div class="card-item-title">🚀 Project #${index + 1}</div>
      
      <div class="form-row">
        <div class="form-col-6">
          <label class="field-label">Project Name</label>
          <input type="text" class="form-control" value="${proj.name || ''}" oninput="updateItemField('projects', ${index}, 'name', this.value)">
        </div>
        <div class="form-col-6">
          <label class="field-label">Your Role / Context</label>
          <input type="text" class="form-control" placeholder="Creator, Contributor" value="${proj.role || ''}" oninput="updateItemField('projects', ${index}, 'role', this.value)">
        </div>
      </div>
      
      <div class="form-row mt-3">
        <div class="form-col-6">
          <label class="field-label">Project Link (Optional)</label>
          <input type="text" class="form-control" placeholder="github.com/project" value="${proj.link || ''}" oninput="updateItemField('projects', ${index}, 'link', this.value)">
        </div>
        <div class="form-col-6">
          <label class="field-label">Completion Date (Optional)</label>
          <input type="text" class="form-control" placeholder="May 2024" value="${proj.startDate || ''}" oninput="updateItemField('projects', ${index}, 'startDate', this.value)">
        </div>
      </div>
      
      <div class="form-group mt-3">
        <label class="field-label">Key achievements (One bullet per line)</label>
        <textarea class="form-control" rows="3" placeholder="Designed client API layers utilizing clean architectures...&#10;Integrated robust animations scaling responsiveness..." oninput="updateItemField('projects', ${index}, 'description', this.value)">${Array.isArray(proj.description) ? proj.description.join('\n') : proj.description || ''}</textarea>
      </div>
    `;
    DOM.projectsList.appendChild(card);
  });
}

/**
 * 4. SKILLS RENDERER
 */
function renderSkillsList() {
  DOM.skillsList.innerHTML = '';
  currentResume.skills.forEach((sk, index) => {
    const card = document.createElement('div');
    card.className = 'dynamic-card-item';
    card.style.padding = '12px';
    card.innerHTML = `
      <div class="card-drag-controls" style="top: 8px;">
        <button type="button" class="btn-card-action danger" onclick="removeItem('skills', ${index})">🗑️</button>
      </div>
      <div class="form-row" style="margin-right: 32px;">
        <div class="form-col-6">
          <input type="text" class="form-control form-control-sm" placeholder="Skill Name (e.g. JavaScript)" value="${sk.name || ''}" oninput="updateItemField('skills', ${index}, 'name', this.value)">
        </div>
        <div class="form-col-6">
          <input type="text" class="form-control form-control-sm" placeholder="Level (e.g. Expert, Advanced)" value="${sk.level || ''}" oninput="updateItemField('skills', ${index}, 'level', this.value)">
        </div>
      </div>
    `;
    DOM.skillsList.appendChild(card);
  });
}

/**
 * 5. LANGUAGES RENDERER
 */
function renderLanguagesList() {
  DOM.languagesList.innerHTML = '';
  currentResume.languages.forEach((lang, index) => {
    const card = document.createElement('div');
    card.className = 'dynamic-card-item';
    card.style.padding = '10px';
    card.innerHTML = `
      <div class="card-drag-controls" style="top: 6px;">
        <button type="button" class="btn-card-action danger" onclick="removeItem('languages', ${index})">🗑️</button>
      </div>
      <div class="form-row" style="margin-right: 32px;">
        <div class="form-col-6">
          <input type="text" class="form-control" placeholder="Language (e.g. English)" value="${lang.name || ''}" oninput="updateItemField('languages', ${index}, 'name', this.value)">
        </div>
        <div class="form-col-6">
          <input type="text" class="form-control" placeholder="Proficiency (e.g. Native)" value="${lang.level || ''}" oninput="updateItemField('languages', ${index}, 'level', this.value)">
        </div>
      </div>
    `;
    DOM.languagesList.appendChild(card);
  });
}

/**
 * 6. CERTIFICATIONS RENDERER
 */
function renderCertificationsList() {
  DOM.certificationsList.innerHTML = '';
  currentResume.certifications.forEach((cert, index) => {
    const card = document.createElement('div');
    card.className = 'dynamic-card-item';
    card.style.padding = '12px';
    card.innerHTML = `
      <div class="card-drag-controls" style="top: 8px;">
        <button type="button" class="btn-card-action danger" onclick="removeItem('certifications', ${index})">🗑️</button>
      </div>
      <div class="form-row" style="margin-right: 32px;">
        <div class="form-col-6">
          <label class="field-label" style="font-size:7.5pt;">Certification Title</label>
          <input type="text" class="form-control" value="${cert.name || ''}" oninput="updateItemField('certifications', ${index}, 'name', this.value)">
        </div>
        <div class="form-col-6">
          <label class="field-label" style="font-size:7.5pt;">Issuing Body / Date</label>
          <input type="text" class="form-control" placeholder="AWS (2024)" value="${cert.issuer || ''}" oninput="updateItemField('certifications', ${index}, 'issuer', this.value)">
        </div>
      </div>
    `;
    DOM.certificationsList.appendChild(card);
  });
}


/* ==========================================================================
   LIST MODIFICATION FUNCTIONS
   ========================================================================== */

/**
 * Adds an empty position to a subform list array
 * @param {string} category list name
 * @param {Object} defaultObj default item shape
 */
function addItem(category, defaultObj) {
  currentResume[category].push(defaultObj);
  
  // Re-render only that specific category list
  if (category === 'experience') renderExperienceList();
  if (category === 'education') renderEducationList();
  if (category === 'projects') renderProjectsList();
  if (category === 'skills') renderSkillsList();
  if (category === 'languages') renderLanguagesList();
  if (category === 'certifications') renderCertificationsList();
  
  updatePreview();
  triggerSave();
}

/**
 * Updates a specific field on a list item
 */
window.updateItemField = function(category, index, field, value) {
  if (!currentResume) return;
  
  // If it's description, split by newlines for bullets
  if ((field === 'description') && typeof value === 'string') {
    currentResume[category][index][field] = value.split('\n').filter(l => l.trim().length > 0);
  } else {
    currentResume[category][index][field] = value;
  }
  
  updatePreview();
  triggerSave();
};

/**
 * Removes an index item from the array list
 */
window.removeItem = function(category, index) {
  currentResume[category].splice(index, 1);
  
  // Update view lists
  if (category === 'experience') renderExperienceList();
  if (category === 'education') renderEducationList();
  if (category === 'projects') renderProjectsList();
  if (category === 'skills') renderSkillsList();
  if (category === 'languages') renderLanguagesList();
  if (category === 'certifications') renderCertificationsList();
  
  updatePreview();
  triggerSave();
};

/**
 * Swaps array elements for up/down ordering
 */
window.moveItem = function(category, index, direction) {
  const targetIndex = index + direction;
  const list = currentResume[category];
  
  // Check bounds
  if (targetIndex < 0 || targetIndex >= list.length) return;
  
  // Swap elements
  const temp = list[index];
  list[index] = list[targetIndex];
  list[targetIndex] = temp;
  
  // Re-render
  if (category === 'experience') renderExperienceList();
  if (category === 'education') renderEducationList();
  if (category === 'projects') renderProjectsList();
  
  updatePreview();
  triggerSave();
};

// Add item button handlers
DOM.btnAddExp.addEventListener('click', () => {
  addItem('experience', { company: '', role: '', startDate: '', endDate: '', location: '', description: [] });
});
DOM.btnAddEdu.addEventListener('click', () => {
  addItem('education', { institution: '', degree: '', startDate: '', endDate: '', location: '', gpa: '' });
});
DOM.btnAddProject.addEventListener('click', () => {
  addItem('projects', { name: '', role: '', link: '', startDate: '', endDate: '', description: [] });
});
DOM.btnAddSkill.addEventListener('click', () => {
  addItem('skills', { name: '', level: '' });
});
DOM.btnAddLang.addEventListener('click', () => {
  addItem('languages', { name: '', level: '' });
});
DOM.btnAddCert.addEventListener('click', () => {
  addItem('certifications', { name: '', issuer: '', date: '' });
});


/* ==========================================================================
   TABS PANEL TRANSITION TRIGGER
   ========================================================================== */
document.querySelectorAll('.tab-nav-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    const targetId = btn.dataset.target;
    
    // Clear navigation active highlights
    document.querySelectorAll('.tab-nav-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    
    // Switch panels display
    document.querySelectorAll('.tab-panel').forEach(p => p.classList.remove('active'));
    document.getElementById(targetId).classList.add('active');
  });
});


/* ==========================================================================
   ZOOM VIEWPORT MULTI-SCALE ACTIONS
   ========================================================================== */

function applyZoomScale(scalePercent) {
  const scaleFraction = scalePercent / 100;
  DOM.previewSheet.style.transform = `scale(${scaleFraction})`;
  DOM.zoomPercentText.textContent = `${scalePercent}%`;
  
  // To avoid leaving empty bottom margins due to scale transform empty bounds,
  // we adjust height offsets dynamically in the viewport.
  const containerHeight = 1123 * scaleFraction + 80; // 1123 A4 standard height
  DOM.previewContainer.style.minHeight = `${containerHeight}px`;
}

DOM.zoomSlider.addEventListener('input', (e) => {
  applyZoomScale(parseInt(e.target.value));
});

function fitZoom() {
  const viewportWidth = DOM.previewContainer.clientWidth;
  const sheetWidth = 794; // standard 150 DPI A4 width in px
  
  // Deduct padding bounds
  const fitWidth = viewportWidth - 80;
  
  // Calculate percentage
  let scalePercent = Math.floor((fitWidth / sheetWidth) * 100);
  
  // Clamp scale boundary limits
  if (scalePercent < 20) scalePercent = 20;
  if (scalePercent > 120) scalePercent = 120;
  
  DOM.zoomSlider.value = scalePercent;
  applyZoomScale(scalePercent);
}

DOM.btnFitZoom.addEventListener('click', fitZoom);

// Triggers zoom recalculations on screen size adaptions
window.addEventListener('resize', () => {
  if (document.getElementById('editor').classList.contains('active')) {
    fitZoom();
  }
});

// Bind to window context
window.initEditor = initEditor;
window.updatePreview = updatePreview;
window.fitZoom = fitZoom;

/* ==========================================================================
   BIDIRECTIONAL VISUAL WYSIWYG EDITOR INTERFACE
   Allows direct click-and-type editing of A4 preview elements.
   ========================================================================== */

// Utility to set deep nested values in the state
function updateStateByPath(path, value) {
  if (!currentResume || !path) return;
  const parts = path.split('.');
  let obj = currentResume;
  
  for (let i = 0; i < parts.length - 1; i++) {
    const part = parts[i];
    if (obj[part] === undefined) return;
    obj = obj[part];
  }
  
  const lastPart = parts[parts.length - 1];
  
  // If the target is description, update that specific array index
  if (parts.includes('description')) {
    const index = parseInt(lastPart);
    if (!isNaN(index) && Array.isArray(obj)) {
      obj[index] = value;
    }
  } else {
    obj[lastPart] = value;
  }
}

// Map path changes back to corresponding left-sidebar input values
function syncSidebarFromState(path, value) {
  if (path.startsWith('personal.')) {
    const key = path.split('.')[1];
    const field = document.getElementById(`pi-${key}`);
    if (field) {
      field.value = value;
    }
  } else if (path.startsWith('experience.')) {
    const parts = path.split('.');
    const index = parseInt(parts[1]);
    const field = parts[2];
    const container = document.getElementById('experience-list');
    if (container) {
      const cards = container.querySelectorAll('.dynamic-card-item');
      if (cards[index]) {
        if (field === 'description') {
          const textarea = cards[index].querySelector('textarea');
          if (textarea && Array.isArray(currentResume.experience[index].description)) {
            textarea.value = currentResume.experience[index].description.join('\n');
          }
        } else {
          const fieldMap = { company: 0, role: 1, startDate: 2, endDate: 3, location: 4 };
          const inputs = cards[index].querySelectorAll('input');
          const inputIdx = fieldMap[field];
          if (inputIdx !== undefined && inputs[inputIdx]) {
            inputs[inputIdx].value = value;
          }
        }
      }
    }
  } else if (path.startsWith('education.')) {
    const parts = path.split('.');
    const index = parseInt(parts[1]);
    const field = parts[2];
    const container = document.getElementById('education-list');
    if (container) {
      const cards = container.querySelectorAll('.dynamic-card-item');
      if (cards[index]) {
        const fieldMap = { institution: 0, degree: 1, startDate: 2, endDate: 3, location: 4, gpa: 5 };
        const inputs = cards[index].querySelectorAll('input');
        const inputIdx = fieldMap[field];
        if (inputIdx !== undefined && inputs[inputIdx]) {
          inputs[inputIdx].value = value;
        }
      }
    }
  } else if (path.startsWith('projects.')) {
    const parts = path.split('.');
    const index = parseInt(parts[1]);
    const field = parts[2];
    const container = document.getElementById('projects-list');
    if (container) {
      const cards = container.querySelectorAll('.dynamic-card-item');
      if (cards[index]) {
        if (field === 'description') {
          const textarea = cards[index].querySelector('textarea');
          if (textarea && Array.isArray(currentResume.projects[index].description)) {
            textarea.value = currentResume.projects[index].description.join('\n');
          }
        } else {
          const fieldMap = { name: 0, role: 1, link: 2, startDate: 3 };
          const inputs = cards[index].querySelectorAll('input');
          const inputIdx = fieldMap[field];
          if (inputIdx !== undefined && inputs[inputIdx]) {
            inputs[inputIdx].value = value;
          }
        }
      }
    }
  } else if (path.startsWith('skills.')) {
    const parts = path.split('.');
    const index = parseInt(parts[1]);
    const field = parts[2];
    const container = document.getElementById('skills-list');
    if (container) {
      const cards = container.querySelectorAll('.dynamic-card-item');
      if (cards[index]) {
        const fieldMap = { name: 0, level: 1 };
        const inputs = cards[index].querySelectorAll('input');
        const inputIdx = fieldMap[field];
        if (inputIdx !== undefined && inputs[inputIdx]) {
          inputs[inputIdx].value = value;
        }
      }
    }
  } else if (path.startsWith('languages.')) {
    const parts = path.split('.');
    const index = parseInt(parts[1]);
    const field = parts[2];
    const container = document.getElementById('languages-list');
    if (container) {
      const cards = container.querySelectorAll('.dynamic-card-item');
      if (cards[index]) {
        const fieldMap = { name: 0, level: 1 };
        const inputs = cards[index].querySelectorAll('input');
        const inputIdx = fieldMap[field];
        if (inputIdx !== undefined && inputs[inputIdx]) {
          inputs[inputIdx].value = value;
        }
      }
    }
  } else if (path.startsWith('certifications.')) {
    const parts = path.split('.');
    const index = parseInt(parts[1]);
    const field = parts[2];
    const container = document.getElementById('certifications-list');
    if (container) {
      const cards = container.querySelectorAll('.dynamic-card-item');
      if (cards[index]) {
        const fieldMap = { name: 0, issuer: 1 };
        const inputs = cards[index].querySelectorAll('input');
        const inputIdx = fieldMap[field];
        if (inputIdx !== undefined && inputs[inputIdx]) {
          inputs[inputIdx].value = value;
        }
      }
    }
  }
}

// Attach live input listener to A4 preview document
DOM.previewSheet.addEventListener('input', (e) => {
  const target = e.target;
  const path = target.dataset.path;
  if (!path) return;
  
  const value = target.innerText || target.textContent;
  
  // 1. Update background JSON state
  updateStateByPath(path, value);
  
  // 2. Synchronize visual values in left-sidebar input elements
  syncSidebarFromState(path, value);
  
  // 3. Debounce save to cache
  triggerSave();
});
