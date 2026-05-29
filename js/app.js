/**
 * RESUBUILD CORE ROUTER & STATE CONTROLLER
 * Controls local storage CRUD, page switches, duplications, searches,
 * and sets up premium professional mock data for quick starts.
 */

const STORAGE_KEY = 'resubuild_resumes';

// Professional Default/Mock data to prepopulate and inspire users
const MOCK_RESUME_DATA = {
  title: "Software Engineer Lead Draft",
  template: "minimalist",
  fontPair: "inter-sans",
  color: "#3b82f6",
  margin: "normal",
  lineHeight: "1.4",
  personal: {
    name: "Alex Mercer",
    title: "Lead Software Architect",
    email: "alex.mercer@gmail.com",
    phone: "+1 (555) 019-2834",
    location: "Seattle, WA",
    website: "alexmercer.io",
    linkedin: "linkedin.com/in/alex-mercer",
    github: "github.com/alex-mercer",
    summary: "Senior Software Architect with over 8 years of experience designing scalable distributed microservices and reactive frontend architectures. Proven track record of spearheading cross-functional teams, reducing operational costs by 35%, and driving engineering excellency through clean code and automated delivery models."
  },
  experience: [
    {
      company: "CloudCore Technologies",
      role: "Lead Software Engineer",
      startDate: "Jun 2022",
      endDate: "Present",
      location: "Seattle, WA",
      description: [
        "Architected enterprise cloud pipeline utilizing Node.js, AWS lambda, and Kubernetes, handling 25M+ active daily transactions.",
        "Led engineering squad of 8 members, reducing pipeline latency by 45% through robust caching and async database layers.",
        "Refactored legacy Monolith database into domain-driven microservices, improving deployment speed by 60%."
      ]
    },
    {
      company: "VeloTech Solutions",
      role: "Senior Full Stack Developer",
      startDate: "Mar 2019",
      endDate: "May 2022",
      location: "San Francisco, CA",
      description: [
        "Built responsive, interactive dashboard using React, TailwindCSS, and D3.js, increasing customer engagement by 20%.",
        "Developed structured RESTful APIs with Django/PostgreSQL, reducing API call overhead by 30% via indexed schema designs.",
        "Authored comprehensive end-to-end testing suites in Jest and Cypress, elevating unit coverage score from 40% to 92%."
      ]
    }
  ],
  education: [
    {
      institution: "University of Washington",
      degree: "M.S. in Computer Science & Engineering",
      startDate: "2017",
      endDate: "2019",
      location: "Seattle, WA",
      gpa: "3.91 / 4.0"
    },
    {
      institution: "UC Berkeley",
      degree: "B.S. in Computer Science",
      startDate: "2013",
      endDate: "2017",
      location: "Berkeley, CA",
      gpa: "3.85 / 4.0"
    }
  ],
  projects: [
    {
      name: "Nebula - Decentralized Caching Engine",
      role: "Creator & Lead Contributor",
      link: "github.com/alex-mercer/nebula",
      startDate: "Jan 2023",
      endDate: "Aug 2023",
      description: [
        "Authored low-latency key-value store in Go utilizing customizable LRU eviction algorithms.",
        "Secured 4,000+ GitHub stars and integrated community pull-requests maintaining 99% test suites coverage."
      ]
    }
  ],
  skills: [
    { name: "JavaScript / TypeScript", level: "Expert" },
    { name: "Go / Golang", level: "Advanced" },
    { name: "React & Next.js", level: "Expert" },
    { name: "AWS (S3, Lambda, RDS)", level: "Advanced" },
    { name: "Docker & Kubernetes", level: "Advanced" },
    { name: "PostgreSQL & Redis", level: "Expert" }
  ],
  languages: [
    { name: "English", level: "Native" },
    { name: "Spanish", level: "Professional" }
  ],
  certifications: [
    { name: "AWS Certified Solutions Architect", issuer: "Amazon Web Services", date: "2023" },
    { name: "Certified Kubernetes Administrator", issuer: "Cloud Native Computing Foundation", date: "2024" }
  ]
};


/* ==========================================================================
   LOCALSTORAGE DATABASE HELPERS
   ========================================================================== */

/**
 * Returns all saved resumes
 * @returns {Array} Array of resumes
 */
function getResumesFromStorage() {
  const data = localStorage.getItem(STORAGE_KEY);
  if (!data) return [];
  try {
    return JSON.parse(data);
  } catch (e) {
    return [];
  }
}

/**
 * Saves a single resume draft
 */
function saveResumeToStorage(resume) {
  const resumes = getResumesFromStorage();
  const index = resumes.findIndex(r => r.id === resume.id);
  
  resume.updatedAt = Date.now();
  
  if (index > -1) {
    resumes[index] = resume;
  } else {
    resumes.push(resume);
  }
  
  localStorage.setItem(STORAGE_KEY, JSON.stringify(resumes));
  updateDashboardStats();
}

/**
 * Duplicates a resume draft
 */
function duplicateResume(id) {
  const resumes = getResumesFromStorage();
  const target = resumes.find(r => r.id === id);
  if (!target) return;
  
  // Shallow clone and generate new ID
  const clone = JSON.parse(JSON.stringify(target));
  clone.id = Date.now();
  clone.title = `${clone.title} (Copy)`;
  clone.updatedAt = Date.now();
  
  resumes.push(clone);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(resumes));
  
  renderResumesList();
  updateDashboardStats();
}

/**
 * Deletes a resume draft
 */
function deleteResume(id) {
  if (!confirm("Are you sure you want to permanently delete this resume? This cannot be undone.")) return;
  
  let resumes = getResumesFromStorage();
  resumes = resumes.filter(r => r.id !== id);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(resumes));
  
  renderResumesList();
  updateDashboardStats();
}

// Bind to window to allow delete/duplicate from inline calls
window.saveResumeToStorage = saveResumeToStorage;
window.duplicateResume = duplicateResume;
window.deleteResume = deleteResume;


/* ==========================================================================
   SPA ROUTER ENGINE
   ========================================================================== */

function handleRouter() {
  const hash = window.location.hash || '#home';
  
  // Transition all screens to passive
  document.querySelectorAll('.spa-view').forEach(view => {
    view.classList.remove('active');
  });
  
  // Parse query parameters
  const page = hash.split('?')[0];
  const query = hash.split('?')[1] || '';
  const params = new URLSearchParams(query);
  
  if (page === '#home' || page === '#features' || page === '#templates' || page === '#testimonials') {
    document.getElementById('homepage').classList.add('active');
    document.title = "ResuBuild | Professional Resume Builder";
    
    // Smooth scroll to the target section
    if (page !== '#home') {
      const sectionId = page.replace('#', '');
      const element = document.getElementById(sectionId);
      if (element) {
        // Brief timeout ensures display active transitions are fully completed
        setTimeout(() => {
          element.scrollIntoView({ behavior: 'smooth' });
        }, 80);
      }
    }
  } 
  else if (page === '#dashboard') {
    document.getElementById('dashboard').classList.add('active');
    document.title = "My Workspace | ResuBuild";
    renderResumesList();
    updateDashboardStats();
  } 
  else if (page === '#editor') {
    document.getElementById('editor').classList.add('active');
    
    const isNew = params.get('new');
    const resumeId = params.get('id');
    
    if (isNew) {
      // Create a new resume
      const newResume = JSON.parse(JSON.stringify(MOCK_RESUME_DATA));
      newResume.id = Date.now();
      newResume.updatedAt = Date.now();
      newResume.title = `My Resume #${getResumesFromStorage().length + 1}`;
      
      // Seed template if clicking directly from a homepage preview
      const templateSeed = params.get('template');
      if (templateSeed) {
        newResume.template = templateSeed;
      }
      
      saveResumeToStorage(newResume);
      
      // Re-route to editor page
      window.location.hash = `#editor?id=${newResume.id}`;
      return;
    }
    
    if (resumeId) {
      const resumes = getResumesFromStorage();
      const current = resumes.find(r => r.id == resumeId);
      if (current) {
        document.title = `Editor: ${current.title} | ResuBuild`;
        window.initEditor(current);
      } else {
        // Fallback to dashboard if invalid ID
        window.location.hash = '#dashboard';
      }
    } else {
      window.location.hash = '#dashboard';
    }
  }
}

