// UI module for rendering and DOM manipulation
const UI = {
    /**
     * Render employee grid
     * @param {Array} employees - Array of employees to render
     */
    renderEmployeeGrid(employees) {
        const grid = document.getElementById('employee-grid');
        if (!grid) return;

        if (employees.length === 0) {
            grid.innerHTML = this.getEmptyStateHTML();
            return;
        }

        const employeeCards = employees.map(employee => this.getEmployeeCardHTML(employee)).join('');
        grid.innerHTML = employeeCards;
        this.attachEmployeeCardListeners();
    },

    /**
     * Get employee card HTML
     * @param {Object} employee - Employee object
     * @returns {string} HTML string for employee card
     */
    getEmployeeCardHTML(employee) {
        return `
            <div class="employee-card" data-employee-id="${employee.id}">
                <div class="employee-card__header">
                    <h3 class="employee-card__name">${employee.firstName} ${employee.lastName}</h3>
                    <span class="employee-card__id">#${employee.id}</span>
                </div>
                <div class="employee-card__info">
                    <div class="employee-card__field">
                        <span class="employee-card__label">Email:</span>
                        <span class="employee-card__value">${employee.email}</span>
                    </div>
                    <div class="employee-card__field">
                        <span class="employee-card__label">Department:</span>
                        <span class="employee-card__value">${employee.department}</span>
                    </div>
                    <div class="employee-card__field">
                        <span class="employee-card__label">Role:</span>
                        <span class="employee-card__value">${employee.role}</span>
                    </div>
                </div>
                <div class="employee-card__actions">
                    <button class="btn btn--secondary btn--small edit-employee-btn" data-id="${employee.id}">
                        <svg class="btn__icon" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                            <path d="m18.5 2.5 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                        </svg>
                        Edit
                    </button>
                    <button class="btn btn--danger btn--small delete-employee-btn" data-id="${employee.id}">
                        <svg class="btn__icon" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <polyline points="3,6 5,6 21,6"></polyline>
                            <path d="m19,6v14a2,2 0 0,1 -2,2H7a2,2 0 0,1 -2,-2V6m3,0V4a2,2 0 0,1 2,-2h4a2,2 0 0,1 2,2v2"></path>
                        </svg>
                        Delete
                    </button>
                </div>
            </div>
        `;
    },

    /**
     * Get empty state HTML
     * @returns {string} HTML string for empty state
     */
    getEmptyStateHTML() {
        return `
            <div class="empty-state">
                <svg class="empty-state__icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                    <circle cx="9" cy="7" r="4"></circle>
                    <path d="m23 21-2-2"></path>
                    <path d="m16 16 4 4 4-4"></path>
                </svg>
                <h3 class="empty-state__title">No employees found</h3>
                <p class="empty-state__description">
                    ${DataManager.getState().searchTerm || DataManager.getState().filters.department || DataManager.getState().filters.role 
                        ? 'Try adjusting your search or filters to find what you\'re looking for.'
                        : 'Get started by adding your first employee.'
                    }
                </p>
                ${!DataManager.getState().searchTerm && !DataManager.getState().filters.department && !DataManager.getState().filters.role 
                    ? '<button class="btn btn--primary" id="add-first-employee-btn">Add Employee</button>'
                    : '<button class="btn btn--secondary" id="clear-all-filters-btn">Clear Filters</button>'
                }
            </div>
        `;
    },

    /**
     * Render pagination
     */
    renderPagination() {
        const pagination = document.getElementById('pagination');
        if (!pagination) return;

        const totalPages = DataManager.getTotalPages();
        const currentPage = DataManager.getCurrentPage();
        const totalItems = DataManager.getFilteredTotal();
        const itemsPerPage = DataManager.getItemsPerPage();
        const startItem = (currentPage - 1) * itemsPerPage + 1;
        const endItem = Math.min(currentPage * itemsPerPage, totalItems);

        // Update pagination info
        const paginationInfo = document.getElementById('pagination-info');
        if (paginationInfo) {
            paginationInfo.textContent = `Showing ${startItem}-${endItem} of ${totalItems} employees`;
        }

        // Update pagination controls
        const prevBtn = document.getElementById('prev-page');
        const nextBtn = document.getElementById('next-page');
        const pageNumbers = document.getElementById('page-numbers');

        if (prevBtn) prevBtn.disabled = currentPage === 1;
        if (nextBtn) nextBtn.disabled = currentPage === totalPages || totalPages === 0;
        if (pageNumbers) pageNumbers.innerHTML = this.getPageNumbersHTML(currentPage, totalPages);

        // Hide pagination if only one page
        pagination.style.display = totalPages <= 1 ? 'none' : 'flex';
    },

    /**
     * Get page numbers HTML
     * @param {number} currentPage - Current page number
     * @param {number} totalPages - Total number of pages
     * @returns {string} HTML string for page numbers
     */
    getPageNumbersHTML(currentPage, totalPages) {
        if (totalPages <= 1) return '';

        const pages = [];
        const maxVisiblePages = 5;
        let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
        let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

        if (endPage - startPage + 1 < maxVisiblePages) {
            startPage = Math.max(1, endPage - maxVisiblePages + 1);
        }

        // Add first page and ellipsis
        if (startPage > 1) {
            pages.push(this.getPageNumberHTML(1, currentPage));
            if (startPage > 2) pages.push('<span class="page-ellipsis">...</span>');
        }

        // Add page numbers
        for (let i = startPage; i <= endPage; i++) {
            pages.push(this.getPageNumberHTML(i, currentPage));
        }

        // Add last page and ellipsis
        if (endPage < totalPages) {
            if (endPage < totalPages - 1) pages.push('<span class="page-ellipsis">...</span>');
            pages.push(this.getPageNumberHTML(totalPages, currentPage));
        }

        return pages.join('');
    },

    /**
     * Get page number HTML
     * @param {number} pageNumber - Page number
     * @param {number} currentPage - Current page number
     * @returns {string} HTML string for page number
     */
    getPageNumberHTML(pageNumber, currentPage) {
        const isActive = pageNumber === currentPage;
        const className = isActive ? 'page-number active' : 'page-number';
        return `<button class="${className}" data-page="${pageNumber}">${pageNumber}</button>`;
    },

    /**
     * Render filter options
     */
    renderFilterOptions() {
        const departments = DataManager.getUniqueDepartments();
        const roles = DataManager.getUniqueRoles();

        // Update department select
        const departmentSelect = document.getElementById('filter-department');
        if (departmentSelect) {
            const currentValue = departmentSelect.value;
            departmentSelect.innerHTML = '<option value="">All Departments</option>';
            departments.forEach(dept => {
                const option = document.createElement('option');
                option.value = dept;
                option.textContent = dept;
                if (dept === currentValue) option.selected = true;
                departmentSelect.appendChild(option);
            });
        }

        // Update role select
        const roleSelect = document.getElementById('filter-role');
        if (roleSelect) {
            const currentValue = roleSelect.value;
            roleSelect.innerHTML = '<option value="">All Roles</option>';
            roles.forEach(role => {
                const option = document.createElement('option');
                option.value = role;
                option.textContent = role;
                if (role === currentValue) option.selected = true;
                roleSelect.appendChild(option);
            });
        }
    },

    /**
     * Toggle filter panel
     * @param {boolean} show - Whether to show or hide the panel
     */
    toggleFilterPanel(show) {
        const filterPanel = document.getElementById('filter-panel');
        if (!filterPanel) return;
        
        if (show) {
            filterPanel.classList.add('show');
        } else {
            filterPanel.classList.remove('show');
        }
    },

    /**
     * Show employee modal
     * @param {Object} employee - Employee object (null for add mode)
     */
    showEmployeeModal(employee = null) {
        const modal = document.getElementById('employee-modal');
        const modalTitle = document.getElementById('modal-title');
        const form = document.getElementById('employee-form');

        if (!modal || !modalTitle || !form) return;

        // Update modal title
        modalTitle.textContent = employee ? 'Edit Employee' : 'Add Employee';

        // Reset form
        form.reset();
        Validation.clearAllErrors(['firstName', 'lastName', 'email', 'department', 'role']);

        // Pre-fill form if editing
        if (employee) {
            document.getElementById('firstName').value = employee.firstName;
            document.getElementById('lastName').value = employee.lastName;
            document.getElementById('email').value = employee.email;
            document.getElementById('department').value = employee.department;
            document.getElementById('role').value = employee.role;
            form.dataset.employeeId = employee.id;
        } else {
            delete form.dataset.employeeId;
        }

        // Show modal
        modal.classList.add('show');
        document.getElementById('firstName').focus();
    },

    /**
     * Hide employee modal
     */
    hideEmployeeModal() {
        const modal = document.getElementById('employee-modal');
        if (modal) {
            modal.classList.remove('show');
        }
    },

    /**
     * Update search input
     * @param {string} value - Search value
     */
    updateSearchInput(value) {
        const searchInput = document.getElementById('search-input');
        if (searchInput) {
            searchInput.value = value;
        }
    },

    /**
     * Update filter inputs
     * @param {Object} filters - Filter values
     */
    updateFilterInputs(filters) {
        const departmentSelect = document.getElementById('filter-department');
        const roleSelect = document.getElementById('filter-role');

        if (departmentSelect) departmentSelect.value = filters.department || '';
        if (roleSelect) roleSelect.value = filters.role || '';
    },

    /**
     * Update sort select
     * @param {string} sortBy - Sort field
     */
    updateSortSelect(sortBy) {
        const sortSelect = document.getElementById('sort-select');
        if (sortSelect) {
            sortSelect.value = sortBy || '';
        }
    },

    /**
     * Update items per page select
     * @param {number} itemsPerPage - Items per page
     */
    updateItemsPerPageSelect(itemsPerPage) {
        const itemsPerPageSelect = document.getElementById('items-per-page');
        if (itemsPerPageSelect) {
            itemsPerPageSelect.value = itemsPerPage;
        }
    },

    /**
     * Show loading state
     * @param {boolean} show - Whether to show or hide loading
     */
    showLoading(show) {
        const app = document.getElementById('app');
        if (app) {
            if (show) {
                app.classList.add('loading');
            } else {
                app.classList.remove('loading');
            }
        }
    },

    /**
     * Attach event listeners to employee cards
     */
    attachEmployeeCardListeners() {
        // Edit buttons
        document.querySelectorAll('.edit-employee-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const employeeId = parseInt(btn.dataset.id);
                const employee = DataManager.getEmployeeById(employeeId);
                if (employee) {
                    UI.showEmployeeModal(employee);
                }
            });
        });

        // Delete buttons
        document.querySelectorAll('.delete-employee-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const employeeId = parseInt(btn.dataset.id);
                const employee = DataManager.getEmployeeById(employeeId);
                if (employee) {
                    this.handleDeleteEmployee(employee);
                }
            });
        });
    },

    /**
     * Handle employee deletion
     * @param {Object} employee - Employee to delete
     */
    async handleDeleteEmployee(employee) {
        const confirmed = await Validation.confirmAction(
            `Are you sure you want to delete ${employee.firstName} ${employee.lastName}? This action cannot be undone.`
        );

        if (confirmed) {
            const success = DataManager.deleteEmployee(employee.id);
            if (success) {
                Validation.showSuccessMessage(`${employee.firstName} ${employee.lastName} has been deleted successfully.`);
                this.refreshUI();
            } else {
                Validation.showErrorMessage('Failed to delete employee. Please try again.');
            }
        }
    },

    /**
     * Refresh entire UI
     */
    refreshUI() {
        const employees = DataManager.getPaginatedEmployees();
        this.renderEmployeeGrid(employees);
        this.renderPagination();
        this.renderFilterOptions();
    },

    /**
     * Update UI based on current state
     */
    updateUI() {
        const state = DataManager.getState();
        
        this.updateSearchInput(state.searchTerm);
        this.updateFilterInputs(state.filters);
        this.updateSortSelect(state.sortBy);
        this.updateItemsPerPageSelect(state.itemsPerPage);
        this.refreshUI();
    },

    /**
     * Initialize UI
     */
    init() {
        this.updateUI();
        Validation.setupRealTimeValidation('employee-form');
    }
};

// Export for use in other modules
window.UI = UI; 