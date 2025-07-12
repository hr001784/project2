// Mock employee data - simulating data passed from Freemarker template
const mockEmployees = [
    {
        id: 1,
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@company.com',
        department: 'Engineering',
        role: 'Senior Developer'
    },
    {
        id: 2,
        firstName: 'Jane',
        lastName: 'Smith',
        email: 'jane.smith@company.com',
        department: 'Marketing',
        role: 'Marketing Manager'
    },
    {
        id: 3,
        firstName: 'Michael',
        lastName: 'Johnson',
        email: 'michael.johnson@company.com',
        department: 'Sales',
        role: 'Sales Representative'
    },
    {
        id: 4,
        firstName: 'Sarah',
        lastName: 'Williams',
        email: 'sarah.williams@company.com',
        department: 'HR',
        role: 'HR Coordinator'
    },
    {
        id: 5,
        firstName: 'David',
        lastName: 'Brown',
        email: 'david.brown@company.com',
        department: 'Finance',
        role: 'Financial Analyst'
    },
    {
        id: 6,
        firstName: 'Emily',
        lastName: 'Davis',
        email: 'emily.davis@company.com',
        department: 'Engineering',
        role: 'Frontend Developer'
    },
    {
        id: 7,
        firstName: 'Robert',
        lastName: 'Miller',
        email: 'robert.miller@company.com',
        department: 'Operations',
        role: 'Operations Manager'
    },
    {
        id: 8,
        firstName: 'Lisa',
        lastName: 'Wilson',
        email: 'lisa.wilson@company.com',
        department: 'Marketing',
        role: 'Content Specialist'
    },
    {
        id: 9,
        firstName: 'James',
        lastName: 'Taylor',
        email: 'james.taylor@company.com',
        department: 'Engineering',
        role: 'Backend Developer'
    },
    {
        id: 10,
        firstName: 'Amanda',
        lastName: 'Anderson',
        email: 'amanda.anderson@company.com',
        department: 'Sales',
        role: 'Sales Manager'
    },
    {
        id: 11,
        firstName: 'Christopher',
        lastName: 'Thomas',
        email: 'christopher.thomas@company.com',
        department: 'Finance',
        role: 'Accountant'
    },
    {
        id: 12,
        firstName: 'Jessica',
        lastName: 'Jackson',
        email: 'jessica.jackson@company.com',
        department: 'HR',
        role: 'Recruiter'
    },
    {
        id: 13,
        firstName: 'Daniel',
        lastName: 'White',
        email: 'daniel.white@company.com',
        department: 'Engineering',
        role: 'DevOps Engineer'
    },
    {
        id: 14,
        firstName: 'Ashley',
        lastName: 'Harris',
        email: 'ashley.harris@company.com',
        department: 'Marketing',
        role: 'Digital Marketing Specialist'
    },
    {
        id: 15,
        firstName: 'Matthew',
        lastName: 'Clark',
        email: 'matthew.clark@company.com',
        department: 'Operations',
        role: 'Logistics Coordinator'
    }
];

// Application state
const state = {
    employees: [...mockEmployees],
    filteredEmployees: [...mockEmployees],
    currentPage: 1,
    itemsPerPage: 10,
    searchTerm: '',
    filters: {
        department: '',
        role: ''
    },
    sortBy: '',
    sortDirection: 'asc'
};

