// Futuristic Code Editor Application
class FuturisticCodeEditor {
    constructor() {
        this.htmlCode = document.getElementById('htmlCode');
        this.cssCode = document.getElementById('cssCode');
        this.jsCode = document.getElementById('jsCode');
        this.outputFrame = document.getElementById('outputFrame');
        this.runBtn = document.getElementById('runBtn');
        this.clearBtn = document.getElementById('clearBtn');
        this.infoBtn = document.getElementById('infoBtn');
        this.infoModal = document.getElementById('infoModal');
        this.confirmModal = document.getElementById('confirmModal');
        this.closeModal = document.getElementById('closeModal');
        this.confirmClear = document.getElementById('confirmClear');
        this.cancelClear = document.getElementById('cancelClear');
        this.outputStatus = document.getElementById('outputStatus');
        
        this.autoRunTimeout = null;
        this.isRunning = false;
        
        this.init();
    }
    
    init() {
        console.log('Initializing editor...');
        this.loadDefaultCode();
        this.setupEventListeners();
        this.setupKeyboardShortcuts();
        this.runCode(); // Initial run
        console.log('Editor initialized successfully');
    }
    
    loadDefaultCode() {
        // Default code from application data
        const defaultCode = {
            html: `<!DOCTYPE html>
<html>
<head>
    <title>My Page</title>
</head>
<body>
    <h1>Hello World!</h1>
    <p>Welcome to the code editor</p>
</body>
</html>`,
            css: `body {
    font-family: Arial, sans-serif;
    background: linear-gradient(45deg, #667eea, #764ba2);
    color: white;
    padding: 20px;
    text-align: center;
}

h1 {
    animation: glow 2s infinite alternate;
}

@keyframes glow {
    from { text-shadow: 0 0 5px #fff; }
    to { text-shadow: 0 0 20px #fff; }
}`,
            javascript: `// Welcome message
console.log('Welcome to Futuristic Code Editor!');

// Add click event to heading
document.addEventListener('DOMContentLoaded', function() {
    const heading = document.querySelector('h1');
    if (heading) {
        heading.addEventListener('click', function() {
            this.style.color = '#ff6b6b';
            alert('Hello from JavaScript!');
        });
    }
});`
        };
        
        if (this.htmlCode) this.htmlCode.value = defaultCode.html;
        if (this.cssCode) this.cssCode.value = defaultCode.css;
        if (this.jsCode) this.jsCode.value = defaultCode.javascript;
    }
    