window.addEventListener('hashchange', handleRouter);
window.addEventListener('DOMContentLoaded', handleRouter);


/* ==========================================================================
   DASHBOARD WORKSPACE BUILDERS
   ========================================================================== */

function updateDashboardStats() {
  const list = getResumesFromStorage();
  const countSpan = document.getElementById('stats-count');
  if (countSpan) {
    countSpan.textContent = list.length;
  }
}

function renderResumesList(filterQuery = '') {
  const listContainer = document.getElementById('resumes-list-container');
  if (!listContainer) return;
  
  const resumes = getResumesFromStorage();
  
  // Apply search filtration if necessary
  const filtered = resumes.filter(res => {
    return res.title.toLowerCase().includes(filterQuery.toLowerCase()) || 
           res.personal.name.toLowerCase().includes(filterQuery.toLowerCase()) || 
           res.personal.title.toLowerCase().includes(filterQuery.toLowerCase());
  });
  
  // Clear previous entries
  listContainer.innerHTML = '';
  
  if (filtered.length === 0) {
    listContainer.innerHTML = `
      <div class="empty-state-card">
        <div class="empty-icon">${filterQuery ? '🔍' : '📂'}</div>
        <h4>${filterQuery ? 'No matching drafts found' : 'Create your first CV'}</h4>
        <p>${filterQuery ? 'Try adjusting your search filters' : 'Select from premium templates and land your dream job!'}</p>
        <button id="dashboard-inline-create" class="btn btn-primary">${filterQuery ? 'Clear Search' : 'Build Resume'}</button>
      </div>
    `;
    
    document.getElementById('dashboard-inline-create').addEventListener('click', () => {
      if (filterQuery) {
        document.getElementById('resume-search').value = '';
        renderResumesList();
      } else {
        window.location.hash = '#editor?new=true';
      }
    });
    return;
  }
  
  filtered.forEach(res => {
    const card = document.createElement('div');
    card.className = 'resume-draft-card';
    
    // Format timestamp nicely
    const dateObj = new Date(res.updatedAt);
    const dateStr = dateObj.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
    
    card.innerHTML = `
      <div class="draft-header">
        <div class="draft-icon">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" />
          </svg>
        </div>
        <div class="draft-actions-dropdown">
          <button class="draft-menu-btn" onclick="toggleDropdownMenu(event, ${res.id})">•••</button>
          <div class="draft-menu-popup" id="menu-${res.id}">
            <button class="draft-menu-item" onclick="duplicateResume(${res.id})">👯 Duplicate</button>
            <button class="draft-menu-item danger" onclick="deleteResume(${res.id})">🗑️ Delete</button>
          </div>
        </div>
      </div>
      <div class="draft-title">${res.title}</div>
      <div class="draft-meta">Updated: ${dateStr}</div>
      <div class="draft-footer">
        <span class="draft-badge">${res.template}</span>
        <a href="#editor?id=${res.id}" class="draft-edit-link">Edit Draft →</a>
      </div>
    `;
    listContainer.appendChild(card);
  });
}

/**
 * Dropdown Menu Controller for saved resume cards
 */
window.toggleDropdownMenu = function(event, id) {
  event.stopPropagation();
  
  // Close any already open menus
  document.querySelectorAll('.draft-menu-popup').forEach(menu => {
    if (menu.id !== `menu-${id}`) {
      menu.classList.remove('active');
    }
  });
  
  const menu = document.getElementById(`menu-${id}`);
  if (menu) {
    menu.classList.toggle('active');
  }
};

// Close all menus when clicking outside
document.addEventListener('click', () => {
  document.querySelectorAll('.draft-menu-popup').forEach(menu => {
    menu.classList.remove('active');
  });
});

// Search input filtration handler
const searchInput = document.getElementById('resume-search');
if (searchInput) {
  searchInput.addEventListener('input', (e) => {
    renderResumesList(e.target.value);
  });
}

// Global button triggers
const createBtn = document.getElementById('dashboard-new-btn');
if (createBtn) {
  createBtn.addEventListener('click', () => {
    window.location.hash = '#editor?new=true';
  });
}

const quickStartBtn = document.getElementById('dashboard-quickstart');
if (quickStartBtn) {
  quickStartBtn.addEventListener('click', () => {
    window.location.hash = '#editor?new=true';
  });
}

// Homepage template quick starts
document.querySelectorAll('.template-card-preview').forEach(card => {
  card.addEventListener('click', () => {
    const template = card.dataset.template;
    window.location.hash = `#editor?new=true&template=${template}`;
  });
});

// ==========================================================================
// SMART IMPROVE RESUME MODAL & PARSER ENGINE
// ==========================================================================

const modal = document.getElementById('import-modal');
const modalCloseBtn = document.getElementById('btn-close-modal');
const modalTabBtns = document.querySelectorAll('.modal-tab-btn');
const modalTabPanels = document.querySelectorAll('.modal-tab-panel');

const textareaImport = document.getElementById('import-text-area');
const btnSubmitText = document.getElementById('btn-submit-import-text');

const dragArea = document.getElementById('modal-drag-area');
const fileInput = document.getElementById('resume-upload-input');
const displayFilename = document.getElementById('modal-file-name-display');
const btnSubmitFile = document.getElementById('btn-submit-import-file');

const loader = document.getElementById('modal-loader');
const loaderStatusText = document.getElementById('loader-status-text');

let selectedFile = null;

// Bind all "Improve my Resume" buttons to open the modal
document.querySelectorAll('.btn-upload-trigger').forEach(btn => {
  btn.addEventListener('click', (e) => {
    e.preventDefault();
    if (modal) {
      modal.classList.add('active');
    }
  });
});

// Close modal triggers
if (modalCloseBtn) {
  modalCloseBtn.addEventListener('click', () => {
    modal.classList.remove('active');
  });
}
window.addEventListener('click', (e) => {
  if (e.target === modal) {
    modal.classList.remove('active');
  }
});

// Modal Tabs switching
modalTabBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    const tabTarget = btn.dataset.tab;
    
    modalTabBtns.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    
    modalTabPanels.forEach(p => p.classList.remove('active'));
    document.getElementById(tabTarget).classList.add('active');
  });
});

// File Drag / Selection events
if (dragArea && fileInput) {
  dragArea.addEventListener('click', () => {
    fileInput.click();
  });
  
  fileInput.addEventListener('change', (e) => {
    handleFileSelect(e.target.files[0]);
  });
  
  dragArea.addEventListener('dragover', (e) => {
    e.preventDefault();
    dragArea.style.borderColor = 'var(--accent-blue)';
  });
  dragArea.addEventListener('dragleave', () => {
    dragArea.style.borderColor = 'var(--border-ui)';
  });
  dragArea.addEventListener('drop', (e) => {
    e.preventDefault();
    dragArea.style.borderColor = 'var(--border-ui)';
    handleFileSelect(e.dataTransfer.files[0]);
  });
}

