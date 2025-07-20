// CSV File Extractor Frontend
// Main application class
class CSVFileExtractor {
    constructor() {
        this.currentFile = null;
        this.csvData = null;
        this.selectedColumns = new Set();
        this.isDarkMode = localStorage.getItem('darkMode') === 'true';
        this.currentPage = 1;
        this.rowsPerPage = 10;
        this.initializeElements();
        this.setupEventListeners();
        this.initializeTheme();
    }

    // Initialize DOM elements
    initializeElements() {
        this.elements = {
            // Upload elements
            uploadArea: document.getElementById('uploadArea'),
            fileInput: document.getElementById('fileInput'),
            uploadBtn: document.getElementById('uploadBtn'),
            
            // File info elements
            fileInfo: document.getElementById('fileInfo'),
            fileName: document.getElementById('fileName'),
            fileSize: document.getElementById('fileSize'),
            removeFile: document.getElementById('removeFile'),
            
            // Preview elements
            previewSection: document.getElementById('previewSection'),
            previewTable: document.getElementById('previewTable'),
            headerRow: document.getElementById('headerRow'),
            tableBody: document.getElementById('tableBody'),
            selectAllBtn: document.getElementById('selectAllBtn'),
            deselectAllBtn: document.getElementById('deselectAllBtn'),
            
            // Column selection elements
            columnSelection: document.getElementById('columnSelection'),
            columnsGrid: document.getElementById('columnsGrid'),
            
            // Action elements
            actionSection: document.getElementById('actionSection'),
            extractBtn: document.getElementById('extractBtn'),
            previewExtractBtn: document.getElementById('previewExtractBtn'),
            
            // Loading elements
            loadingOverlay: document.getElementById('loadingOverlay'),
            loadingText: document.getElementById('loadingText'),
            
            // Theme elements
            themeToggle: document.getElementById('themeToggle'),
            
            // Toast container
            toastContainer: document.getElementById('toastContainer')
        };
        
        // Validate critical elements
        const criticalElements = ['uploadArea', 'fileInput', 'uploadBtn', 'toastContainer'];
        const missingElements = criticalElements.filter(id => !this.elements[id]);
        
        if (missingElements.length > 0) {
            console.error('Missing critical elements:', missingElements);
            throw new Error(`Missing critical DOM elements: ${missingElements.join(', ')}`);
        }
    }

    // Setup event listeners
    setupEventListeners() {
        try {
            // File upload events
            if (this.elements.uploadBtn && this.elements.fileInput) {
                this.elements.uploadBtn.addEventListener('click', () => this.elements.fileInput.click());
                this.elements.fileInput.addEventListener('change', (e) => this.handleFileSelect(e));
            }
            
            // Drag and drop events
            if (this.elements.uploadArea) {
                this.elements.uploadArea.addEventListener('dragover', (e) => this.handleDragOver(e));
                this.elements.uploadArea.addEventListener('dragleave', (e) => this.handleDragLeave(e));
                this.elements.uploadArea.addEventListener('drop', (e) => this.handleDrop(e));
            }
            
            // File removal
            if (this.elements.removeFile) {
                this.elements.removeFile.addEventListener('click', () => this.removeFile());
            }
            
            // Preview controls
            if (this.elements.selectAllBtn) {
                this.elements.selectAllBtn.addEventListener('click', () => this.selectAllColumns());
            }
            if (this.elements.deselectAllBtn) {
                this.elements.deselectAllBtn.addEventListener('click', () => this.deselectAllColumns());
            }
            
            // Action buttons
            if (this.elements.extractBtn) {
                this.elements.extractBtn.addEventListener('click', () => this.extractSelectedColumns());
            }
            if (this.elements.previewExtractBtn) {
                this.elements.previewExtractBtn.addEventListener('click', () => this.previewExtraction());
            }
            
            // Theme toggle
            if (this.elements.themeToggle) {
                this.elements.themeToggle.addEventListener('click', () => this.toggleTheme());
            }
            
            // Keyboard navigation
            document.addEventListener('keydown', (e) => this.handleKeyboardNavigation(e));
        } catch (error) {
            console.error('Error setting up event listeners:', error);
        }
    }