    setupEventListeners() {
        console.log('Setting up event listeners...');
        
        // Run button
        if (this.runBtn) {
            this.runBtn.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                console.log('Run button clicked');
                this.runCode();
            });
        }
        
        // Clear button - Fixed with proper event handling
        if (this.clearBtn) {
            this.clearBtn.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                console.log('Clear button clicked');
                this.showConfirmModal();
            });
            
            // Also add mousedown event as backup
            this.clearBtn.addEventListener('mousedown', (e) => {
                e.preventDefault();
            });
        }
        
        // Info button
        if (this.infoBtn) {
            this.infoBtn.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                console.log('Info button clicked');
                this.showInfoModal();
            });
        }
        
        // Modal close events
        if (this.closeModal) {
            this.closeModal.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                console.log('Close modal clicked');
                this.hideInfoModal();
            });
        }
        
        if (this.confirmClear) {
            this.confirmClear.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                console.log('Confirm clear clicked');
                this.clearAllCode();
            });
        }
        
        if (this.cancelClear) {
            this.cancelClear.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                console.log('Cancel clear clicked');
                this.hideConfirmModal();
            });
        }
        
        // Click outside modal to close - Enhanced
        if (this.infoModal) {
            this.infoModal.addEventListener('click', (e) => {
                if (e.target === this.infoModal || e.target.classList.contains('modal__backdrop')) {
                    e.preventDefault();
                    this.hideInfoModal();
                }
            });
        }
        
        if (this.confirmModal) {
            this.confirmModal.addEventListener('click', (e) => {
                if (e.target === this.confirmModal || e.target.classList.contains('modal__backdrop')) {
                    e.preventDefault();
                    this.hideConfirmModal();
                }
            });
        }
        
        // Auto-run functionality and auto-complete
        [this.htmlCode, this.cssCode, this.jsCode].forEach(textarea => {
            if (textarea) {
                textarea.addEventListener('input', (e) => {
                    console.log('Code input detected');
                    this.scheduleAutoRun();
                    this.handleAutoComplete(textarea, e);
                });
                
                textarea.addEventListener('keydown', (e) => {
                    this.handleKeydown(e, textarea);
                });
                
                // Ensure textareas are editable
                textarea.removeAttribute('readonly');
                textarea.removeAttribute('disabled');
                textarea.style.pointerEvents = 'auto';
            }
        });
        
        console.log('Event listeners set up successfully');
    }
    
    setupKeyboardShortcuts() {
        console.log('Setting up keyboard shortcuts...');
        
        document.addEventListener('keydown', (e) => {
            // Ctrl+Enter to run code
            if (e.ctrlKey && e.key === 'Enter') {
                e.preventDefault();
                console.log('Ctrl+Enter pressed - running code');
                this.runCode();
                return;
            }
            
            // Escape to close modals
            if (e.key === 'Escape') {
                console.log('Escape pressed - closing modals');
                this.hideInfoModal();
                this.hideConfirmModal();
                return;
            }
        });
        
        console.log('Keyboard shortcuts set up successfully');
    }
    
    handleKeydown(e, textarea) {
        // Tab key for indentation
        if (e.key === 'Tab') {
            e.preventDefault();
            const start = textarea.selectionStart;
            const end = textarea.selectionEnd;
            
            // Insert tab character
            textarea.value = textarea.value.substring(0, start) + '    ' + textarea.value.substring(end);
            textarea.selectionStart = textarea.selectionEnd = start + 4;
            
            // Trigger input event for auto-run
            textarea.dispatchEvent(new Event('input', { bubbles: true }));
        }
    }
    
    handleAutoComplete(textarea, event) {
        const cursorPos = textarea.selectionStart;
        const textBeforeCursor = textarea.value.substring(0, cursorPos);
        const textAfterCursor = textarea.value.substring(cursorPos);
        
        // Auto-complete pairs
        const pairs = {
            '(': ')',
            '[': ']',
            '{': '}',
            '"': '"',
            "'": "'",
        };
        
        // Get the character that was just typed
        const inputChar = event.data;
        
        if (inputChar && pairs[inputChar] && !textAfterCursor.startsWith(pairs[inputChar])) {
            const closeChar = pairs[inputChar];
            
            // Insert the closing character
            textarea.value = textBeforeCursor + closeChar + textAfterCursor;
            textarea.selectionStart = textarea.selectionEnd = cursorPos;
        }
    }
    
    scheduleAutoRun() {
        if (this.autoRunTimeout) {
            clearTimeout(this.autoRunTimeout);
        }
        
        if (this.outputStatus) {
            this.outputStatus.textContent = 'Typing...';
        }
        
        this.autoRunTimeout = setTimeout(() => {
            this.runCode();
        }, 2000);
    }
    
    async runCode() {
        if (this.isRunning) return;
        
        console.log('Running code...');
        this.isRunning = true;
        this.showLoadingState();
        
        try {
            const html = this.htmlCode ? this.htmlCode.value : '';
            const css = this.cssCode ? this.cssCode.value : '';
            const js = this.jsCode ? this.jsCode.value : '';
            
            // Create the complete HTML document
            const completeHtml = `
                <!DOCTYPE html>
                <html>
                <head>
                    <meta charset="UTF-8">
                    <meta name="viewport" content="width=device-width, initial-scale=1.0">
                    <title>Live Preview</title>
                    <style>
                        ${css}
                    </style>
                </head>
                <body>
                    ${html}
                    <script>
                        try {
                            ${js}
                        } catch (error) {
                            console.error('JavaScript Error:', error);
                            document.body.innerHTML += '<div style="color: red; background: #fff; padding: 10px; margin: 10px; border-radius: 5px; border: 1px solid red; font-family: Arial, sans-serif;">JavaScript Error: ' + error.message + '</div>';
                        }
                    </script>
                </body>
                </html>
            `;
            
            // Update the iframe
            if (this.outputFrame) {
                const blob = new Blob([completeHtml], { type: 'text/html' });
                const url = URL.createObjectURL(blob);
                this.outputFrame.src = url;
                
                // Clean up the blob URL after a short delay
                setTimeout(() => {
                    URL.revokeObjectURL(url);
                }, 1000);
            }
            
            if (this.outputStatus) {
                this.outputStatus.textContent = 'Running';
                this.outputStatus.style.background = 'rgba(0, 255, 245, 0.2)';
            }
            
            // Simulate loading time
            setTimeout(() => {
                if (this.outputStatus) {
                    this.outputStatus.textContent = 'Ready';
                    this.outputStatus.style.background = 'rgba(0, 255, 245, 0.2)';
                }
            }, 500);
            
        } catch (error) {
            console.error('Error running code:', error);
            if (this.outputStatus) {
                this.outputStatus.textContent = 'Error';
                this.outputStatus.style.background = 'rgba(255, 107, 107, 0.3)';
            }
        } finally {
            this.hideLoadingState();
            this.isRunning = false;
        }
    }
    
    showLoadingState() {
        if (this.runBtn) {
            this.runBtn.classList.add('loading');
            const btnText = this.runBtn.querySelector('.btn__text');
            const btnLoader = this.runBtn.querySelector('.btn__loader');
            if (btnText) btnText.style.opacity = '0';
            if (btnLoader) btnLoader.classList.remove('hidden');
        }
        
        if (this.outputStatus) {
            this.outputStatus.textContent = 'Loading...';
            this.outputStatus.style.background = 'rgba(255, 193, 7, 0.3)';
        }
    }
    
    hideLoadingState() {
        if (this.runBtn) {
            this.runBtn.classList.remove('loading');
            const btnText = this.runBtn.querySelector('.btn__text');
            const btnLoader = this.runBtn.querySelector('.btn__loader');
            if (btnText) btnText.style.opacity = '1';
            if (btnLoader) btnLoader.classList.add('hidden');
        }
    }
    
    showConfirmModal() {
        console.log('Showing confirm modal');
        if (this.confirmModal) {
            // Force show the modal
            this.confirmModal.classList.remove('hidden');
            this.confirmModal.style.display = 'flex';
            this.confirmModal.style.opacity = '1';
            this.confirmModal.style.visibility = 'visible';
            document.body.style.overflow = 'hidden';
            
            // Force reflow to ensure styles are applied
            this.confirmModal.offsetHeight;
            
            console.log('Confirm modal should now be visible');
        } else {
            console.error('Confirm modal element not found');
        }
    }
    
    hideConfirmModal() {
        console.log('Hiding confirm modal');
        if (this.confirmModal) {
            this.confirmModal.classList.add('hidden');
            this.confirmModal.style.display = '';
            this.confirmModal.style.opacity = '';
            this.confirmModal.style.visibility = '';
            document.body.style.overflow = '';
        }
    }
    
    showInfoModal() {
        console.log('Showing info modal');
        if (this.infoModal) {
            this.infoModal.classList.remove('hidden');
            this.infoModal.style.display = 'flex';
            this.infoModal.style.opacity = '1';
            this.infoModal.style.visibility = 'visible';
            document.body.style.overflow = 'hidden';
            
            // Force reflow to ensure styles are applied
            this.infoModal.offsetHeight;
        } else {
            console.error('Info modal element not found');
        }
    }
    
    hideInfoModal() {
        console.log('Hiding info modal');
        if (this.infoModal) {
            this.infoModal.classList.add('hidden');
            this.infoModal.style.display = '';
            this.infoModal.style.opacity = '';
            this.infoModal.style.visibility = '';
            document.body.style.overflow = '';
        }
    }
    
    clearAllCode() {
        console.log('Clearing all code');
        
        if (this.htmlCode) this.htmlCode.value = '';
        if (this.cssCode) this.cssCode.value = '';
        if (this.jsCode) this.jsCode.value = '';
        
        // Clear the output frame
        if (this.outputFrame) {
            this.outputFrame.src = 'about:blank';
        }
        
        if (this.outputStatus) {
            this.outputStatus.textContent = 'Cleared';
            this.outputStatus.style.background = 'rgba(255, 107, 107, 0.3)';
            
            setTimeout(() => {
                this.outputStatus.textContent = 'Ready';
                this.outputStatus.style.background = 'rgba(0, 255, 245, 0.2)';
            }, 1500);
        }
        
        this.hideConfirmModal();
        
        // Focus on HTML textarea
        if (this.htmlCode) {
            this.htmlCode.focus();
        }
    }
}

