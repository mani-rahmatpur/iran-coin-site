const INDEX_PATH = "../assets/data/rulers.index.json";
const grid = document.getElementById("rulersGrid");

/* Modal refs */
const modal = document.getElementById("rulerModal");
const mImg   = document.getElementById("modalImage");
const mTitle = document.getElementById("modalTitle");
const mSum   = document.getElementById("modalSummary");
const mEra   = document.getElementById("metaEra");
const mCap   = document.getElementById("metaCapital");
const mFacts = document.getElementById("modalFacts");
const mMap   = document.getElementById("modalMap");
const slides = document.getElementById("slides");
const openBtn= document.getElementById("openFullPage");

let currentSlide = 0;

/* ==============================================
   EMPIRE-SPECIFIC MISSING RULERS LISTS
   ============================================== */

/* Achaemenid Empire - Missing Rulers (1 ruler) */
const achaemenidMissingRulers = [
  "achaemenid-darius3"
];

/* Parthian Empire - Missing Rulers (9 rulers) */
const parthianMissingRulers = [
  "parthian-priapatius",
  "parthian-artabanus1",
  "parthian-orodes1",
  "parthian-mithridates3",
  "parthian-gotarzes2",
  "parthian-vonones2",
  "parthian-vologases2",
  "parthian-vologases3",
  "parthian-vologases4"
];

/* Sasanian Empire - Missing Rulers (2 rulers) */
const sasanianMissingRulers = [
  "sasanian-jamasp",
  "sasanian-yazdegerd3"
];

/* ==============================================
   HELPER FUNCTIONS
   ============================================== */

/* Get empire name from dynasty index or title */
function getEmpireName(dynastyIndex, dynastyTitle) {
  if (dynastyIndex === 1 || (dynastyTitle && dynastyTitle.toLowerCase().includes('achaemenid'))) {
    return 'achaemenid';
  } else if (dynastyIndex === 2 || (dynastyTitle && dynastyTitle.toLowerCase().includes('parthian'))) {
    return 'parthian';
  } else if (dynastyIndex === 3 || (dynastyTitle && dynastyTitle.toLowerCase().includes('sasanian'))) {
    return 'sasanian';
  }
  return null;
}

/* Check if a ruler image is missing for a specific empire */
function isMissingRuler(empire, imageName) {
  if (!imageName) return false;
  const nameWithoutExt = imageName.replace('.png', '');
  
  switch(empire) {
    case 'achaemenid':
      return achaemenidMissingRulers.includes(nameWithoutExt);
    case 'parthian':
      return parthianMissingRulers.includes(nameWithoutExt);
    case 'sasanian':
      return sasanianMissingRulers.includes(nameWithoutExt);
    default:
      return false;
  }
}

/* Get the placeholder path for a specific empire */
function getPlaceholderPath(empire) {
  switch(empire) {
    case 'achaemenid':
      return '../images/rulers/achaemenid-placeholder.png';
    case 'parthian':
      return '../images/rulers/parthian-placeholder.png';
    case 'sasanian':
      return '../images/rulers/sasanian-placeholder.png';
    default:
      return '../images/placeholder.png';
  }
}

/* Get the correct image path (real image or placeholder) */
function getImagePath(empire, imageName) {
  if (!imageName) {
    return getPlaceholderPath(empire);
  }
  
  /* Check if this is a missing ruler for this empire */
  if (empire && isMissingRuler(empire, imageName)) {
    return getPlaceholderPath(empire);
  }
  
  return `../images/rulers/${imageName}`;
}

/* ==============================================
   RENDER GRID
   ============================================== */

