const API_URL = 'http://127.0.0.1:8000';

// ─── DOM References ────────────────────────────────────────────────────────
const fileInput       = document.getElementById('file-input');
const dropZone        = document.getElementById('drop-zone');
const documentList    = document.getElementById('document-list');
const docCountBadge   = document.getElementById('doc-count');
const chatContainer   = document.getElementById('chat-container');
const userInput       = document.getElementById('user-input');
const sendBtn         = document.getElementById('send-btn');
const uploadTrigger   = document.getElementById('upload-trigger');
const rightPanel      = document.getElementById('right-panel');

// Documents page
const docsGrid           = document.getElementById('docs-grid');
const docsPageCount      = document.getElementById('docs-page-count');
const uploadTriggerDocs  = document.getElementById('upload-trigger-docs');
const dropZoneDocs       = document.getElementById('drop-zone-docs');
const refreshDocsBtn     = document.getElementById('refresh-docs-btn');

// Stats
const statDocs   = document.getElementById('stat-docs');
const statChunks = document.getElementById('stat-chunks');

// Modal
const docModal   = document.getElementById('doc-modal');
const modalClose = document.getElementById('modal-close');
const modalTitle = document.getElementById('modal-title');
const modalBody  = document.getElementById('modal-body');

// ─── Page Router ──────────────────────────────────────────────────────────
function initRouter() {
    document.querySelectorAll('.nav-item[data-page]').forEach(link => {
        link.addEventListener('click', e => {
            e.preventDefault();
            const page = link.dataset.page;
            navigateTo(page);
        });
    });
}

function navigateTo(pageId) {
    // Update nav active state
    document.querySelectorAll('.nav-item[data-page]').forEach(l => {
        l.classList.toggle('active', l.dataset.page === pageId);
    });

    // Show / hide pages
    document.querySelectorAll('.page').forEach(p => {
        p.classList.toggle('active', p.id === `page-${pageId}`);
    });

    // Right panel only shows on chat
    if (rightPanel) rightPanel.style.display = pageId === 'chat' ? '' : 'none';

    // Refresh docs when navigating to documents page
    if (pageId === 'documents') fetchDocumentsPage();
}

// ─── Theme Switcher ───────────────────────────────────────────────────────
const THEMES = ['default','ocean','forest','rose','midnight','ember','slate','neon'];

function initThemes() {
    const saved = localStorage.getItem('evidentia-theme') || 'default';
    applyTheme(saved);

    document.querySelectorAll('.theme-card[data-theme]').forEach(card => {
        card.addEventListener('click', () => {
            const t = card.dataset.theme;
            applyTheme(t);
            localStorage.setItem('evidentia-theme', t);
        });
    });
}

function applyTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    document.querySelectorAll('.theme-card').forEach(c => {
        c.classList.toggle('active', c.dataset.theme === theme);
    });
}

// ─── File Upload ──────────────────────────────────────────────────────────
function initUpload() {
    // Chat page dropzone
    if (dropZone) {
        dropZone.addEventListener('dragover', e => {
            e.preventDefault();
            dropZone.classList.add('drag-over');
        });
        dropZone.addEventListener('dragleave', () => dropZone.classList.remove('drag-over'));
        dropZone.addEventListener('drop', e => {
            e.preventDefault();
            dropZone.classList.remove('drag-over');
            handleFiles(e.dataTransfer.files);
        });
        dropZone.addEventListener('click', () => fileInput.click());
    }

    // Docs page dropzone — create its own hidden file input so it works
    // independently of the right-panel which is hidden on this page
    const docsFileInput = document.createElement('input');
    docsFileInput.type = 'file';
    docsFileInput.multiple = true;
    docsFileInput.accept = '.pdf,.docx,.doc,.txt,.png,.jpg,.jpeg,.gif,.bmp,.webp,.mp3,.wav,.m4a,.ogg';
    docsFileInput.style.display = 'none';
    document.body.appendChild(docsFileInput);
    docsFileInput.addEventListener('change', e => handleFiles(e.target.files, true));

    if (dropZoneDocs) {
        dropZoneDocs.addEventListener('dragover', e => {
            e.preventDefault();
            dropZoneDocs.classList.add('drag-over');
        });
        dropZoneDocs.addEventListener('dragleave', () => dropZoneDocs.classList.remove('drag-over'));
        dropZoneDocs.addEventListener('drop', e => {
            e.preventDefault();
            dropZoneDocs.classList.remove('drag-over');
            handleFiles(e.dataTransfer.files, true);
        });
        // Click the zone to open file picker
        dropZoneDocs.addEventListener('click', () => docsFileInput.click());
    }

    if (fileInput) fileInput.addEventListener('change', e => handleFiles(e.target.files));
    if (uploadTrigger)     uploadTrigger.addEventListener('click', () => fileInput.click());
    if (uploadTriggerDocs) uploadTriggerDocs.addEventListener('click', () => docsFileInput.click());
    if (refreshDocsBtn)    refreshDocsBtn.addEventListener('click', () => {
        refreshDocsBtn.classList.add('spinning');
        fetchDocumentsPage().finally(() => refreshDocsBtn.classList.remove('spinning'));
    });
}