function handleFileSelect(file) {
  if (!file) return;
  const name = file.name.toLowerCase();
  if (!name.endsWith('.json') && !name.endsWith('.pdf') && !name.endsWith('.docx') && !name.endsWith('.txt')) {
    alert("Please select a valid resume file (.pdf, .docx, .txt, or .json).");
    return;
  }
  selectedFile = file;
  if (displayFilename) {
    displayFilename.textContent = `Selected: ${file.name} (${Math.round(file.size / 1024)} KB)`;
  }
  if (btnSubmitFile) {
    btnSubmitFile.disabled = false;
  }
}

// Load JSON or Document File Action
if (btnSubmitFile) {
  btnSubmitFile.addEventListener('click', () => {
    if (!selectedFile) return;
    
    const name = selectedFile.name.toLowerCase();
    
    if (name.endsWith('.json')) {
      // JSON backup parser
      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const resumeData = JSON.parse(event.target.result);
          if (!resumeData.personal || !resumeData.template || !resumeData.experience || !resumeData.education) {
            alert("Invalid JSON format. Upload a valid ResuBuild JSON draft backup.");
            return;
          }
          showLoader("Reading draft data...", () => {
            resumeData.id = Date.now();
            resumeData.updatedAt = Date.now();
            if (!resumeData.title.startsWith('[Imported]')) {
              resumeData.title = `[Imported] ${resumeData.title}`;
            }
            saveResumeToStorage(resumeData);
            closeModalAndRedirect(resumeData.id);
          });
        } catch (err) {
          alert("Failed to parse JSON backup.");
        }
      };
      reader.readAsText(selectedFile);
    } 
    else if (name.endsWith('.txt')) {
      // Plain text parser
      const reader = new FileReader();
      reader.onload = (event) => {
        const text = event.target.result;
        showLoader("Parsing text structures...", () => {
          try {
            updateLoaderText("Extracting profile & contacts...");
            const parsedData = parseRawResumeText(text);
            updateLoaderText("Building achievements cards...");
            saveResumeToStorage(parsedData);
            setTimeout(() => {
              closeModalAndRedirect(parsedData.id);
            }, 600);
          } catch (err) {
            console.error("Text file parsing error:", err);
            alert("Failed to parse text resume: " + err.message);
            if (loader) loader.classList.remove('active');
          }
        });
      };
      reader.readAsText(selectedFile);
    } 
    else if (name.endsWith('.docx')) {
      // Word document parser (using Mammoth.js!)
      const reader = new FileReader();
      reader.onload = (event) => {
        const arrayBuffer = event.target.result;
        showLoader("Extracting Word document text...", () => {
          if (typeof mammoth === 'undefined') {
            alert("Mammoth parser library not loaded. Check script imports.");
            if (loader) loader.classList.remove('active');
            return;
          }
          mammoth.extractRawText({ arrayBuffer: arrayBuffer }).then((result) => {
            const text = result.value;
            updateLoaderText("Parsing document structures...");
            setTimeout(() => {
              updateLoaderText("Extracting profile & contacts...");
              const parsedData = parseRawResumeText(text);
              setTimeout(() => {
                updateLoaderText("Building achievements cards...");
                saveResumeToStorage(parsedData);
                setTimeout(() => {
                  closeModalAndRedirect(parsedData.id);
                }, 600);
              }, 600);
            }, 500);
          }).catch((err) => {
            console.error("Mammoth word parsing error:", err);
            alert("Failed to read Word document. Ensure it is not corrupted.");
            if (loader) loader.classList.remove('active');
          });
        });
      };
      reader.readAsArrayBuffer(selectedFile);
    } 
    else if (name.endsWith('.pdf')) {
      // PDF document parser (using PDF.js!)
      const reader = new FileReader();
      reader.onload = function(event) {
        const typedarray = new Uint8Array(event.target.result);
        showLoader("Initializing PDF reader...", () => {
          if (typeof pdfjsLib === 'undefined') {
            alert("PDF.js library not loaded. Check script imports.");
            if (loader) loader.classList.remove('active');
            return;
          }
          
          try {
            // Under file:// protocol, modern browsers restrict Web Workers from local files.
            // Bypassing workerSrc forces PDF.js to fall back to the built-in main-thread fake worker,
            // which works perfectly offline under file:// protocol.
            if (window.location.protocol !== 'file:') {
              pdfjsLib.GlobalWorkerOptions.workerSrc = 'js/pdf.worker.min.js';
            } else {
              console.log("Running under file:// protocol. Bypassing workerSrc to load PDF on main thread.");
            }
          } catch (workerErr) {
            console.warn("Failed to configure PDF.js worker:", workerErr);
          }
          
          pdfjsLib.getDocument({ data: typedarray }).promise.then((pdf) => {
            updateLoaderText("Extracting PDF text structures...");
            let maxPages = pdf.numPages;
            let countPromises = [];
            
            for (let j = 1; j <= maxPages; j++) {
              countPromises.push(
                pdf.getPage(j).then((page) => {
                  return page.getTextContent().then((textContent) => {
                    let lastY = null;
                    let pageText = "";
                    
                    textContent.items.forEach((item) => {
                      const currentY = item.transform ? item.transform[5] : null;
                      
                      // Check if Y coordinate changed significantly (new line)
                      if (lastY !== null && currentY !== null && Math.abs(lastY - currentY) > 5) {
                        pageText += "\n";
                      } else if (item.hasEOL) {
                        pageText += "\n";
                      } else if (pageText.length > 0 && !pageText.endsWith('\n') && !pageText.endsWith(' ')) {
                        // Prevent word runs on same line from sticking together
                        pageText += " ";
                      }
                      
                      pageText += item.str;
                      if (currentY !== null) {
                        lastY = currentY;
                      }
                    });
                    
                    return pageText;
                  });
                })
              );
            }
            
            Promise.all(countPromises).then((texts) => {
              const fullText = texts.join('\n');
              updateLoaderText("Parsing document structures...");
              
              setTimeout(() => {
                updateLoaderText("Extracting profile & contacts...");
                const parsedData = parseRawResumeText(fullText);
                setTimeout(() => {
                  updateLoaderText("Building achievements cards...");
                  saveResumeToStorage(parsedData);
                  setTimeout(() => {
                    closeModalAndRedirect(parsedData.id);
                  }, 600);
                }, 600);
              }, 500);
            }).catch((err) => {
              console.error("PDF text extraction error:", err);
              alert("Failed to parse text from pages: " + err.message);
              if (loader) loader.classList.remove('active');
            });
          }).catch((err) => {
            console.error("PDF.js loading error:", err);
            alert("Failed to read PDF file. Ensure it is a valid, non-encrypted PDF containing selectable text.");
            if (loader) loader.classList.remove('active');
          });
        });
      };
      reader.readAsArrayBuffer(selectedFile);
    }
  });
}

