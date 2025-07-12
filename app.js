// Main application module
const App = {
    /**
     * Initialize the application
     */
    init() {
        this.setupEventListeners();
        UI.init();
        console.log('Employee Directory Application initialized');
    },

    /**
     * Setup all event listeners
     */
    setupEventListeners() {
        this.setupSearchListener();
        this.setupFilterListeners();
        this.setupSortListener();
        this.setupPaginationListeners();
        this.setupModalListeners();
        this.setupFormListeners();
        this.setupKeyboardShortcuts();
    },

    /**
     * Setup search functionality
     */
    setupSearchListener() {
        const searchInput = document.getElementById('search-input');
        if (!searchInput) return;

        let searchTimeout;
        searchInput.addEventListener('input', (e) => {
            clearTimeout(searchTimeout);
            searchTimeout = setTimeout(() => {
                const searchTerm = e.target.value;
                DataManager.searchEmployees(searchTerm);
                DataManager.setCurrentPage(1); // Reset to first page
                UI.refreshUI();
            }, 300); // Debounce search
        });
    },

    /**
     * Setup filter functionality
     */
    setupFilterListeners() {
        // Filter toggle button
        const filterBtn = document.getElementById('filter-btn');
        if (filterBtn) {
            filterBtn.addEventListener('click', () => {
                const filterPanel = document.getElementById('filter-panel');
                const isVisible = filterPanel.classList.contains('show');
                UI.toggleFilterPanel(!isVisible);
            });
        }

        // Apply filters button
        const applyFiltersBtn = document.getElementById('apply-filters');
        if (applyFiltersBtn) {
            applyFiltersBtn.addEventListener('click', () => {
                const departmentSelect = document.getElementById('filter-department');
                const roleSelect = document.getElementById('filter-role');

                const filters = {
                    department: departmentSelect ? departmentSelect.value : '',
                    role: roleSelect ? roleSelect.value : ''
                };

                DataManager.setFilters(filters);
                DataManager.setCurrentPage(1); // Reset to first page
                UI.refreshUI();
                UI.toggleFilterPanel(false);
            });
        }

        // Clear filters button
        const clearFiltersBtn = document.getElementById('clear-filters');
        if (clearFiltersBtn) {
            clearFiltersBtn.addEventListener('click', () => {
                DataManager.clearFilters();
                UI.updateUI();
            });
        }
    },

    /**
     * Setup sort functionality
     */
    setupSortListener() {
        const sortSelect = document.getElementById('sort-select');
        if (!sortSelect) return;

        sortSelect.addEventListener('change', (e) => {
            const sortBy = e.target.value;
            if (sortBy) {
                DataManager.setSorting(sortBy, 'asc');
            } else {
                DataManager.setSorting('', 'asc');
            }
            DataManager.setCurrentPage(1); // Reset to first page
            UI.refreshUI();
        });
    },

    /**
     * Setup pagination functionality
     */
    setupPaginationListeners() {
        // Previous page button
        const prevBtn = document.getElementById('prev-page');
        if (prevBtn) {
            prevBtn.addEventListener('click', () => {
                const currentPage = DataManager.getCurrentPage();
                if (currentPage > 1) {
                    DataManager.setCurrentPage(currentPage - 1);
                    UI.refreshUI();
                }
            });
        }

        // Next page button
        const nextBtn = document.getElementById('next-page');
        if (nextBtn) {
            nextBtn.addEventListener('click', () => {
                const currentPage = DataManager.getCurrentPage();
                const totalPages = DataManager.getTotalPages();
                if (currentPage < totalPages) {
                    DataManager.setCurrentPage(currentPage + 1);
                    UI.refreshUI();
                }
            });
        }

        // Page number buttons (delegated event)
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('page-number')) {
                const pageNumber = parseInt(e.target.dataset.page);
                DataManager.setCurrentPage(pageNumber);
                UI.refreshUI();
            }
        });

        // Items per page select
        const itemsPerPageSelect = document.getElementById('items-per-page');
        if (itemsPerPageSelect) {
            itemsPerPageSelect.addEventListener('change', (e) => {
                const itemsPerPage = parseInt(e.target.value);
                DataManager.setItemsPerPage(itemsPerPage);
                UI.refreshUI();
            });
        }
    },

    /**
     * Setup modal functionality
     */
    setupModalListeners() {
        // Add employee button
        const addEmployeeBtn = document.getElementById('add-employee-btn');
        if (addEmployeeBtn) {
            addEmployeeBtn.addEventListener('click', () => {
                UI.showEmployeeModal();
            });
        }

        // Modal close button
        const modalCloseBtn = document.getElementById('modal-close');
        if (modalCloseBtn) {
            modalCloseBtn.addEventListener('click', () => {
                UI.hideEmployeeModal();
            });
        }

        // Modal overlay click
        const modalOverlay = document.getElementById('modal-overlay');
        if (modalOverlay) {
            modalOverlay.addEventListener('click', () => {
                UI.hideEmployeeModal();
            });
        }

        // Cancel button
        const cancelBtn = document.getElementById('cancel-btn');
        if (cancelBtn) {
            cancelBtn.addEventListener('click', () => {
                UI.hideEmployeeModal();
            });
        }

        // Confirmation modal buttons
        const cancelDeleteBtn = document.getElementById('cancel-delete');
        const confirmDeleteBtn = document.getElementById('confirm-delete');

        if (cancelDeleteBtn) {
            cancelDeleteBtn.addEventListener('click', () => {
                document.getElementById('confirm-modal').classList.remove('show');
            });
        }

        if (confirmDeleteBtn) {
            confirmDeleteBtn.addEventListener('click', () => {
                // This will be handled by the Validation.confirmAction function
            });
        }
    },

    /**
     * Setup form functionality
     */
    setupFormListeners() {
        const form = document.getElementById('employee-form');
        if (!form) return;

        form.addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleFormSubmission();
        });
    },

    /**
     * Handle form submission
     */
    handleFormSubmission() {
        const form = document.getElementById('employee-form');
        const formData = new FormData(form);
        
        const employeeData = {
            firstName: formData.get('firstName'),
            lastName: formData.get('lastName'),
            email: formData.get('email'),
            department: formData.get('department'),
            role: formData.get('role')
        };

        // Validate form data
        const validation = DataManager.validateEmployee(employeeData);
        if (!validation.isValid) {
            validation.errors.forEach(error => {
                Validation.showErrorMessage(error);
            });
            return;
        }

        // Clear any existing errors
        Validation.clearAllErrors(['firstName', 'lastName', 'email', 'department', 'role']);

        const employeeId = form.dataset.employeeId;
        let result;

        if (employeeId) {
            // Update existing employee
            result = DataManager.updateEmployee(parseInt(employeeId), employeeData);
            if (result) {
                Validation.showSuccessMessage(`${employeeData.firstName} ${employeeData.lastName} has been updated successfully.`);
            } else {
                Validation.showErrorMessage('Failed to update employee. Please try again.');
                return;
            }
        } else {
            // Add new employee
            result = DataManager.addEmployee(employeeData);
            if (result) {
                Validation.showSuccessMessage(`${employeeData.firstName} ${employeeData.lastName} has been added successfully.`);
            } else {
                Validation.showErrorMessage('Failed to add employee. Please try again.');
                return;
            }
        }

        // Close modal and refresh UI
        UI.hideEmployeeModal();
        UI.refreshUI();
    },

    /**
     * Setup keyboard shortcuts
     */
    setupKeyboardShortcuts() {
        document.addEventListener('keydown', (e) => {
            // Ctrl/Cmd + N to add new employee
            if ((e.ctrlKey || e.metaKey) && e.key === 'n') {
                e.preventDefault();
                UI.showEmployeeModal();
            }

            // Escape to close modals
            if (e.key === 'Escape') {
                const employeeModal = document.getElementById('employee-modal');
                const confirmModal = document.getElementById('confirm-modal');
                
                if (employeeModal.classList.contains('show')) {
                    UI.hideEmployeeModal();
                }
                
                if (confirmModal.classList.contains('show')) {
                    confirmModal.classList.remove('show');
                }
            }

            // Ctrl/Cmd + F to focus search
            if ((e.ctrlKey || e.metaKey) && e.key === 'f') {
                e.preventDefault();
                const searchInput = document.getElementById('search-input');
                if (searchInput) {
                    searchInput.focus();
                    searchInput.select();
                }
            }
        });
    },

    /**
     * Handle empty state actions
     */
    setupEmptyStateListeners() {
        document.addEventListener('click', (e) => {
            if (e.target.id === 'add-first-employee-btn') {
                UI.showEmployeeModal();
            }
            
            if (e.target.id === 'clear-all-filters-btn') {
                DataManager.clearFilters();
                UI.updateUI();
            }
        });
    },

    /**
     * Export employees to CSV
     */
    exportToCSV() {
        try {
            const csvContent = DataManager.exportToCSV();
            const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
            const link = document.createElement('a');
            
            if (link.download !== undefined) {
                const url = URL.createObjectURL(blob);
                link.setAttribute('href', url);
                link.setAttribute('download', 'employees.csv');
                link.style.visibility = 'hidden';
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
            }
        } catch (error) {
            Validation.showErrorMessage('Failed to export data. Please try again.');
        }
    },

    /**
     * Import employees from CSV
     * @param {File} file - CSV file to import
     */
    async importFromCSV(file) {
        try {
            const text = await file.text();
            const result = DataManager.importFromCSV(text);
            
            if (result.success) {
                Validation.showSuccessMessage(`Successfully imported ${result.imported} employees.`);
                UI.refreshUI();
            } else {
                Validation.showErrorMessage(`Import failed: ${result.error}`);
            }
        } catch (error) {
            Validation.showErrorMessage('Failed to import file. Please check the file format.');
        }
    },

    /**
     * Get application statistics
     * @returns {Object} Application statistics
     */
    getStats() {
        const totalEmployees = DataManager.getTotalEmployees();
        const filteredEmployees = DataManager.getFilteredTotal();
        const departments = DataManager.getUniqueDepartments();
        const roles = DataManager.getUniqueRoles();

        return {
            totalEmployees,
            filteredEmployees,
            totalDepartments: departments.length,
            totalRoles: roles.length,
            currentPage: DataManager.getCurrentPage(),
            totalPages: DataManager.getTotalPages(),
            itemsPerPage: DataManager.getItemsPerPage()
        };
    },

    /**
     * Reset application state
     */
    reset() {
        // Reset data
        DataManager.clearFilters();
        DataManager.setCurrentPage(1);
        DataManager.setItemsPerPage(10);
        DataManager.setSorting('', 'asc');
        
        // Reset UI
        UI.updateUI();
        
        Validation.showInfoMessage('Application state has been reset.');
    }
};

// Initialize application when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    App.init();
});

// Export for global access
window.App = App; 