    // Initialize theme
    initializeTheme() {
        if (this.isDarkMode) {
            document.documentElement.setAttribute('data-theme', 'dark');
            this.elements.themeToggle.innerHTML = '<i class="fas fa-sun"></i>';
        } else {
            document.documentElement.removeAttribute('data-theme');
            this.elements.themeToggle.innerHTML = '<i class="fas fa-moon"></i>';
        }
    }

    // Handle file selection
    async handleFileSelect(event) {
        const file = event.target.files[0];
        if (file) {
            await this.processFile(file);
        }
    }

    // Handle drag over
    handleDragOver(event) {
        event.preventDefault();
        this.elements.uploadArea.classList.add('drag-over');
    }

    // Handle drag leave
    handleDragLeave(event) {
        event.preventDefault();
        this.elements.uploadArea.classList.remove('drag-over');
    }

    // Handle file drop
    async handleDrop(event) {
        event.preventDefault();
        this.elements.uploadArea.classList.remove('drag-over');
        
        const files = event.dataTransfer.files;
        if (files.length > 0) {
            const file = files[0];
            if (file.type === 'text/csv' || file.name.endsWith('.csv')) {
                await this.processFile(file);
            } else {
                this.showToast('error', 'Invalid File Type', 'Please select a valid CSV file.');
            }
        } else {
            this.showToast('error', 'No File', 'Please drop a CSV file.');
        }
    }

    // Process uploaded file
    async processFile(file) {
        try {
            this.showLoading('Reading CSV file...');
            
            // Validate file
            if (!this.validateFile(file)) {
                this.hideLoading();
                return;
            }

            // Read file content
            const text = await this.readFileAsText(file);
            
            // Parse CSV
            this.csvData = this.parseCSV(text);
            
            if (!this.csvData || !this.csvData.headers || this.csvData.headers.length === 0) {
                this.hideLoading();
                this.showToast('error', 'Invalid CSV', 'The file appears to be empty or has no valid headers.');
                return;
            }

            // Update UI
            this.currentFile = file;
            this.updateFileInfo(file);
            this.showFileInfo();
            this.displayPreview(1); // Always start at page 1
            this.createColumnSelection();
            this.showColumnSelection();
            this.showActionSection();
            
            // Optionally upload to backend (uncomment if you want to store files)
            // await this.uploadToBackend(file);
            
            this.hideLoading();
            this.showToast('success', 'File Uploaded', `${file.name} has been successfully uploaded.`);

            // --- Add Save Users to Database button ---
            let saveBtn = document.getElementById('saveUsersBtn');
            // Find the action-buttons div
            const actionButtonsDiv = this.elements.actionSection.querySelector('.action-buttons');
            if (!actionButtonsDiv) {
                console.error('DEBUG: .action-buttons div not found in #actionSection');
                alert('DEBUG: .action-buttons div not found in #actionSection');
            }
            if (!saveBtn && actionButtonsDiv) {
                saveBtn = document.createElement('button');
                saveBtn.id = 'saveUsersBtn';
                saveBtn.className = 'btn btn-primary';
                saveBtn.innerHTML = '<i class="fas fa-user-plus"></i> Save Users to Database';
                actionButtonsDiv.appendChild(saveBtn);
                console.log('DEBUG: Save Users to Database button created and appended.');
            }
            if (saveBtn) {
                saveBtn.onclick = () => {
                    // Convert previewed data to user objects (no id)
                    const users = this.csvData.data.map(row => ({
                        name: row.name,
                        email: row.email,
                        age: Number(row.age),
                        address: row.address
                    }));
                    this.saveUsersToDatabase(users);
                };
            }
            // --- End Save Users to Database button ---
            
        } catch (error) {
            this.hideLoading();
            console.error('Error processing file:', error);
            this.showToast('error', 'Processing Error', 'An error occurred while processing the file. Please try again.');
        }
    }