// Smart Paste Text Action
if (btnSubmitText) {
  btnSubmitText.addEventListener('click', () => {
    const text = textareaImport.value.trim();
    if (!text) {
      alert("Please paste your resume text in the box.");
      return;
    }
    
    showLoader("Parsing resume headers...", () => {
      try {
        updateLoaderText("Extracting profile & contacts...");
        const parsedData = parseRawResumeText(text);
        updateLoaderText("Building achievements cards...");
        saveResumeToStorage(parsedData);
        setTimeout(() => {
          closeModalAndRedirect(parsedData.id);
        }, 600);
      } catch (err) {
        console.error("Paste text parsing error:", err);
        alert("Failed to parse pasted resume text: " + err.message);
        if (loader) loader.classList.remove('active');
      }
    });
  });
}

function showLoader(initialText, callback) {
  if (loader) {
    loader.classList.add('active');
    loaderStatusText.textContent = initialText;
  }
  setTimeout(callback, 200);
}

function updateLoaderText(text) {
  if (loaderStatusText) {
    loaderStatusText.textContent = text;
  }
}

function closeModalAndRedirect(resumeId) {
  // Hide loader and modal
  if (loader) loader.classList.remove('active');
  if (modal) modal.classList.remove('active');
  
  // Clear paste area
  if (textareaImport) textareaImport.value = '';
  
  // Reset file upload state
  selectedFile = null;
  if (displayFilename) displayFilename.textContent = 'No file selected';
  if (btnSubmitFile) btnSubmitFile.disabled = true;
  if (fileInput) fileInput.value = '';
  
  // Redirect
  window.location.hash = `#editor?id=${resumeId}`;
}

/**
 * CORE HEURISTIC RESUME TEXT PARSER
 * Slices copy-pasted text into structured resume sections locally.
 */
function parseRawResumeText(text) {
  const res = {
    id: Date.now(),
    title: "[Parsed] Resume Draft",
    template: "minimalist",
    fontPair: "inter-sans",
    color: "#3b82f6",
    margin: "normal",
    lineHeight: "1.4",
    personal: { name: "", title: "", email: "", phone: "", location: "", website: "", linkedin: "", github: "", summary: "" },
    experience: [],
    education: [],
    projects: [],
    skills: [],
    languages: [],
    certifications: []
  };

  const lines = text.split('\n').map(l => l.trim());
  
  // Find Name and Title: first non-empty lines that don't look like labels or contact details
  let nameFound = false;
  let titleFound = false;
  for (let i = 0; i < Math.min(lines.length, 15); i++) {
    const l = lines[i];
    if (l.length === 0) continue;
    
    // Ignore contact lines or email/phone elements
    if (l.includes('@') || l.includes('+') || l.toLowerCase().includes('phone') || l.toLowerCase().includes('email') || l.toLowerCase().includes('address') || l.toLowerCase().includes('location')) continue;
    
    // Ignore common boilerplate header words
    const lowerL = l.toLowerCase();
    if (lowerL.includes('curriculum') || lowerL.includes('vitae') || lowerL.includes('resume') || lowerL.includes('page ') || lowerL.includes('summary') || lowerL.includes('objective') || lowerL.includes('profile')) continue;
    
    if (!nameFound) {
      res.personal.name = l;
      nameFound = true;
    } else if (!titleFound && l.length < 50) {
      res.personal.title = l;
      titleFound = true;
    }
  }

  // Parse global contact detail expressions via regex scans
  const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}/;
  const phoneRegex = /(\+?\d{1,4}[-.\s]??)?(\(?\d{3}\)?[-.\s]??\d{3}[-.\s]??\d{4})/;
  
  lines.forEach(l => {
    // Email
    const emailMatch = l.match(emailRegex);
    if (emailMatch && !res.personal.email) {
      res.personal.email = emailMatch[0];
    }
    // Phone
    const phoneMatch = l.match(phoneRegex);
    if (phoneMatch && !res.personal.phone) {
      res.personal.phone = phoneMatch[0];
    }
    // Location
    if (l.toLowerCase().includes('location:') || l.toLowerCase().includes('address:')) {
      const splits = l.split(/:/i);
      if (splits[1]) res.personal.location = splits[1].trim();
    } else if (/\b[A-Z][a-z]+,\s[A-Z]{2}\b/.test(l) && !res.personal.location) {
      // Matches standard City, ST format (e.g. Seattle, WA)
      const match = l.match(/\b[A-Z][a-z]+,\s[A-Z]{2}\b/);
      if (match) res.personal.location = match[0];
    }
    // Links (Github/Linkedin/Websites)
    if (l.toLowerCase().includes('github.com')) {
      const match = l.match(/github\.com\/[a-zA-Z0-9-_/]+/);
      if (match) res.personal.github = match[0];
    }
    if (l.toLowerCase().includes('linkedin.com')) {
      const match = l.match(/linkedin\.com\/in\/[a-zA-Z0-9-_/]+/);
      if (match) res.personal.linkedin = match[0];
    }
    if (l.toLowerCase().includes('portfolio:') || l.toLowerCase().includes('website:')) {
      const splits = l.split(/:/i);
      if (splits[1]) res.personal.website = splits[1].trim();
    }
  });

  // Section splitting
  let currentMode = 'SUMMARY';
  let activeItem = null;

  lines.forEach(l => {
    if (l.length === 0) return;
    
    const lower = l.toLowerCase();
    
    // Classify modes by headers keywords
    if (lower.includes('experience') || lower.includes('work history') || lower.includes('employment history') || lower.includes('career history')) {
      currentMode = 'EXPERIENCE';
      activeItem = null;
      return;
    }
    if (lower.includes('education') || lower.includes('academic') || lower.includes('credentials')) {
      currentMode = 'EDUCATION';
      activeItem = null;
      return;
    }
    if (lower.includes('projects') || lower.includes('initiatives')) {
      currentMode = 'PROJECTS';
      activeItem = null;
      return;
    }
    if (lower.includes('skills') || lower.includes('competencies') || lower.includes('expertise') || lower.includes('technologies')) {
      currentMode = 'SKILLS';
      activeItem = null;
      return;
    }
    if (lower.includes('certifications') || lower.includes('awards') || lower.includes('certs')) {
      currentMode = 'CERTS';
      activeItem = null;
      return;
    }
    if (lower.includes('languages')) {
      currentMode = 'LANGUAGES';
      activeItem = null;
      return;
    }
    if (lower.includes('summary') || lower.includes('profile') || lower.includes('objective')) {
      currentMode = 'SUMMARY';
      activeItem = null;
      return;
    }

    // Process modes accumulates
    if (currentMode === 'SUMMARY') {
      if (l.length > 30 && !l.includes('@') && !l.includes('http')) {
        res.personal.summary += (res.personal.summary ? " " : "") + l;
      }
    } 
    else if (currentMode === 'SKILLS') {
      // Skills are usually bulleted or comma-separated
      let cleanSkillsLine = l.replace(/^[-*•\s]+/, '');
      let list = [];
      if (cleanSkillsLine.includes(',')) {
        list = cleanSkillsLine.split(',').map(s => s.trim());
      } else if (cleanSkillsLine.includes('|')) {
        list = cleanSkillsLine.split('|').map(s => s.trim());
      } else if (cleanSkillsLine.length > 0 && cleanSkillsLine.length < 35) {
        list = [cleanSkillsLine];
      }
      list.forEach(skName => {
        if (skName && !res.skills.find(s => s.name.toLowerCase() === skName.toLowerCase())) {
          res.skills.push({ name: skName, level: "" });
        }
      });
    } 
    else if (currentMode === 'EXPERIENCE') {
      const isBullet = /^[-\*•]/.test(l);
      const cleanLine = l.replace(/^[-*•\s]+/, '');
      
      // If line is not a bullet and contains date patterns, it's likely a header
      const hasDate = /(19|20)\d{2}|present|current/i.test(l);
      
      if (!isBullet && (hasDate || l.length < 60 && !activeItem)) {
        // Create new position card
        activeItem = { company: "Company Name", role: "Job Title", startDate: "Date Range", endDate: "", location: "", description: [] };
        
        // Parse company / role splits
        const splits = cleanLine.split(/ at | @ | - | \| /i);
        if (splits.length >= 2) {
          activeItem.role = splits[0].trim();
          activeItem.company = splits[1].trim();
        } else {
          activeItem.role = cleanLine;
        }
        
        // Date search
        const dateMatch = cleanLine.match(/((?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\s\d{4}|\b\d{4})\b/gi);
        if (dateMatch) {
          activeItem.startDate = dateMatch[0];
          if (dateMatch[1]) {
            activeItem.endDate = dateMatch[1];
          } else if (cleanLine.toLowerCase().includes('present') || cleanLine.toLowerCase().includes('current')) {
            activeItem.endDate = "Present";
          }
        }
        
        res.experience.push(activeItem);
      } 
      else if (activeItem) {
        activeItem.description.push(cleanLine);
      }
    } 
    else if (currentMode === 'EDUCATION') {
      const cleanLine = l.replace(/^[-*•\s]+/, '');
      const hasDate = /(19|20)\d{2}/.test(l);
      
      if (hasDate || l.length < 60 && !activeItem) {
        activeItem = { institution: "University Name", degree: "Degree / Course", startDate: "Year", endDate: "", location: "", gpa: "" };
        
        const splits = cleanLine.split(/ at | - | \| |,/i);
        if (splits.length >= 2) {
          activeItem.degree = splits[0].trim();
          activeItem.institution = splits[1].trim();
        } else {
          activeItem.institution = cleanLine;
        }
        
        const yearMatch = cleanLine.match(/\b\d{4}\b/g);
        if (yearMatch) {
          activeItem.startDate = yearMatch[0];
          if (yearMatch[1]) activeItem.endDate = yearMatch[1];
        }
        
        res.education.push(activeItem);
      }
    } 
    else if (currentMode === 'PROJECTS') {
      const isBullet = /^[-\*•]/.test(l);
      const cleanLine = l.replace(/^[-*•\s]+/, '');
      
      if (!isBullet && l.length < 60) {
        activeItem = { name: cleanLine, role: "Creator", link: "", startDate: "", endDate: "", description: [] };
        res.projects.push(activeItem);
      } else if (activeItem) {
        activeItem.description.push(cleanLine);
      }
    } 
    else if (currentMode === 'CERTS') {
      const cleanLine = l.replace(/^[-*•\s]+/, '');
      const splits = cleanLine.split(/ - | \| |,/);
      res.certifications.push({
        name: splits[0].trim(),
        issuer: splits[1] ? splits[1].trim() : "Authority",
        date: "Year"
      });
    } 
    else if (currentMode === 'LANGUAGES') {
      const cleanLine = l.replace(/^[-*•\s]+/, '');
      const splits = cleanLine.split(/ - | \| |:|/);
      res.languages.push({
        name: splits[0].trim(),
        level: splits[1] ? splits[1].trim() : "Fluent"
      });
    }
  });

  // Safe fallback in case skills list is empty
  if (res.skills.length === 0) {
    res.skills = [
      { name: "Communication", level: "" },
      { name: "Teamwork", level: "" }
    ];
  }
  
  return res;
}