async function handleFiles(files, fromDocsPage = false) {
    if (!files || !files.length) return;
    for (const file of Array.from(files)) {
        await uploadFile(file, fromDocsPage);
    }
}

async function uploadFile(file, fromDocsPage = false) {
    showToast(`Uploading ${file.name}…`, 'info');
    const formData = new FormData();
    formData.append('file', file);

    try {
        const res = await fetch(`${API_URL}/upload/`, { method: 'POST', body: formData });
        if (!res.ok) {
            const err = await res.json().catch(() => ({ detail: 'Unknown error' }));
            throw new Error(err.detail || 'Upload failed');
        }
        showToast(`${file.name} uploaded ✓`, 'success');
        fetchDocuments();                    // refresh sidebar list
        if (fromDocsPage) fetchDocumentsPage(); // refresh docs grid
    } catch (err) {
        console.error('Upload error:', err);
        showToast(`Failed: ${err.message}`, 'error');
    }
}

// ─── Sidebar Document List ────────────────────────────────────────────────
let allDocs = [];

async function fetchDocuments() {
    try {
        const res = await fetch(`${API_URL}/documents/`);
        if (!res.ok) return;
        allDocs = await res.json();
        renderSidebarDocs(allDocs);
        updateStats(allDocs);
    } catch (err) {
        console.error('Error fetching documents:', err);
    }
}

function renderSidebarDocs(docs) {
    if (!documentList) return;
    documentList.innerHTML = '';
    docCountBadge.textContent = docs.length;

    docs.forEach(doc => {
        const div = document.createElement('div');
        div.className = 'doc-item';

        const icon = getDocIcon(doc);
        const date = new Date(doc.upload_time).toLocaleDateString();
        const fileUrl = `${API_URL}/uploads/${encodeURIComponent(doc.filename)}`;

        div.innerHTML = `
            <div class="doc-icon">${icon}</div>
            <div class="doc-info">
                <div class="doc-name" title="${doc.filename}">${doc.filename}</div>
                <div class="doc-meta">${date}</div>
            </div>
            <div class="doc-actions">
                <a href="${fileUrl}" target="_blank" class="mini-btn" title="View"><ion-icon name="eye-outline"></ion-icon></a>
                <a href="${fileUrl}" download="${doc.filename}" class="mini-btn" title="Download"><ion-icon name="download-outline"></ion-icon></a>
            </div>
        `;
        documentList.appendChild(div);
    });
}

function updateStats(docs) {
    if (statDocs)   statDocs.textContent   = docs.length;
    if (statChunks) statChunks.textContent = docs.reduce((s, d) => s + (d.chunk_count || 0), 0);
}

// ─── Documents Page ───────────────────────────────────────────────────────
async function fetchDocumentsPage() {
    try {
        const res = await fetch(`${API_URL}/documents/`);
        if (!res.ok) return;
        const docs = await res.json();
        allDocs = docs;
        renderDocsGrid(docs);
        updateStats(docs);
    } catch (err) {
        console.error('Error fetching docs page:', err);
    }
}