    // Validate file
    validateFile(file) {
        if (!file) {
            this.showToast('error', 'No File Selected', 'Please select a file to upload.');
            return false;
        }

        if (file.size === 0) {
            this.showToast('error', 'Empty File', 'The selected file is empty.');
            return false;
        }

        if (file.size > 10 * 1024 * 1024) { // 10MB limit
            this.showToast('error', 'File Too Large', 'Please select a file smaller than 10MB.');
            return false;
        }

        // Check both file extension and MIME type
        const isValidCSV = file.name.toLowerCase().endsWith('.csv') || 
                          file.type === 'text/csv' || 
                          file.type === 'application/csv';
        
        if (!isValidCSV) {
            this.showToast('error', 'Invalid File Type', 'Please select a valid CSV file.');
            return false;
        }

        return true;
    }

    // Read file as text
    readFileAsText(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = (e) => {
                const result = e.target.result;
                if (typeof result === 'string' && result.trim().length > 0) {
                    resolve(result);
                } else {
                    reject(new Error('File is empty or invalid'));
                }
            };
            reader.onerror = () => reject(new Error('Failed to read file'));
            reader.readAsText(file, 'UTF-8');
        });
    }

    // Parse CSV content
    parseCSV(text) {
        const lines = text.trim().split('\n');
        if (lines.length === 0) return null;

        const headers = this.parseCSVLine(lines[0]);
        if (!headers || headers.length === 0) return null;

        const data = [];

        for (let i = 1; i < Math.min(lines.length, 100); i++) { // Limit to first 100 rows for preview
            const values = this.parseCSVLine(lines[i]);
            if (values && values.length === headers.length) {
                const row = {};
                headers.forEach((header, index) => {
                    row[header] = values[index] || '';
                });
                data.push(row);
            }
        }

        return {
            headers: headers,
            data: data,
            totalRows: lines.length - 1
        };
    }

    // Parse CSV line (handles quoted values)
    parseCSVLine(line) {
        if (!line || typeof line !== 'string') return [];
        
        const result = [];
        let current = '';
        let inQuotes = false;
        
        for (let i = 0; i < line.length; i++) {
            const char = line[i];
            
            if (char === '"') {
                inQuotes = !inQuotes;
            } else if (char === ',' && !inQuotes) {
                result.push(current.trim());
                current = '';
            } else {
                current += char;
            }
        }
        
        result.push(current.trim());
        return result;
    }

    // Update file information display
    updateFileInfo(file) {
        this.elements.fileName.textContent = file.name;
        this.elements.fileSize.textContent = this.formatFileSize(file.size);
    }

    // Format file size
    formatFileSize(bytes) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }

    // Show file info section
    showFileInfo() {
        this.elements.fileInfo.style.display = 'block';
    }

    // Display CSV preview
    displayPreview(page = 1) {
        const { headers, data } = this.csvData;
        
        if (!headers || !data) {
            console.error('No headers or data available for preview');
            return;
        }
        
        this.currentPage = page;
        // Pagination logic
        const startIdx = (page - 1) * this.rowsPerPage;
        const endIdx = startIdx + this.rowsPerPage;
        const pageData = data.slice(startIdx, endIdx);
        // Create header row
        this.elements.headerRow.innerHTML = '';
        headers.forEach(header => {
            const th = document.createElement('th');
            th.textContent = header || '';
            this.elements.headerRow.appendChild(th);
        });
        // Create data rows
        this.elements.tableBody.innerHTML = '';
        pageData.forEach(row => {
            const tr = document.createElement('tr');
            headers.forEach(header => {
                const td = document.createElement('td');
                td.textContent = row[header] || '';
                tr.appendChild(td);
            });
            this.elements.tableBody.appendChild(tr);
        });
        this.elements.previewSection.style.display = 'block';
        this.renderPaginationControls();
    }

    renderPaginationControls() {
        let paginationDiv = document.getElementById('paginationControls');
        if (!paginationDiv) {
            paginationDiv = document.createElement('div');
            paginationDiv.id = 'paginationControls';
            paginationDiv.className = 'pagination-controls';
            this.elements.previewSection.appendChild(paginationDiv);
        }
        const totalRows = this.csvData ? this.csvData.data.length : 0;
        const totalPages = Math.ceil(totalRows / this.rowsPerPage);
        if (totalPages <= 1) {
            paginationDiv.innerHTML = '';
            return;
        }
        let html = '';
        html += `<button class="pagination-btn" ${this.currentPage === 1 ? 'disabled' : ''} data-page="${this.currentPage - 1}">Prev</button>`;
        for (let i = 1; i <= totalPages; i++) {
            html += `<button class="pagination-btn${i === this.currentPage ? ' active' : ''}" data-page="${i}">${i}</button>`;
        }
        html += `<button class="pagination-btn" ${this.currentPage === totalPages ? 'disabled' : ''} data-page="${this.currentPage + 1}">Next</button>`;
        paginationDiv.innerHTML = html;
        // Add event listeners
        Array.from(paginationDiv.querySelectorAll('.pagination-btn')).forEach(btn => {
            btn.onclick = (e) => {
                const page = Number(btn.getAttribute('data-page'));
                if (page >= 1 && page <= totalPages && page !== this.currentPage) {
                    this.displayPreview(page);
                }
            };
        });
    }

    // Create column selection checkboxes
    createColumnSelection() {
        this.elements.columnsGrid.innerHTML = '';
        this.selectedColumns.clear();

        if (!this.csvData || !this.csvData.headers) {
            console.error('No CSV data available for column selection');
            return;
        }

        this.csvData.headers.forEach((header, index) => {
            const columnDiv = document.createElement('div');
            columnDiv.className = 'column-checkbox';
            columnDiv.innerHTML = `
                <input type="checkbox" id="col-${index}" value="${header || ''}">
                <label for="col-${index}">${header || 'Column ' + (index + 1)}</label>
            `;

            const checkbox = columnDiv.querySelector('input[type="checkbox"]');
            checkbox.addEventListener('change', (e) => {
                if (e.target.checked) {
                    this.selectedColumns.add(header);
                    columnDiv.classList.add('selected');
                    console.log('Column selected:', header, 'Total selected:', this.selectedColumns.size);
                } else {
                    this.selectedColumns.delete(header);
                    columnDiv.classList.remove('selected');
                    console.log('Column deselected:', header, 'Total selected:', this.selectedColumns.size);
                }
            });

            this.elements.columnsGrid.appendChild(columnDiv);
        });
        
        console.log('Column selection created with', this.csvData.headers.length, 'columns');
    }

    // Show column selection section
    showColumnSelection() {
        this.elements.columnSelection.style.display = 'block';
    }

    // Show action section
    showActionSection() {
        this.elements.actionSection.style.display = 'block';
    }

    // Select all columns
    selectAllColumns() {
        const checkboxes = this.elements.columnsGrid.querySelectorAll('input[type="checkbox"]');
        checkboxes.forEach(checkbox => {
            checkbox.checked = true;
            this.selectedColumns.add(checkbox.value);
            checkbox.closest('.column-checkbox').classList.add('selected');
        });
    }

    // Deselect all columns
    deselectAllColumns() {
        const checkboxes = this.elements.columnsGrid.querySelectorAll('input[type="checkbox"]');
        checkboxes.forEach(checkbox => {
            checkbox.checked = false;
            this.selectedColumns.delete(checkbox.value);
            checkbox.closest('.column-checkbox').classList.remove('selected');
        });
    }

    // Preview extraction
    previewExtraction() {
        if (this.selectedColumns.size === 0) {
            this.showToast('warning', 'No Columns Selected', 'Please select at least one column to extract.');
            return;
        }

        const extractedData = this.extractData();
        this.displayExtractedPreview(extractedData);
    }

    // Extract selected columns
    async extractSelectedColumns() {
        if (this.selectedColumns.size === 0) {
            this.showToast('warning', 'No Columns Selected', 'Please select at least one column to extract.');
            return;
        }

        try {
            this.showLoading('Extracting selected columns...');
            
            // Extract data locally (no backend call needed for column selection)
            const extractedData = this.extractData();
            
            // Generate and download CSV
            this.downloadCSV(extractedData);
            
            this.hideLoading();
            this.showToast('success', 'Extraction Complete', 'Your CSV file has been extracted and downloaded successfully.');
            
        } catch (error) {
            this.hideLoading();
            console.error('Extraction error:', error);
            this.showToast('error', 'Extraction Failed', 'An error occurred during extraction. Please try again.');
        }
    }

    // Extract data based on selected columns
    extractData() {
        const { headers, data } = this.csvData;
        const selectedHeaders = Array.from(this.selectedColumns);
        
        if (!headers || !data || selectedHeaders.length === 0) {
            console.error('Invalid data for extraction');
            return { headers: [], data: [] };
        }
        
        console.log('Extracting data with selected columns:', selectedHeaders);
        console.log('Available headers:', headers);
        console.log('Selected columns count:', this.selectedColumns.size);
        
        return {
            headers: selectedHeaders,
            data: data.map(row => {
                const extractedRow = {};
                selectedHeaders.forEach(header => {
                    extractedRow[header] = row[header] || '';
                });
                return extractedRow;
            })
        };
    }

    // Display extracted data preview
    displayExtractedPreview(extractedData) {
        // Create a modal or new table to show extracted data
        const previewWindow = window.open('', '_blank');
        previewWindow.document.write(`
            <!DOCTYPE html>
            <html>
            <head>
                <title>Extracted Data Preview</title>
                <style>
                    body { font-family: Arial, sans-serif; margin: 20px; }
                    table { border-collapse: collapse; width: 100%; }
                    th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
                    th { background-color: #f2f2f2; }
                </style>
            </head>
            <body>
                <h2>Extracted Data Preview</h2>
                <table>
                    <thead><tr>${extractedData.headers.map(h => `<th>${h}</th>`).join('')}</tr></thead>
                    <tbody>
                        ${extractedData.data.map(row => 
                            `<tr>${extractedData.headers.map(h => `<td>${row[h]}</td>`).join('')}</tr>`
                        ).join('')}
                    </tbody>
                </table>
            </body>
            </html>
        `);
        previewWindow.document.close();
    }

    // Download CSV file
    downloadCSV(extractedData) {
        if (!extractedData || !extractedData.headers || !extractedData.data) {
            console.error('Invalid extracted data for download');
            this.showToast('error', 'Download Failed', 'No data available for download.');
            return;
        }
        
        const csvContent = this.generateCSV(extractedData);
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        
        if (link.download !== undefined) {
            const url = URL.createObjectURL(blob);
            // Generate a unique filename with timestamp
            const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
            const baseName = this.currentFile.name.replace(/\.csv$/i, '');
            link.setAttribute('href', url);
            link.setAttribute('download', `extracted_${baseName}_${timestamp}.csv`);
            link.style.visibility = 'hidden';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            
            // Clean up the URL object
            setTimeout(() => URL.revokeObjectURL(url), 100);
        }
    }

    // Generate CSV content
    generateCSV(extractedData) {
        const { headers, data } = extractedData;
        
        // Create header row
        let csv = headers.map(header => this.escapeCSVValue(header)).join(',') + '\n';
        
        // Create data rows
        data.forEach(row => {
            const rowValues = headers.map(header => this.escapeCSVValue(row[header] || ''));
            csv += rowValues.join(',') + '\n';
        });
        
        return csv;
    }

    // Escape CSV values
    escapeCSVValue(value) {
        if (value.includes(',') || value.includes('"') || value.includes('\n')) {
            return `"${value.replace(/"/g, '""')}"`;
        }
        return value;
    }

    // Optional: Upload file to backend for storage
    async uploadToBackend(file) {
        try {
            const formData = new FormData();
            formData.append('file', file);

            const response = await fetch('/api/upload', {
                method: 'POST',
                body: formData
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            console.log('File uploaded to backend successfully');
        } catch (error) {
            console.error('Backend upload error:', error);
            // Don't show error to user since this is optional
        }
    }

    // Remove file
    removeFile() {
        this.currentFile = null;
        this.csvData = null;
        this.selectedColumns.clear();
        
        // Hide sections
        this.elements.fileInfo.style.display = 'none';
        this.elements.previewSection.style.display = 'none';
        this.elements.columnSelection.style.display = 'none';
        this.elements.actionSection.style.display = 'none';
        
        // Clear file input
        this.elements.fileInput.value = '';
        
        this.showToast('info', 'File Removed', 'The file has been removed. You can upload a new file.');
    }

    // Show loading overlay
    showLoading(message = 'Processing...') {
        this.elements.loadingText.textContent = message;
        this.elements.loadingOverlay.style.display = 'flex';
    }

    // Hide loading overlay
    hideLoading() {
        this.elements.loadingOverlay.style.display = 'none';
    }

    // Toggle theme
    toggleTheme() {
        try {
            this.isDarkMode = !this.isDarkMode;
            
            if (this.isDarkMode) {
                document.documentElement.setAttribute('data-theme', 'dark');
                this.elements.themeToggle.innerHTML = '<i class="fas fa-sun"></i>';
            } else {
                document.documentElement.removeAttribute('data-theme');
                this.elements.themeToggle.innerHTML = '<i class="fas fa-moon"></i>';
            }
            
            localStorage.setItem('darkMode', this.isDarkMode);
        } catch (error) {
            console.error('Error toggling theme:', error);
        }
    }

    // Handle keyboard navigation
    handleKeyboardNavigation(event) {
        try {
            // Escape key to close modals or remove file
            if (event.key === 'Escape') {
                if (this.currentFile) {
                    this.removeFile();
                }
            }
            
            // Ctrl/Cmd + U to trigger file upload
            if ((event.ctrlKey || event.metaKey) && event.key === 'u') {
                event.preventDefault();
                if (this.elements.fileInput) {
                    this.elements.fileInput.click();
                }
            }
        } catch (error) {
            console.error('Error handling keyboard navigation:', error);
        }
    }

    // Show toast notification
    showToast(type, title, message) {
        if (!this.elements.toastContainer) {
            console.error('Toast container not found');
            return;
        }
        
        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        
        const icon = this.getToastIcon(type);
        
        toast.innerHTML = `
            <i class="${icon}"></i>
            <div class="toast-content">
                <div class="toast-title">${title}</div>
                <div class="toast-message">${message}</div>
            </div>
            <button class="toast-close" aria-label="Close notification">
                <i class="fas fa-times"></i>
            </button>
        `;
        
        // Add close functionality
        const closeBtn = toast.querySelector('.toast-close');
        closeBtn.addEventListener('click', () => {
            toast.remove();
        });
        
        // Auto-remove after 5 seconds
        setTimeout(() => {
            if (toast.parentNode) {
                toast.remove();
            }
        }, 5000);
        
        this.elements.toastContainer.appendChild(toast);
    }

    // Get toast icon based on type
    getToastIcon(type) {
        switch (type) {
            case 'success': return 'fas fa-check-circle';
            case 'error': return 'fas fa-exclamation-circle';
            case 'warning': return 'fas fa-exclamation-triangle';
            case 'info': return 'fas fa-info-circle';
            default: return 'fas fa-info-circle';
        }
    }

    // Add after preview and column selection logic
    async saveUsersToDatabase(users) {
        try {
            const response = await fetch('/api/users/upload-csv', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(users)
            });
            const result = await response.json();
            if (result.success) {
                this.showToast('success', 'Users Saved', result.message);
            } else {
                this.showToast('error', 'Save Failed', result.message || 'Failed to save users.');
            }
        } catch (error) {
            this.showToast('error', 'Save Failed', 'Could not save users to database.');
        }
    }

    // Add a method to handle user search by ID
    async searchUserById(userId) {
        try {
            const response = await fetch(`/api/users/${userId}`);
            if (!response.ok) {
                this.showToast('error', 'User Not Found', 'No user found with this ID.');
                this.displayUserDetails(null);
                return;
            }
            const user = await response.json();
            this.displayUserDetails(user);
        } catch (error) {
            this.showToast('error', 'Search Failed', 'Could not fetch user details.');
            this.displayUserDetails(null);
        }
    }

    // Add a method to display user details
    displayUserDetails(user) {
        let detailsDiv = document.getElementById('userDetails');
        if (!detailsDiv) {
            detailsDiv = document.createElement('div');
            detailsDiv.id = 'userDetails';
            this.elements.uploadArea.parentNode.insertBefore(detailsDiv, this.elements.uploadArea.nextSibling);
        }
        if (!user) {
            detailsDiv.innerHTML = '<div class="user-details-error">No user found.</div>';
            return;
        }
        detailsDiv.innerHTML = `
            <div class="user-details">
                <h3>User Details</h3>
                <p><strong>ID:</strong> ${user.id}</p>
                <p><strong>Name:</strong> ${user.name}</p>
                <p><strong>Email:</strong> ${user.email}</p>
                <p><strong>Age:</strong> ${user.age}</p>
                <p><strong>Address:</strong> ${user.address}</p>
            </div>
        `;
    }
}