/* ==========================================================================
   SUPABASE EMAIL AUTHENTICATION & PDF DOWNLOAD GATE
   ========================================================================== */

const SUPABASE_URL = 'https://wvllzogrrhbgeoxjmobi.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Ind2bGx6b2dycmhiZ2VveGptb2JpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzk3OTI0MDQsImV4cCI6MjA5NTM2ODQwNH0.OH8KWLg_Uh5sPOGzW_LhEAdwQyT9_RLAcanvyNEHFdM';

let supabaseClient = null;
if (typeof supabase !== 'undefined') {
  supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
}

// Session state variables
let pendingAuthCallback = null;
let currentAuthMode = 'login'; // 'login' or 'signup'

// Get DOM elements for auth
const authModal = document.getElementById('auth-modal');
const btnCloseAuth = document.getElementById('btn-close-auth');
const authForm = document.getElementById('auth-form');
const authEmailInput = document.getElementById('auth-email');
const authPasswordInput = document.getElementById('auth-password');
const authErrorMsg = document.getElementById('auth-error-msg');
const authSuccessMsg = document.getElementById('auth-success-msg');
const btnAuthSubmit = document.getElementById('btn-auth-submit');
const tabAuthLogin = document.getElementById('tab-auth-login');
const tabAuthSignup = document.getElementById('tab-auth-signup');

// Intercept action and prompt auth if not logged in
async function checkAuthBeforeAction(callback) {
  if (!supabaseClient) {
    // If Supabase fails to load, let them proceed (graceful fallback)
    callback();
    return;
  }
  
  try {
    const { data: { session } } = await supabaseClient.auth.getSession();
    if (session) {
      callback();
    } else {
      // Store the callback to run after successful sign-in
      pendingAuthCallback = callback;
      if (authModal) {
        // Reset messages and inputs
        authEmailInput.value = '';
        authPasswordInput.value = '';
        authErrorMsg.style.display = 'none';
        authSuccessMsg.style.display = 'none';
        
        switchAuthMode('login');
        authModal.classList.add('active');
      }
    }
  } catch (err) {
    console.error("Auth check error, falling back:", err);
    callback(); // safe fallback
  }
}

// Function to switch between login and signup modes in modal
function switchAuthMode(mode) {
  currentAuthMode = mode;
  if (mode === 'login') {
    tabAuthLogin.classList.add('active');
    tabAuthSignup.classList.remove('active');
    btnAuthSubmit.textContent = 'Sign In & Download';
  } else {
    tabAuthLogin.classList.remove('active');
    tabAuthSignup.classList.add('active');
    btnAuthSubmit.textContent = 'Sign Up & Download';
  }
}

// Event bindings for auth tabs
if (tabAuthLogin && tabAuthSignup) {
  tabAuthLogin.addEventListener('click', () => switchAuthMode('login'));
  tabAuthSignup.addEventListener('click', () => switchAuthMode('signup'));
}

// Close auth modal
if (btnCloseAuth) {
  btnCloseAuth.addEventListener('click', () => {
    if (authModal) authModal.classList.remove('active');
    pendingAuthCallback = null;
  });
}