// Enhanced features
class EditorEnhancements {
    constructor(editor) {
        this.editor = editor;
        this.setupEnhancements();
    }
    
    setupEnhancements() {
        this.setupAutoSave();
    }
    
    setupAutoSave() {
        // Auto-save to prevent data loss (using sessionStorage as localStorage is not available)
        const textareas = [this.editor.htmlCode, this.editor.cssCode, this.editor.jsCode];
        const keys = ['editor_html', 'editor_css', 'editor_js'];
        
        textareas.forEach((textarea, index) => {
            if (!textarea) return;
            
            const key = keys[index];
            
            // Save on input
            textarea.addEventListener('input', () => {
                try {
                    sessionStorage.setItem(key, textarea.value);
                } catch (e) {
                    // Handle storage quota exceeded or storage not available
                    console.warn('Could not save to session storage:', e);
                }
            });
            
            // Restore on load (only if textarea is empty)
            try {
                const saved = sessionStorage.getItem(key);
                if (saved && textarea.value.trim() === '') {
                    textarea.value = saved;
                }
            } catch (e) {
                console.warn('Could not restore from session storage:', e);
            }
        });
    }
}

// Theme Manager
class ThemeManager {
    constructor() {
        this.currentTheme = 'dark'; // Default to dark theme
        this.setupTheme();
    }
    