// Data management functions
const DataManager = {
    /**
     * Get all employees
     * @returns {Array} Array of all employees
     */
    getAllEmployees() {
        return state.employees;
    },

    /**
     * Get filtered employees
     * @returns {Array} Array of filtered employees
     */
    getFilteredEmployees() {
        return state.filteredEmployees;
    },

    /**
     * Get paginated employees
     * @returns {Array} Array of employees for current page
     */
    getPaginatedEmployees() {
        const startIndex = (state.currentPage - 1) * state.itemsPerPage;
        const endIndex = startIndex + state.itemsPerPage;
        return state.filteredEmployees.slice(startIndex, endIndex);
    },

    /**
     * Get total number of employees
     * @returns {number} Total count
     */
    getTotalEmployees() {
        return state.employees.length;
    },

    /**
     * Get total number of filtered employees
     * @returns {number} Filtered count
     */
    getFilteredTotal() {
        return state.filteredEmployees.length;
    },

    /**
     * Get total number of pages
     * @returns {number} Total pages
     */
    getTotalPages() {
        return Math.ceil(state.filteredEmployees.length / state.itemsPerPage);
    },

    /**
     * Get current page
     * @returns {number} Current page number
     */
    getCurrentPage() {
        return state.currentPage;
    },

    /**
     * Get items per page
     * @returns {number} Items per page
     */
    getItemsPerPage() {
        return state.itemsPerPage;
    },

    /**
     * Get application state
     * @returns {Object} Current state
     */
    getState() {
        return { ...state };
    },

    /**
     * Add a new employee
     * @param {Object} employee - Employee data
     * @returns {Object} Added employee with ID
     */
    addEmployee(employee) {
        const newEmployee = {
            ...employee,
            id: this.generateId()
        };
        
        state.employees.push(newEmployee);
        this.applyFilters();
        return newEmployee;
    },

    /**
     * Update an existing employee
     * @param {number} id - Employee ID
     * @param {Object} updates - Updated employee data
     * @returns {Object|null} Updated employee or null if not found
     */
    updateEmployee(id, updates) {
        const index = state.employees.findIndex(emp => emp.id === id);
        if (index === -1) return null;

        state.employees[index] = { ...state.employees[index], ...updates };
        this.applyFilters();
        return state.employees[index];
    },

    /**
     * Delete an employee
     * @param {number} id - Employee ID
     * @returns {boolean} Success status
     */
    deleteEmployee(id) {
        const index = state.employees.findIndex(emp => emp.id === id);
        if (index === -1) return false;

        state.employees.splice(index, 1);
        this.applyFilters();
        return true;
    },

    /**
     * Get employee by ID
     * @param {number} id - Employee ID
     * @returns {Object|null} Employee or null if not found
     */
    getEmployeeById(id) {
        return state.employees.find(emp => emp.id === id) || null;
    },

    /**
     * Search employees
     * @param {string} term - Search term
     */
    searchEmployees(term) {
        state.searchTerm = term.toLowerCase();
        this.applyFilters();
    },

    /**
     * Set filters
     * @param {Object} filters - Filter criteria
     */
    setFilters(filters) {
        state.filters = { ...state.filters, ...filters };
        this.applyFilters();
    },

    /**
     * Clear all filters
     */
    clearFilters() {
        state.filters = { department: '', role: '' };
        state.searchTerm = '';
        this.applyFilters();
    },

    /**
     * Set sorting
     * @param {string} sortBy - Field to sort by
     * @param {string} direction - Sort direction ('asc' or 'desc')
     */
    setSorting(sortBy, direction = 'asc') {
        state.sortBy = sortBy;
        state.sortDirection = direction;
        this.applyFilters();
    },

    /**
     * Set current page
     * @param {number} page - Page number
     */
    setCurrentPage(page) {
        state.currentPage = Math.max(1, Math.min(page, this.getTotalPages()));
    },

    /**
     * Set items per page
     * @param {number} items - Number of items per page
     */
    setItemsPerPage(items) {
        state.itemsPerPage = items;
        state.currentPage = 1; // Reset to first page
        this.applyFilters();
    },

    /**
     * Apply all filters, search, and sorting
     */
    applyFilters() {
        let filtered = [...state.employees];

        // Apply search
        if (state.searchTerm) {
            filtered = filtered.filter(emp => 
                emp.firstName.toLowerCase().includes(state.searchTerm) ||
                emp.lastName.toLowerCase().includes(state.searchTerm) ||
                emp.email.toLowerCase().includes(state.searchTerm) ||
                emp.department.toLowerCase().includes(state.searchTerm) ||
                emp.role.toLowerCase().includes(state.searchTerm)
            );
        }

        // Apply department filter
        if (state.filters.department) {
            filtered = filtered.filter(emp => emp.department === state.filters.department);
        }

        // Apply role filter
        if (state.filters.role) {
            filtered = filtered.filter(emp => emp.role === state.filters.role);
        }

        // Apply sorting
        if (state.sortBy) {
            filtered.sort((a, b) => {
                let aValue = a[state.sortBy];
                let bValue = b[state.sortBy];

                // Handle string comparison
                if (typeof aValue === 'string' && typeof bValue === 'string') {
                    aValue = aValue.toLowerCase();
                    bValue = bValue.toLowerCase();
                }

                if (aValue < bValue) {
                    return state.sortDirection === 'asc' ? -1 : 1;
                }
                if (aValue > bValue) {
                    return state.sortDirection === 'asc' ? 1 : -1;
                }
                return 0;
            });
        }

        state.filteredEmployees = filtered;
        
        // Reset to first page if current page is out of bounds
        const totalPages = this.getTotalPages();
        if (state.currentPage > totalPages && totalPages > 0) {
            state.currentPage = totalPages;
        } else if (state.currentPage < 1) {
            state.currentPage = 1;
        }
    },

    /**
     * Generate unique ID
     * @returns {number} Unique ID
     */
    generateId() {
        return Math.max(...state.employees.map(emp => emp.id), 0) + 1;
    },

    /**
     * Get unique departments
     * @returns {Array} Array of unique departments
     */
    getUniqueDepartments() {
        const departments = [...new Set(state.employees.map(emp => emp.department))];
        return departments.sort();
    },

    /**
     * Get unique roles
     * @returns {Array} Array of unique roles
     */
    getUniqueRoles() {
        const roles = [...new Set(state.employees.map(emp => emp.role))];
        return roles.sort();
    },

    /**
     * Validate employee data
     * @param {Object} employee - Employee data to validate
     * @returns {Object} Validation result with errors array
     */
    validateEmployee(employee) {
        const errors = [];

        if (!employee.firstName || employee.firstName.trim().length === 0) {
            errors.push('First name is required');
        }

        if (!employee.lastName || employee.lastName.trim().length === 0) {
            errors.push('Last name is required');
        }

        if (!employee.email || employee.email.trim().length === 0) {
            errors.push('Email is required');
        } else if (!this.isValidEmail(employee.email)) {
            errors.push('Please enter a valid email address');
        }

        if (!employee.department || employee.department.trim().length === 0) {
            errors.push('Department is required');
        }

        if (!employee.role || employee.role.trim().length === 0) {
            errors.push('Role is required');
        }

        // Check for duplicate email (excluding current employee if editing)
        const existingEmployee = state.employees.find(emp => 
            emp.email.toLowerCase() === employee.email.toLowerCase() && 
            emp.id !== employee.id
        );
        
        if (existingEmployee) {
            errors.push('An employee with this email already exists');
        }

        return {
            isValid: errors.length === 0,
            errors
        };
    },

    /**
     * Validate email format
     * @param {string} email - Email to validate
     * @returns {boolean} Is valid email
     */
    isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    },

    /**
     * Export employees to CSV
     * @returns {string} CSV string
     */
    exportToCSV() {
        const headers = ['ID', 'First Name', 'Last Name', 'Email', 'Department', 'Role'];
        const rows = state.filteredEmployees.map(emp => [
            emp.id,
            emp.firstName,
            emp.lastName,
            emp.email,
            emp.department,
            emp.role
        ]);

        const csvContent = [headers, ...rows]
            .map(row => row.map(cell => `"${cell}"`).join(','))
            .join('\n');

        return csvContent;
    },

    /**
     * Import employees from CSV
     * @param {string} csvContent - CSV content
     * @returns {Object} Import result
     */
    importFromCSV(csvContent) {
        try {
            const lines = csvContent.trim().split('\n');
            const headers = lines[0].split(',').map(h => h.replace(/"/g, ''));
            const employees = [];

            for (let i = 1; i < lines.length; i++) {
                const values = lines[i].split(',').map(v => v.replace(/"/g, ''));
                const employee = {};

                headers.forEach((header, index) => {
                    employee[header.toLowerCase().replace(/\s+/g, '')] = values[index];
                });

                // Validate and convert data
                const validatedEmployee = {
                    id: parseInt(employee.id) || this.generateId(),
                    firstName: employee.firstname || '',
                    lastName: employee.lastname || '',
                    email: employee.email || '',
                    department: employee.department || '',
                    role: employee.role || ''
                };

                const validation = this.validateEmployee(validatedEmployee);
                if (validation.isValid) {
                    employees.push(validatedEmployee);
                }
            }

            // Add imported employees
            state.employees.push(...employees);
            this.applyFilters();

            return {
                success: true,
                imported: employees.length,
                total: state.employees.length
            };
        } catch (error) {
            return {
                success: false,
                error: error.message
            };
        }
    }
};

// Export for use in other modules
window.DataManager = DataManager; 