// Handle login / signup submission
async function handleAuthSubmit(event) {
  event.preventDefault();
  
  const email = authEmailInput.value.trim();
  const password = authPasswordInput.value;
  
  authErrorMsg.style.display = 'none';
  authSuccessMsg.style.display = 'none';
  btnAuthSubmit.disabled = true;
  
  const originalText = btnAuthSubmit.textContent;
  btnAuthSubmit.textContent = currentAuthMode === 'login' ? 'Signing In...' : 'Registering...';
  
  try {
    if (currentAuthMode === 'login') {
      // Sign In
      const { data, error } = await supabaseClient.auth.signInWithPassword({ email, password });
      
      if (error) throw error;
      
      authSuccessMsg.textContent = "Successfully signed in!";
      authSuccessMsg.style.display = 'block';
      
      // Close modal and sync header button states
      setTimeout(() => {
        if (authModal) authModal.classList.remove('active');
        syncAuthUI(data?.session);
        
        // Execute the pending action (download / print)!
        if (pendingAuthCallback) {
          pendingAuthCallback();
          pendingAuthCallback = null;
        }
      }, 500);
      
    } else {
      // Sign Up
      const { data, error } = await supabaseClient.auth.signUp({ email, password });
      
      if (error) throw error;
      
      // Check if user was auto-confirmed or needs confirmation
      const user = data.user;
      if (data.session) {
        authSuccessMsg.textContent = "Registration successful!";
        authSuccessMsg.style.display = 'block';
        
        setTimeout(() => {
          if (authModal) authModal.classList.remove('active');
          syncAuthUI(data?.session);
          
          if (pendingAuthCallback) {
            pendingAuthCallback();
            pendingAuthCallback = null;
          }
        }, 500);
      } else {
        authSuccessMsg.innerHTML = `
          Account created! Please check your email inbox to confirm your registration.
          <button type="button" class="btn btn-secondary btn-sm mt-3 w-100" onclick="checkAuthSessionManually()" style="background-color: var(--accent-blue); color: white; border: none; font-size: 0.8rem; font-weight: 600; padding: 6px 12px; border-radius: var(--radius-sm); cursor: pointer;">
            ✓ I've Confirmed my Email! Proceed to Download
          </button>
        `;
        authSuccessMsg.style.display = 'block';
      }
    }
  } catch (err) {
    console.error("Auth action failed:", err);
    authErrorMsg.textContent = err.message || "Authentication failed. Try again.";
    authErrorMsg.style.display = 'block';
  } finally {
    btnAuthSubmit.disabled = false;
    btnAuthSubmit.textContent = originalText;
  }
}

// Manual verification check for email confirmation
async function checkAuthSessionManually() {
  if (!supabaseClient) return;
  
  const checkingBtn = document.querySelector('#auth-success-msg button');
  const originalHtml = checkingBtn ? checkingBtn.innerHTML : '';
  if (checkingBtn) {
    checkingBtn.disabled = true;
    checkingBtn.textContent = "Verifying and logging you in...";
  }
  
  try {
    const email = authEmailInput.value.trim();
    const password = authPasswordInput.value;
    
    // 1. Try to sign in with the entered credentials since the email is confirmed on the server
    if (email && password) {
      console.log("Checking email confirmation via background sign-in...");
      const { data: { session }, error } = await supabaseClient.auth.signInWithPassword({ email, password });
      
      if (session) {
        if (authModal) authModal.classList.remove('active');
        syncAuthUI(session);
        
        // Trigger pending action
        if (pendingAuthCallback) {
          pendingAuthCallback();
          pendingAuthCallback = null;
        }
        return;
      }
    }
    
    // 2. Fallback check: refresh session to see if session is active
    const { data: { session }, error: refreshError } = await supabaseClient.auth.refreshSession();
    if (session) {
      if (authModal) authModal.classList.remove('active');
      syncAuthUI(session);
      if (pendingAuthCallback) {
        pendingAuthCallback();
        pendingAuthCallback = null;
      }
      return;
    }
    
    throw new Error("Verification not detected yet.");
  } catch (err) {
    console.error("Verification check failed:", err);
    alert("It looks like your email is not verified yet, or the confirmation didn't register. Please open your email inbox, click the 'Confirm email address' link, and then click this button again! Alternatively, you can try signing in using the 'Sign In' tab.");
    if (checkingBtn) {
      checkingBtn.disabled = false;
      checkingBtn.innerHTML = originalHtml;
    }
  }
}


// Global Sign Out handler
async function handleSignOut() {
  if (!supabaseClient) return;
  if (!confirm("Are you sure you want to sign out?")) return;
  
  try {
    // Explicitly hide all Sign Out buttons immediately in the UI to prevent any state update delay
    document.querySelectorAll('.btn-sign-out').forEach(btn => {
      btn.style.display = 'none';
    });

    const { error } = await supabaseClient.auth.signOut();
    if (error) throw error;
    
    await syncAuthUI(null); // Explicitly update UI with null session to prevent race conditions
    alert("You have successfully signed out!");
    
    // Redirect to home or dashboard
    window.location.hash = '#home';
  } catch (err) {
    console.error("Sign out error:", err);
  }
}