// Initialize the application when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    try {
        const app = new CSVFileExtractor();
        window.csvFileExtractorAppInstance = app;
    } catch (error) {
        console.error('Failed to initialize CSV File Extractor:', error);
        // Show a user-friendly error message
        const errorDiv = document.createElement('div');
        errorDiv.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: #ef4444;
            color: white;
            padding: 2rem;
            border-radius: 0.5rem;
            text-align: center;
            z-index: 10000;
        `;
        errorDiv.innerHTML = `
            <h3>Application Error</h3>
            <p>Failed to initialize the CSV File Extractor. Please refresh the page and try again.</p>
        `;
        document.body.appendChild(errorDiv);
    }
}); 

// Add tooltips for better UX
document.addEventListener('DOMContentLoaded', () => {
    // Add tooltips to buttons
    const buttons = document.querySelectorAll('button[title]');
    buttons.forEach(button => {
        button.addEventListener('mouseenter', (e) => {
            const tooltip = document.createElement('div');
            tooltip.className = 'tooltip';
            tooltip.textContent = e.target.title;
            tooltip.style.cssText = `
                position: absolute;
                background: var(--surface-color);
                color: var(--text-primary);
                padding: 0.5rem;
                border-radius: var(--radius-sm);
                font-size: 0.75rem;
                box-shadow: var(--shadow-md);
                z-index: 1000;
                pointer-events: none;
                white-space: nowrap;
            `;
            document.body.appendChild(tooltip);
            
            const rect = e.target.getBoundingClientRect();
            tooltip.style.left = rect.left + (rect.width / 2) - (tooltip.offsetWidth / 2) + 'px';
            tooltip.style.top = rect.top - tooltip.offsetHeight - 8 + 'px';
            
            e.target.addEventListener('mouseleave', () => {
                tooltip.remove();
            }, { once: true });
        });
    });
}); 

// Add UI for searching user by ID after DOMContentLoaded
const uploadSection = document.getElementById('uploadSection');
if (uploadSection && !document.getElementById('userSearchForm')) {
    const form = document.createElement('form');
    form.id = 'userSearchForm';
    form.style.marginBottom = '1rem';
    form.innerHTML = `
        <label for="userIdInput"><strong>Find User by Backend ID:</strong></label>
        <input type="number" id="userIdInput" placeholder="Enter user ID" style="margin: 0 0.5rem; padding: 0.25rem 0.5rem; width: 120px;">
        <button type="submit" class="btn btn-secondary"><i class="fas fa-search"></i> Search</button>
    `;
    uploadSection.insertBefore(form, uploadSection.firstChild);
    form.onsubmit = (e) => {
        e.preventDefault();
        const userId = document.getElementById('userIdInput').value;
        if (userId) {
            const app = window.csvFileExtractorAppInstance;
            if (app) {
                app.searchUserById(userId);
            }
        }
    };
} 