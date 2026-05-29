/**
 * RESUBUILD PDF GENERATION & PRINT FLOW ENGINE
 * Controls vector-quality printing (browser engine) and instant local A4 conversions.
 */

/**
 * Compiles and downloads high-fidelity PDF from preview sheet
 * @param {string} resumeTitle Document download name
 */
async function downloadPDF(resumeTitle) {
  const element = document.getElementById('a4-printable-document');
  if (!element) return;
  
  // 1. Quota limit checks inside Supabase context
  if (typeof supabaseClient !== 'undefined' && supabaseClient) {
    try {
      const { data: { session } } = await supabaseClient.auth.getSession();
      if (session && session.user) {
        const metadata = session.user.user_metadata || {};
        let isPremium = !!metadata.is_premium;
        let downloads = parseInt(metadata.downloads_this_month) || 0;
        let premiumUntilStr = metadata.premium_until || '';
        let lastResetStr = metadata.last_download_reset || '';
        
        // Expiration fallback double-check
        if (isPremium && premiumUntilStr) {
          if (new Date() > new Date(premiumUntilStr)) {
            // Subscription expired! We'll reset it to false
            isPremium = false;
            await supabaseClient.auth.updateUser({ data: { is_premium: false } });
            if (typeof syncAuthUI === 'function') await syncAuthUI();
            alert("Your premium subscription has expired. Please upgrade to continue downloading resumes!");
            if (typeof openPricingModal === 'function') openPricingModal();
            return;
          }
        }
        
        // 30-day quota reset check
        if (lastResetStr) {
          const lastReset = new Date(lastResetStr);
          const daysDiff = (new Date() - lastReset) / (1000 * 60 * 60 * 24);
          if (daysDiff >= 30) {
            downloads = 0;
            lastResetStr = new Date().toISOString();
            await supabaseClient.auth.updateUser({ 
              data: { 
                downloads_this_month: 0, 
                last_download_reset: lastResetStr 
              } 
            });
            if (typeof syncAuthUI === 'function') await syncAuthUI();
            console.log("[Quota Engine] 30 days passed. Reset downloads count to 0 in DB.");
          }
        } else {
          // Initialize last_download_reset if missing
          lastResetStr = new Date().toISOString();
          await supabaseClient.auth.updateUser({ data: { last_download_reset: lastResetStr } });
        }
        
        // Quota Guard Interception
        if (!isPremium && downloads >= 2) {
          console.warn("[Quota Intercept] Free limit reached.");
          alert("🔒 Limit Reached: You have already used your 2 free resume downloads for this month. Please upgrade to the Premium Plan to unlock unlimited downloads!");
          if (typeof openPricingModal === 'function') openPricingModal();
          return;
        }
        
        // Increment Free download count *before* generation
        if (!isPremium) {
          downloads += 1;
          await supabaseClient.auth.updateUser({ data: { downloads_this_month: downloads } });
          if (typeof syncAuthUI === 'function') await syncAuthUI();
          console.log(`[Quota Engine] Incrementing download count to ${downloads} / 2.`);
        }
      }
    } catch (err) {
      console.warn("Quota validation exception, proceeding with safe fallback:", err);
    }
  }

  // Show premium loader screen to cover the layout shift and block user input
  const loader = document.getElementById('modal-loader');
  const loaderText = document.getElementById('loader-status-text');
  if (loader) {
    if (loaderText) loaderText.textContent = "Compiling one-page vector PDF...";
    loader.classList.add('active');
  }
  
  // Keep original styles for perfect restoration
  const originalTransform = element.style.transform;
  const originalTransformOrigin = element.style.transformOrigin;
  const originalHeight = element.style.height;
  const originalBoxShadow = element.style.boxShadow;
  const originalMargin = element.style.margin;
  
  // Reset styles temporarily to measure true unscaled content scrollHeight
  element.style.transform = 'none';
  element.style.height = 'auto';
  
  const contentHeight = element.scrollHeight;
  const targetHeight = 1123; // Standard 150 DPI A4 height
  let scaleFactor = 1;
  if (contentHeight > targetHeight) {
    scaleFactor = targetHeight / contentHeight;
    console.log(`[PDF Auto-Fit] Content height is ${contentHeight}px. Scaling down by ${scaleFactor.toFixed(4)} to fit exactly on 1 page.`);
  } else {
    console.log(`[PDF Auto-Fit] Content fits perfectly on 1 page without scaling.`);
  }
  
  // Create a temporary parent wrapper inside the active DOM tree
  const parent = element.parentElement;
  const wrapper = document.createElement('div');
  wrapper.id = 'pdf-export-wrapper';
  wrapper.style.width = '794px';
  wrapper.style.height = '1123px';
  wrapper.style.overflow = 'hidden';
  wrapper.style.background = '#ffffff';
  wrapper.style.margin = '0';
  wrapper.style.padding = '0';
  wrapper.style.boxShadow = 'none';
  
  // Apply temporary export styles to the printable sheet for rendering inside the wrapper
  element.style.boxShadow = 'none';
  element.style.margin = '0';
  
  if (scaleFactor < 1) {
    element.style.height = `${contentHeight}px`;
    element.style.transform = `scale(${scaleFactor})`;
    element.style.transformOrigin = 'top center';
  } else {
    element.style.height = '1123px';
    element.style.transform = 'none';
  }
  
  // Temporarily swap the element into the wrapper inside the live DOM
  parent.replaceChild(wrapper, element);
  wrapper.appendChild(element);
  
  // Setup html2pdf configuration (scale: 2 is high-resolution, 300DPI equivalent)
  const opt = {
    margin:       0,
    filename:     `${resumeTitle.replace(/\s+/g, '_')}_CV.pdf`,
    image:        { type: 'jpeg', quality: 0.98 },
    html2canvas:  { 
      scale: 2, 
      useCORS: true, 
      letterRendering: true,
      scrollX: 0,
      scrollY: 0
    },
    jsPDF:        { unit: 'mm', format: 'a4', orientation: 'portrait' }
  };
  
  // Helper function to safely restore DOM to original preview state
  function restoreDOM() {
    element.style.transform = originalTransform;
    element.style.transformOrigin = originalTransformOrigin;
    element.style.height = originalHeight;
    element.style.boxShadow = originalBoxShadow;
    element.style.margin = originalMargin;
    
    if (parent.contains(wrapper)) {
      parent.replaceChild(element, wrapper);
    }
    
    if (loader) {
      loader.classList.remove('active');
    }
  }
  
  // Trigger background PDF generation asynchronously
  html2pdf().set(opt).from(wrapper).save().then(() => {
    console.log("[PDF compiler] PDF generated and saved successfully.");
    restoreDOM();
  }).catch((err) => {
    console.error('PDF Conversion error:', err);
    restoreDOM();
    
    // Automatic system print fallback!
    alert("We encountered an issue saving your PDF. Opening the system print dialog so you can save your resume as PDF instead!");
    window.print();
  });
}

/**
 * Triggers standard browser system print flow.
 * Works perfectly because of print media stylesheets in templates.css.
 */
function printCV() {
  window.print();
}

// Bind to event triggers in navigation
document.getElementById('btn-download-pdf').addEventListener('click', () => {
  if (typeof window.checkAuthBeforeAction === 'function') {
    window.checkAuthBeforeAction(() => {
      const title = document.getElementById('resume-title-input').value || 'My_Resume';
      downloadPDF(title);
    });
  } else {
    const title = document.getElementById('resume-title-input').value || 'My_Resume';
    downloadPDF(title);
  }
});

document.getElementById('btn-print').addEventListener('click', () => {
  if (typeof window.checkAuthBeforeAction === 'function') {
    window.checkAuthBeforeAction(printCV);
  } else {
    printCV();
  }
});