// Sync "Sign Out" buttons, download quotas, and premium badges depending on session
async function syncAuthUI(passedSession = undefined) {
  if (!supabaseClient) return;
  try {
    let session;
    if (passedSession !== undefined) {
      session = passedSession;
    } else {
      const { data } = await supabaseClient.auth.getSession();
      session = data?.session;
    }
    const isLoggedIn = !!session;
    
    // Hide/Show Sign Out buttons
    document.querySelectorAll('.btn-sign-out').forEach(btn => {
      btn.style.display = isLoggedIn ? 'inline-flex' : 'none';
    });
    
    // Hide/Show Premium components depending on active user state
    const upgradeBtns = [
      document.getElementById('btn-upgrade-homepage'),
      document.getElementById('btn-upgrade-dashboard'),
      document.getElementById('btn-upgrade-editor'),
      document.getElementById('btn-upgrade-mobile')
    ];
    
    const quotaBadges = [
      document.getElementById('dashboard-quota-badge'),
      document.getElementById('editor-quota-badge')
    ];
    
    const quotaTexts = [
      document.getElementById('quota-display-text'),
      document.getElementById('editor-quota-display-text')
    ];
    
    if (isLoggedIn && session.user) {
      // Get or initialize user_metadata
      const metadata = session.user.user_metadata || {};
      
      let isPremium = !!metadata.is_premium;
      let downloads = parseInt(metadata.downloads_this_month) || 0;
      let premiumUntilStr = metadata.premium_until || '';
      let lastResetStr = metadata.last_download_reset || '';
      
      let updatesNeeded = false;
      const updatedData = {};
      
      // 1. Initial defaults fallback
      if (metadata.is_premium === undefined) {
        isPremium = false;
        updatedData.is_premium = false;
        updatesNeeded = true;
      }
      if (metadata.downloads_this_month === undefined) {
        downloads = 0;
        updatedData.downloads_this_month = 0;
        updatesNeeded = true;
      }
      if (!lastResetStr) {
        lastResetStr = new Date().toISOString();
        updatedData.last_download_reset = lastResetStr;
        updatesNeeded = true;
      }
      
      // 2. Validate active premium period
      if (isPremium && premiumUntilStr) {
        const premiumUntil = new Date(premiumUntilStr);
        if (new Date() > premiumUntil) {
          isPremium = false;
          updatedData.is_premium = false;
          updatesNeeded = true;
          console.log("[Quota Engine] Premium subscription has expired.");
        }
      }
      
      // 3. Monthly download quota auto-resets (resets 30 days after last_download_reset)
      if (lastResetStr) {
        const lastReset = new Date(lastResetStr);
        const daysDiff = (new Date() - lastReset) / (1000 * 60 * 60 * 24);
        if (daysDiff >= 30) {
          downloads = 0;
          lastResetStr = new Date().toISOString();
          updatedData.downloads_this_month = 0;
          updatedData.last_download_reset = lastResetStr;
          updatesNeeded = true;
          console.log("[Quota Engine] 30 days have passed. Resetting downloads count.");
        }
      }
      
      // 4. Client-side update Supabase context if any defaults or resets triggered
      if (updatesNeeded) {
        console.log("[Quota Engine] Syncing updated user metadata to Supabase...", updatedData);
        await supabaseClient.auth.updateUser({ data: updatedData });
      }
      
      // 5. Update UI displays based on Plan state
      if (isPremium) {
        // Subscribed Premium Plan Display
        upgradeBtns.forEach(btn => {
          if (btn) {
            btn.style.display = 'inline-flex';
            btn.className = 'btn btn-premium-active';
            btn.innerHTML = '👑 Premium Active';
            btn.disabled = true;
          }
        });
        
        quotaBadges.forEach(badge => {
          if (badge) badge.style.display = 'inline-flex';
        });
        
        quotaTexts.forEach(text => {
          if (text) {
            text.innerHTML = '👑 Premium Active (Unlimited)';
            text.style.color = '#10b981';
          }
        });
        
        // Modal pricing card updates
        const upgradePremiumBtn = document.getElementById('btn-upgrade-premium');
        const freeCard = document.getElementById('pricing-card-free');
        const premiumCard = document.getElementById('pricing-card-premium');
        
        if (upgradePremiumBtn) {
          upgradePremiumBtn.textContent = '👑 Subscribed (Active)';
          upgradePremiumBtn.disabled = true;
          upgradePremiumBtn.style.background = 'rgba(16, 185, 129, 0.2)';
          upgradePremiumBtn.style.color = '#10b981';
          upgradePremiumBtn.style.border = '1px solid rgba(16, 185, 129, 0.4)';
          upgradePremiumBtn.style.boxShadow = 'none';
        }
        if (freeCard) freeCard.style.opacity = '0.5';
        if (premiumCard) {
          const badge = premiumCard.querySelector('.plan-badge');
          if (badge) badge.textContent = '👑 Active Plan';
        }
      } else {
        // Free Plan Display
        upgradeBtns.forEach(btn => {
          if (btn) {
            btn.style.display = 'inline-flex';
            btn.className = 'btn btn-premium-upgrade';
            btn.innerHTML = '👑 Upgrade';
            btn.disabled = false;
          }
        });
        
        quotaBadges.forEach(badge => {
          if (badge) badge.style.display = 'inline-flex';
        });
        
        quotaTexts.forEach(text => {
          if (text) {
            text.innerHTML = `Downloads: ${downloads} / 2 Free`;
            text.style.color = '';
          }
        });
        
        // Modal pricing card updates
        const upgradePremiumBtn = document.getElementById('btn-upgrade-premium');
        const freeCard = document.getElementById('pricing-card-free');
        const premiumCard = document.getElementById('pricing-card-premium');
        
        if (upgradePremiumBtn) {
          upgradePremiumBtn.textContent = '⚡ Upgrade to Premium';
          upgradePremiumBtn.disabled = false;
          upgradePremiumBtn.style.background = '';
          upgradePremiumBtn.style.color = '';
          upgradePremiumBtn.style.border = '';
          upgradePremiumBtn.style.boxShadow = '';
        }
        if (freeCard) freeCard.style.opacity = '1';
        if (premiumCard) {
          const badge = premiumCard.querySelector('.plan-badge');
          if (badge) badge.textContent = '👑 Recommended';
        }
      }
    } else {
      // User is Guest/Logged out -> Hide Quota displays & Upgrade tags
      upgradeBtns.forEach(btn => {
        if (btn) btn.style.display = 'none';
      });
      quotaBadges.forEach(badge => {
        if (badge) badge.style.display = 'none';
      });
    }
  } catch (err) {
    console.warn("Could not synchronize authentication/pricing buttons:", err);
  }
}

// Bind to window to allow HTML onclick executions
// Google OAuth Sign In
async function handleGoogleSignIn() {
  if (!supabaseClient) {
    alert("Supabase client is not loaded. Cannot perform Google Sign-In.");
    return;
  }
  
  try {
    // Flag that we want to download the resume immediately after successful authentication
    localStorage.setItem('pending_download_on_login', 'true');
    
    const redirectToUrl = window.location.origin + window.location.pathname;
    console.log("Redirecting to Google Sign-In, callback will return to:", redirectToUrl);
    
    const { data, error } = await supabaseClient.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: redirectToUrl
      }
    });
    
    if (error) throw error;
  } catch (err) {
    console.error("Google Sign-In failed:", err);
    alert("Google Sign-In failed: " + (err.message || err));
    localStorage.removeItem('pending_download_on_login');
  }
}

// Bind to window to allow HTML onclick executions
window.checkAuthBeforeAction = checkAuthBeforeAction;
window.handleAuthSubmit = handleAuthSubmit;
window.checkAuthSessionManually = checkAuthSessionManually;
window.handleGoogleSignIn = handleGoogleSignIn;
window.handleSignOut = handleSignOut;
window.syncAuthUI = syncAuthUI;

// Listen to session changes to trigger state updates
if (supabaseClient) {
  supabaseClient.auth.onAuthStateChange((event, session) => {
    syncAuthUI(session);
    
    // Auto-download after Google OAuth redirect login if flagged
    if (session && localStorage.getItem('pending_download_on_login') === 'true') {
      localStorage.removeItem('pending_download_on_login');
      
      // Give a tiny moment for layout and authModal transitions to complete
      setTimeout(() => {
        const titleInput = document.getElementById('resume-title-input');
        const title = (titleInput && titleInput.value) || 'My_Resume';
        
        console.log("Auto-triggering download for:", title);
        if (typeof downloadPDF === 'function') {
          downloadPDF(title);
        } else if (window.downloadPDF) {
          window.downloadPDF(title);
        }
      }, 1000);
    }
  });
}

// ==========================================================================
// APP THEME CONTROLLER (Light, Dark, System)
// ==========================================================================

function setAppTheme(theme) {
  // Save to localStorage
  localStorage.setItem('resu_app_theme', theme);
  
  const root = document.documentElement;
  
  // Clean classes
  root.classList.remove('theme-light');
  
  // Set dropdown options states
  document.querySelectorAll('.theme-opt').forEach(btn => {
    btn.classList.remove('active');
  });
  document.querySelectorAll('.theme-editor-btn').forEach(btn => {
    btn.classList.remove('active');
  });
  
  // Apply theme
  let appliedTheme = theme;
  if (theme === 'system') {
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    appliedTheme = prefersDark ? 'dark' : 'light';
    
    // Highlight system buttons
    document.querySelectorAll('.theme-opt[onclick*="system"]').forEach(b => b.classList.add('active'));
    const sysBtn = document.getElementById('theme-btn-system');
    if (sysBtn) sysBtn.classList.add('active');
  } else {
    // Highlight specific buttons
    document.querySelectorAll(`.theme-opt[onclick*="${theme}"]`).forEach(b => b.classList.add('active'));
    const activeBtn = document.getElementById(`theme-btn-${theme}`);
    if (activeBtn) activeBtn.classList.add('active');
  }
  
  // Set body light class if theme is light
  if (appliedTheme === 'light') {
    root.classList.add('theme-light');
  }
  
  // Update header trigger icon
  const currentThemeIcon = document.querySelectorAll('.current-theme-icon');
  currentThemeIcon.forEach(iconSpan => {
    if (theme === 'light') iconSpan.textContent = '☀️';
    else if (theme === 'dark') iconSpan.textContent = '🌙';
    else iconSpan.textContent = '💻';
  });
  
  console.log(`Theme set to: ${theme} (applied: ${appliedTheme})`);
}