function renderDocsGrid(docs) {
    if (!docsGrid) return;
    docsPageCount.textContent = `${docs.length} document${docs.length !== 1 ? 's' : ''}`;
    docsGrid.innerHTML = '';

    if (docs.length === 0) {
        docsGrid.innerHTML = '<div class="docs-empty"><ion-icon name="documents-outline"></ion-icon><p>No documents yet. Upload some files!</p></div>';
        return;
    }

    docs.forEach(doc => {
        const card = document.createElement('div');
        card.className = 'doc-card';

        const isImage = doc.filename.match(/\.(png|jpg|jpeg|gif|bmp|webp)$/i);
        const fileUrl = `${API_URL}/uploads/${encodeURIComponent(doc.filename)}`;
        const date = new Date(doc.upload_time).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });

        let previewHtml = '';
        if (isImage) {
            previewHtml = `<div class="doc-card-preview img-preview"><img src="${fileUrl}" alt="${doc.filename}" onerror="this.parentElement.innerHTML='<ion-icon name=image-outline></ion-icon>'"></div>`;
        } else {
            const bigIcon = getDocIconLarge(doc);
            previewHtml = `<div class="doc-card-preview icon-preview">${bigIcon}</div>`;
        }

        card.innerHTML = `
            ${previewHtml}
            <div class="doc-card-body">
                <div class="doc-card-name" title="${doc.filename}">${doc.filename}</div>
                <div class="doc-card-meta">
                    <span class="doc-type-badge">${getFileTypeLabel(doc)}</span>
                    <span>${doc.chunk_count} chunk${doc.chunk_count !== 1 ? 's' : ''}</span>
                </div>
                <div class="doc-card-date">${date}</div>
                <div class="doc-card-actions">
                    <a href="${fileUrl}" target="_blank" class="btn-card-action view">
                        <ion-icon name="eye-outline"></ion-icon> View
                    </a>
                    <a href="${fileUrl}" download="${doc.filename}" class="btn-card-action download">
                        <ion-icon name="download-outline"></ion-icon> Download
                    </a>
                </div>
            </div>
        `;
        docsGrid.appendChild(card);
    });
}

function getDocIcon(doc) {
    const t = (doc.content_type || '').toLowerCase();
    const f = (doc.filename || '').toLowerCase();
    if (t.includes('pdf') || f.endsWith('.pdf')) return '<ion-icon name="document-text-outline"></ion-icon>';
    if (t.includes('image') || f.match(/\.(png|jpg|jpeg|gif|bmp|webp)$/)) return '<ion-icon name="image-outline"></ion-icon>';
    if (t.includes('audio') || f.match(/\.(mp3|wav|m4a|ogg)$/)) return '<ion-icon name="musical-notes-outline"></ion-icon>';
    if (f.endsWith('.docx') || f.endsWith('.doc')) return '<ion-icon name="document-outline"></ion-icon>';
    return '<ion-icon name="attach-outline"></ion-icon>';
}

function getDocIconLarge(doc) {
    const t = (doc.content_type || '').toLowerCase();
    const f = (doc.filename || '').toLowerCase();
    if (t.includes('pdf') || f.endsWith('.pdf')) return '<ion-icon name="document-text-outline"></ion-icon>';
    if (t.includes('audio') || f.match(/\.(mp3|wav|m4a|ogg)$/)) return '<ion-icon name="musical-notes-outline"></ion-icon>';
    if (f.endsWith('.docx') || f.endsWith('.doc')) return '<ion-icon name="document-outline"></ion-icon>';
    return '<ion-icon name="attach-outline"></ion-icon>';
}

function getFileTypeLabel(doc) {
    const f = (doc.filename || '').toLowerCase();
    if (f.endsWith('.pdf')) return 'PDF';
    if (f.endsWith('.docx') || f.endsWith('.doc')) return 'Word';
    if (f.match(/\.(png|jpg|jpeg|gif|bmp|webp)$/)) return 'Image';
    if (f.match(/\.(mp3|wav|m4a|ogg)$/)) return 'Audio';
    return 'File';
}

// ─── Modal ─────────────────────────────────────────────────────────────────
function initModal() {
    if (modalClose) {
        modalClose.addEventListener('click', closeModal);
    }
    if (docModal) {
        docModal.addEventListener('click', e => {
            if (e.target === docModal) closeModal();
        });
    }
}

function openModal(title, contentHtml) {
    if (!docModal) return;
    modalTitle.textContent = title;
    modalBody.innerHTML = contentHtml;
    docModal.hidden = false;
}