fetch(INDEX_PATH)
  .then(r => r.json())
  .then(list => {
    list.forEach((d, i) => {
      const dynastyIndex = i + 1;
      const empire = getEmpireName(dynastyIndex, d.title);
      const placeholderPath = getPlaceholderPath(empire);
      
      const el = document.createElement("article");
      el.className = "card";
      el.innerHTML = `
        <img src="../images/rulers/RUL${dynastyIndex}.png" alt="${d.title}" loading="lazy"
             onerror="this.onerror=null; this.src='${placeholderPath}'">
        <div class="overlay">
          <h2>${d.title}</h2>
          <p>${d.era}</p>
        </div>`;
      el.addEventListener("click", () => openModal(d, dynastyIndex));
      grid.appendChild(el);
    });
  })
  .catch(err => grid.innerHTML = `<p style="color:#f66">${err.message}</p>`);

/* ==============================================
   OPEN MODAL FUNCTION
   ============================================== */

function openModal(dyn, dynastyIndex) {
  modal.setAttribute("aria-hidden", "false");
  document.body.style.overflow = "hidden";

  /* Get empire name for this dynasty */
  const empire = getEmpireName(dynastyIndex, dyn.title);
  const placeholderPath = getPlaceholderPath(empire);
  
  /* Basic fields from index immediately */
  mImg.src = `../images/rulers/RUL${dynastyIndex}.png`;
  mImg.alt = dyn.title;
  
  /* Add error handler for grid image */
  mImg.onerror = function() {
    this.onerror = null;
    this.src = placeholderPath;
  };
  
  mTitle.textContent = dyn.title;
  mEra.textContent   = dyn.era || "—";
  mCap.textContent   = dyn.capital || "—";
  mSum.textContent   = dyn.summary || "";

  openBtn.href = dyn.page || "#";

  /* Reset */
  mMap.src = ""; 
  mMap.style.display = "none";
  mFacts.innerHTML = ""; 
  slides.innerHTML = ""; 
  currentSlide = 0;

  /* Fetch full data file */
  fetch(dyn.dataPath)
    .then(r => r.json())
    .then(full => {
      /* Map image */
      if (full.map) { 
        mMap.src = full.map; 
        mMap.style.display = "block";
        mMap.onerror = function() {
          this.onerror = null;
          this.src = placeholderPath;
        };
      }

      /* Facts */
      (full.facts || dyn.facts || []).forEach(f => {
        const li = document.createElement("li"); 
        li.textContent = f; 
        mFacts.appendChild(li);
      });

      /* Rulers slider with empire-specific placeholders */
      (full.rulers || []).forEach(r => {
        const s = document.createElement("div");
        s.className = "slide";
        
        /* Get the correct image path (real or placeholder) */
        const imagePath = getImagePath(empire, r.image);
        
        s.innerHTML = `
          <img src="${imagePath}" alt="${r.name}" loading="lazy"
               onerror="this.onerror=null; this.src='${placeholderPath}'">
          <h4>${r.name}</h4>
          <p>${r.description || ""}</p>`;
        slides.appendChild(s);
      });
      updateSlider();
    })
    .catch(err => {
      const li = document.createElement("li");
      li.textContent = `Could not load rulers: ${err.message}`;
      mFacts.appendChild(li);
    });
}

/* ==============================================
   MODAL CLOSE FUNCTIONS
   ============================================== */

function closeModal(){ 
  modal.setAttribute("aria-hidden","true"); 
  document.body.style.overflow = ""; 
}

modal.addEventListener("click", e => { 
  if (e.target.hasAttribute("data-close-modal")) closeModal(); 
});

document.addEventListener("keydown", e => {
  if(e.key === "Escape" && modal.getAttribute("aria-hidden")==="false") closeModal();
});

/* ==============================================
   SLIDER FUNCTIONS
   ============================================== */

function updateSlider(){ 
  slides.style.transform = `translateX(-${currentSlide * 100}%)`; 
}

document.querySelector(".prev").addEventListener("click", () => {
  const total = slides.children.length || 1;
  currentSlide = (currentSlide - 1 + total) % total; 
  updateSlider();
});

document.querySelector(".next").addEventListener("click", () => {
  const total = slides.children.length || 1;
  currentSlide = (currentSlide + 1) % total; 
  updateSlider();
});
