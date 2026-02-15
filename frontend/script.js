const API_URL = 'http://127.0.0.1:8000';

// DOM Elements
const fileInput = document.getElementById('file-input');
const dropZone = document.getElementById('drop-zone');
const documentList = document.getElementById('document-list');
const docCountBadge = document.getElementById('doc-count');
const chatContainer = document.getElementById('chat-container');
const userInput = document.getElementById('user-input');
const sendBtn = document.getElementById('send-btn');
const uploadTrigger = document.getElementById('upload-trigger');

// Initialize
function init() {
    fetchDocuments();
    setupEventListeners();
}

function setupEventListeners() {
    // File Upload (Drag & Drop)
    dropZone.addEventListener('dragover', (e) => {
        e.preventDefault();
        dropZone.style.borderColor = 'var(--accent-color)';
        dropZone.style.background = 'rgba(255, 107, 74, 0.05)';
    });

    dropZone.addEventListener('dragleave', (e) => {
        e.preventDefault();
        dropZone.style.borderColor = 'var(--border-color)';
        dropZone.style.background = 'transparent';
    });

    dropZone.addEventListener('drop', (e) => {
        e.preventDefault();
        dropZone.style.borderColor = 'var(--border-color)';
        dropZone.style.background = 'transparent';
        handleFiles(e.dataTransfer.files);
    });

    // File Input Trigger
    dropZone.addEventListener('click', () => fileInput.click());
    if(uploadTrigger) uploadTrigger.addEventListener('click', () => fileInput.click());
    
    fileInput.addEventListener('change', (e) => {
        handleFiles(e.target.files);
    });

    // Chat Interaction
    userInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
            sendMessage();
        }
    });

    sendBtn.addEventListener('click', sendMessage);
}

// --- File Handling ---

async function handleFiles(files) {
    if (!files.length) return;
    
    Array.from(files).forEach(async (file) => {
        await uploadFile(file);
    });
}

async function uploadFile(file) {
    // Optimistic UI update (optional, but good for UX)
    // For now, we wait for response to refresh list
    
    const formData = new FormData();
    formData.append('file', file);

    try {
        const response = await fetch(`${API_URL}/upload/`, {
            method: 'POST',
            body: formData
        });

        if (!response.ok) throw new Error('Upload failed');
        
        // Success
        fetchDocuments(); // Refresh list
        
    } catch (error) {
        console.error("Upload error:", error);
        alert(`Failed to upload ${file.name}`);
    }
}

async function fetchDocuments() {
    try {
        const response = await fetch(`${API_URL}/documents/`);
        if (!response.ok) return;
        const docs = await response.json();
        renderDocuments(docs);
    } catch (error) {
        console.error('Error fetching documents:', error);
    }
}

function renderDocuments(docs) {
    documentList.innerHTML = '';
    docCountBadge.textContent = docs.length;

    docs.forEach(doc => {
        const div = document.createElement('div');
        div.className = 'doc-item';
        
        let icon = '📄'; // Default
        const type = doc.content_type || '';
        if (type.includes('pdf')) icon = '<ion-icon name="document-text-outline"></ion-icon>';
        else if (type.includes('image')) icon = '<ion-icon name="image-outline"></ion-icon>';
        else if (type.includes('audio')) icon = '<ion-icon name="musical-notes-outline"></ion-icon>';

        div.innerHTML = `
            <div class="doc-icon">${icon}</div>
            <div class="doc-info">
                <div class="doc-name" title="${doc.filename}">${doc.filename}</div>
                <div class="doc-meta">${new Date(doc.upload_time).toLocaleDateString()}</div>
            </div>
            <button class="delete-btn" title="Delete">
                <ion-icon name="trash-outline"></ion-icon>
            </button>
        `;
        documentList.appendChild(div);
    });
}

// --- Chat Logic ---

async function sendMessage() {
    const text = userInput.value.trim();
    if (!text) return;

    // 1. Add User Message
    addMessage(text, 'user');
    userInput.value = '';

    // 2. Show Loading
    const loadingId = addMessage('Thinking...', 'ai', true);

    try {
        const response = await fetch(`${API_URL}/query/`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ query: text })
        });

        if (!response.ok) throw new Error('Server Error');

        const data = await response.json();
        
        // 3. Update AI Message
        removeMessage(loadingId);
        addMessage(data.answer, 'ai', false, data.citations);

    } catch (error) {
        removeMessage(loadingId);
        addMessage(`Error: ${error.message}`, 'ai');
        console.error(error);
    }
}

function addMessage(text, sender, isLoading = false, citations = []) {
    const msgDiv = document.createElement('div');
    msgDiv.className = `message ${sender}-message`;
    if (isLoading) msgDiv.classList.add('loading');
    
    const id = Date.now();
    msgDiv.dataset.id = id;

    let contentHtml = `<div class="message-content">${text.replace(/\n/g, '<br>')}</div>`;

    if (citations && citations.length > 0) {
        let citationsHtml = '<div class="citations-area"><div class="citation-header">SOURCES</div>';
        citations.forEach(cit => {
            const fileUrl = `${API_URL}/uploads/${cit.source_file}`;
            let refText = cit.source_file;
            if (cit.page) refText += ` (Pg ${cit.page})`;
            
            citationsHtml += `
                <div class="citation-item">
                    <span class="citation-text">${refText}</span>
                    <div class="citation-actions">
                        <a href="${fileUrl}" target="_blank" class="action-btn view-btn" title="View"><ion-icon name="eye-outline"></ion-icon></a>
                        <a href="${fileUrl}" download class="action-btn download-btn" title="Download"><ion-icon name="download-outline"></ion-icon></a>
                    </div>
                </div>
            `;
        });
        citationsHtml += '</div>';
        contentHtml += citationsHtml;
    }

    msgDiv.innerHTML = contentHtml;
    chatContainer.appendChild(msgDiv);
    
    // Auto scroll
    chatContainer.scrollTop = chatContainer.scrollHeight;
    
    return id;
}

function removeMessage(id) {
    const el = document.querySelector(`.message[data-id="${id}"]`);
    if (el) el.remove();
}

// Start
document.addEventListener('DOMContentLoaded', init);
