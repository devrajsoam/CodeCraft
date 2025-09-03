// Auto-symbol pair logic
["html-code", "css-code", "js-code"].forEach(id => {
  const el = document.getElementById(id);

  el.addEventListener('keydown', function(e) {
    const pairs = {
      '"': '"',
      "'": "'",
      '{': '}',
      '(': ')',
      '[': ']',
      '<': '>'
    };

    if (pairs[e.key] && !e.ctrlKey) {
      e.preventDefault();
      const [start, end] = [el.selectionStart, el.selectionEnd];
      const val = el.value;
      const insert = e.key + pairs[e.key];
      el.value = val.substring(0, start) + insert + val.substring(end);
      el.selectionStart = el.selectionEnd = start + 1;
    }

    if (e.key === '`') {
      e.preventDefault();
      insertText(el, "'");
    }

    if (e.key === '"' || e.key === '"') {
      e.preventDefault();
      insertText(el, '"');
    }
  });

  function insertText(el, text) {
    const [start, end] = [el.selectionStart, el.selectionEnd];
    el.value = el.value.substring(0, start) + text + el.value.substring(end);
    el.selectionStart = el.selectionEnd = start + text.length;
  }
});

// Run Button Functionality
const runBtn = document.getElementById("run-btn");
const runIcon = document.getElementById("run-btn-icon");
const runText = document.getElementById("run-btn-text");
const runningAnim = document.getElementById("running-anim");

runBtn.addEventListener("click", () => {
  // Show loading animation
  runIcon.style.display = "none";
  runText.textContent = "Running...";
  runningAnim.style.display = "inline-block";

  setTimeout(() => {
    runCode();
    runIcon.style.display = "inline-block";
    runText.textContent = "Run";
    runningAnim.style.display = "none";
  }, 900);
});

function runCode() {
  const htmlCode = document.getElementById("html-code").value;
  const cssCode = `<style>${document.getElementById("css-code").value}</style>`;
  const jsCode = `<script>${document.getElementById("js-code").value}<\/script>`;

  const output = document.getElementById("output");
  output.srcdoc = htmlCode + cssCode + jsCode;
}

// Clear Button Functionality
const clearBtn = document.getElementById("clear-btn");
clearBtn.addEventListener("click", () => {
  if (confirm("Are you sure you want to clear all code?")) {
    document.getElementById("html-code").value = "";
    document.getElementById("css-code").value = "";
    document.getElementById("js-code").value = "";
    document.getElementById("output").srcdoc = "";
  }
});

// Info Modal Functionality
const infoBtn = document.getElementById("info-btn");
const infoModal = document.getElementById("info-modal");
const closeBtn = document.getElementsByClassName("close")[0];

// Open modal when info button is clicked
infoBtn.addEventListener("click", () => {
  infoModal.style.display = "block";
  document.body.style.overflow = "hidden"; // Prevent background scrolling
});

// Close modal when X is clicked
closeBtn.addEventListener("click", () => {
  infoModal.style.display = "none";
  document.body.style.overflow = "auto";
});

// Close modal when clicking outside of it
window.addEventListener("click", (event) => {
  if (event.target == infoModal) {
    infoModal.style.display = "none";
    document.body.style.overflow = "auto";
  }
});

// Keyboard shortcuts
document.addEventListener("keydown", (e) => {
  // Ctrl+Enter to run code
  if (e.ctrlKey && e.key === 'Enter') {
    e.preventDefault();
    runCode();
  }

  // Escape to close modal
  if (e.key === 'Escape' && infoModal.style.display === "block") {
    infoModal.style.display = "none";
    document.body.style.overflow = "auto";
  }
});

// Auto-run feature (optional - runs code after user stops typing for 2 seconds)
let autoRunTimer;
["html-code", "css-code", "js-code"].forEach(id => {
  document.getElementById(id).addEventListener("input", () => {
    clearTimeout(autoRunTimer);
    autoRunTimer = setTimeout(() => {
      runCode();
    }, 2000);
  });
});