// OS system listener
const systemThemeMediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
systemThemeMediaQuery.addEventListener('change', () => {
  const currentSavedTheme = localStorage.getItem('resu_app_theme') || 'dark';
  if (currentSavedTheme === 'system') {
    setAppTheme('system');
  }
});

// Dropdown toggles
function toggleThemeDropdown(event) {
  event.stopPropagation();
  const parent = event.currentTarget.parentElement;
  
  // Close all other theme switchers first
  document.querySelectorAll('.theme-switcher').forEach(el => {
    if (el !== parent) el.classList.remove('active');
  });
  
  parent.classList.toggle('active');
}

// Bind to window to allow HTML onclick executions
window.setAppTheme = setAppTheme;
window.toggleThemeDropdown = toggleThemeDropdown;

// Close dropdowns on window click
window.addEventListener('click', () => {
  document.querySelectorAll('.theme-switcher').forEach(el => {
    el.classList.remove('active');
  });
});

// Run initial UI checks on load
window.addEventListener('DOMContentLoaded', () => {
  setTimeout(syncAuthUI, 200);
  
  // Load and apply user saved theme preference (default to dark)
  const savedTheme = localStorage.getItem('resu_app_theme') || 'dark';
  setAppTheme(savedTheme);
  
  // Bind close event to pricing close button
  const btnClosePricing = document.getElementById('btn-close-pricing');
  if (btnClosePricing) {
    btnClosePricing.addEventListener('click', closePricingModal);
  }
  
  const pricingModal = document.getElementById('pricing-modal');
  if (pricingModal) {
    pricingModal.addEventListener('click', (e) => {
      if (e.target === pricingModal) {
        closePricingModal();
      }
    });
  }
});

// Pricing Modal Toggle Controls
function openPricingModal() {
  const pricingModal = document.getElementById('pricing-modal');
  if (pricingModal) {
    pricingModal.classList.add('active');
  }
}

function closePricingModal() {
  const pricingModal = document.getElementById('pricing-modal');
  if (pricingModal) {
    pricingModal.classList.remove('active');
  }
}

// Trigger checkout with Razorpay SDK (Standard Checkout UI in Test Mode)
async function handlePremiumCheckout() {
  if (!supabaseClient) {
    alert("Supabase client is not loaded. Cannot trigger checkout.");
    return;
  }
  
  // 1. Check if the user is authenticated first
  checkAuthBeforeAction(async () => {
    try {
      const { data: { session } } = await supabaseClient.auth.getSession();
      if (!session || !session.user) {
        alert("Please log in or create an account before upgrading.");
        return;
      }
      
      const email = session.user.email || '';
      
      // 2. Open Razorpay Checkout Modal (using test API keys)
      const options = {
        "key": "rzp_test_ResuBuildKeyID", // Test mode Key ID
        "amount": "9900", // ₹99.00 in subunits (99 * 100 paise)
        "currency": "INR",
        "name": "ResuBuild Premium Plan",
        "description": "Unlock unlimited PDF downloads & priority resume builder templates for 30 days.",
        "image": "https://cdn-icons-png.flaticon.com/512/2822/2822699.png", // Glowing crown icon
        "handler": async function (response) {
          // Success callback trigger
          console.log("[Razorpay Success] Payment Received ID:", response.razorpay_payment_id);
          
          const loader = document.getElementById('modal-loader');
          const loaderText = document.getElementById('loader-status-text');
          if (loader) {
            if (loaderText) loaderText.textContent = "Processing premium upgrade...";
            loader.classList.add('active');
          }
          
          try {
            // Upgrade user's metadata in Supabase to premium (client-side update)
            const premiumUntilDate = new Date();
            premiumUntilDate.setDate(premiumUntilDate.getDate() + 30); // 30-day billing cycle
            
            const updatedMetadata = {
              is_premium: true,
              premium_until: premiumUntilDate.toISOString()
            };
            
            const { data, error } = await supabaseClient.auth.updateUser({ data: updatedMetadata });
            if (error) throw error;
            
            // Success alert & UI update
            closePricingModal();
            
            // Sync session immediately inside client context
            await syncAuthUI();
            
            alert("👑 Congratulations! Your ₹99 payment was successfully processed. You are now a Premium Subscriber with UNLIMITED downloads unlocked for 30 days!");
            
            // Auto-trigger any pending downloads that were intercepted
            const pendingTitle = localStorage.getItem('pending_download_on_login') === 'true' ? 'My_Resume' : '';
            if (pendingTitle && typeof downloadPDF === 'function') {
              downloadPDF(pendingTitle);
            }
          } catch (updateErr) {
            console.error("Upgrade error:", updateErr);
            alert("Upgrade failed to save: " + updateErr.message);
          } finally {
            if (loader) loader.classList.remove('active');
          }
        },
        "prefill": {
          "email": email,
          "name": email.split('@')[0]
        },
        "theme": {
          "color": "#3b82f6" // ResuBuild Blue highlight
        }
      };
      
      const rzpInstance = new Razorpay(options);
      
      // Implement fail listener
      rzpInstance.on('payment.failed', function (response){
        console.error("[Razorpay Failed] code:", response.error.code);
        alert("Payment failed: " + response.error.description);
      });
      
      rzpInstance.open();
    } catch (err) {
      console.error("Payment modal trigger failed:", err);
      alert("Billing gateway failed to initialize. Try again.");
    }
  });
}

// Bind to window to allow HTML onclick executions
window.openPricingModal = openPricingModal;
window.closePricingModal = closePricingModal;
window.handlePremiumCheckout = handlePremiumCheckout;

// Mobile Menu Navigation Drawer Controls
function toggleMobileDrawer() {
  const drawer = document.getElementById('mobile-menu-drawer');
  if (drawer) {
    drawer.classList.add('active');
  }
}

function closeMobileDrawer() {
  const drawer = document.getElementById('mobile-menu-drawer');
  if (drawer) {
    drawer.classList.remove('active');
  }
}

window.toggleMobileDrawer = toggleMobileDrawer;
window.closeMobileDrawer = closeMobileDrawer;

// Toggle mobile live preview mode
function toggleMobilePreviewMode() {
  const editor = document.getElementById('editor');
  const btnToggle = document.getElementById('mobile-preview-toggle');
  if (!editor || !btnToggle) return;
  
  const isActive = editor.classList.toggle('mobile-preview-active-mode');
  
  const icon = btnToggle.querySelector('.toggle-icon');
  const text = btnToggle.querySelector('.toggle-text');
  
  if (isActive) {
    if (icon) icon.textContent = '✏️';
    if (text) text.textContent = 'Edit Form Details';
    btnToggle.style.background = 'linear-gradient(135deg, #10b981 0%, #059669 100%)';
    btnToggle.style.color = '#ffffff';
    btnToggle.style.boxShadow = '0 6px 20px rgba(16, 185, 129, 0.4)';
    
    // Automatically trigger fit zoom to scale the A4 preview sheet down to the phone width
    if (window.fitZoom) {
      setTimeout(window.fitZoom, 150);
    }
  } else {
    if (icon) icon.textContent = '👁️';
    if (text) text.textContent = 'View Live Preview';
    btnToggle.style.background = '';
    btnToggle.style.color = '';
    btnToggle.style.boxShadow = '';
  }
}

window.toggleMobilePreviewMode = toggleMobilePreviewMode;