function closeModal() {
    if (!docModal) return;
    docModal.hidden = true;
    modalBody.innerHTML = '';
}

// ─── Chat Logic ───────────────────────────────────────────────────────────
function initChat() {
    if (userInput) {
        userInput.addEventListener('keydown', e => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                sendMessage();
            }
        });
    }
    if (sendBtn) sendBtn.addEventListener('click', sendMessage);
}

async function sendMessage() {
    const text = userInput.value.trim();
    if (!text) return;

    addMessage(text, 'user');
    userInput.value = '';

    const loadingId = addMessage('Thinking…', 'ai', true);

    try {
        const res = await fetch(`${API_URL}/query/`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ query: text })
        });

        if (!res.ok) throw new Error('Server error');

        const data = await res.json();
        removeMessage(loadingId);
        addMessage(data.answer, 'ai', false, data.citations, data.image_results);

    } catch (err) {
        removeMessage(loadingId);
        addMessage(`Error: ${err.message}`, 'ai');
        console.error(err);
    }
}

function addMessage(text, sender, isLoading = false, citations = [], imageResults = []) {
    const msgDiv = document.createElement('div');
    msgDiv.className = `message ${sender}-message`;
    if (isLoading) msgDiv.classList.add('loading');

    const id = Date.now();
    msgDiv.dataset.id = id;

    let contentHtml = `<div class="message-content">${text.replace(/\n/g, '<br>')}</div>`;

    // Image results (show first / above citations)
    if (imageResults && imageResults.length > 0) {
        let imgHtml = '<div class="image-results-row"><div class="image-results-label"><ion-icon name="images-outline"></ion-icon> Matched Images</div><div class="image-thumbs">';
        imageResults.forEach(img => {
            const url = `${API_URL}/uploads/${encodeURIComponent(img.filename)}`;
            imgHtml += `
                <a href="${url}" target="_blank" class="image-thumb-card" title="${img.filename}">
                    <img src="${url}" alt="${img.filename}" onerror="this.src=''">
                    <span>${img.filename}</span>
                </a>`;
        });
        imgHtml += '</div></div>';
        contentHtml += imgHtml;
    }

    // Text citations
    if (citations && citations.length > 0) {
        let citationsHtml = '<div class="citations-area"><div class="citation-header">SOURCES</div>';
        citations.forEach(cit => {
            const fileUrl = `${API_URL}/uploads/${encodeURIComponent(cit.source_file)}`;
            let refText = cit.source_file;
            if (cit.page) refText += ` (Pg ${cit.page})`;

            citationsHtml += `
                <div class="citation-item">
                    <span class="citation-text">${refText}</span>
                    <div class="citation-actions">
                        <a href="${fileUrl}" target="_blank" class="action-btn view-btn" title="View"><ion-icon name="eye-outline"></ion-icon></a>
                        <a href="${fileUrl}" download class="action-btn download-btn" title="Download"><ion-icon name="download-outline"></ion-icon></a>
                    </div>
                </div>`;
        });
        citationsHtml += '</div>';
        contentHtml += citationsHtml;
    }

    msgDiv.innerHTML = contentHtml;
    chatContainer.appendChild(msgDiv);
    chatContainer.scrollTop = chatContainer.scrollHeight;

    return id;
}

function removeMessage(id) {
    const el = document.querySelector(`.message[data-id="${id}"]`);
    if (el) el.remove();
}

// ─── Toast Notifications ──────────────────────────────────────────────────
function showToast(message, type = 'info') {
    const container = document.getElementById('toast-container');
    if (!container) return;

    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;

    const iconMap = { success: 'checkmark-circle', error: 'alert-circle', info: 'information-circle' };
    toast.innerHTML = `<ion-icon name="${iconMap[type] || 'information-circle'}"></ion-icon><span>${message}</span>`;

    container.appendChild(toast);
    setTimeout(() => toast.classList.add('show'), 10);
    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => toast.remove(), 300);
    }, 3500);
}

// ─── Init ─────────────────────────────────────────────────────────────────
function init() {
    initRouter();
    initThemes();
    initUpload();
    initChat();
    initModal();
    fetchDocuments();
}

document.addEventListener('DOMContentLoaded', init);