    setupTheme() {
        this.applyTheme(this.currentTheme);
    }
    
    applyTheme(theme) {
        document.documentElement.setAttribute('data-color-scheme', theme);
        this.currentTheme = theme;
    }
    
    toggleTheme() {
        const newTheme = this.currentTheme === 'dark' ? 'light' : 'dark';
        this.applyTheme(newTheme);
    }
}

// Initialize the application when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    console.log('🚀 Futuristic Code Editor Initializing...');
    
    try {
        // Initialize main editor
        const editor = new FuturisticCodeEditor();
        
        // Initialize enhancements
        const enhancements = new EditorEnhancements(editor);
        
        // Initialize theme manager
        const themeManager = new ThemeManager();
        
        // Make editor globally available for debugging
        window.editor = editor;
        window.themeManager = themeManager;
        
        console.log('✅ Futuristic Code Editor Ready!');
        console.log('💡 Press Ctrl+Enter to run code');
        console.log('💡 Press Escape to close modals');
        
        // Add welcome message to console
        console.log('%c Welcome to Futuristic Code Editor! ', 'background: linear-gradient(45deg, #00fff5, #00c1ff); color: #1f1f2f; padding: 10px; border-radius: 5px; font-weight: bold;');
        
    } catch (error) {
        console.error('Failed to initialize editor:', error);
    }
});