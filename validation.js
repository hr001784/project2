// Validation module for form handling and error management
const Validation = {
    /**
     * Validate a single field
     * @param {string} fieldName - Name of the field
     * @param {string} value - Field value
     * @param {Object} rules - Validation rules
     * @returns {Object} Validation result
     */
    validateField(fieldName, value, rules = {}) {
        const errors = [];
        const trimmedValue = value ? value.trim() : '';

        // Required validation
        if (rules.required && !trimmedValue) {
            errors.push(`${this.getFieldLabel(fieldName)} is required`);
            return { isValid: false, errors };
        }

        // Skip other validations if field is empty and not required
        if (!trimmedValue && !rules.required) {
            return { isValid: true, errors: [] };
        }

        // Min length validation
        if (rules.minLength && trimmedValue.length < rules.minLength) {
            errors.push(`${this.getFieldLabel(fieldName)} must be at least ${rules.minLength} characters`);
        }

        // Max length validation
        if (rules.maxLength && trimmedValue.length > rules.maxLength) {
            errors.push(`${this.getFieldLabel(fieldName)} must be no more than ${rules.maxLength} characters`);
        }

        // Email validation
        if (rules.email && !this.isValidEmail(trimmedValue)) {
            errors.push('Please enter a valid email address');
        }

        // Pattern validation
        if (rules.pattern && !rules.pattern.test(trimmedValue)) {
            errors.push(rules.patternMessage || `${this.getFieldLabel(fieldName)} format is invalid`);
        }

        // Custom validation
        if (rules.custom) {
            const customResult = rules.custom(trimmedValue);
            if (customResult !== true) {
                errors.push(customResult);
            }
        }

        return { isValid: errors.length === 0, errors };
    },

    /**
     * Validate entire form
     * @param {Object} formData - Form data object
     * @param {Object} validationRules - Validation rules for each field
     * @returns {Object} Validation result
     */
    validateForm(formData, validationRules) {
        const errors = {};
        let isValid = true;

        for (const [fieldName, rules] of Object.entries(validationRules)) {
            const value = formData[fieldName] || '';
            const result = this.validateField(fieldName, value, rules);
            
            if (!result.isValid) {
                errors[fieldName] = result.errors;
                isValid = false;
            }
        }

        return { isValid, errors };
    },

    /**
     * Show field error
     * @param {string} fieldName - Field name
     * @param {Array} errors - Error messages
     */
    showFieldError(fieldName, errors) {
        const field = document.getElementById(fieldName);
        const errorElement = document.getElementById(`${fieldName}-error`);

        if (field) {
            field.classList.add('error');
        }

        if (errorElement) {
            errorElement.textContent = errors.join(', ');
            errorElement.style.display = 'block';
        }
    },

    /**
     * Clear field error
     * @param {string} fieldName - Field name
     */
    clearFieldError(fieldName) {
        const field = document.getElementById(fieldName);
        const errorElement = document.getElementById(`${fieldName}-error`);

        if (field) {
            field.classList.remove('error');
        }

        if (errorElement) {
            errorElement.textContent = '';
            errorElement.style.display = 'none';
        }
    },

    /**
     * Clear all errors for multiple fields
     * @param {Array} fieldNames - Array of field names
     */
    clearAllErrors(fieldNames) {
        fieldNames.forEach(fieldName => this.clearFieldError(fieldName));
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
     * Get human-readable field label
     * @param {string} fieldName - Field name
     * @returns {string} Field label
     */
    getFieldLabel(fieldName) {
        const labels = {
            firstName: 'First Name',
            lastName: 'Last Name',
            email: 'Email',
            department: 'Department',
            role: 'Role'
        };
        return labels[fieldName] || fieldName;
    },

    /**
     * Employee form validation rules
     */
    employeeFormRules: {
        firstName: {
            required: true,
            minLength: 2,
            maxLength: 50,
            pattern: /^[a-zA-Z\s'-]+$/,
            patternMessage: 'First name can only contain letters, spaces, hyphens, and apostrophes'
        },
        lastName: {
            required: true,
            minLength: 2,
            maxLength: 50,
            pattern: /^[a-zA-Z\s'-]+$/,
            patternMessage: 'Last name can only contain letters, spaces, hyphens, and apostrophes'
        },
        email: {
            required: true,
            email: true,
            maxLength: 100,
            custom: function(value) {
                const existingEmployee = DataManager.getAllEmployees().find(emp => 
                    emp.email.toLowerCase() === value.toLowerCase()
                );
                if (existingEmployee) {
                    return 'An employee with this email already exists';
                }
                return true;
            }
        },
        department: {
            required: true
        },
        role: {
            required: true
        }
    },

    /**
     * Real-time validation for input fields
     * @param {Event} event - Input event
     */
    handleRealTimeValidation(event) {
        const field = event.target;
        const fieldName = field.name;
        const value = field.value;

        // Get validation rules for this field
        const rules = this.employeeFormRules[fieldName];
        if (!rules) return;

        // Validate field
        const result = this.validateField(fieldName, value, rules);

        if (result.isValid) {
            this.clearFieldError(fieldName);
        } else {
            this.showFieldError(fieldName, result.errors);
        }
    },

    /**
     * Setup real-time validation for form
     * @param {string} formId - Form ID
     */
    setupRealTimeValidation(formId) {
        const form = document.getElementById(formId);
        if (!form) return;

        const inputs = form.querySelectorAll('input, select');
        inputs.forEach(input => {
            input.addEventListener('blur', this.handleRealTimeValidation.bind(this));
            input.addEventListener('input', this.handleRealTimeValidation.bind(this));
        });
    },

    /**
     * Show success message
     * @param {string} message - Success message
     * @param {number} duration - Duration in milliseconds
     */
    showSuccessMessage(message, duration = 3000) {
        this.showMessage(message, 'success', duration);
    },

    /**
     * Show error message
     * @param {string} message - Error message
     * @param {number} duration - Duration in milliseconds
     */
    showErrorMessage(message, duration = 5000) {
        this.showMessage(message, 'error', duration);
    },

    /**
     * Show info message
     * @param {string} message - Info message
     * @param {number} duration - Duration in milliseconds
     */
    showInfoMessage(message, duration = 3000) {
        this.showMessage(message, 'info', duration);
    },

    /**
     * Show message
     * @param {string} message - Message text
     * @param {string} type - Message type (success, error, info)
     * @param {number} duration - Duration in milliseconds
     */
    showMessage(message, type, duration) {
        // Remove existing messages
        const existingMessages = document.querySelectorAll('.message');
        existingMessages.forEach(msg => msg.remove());

        // Create message element
        const messageElement = document.createElement('div');
        messageElement.className = `message message--${type}`;
        messageElement.innerHTML = `
            <div class="message__content">
                <span class="message__text">${message}</span>
                <button class="message__close" onclick="this.parentElement.parentElement.remove()">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <line x1="18" y1="6" x2="6" y2="18"></line>
                        <line x1="6" y1="6" x2="18" y2="18"></line>
                    </svg>
                </button>
            </div>
        `;

        // Insert message at the top of the main container
        const mainContainer = document.querySelector('.main__container');
        if (mainContainer) {
            mainContainer.insertBefore(messageElement, mainContainer.firstChild);
        }

        // Auto-remove after duration
        if (duration > 0) {
            setTimeout(() => {
                if (messageElement.parentElement) {
                    messageElement.remove();
                }
            }, duration);
        }
    },

    /**
     * Confirm action
     * @param {string} message - Confirmation message
     * @returns {Promise<boolean>} User's choice
     */
    confirmAction(message) {
        return new Promise((resolve) => {
            const confirmModal = document.getElementById('confirm-modal');
            const confirmOverlay = document.getElementById('confirm-overlay');
            const confirmDeleteBtn = document.getElementById('confirm-delete');
            const cancelDeleteBtn = document.getElementById('cancel-delete');

            // Update modal message
            const modalBody = confirmModal.querySelector('.modal__body p');
            if (modalBody) {
                modalBody.textContent = message;
            }

            // Show modal
            confirmModal.classList.add('show');

            // Handle confirm
            const handleConfirm = () => {
                confirmModal.classList.remove('show');
                cleanup();
                resolve(true);
            };

            // Handle cancel
            const handleCancel = () => {
                confirmModal.classList.remove('show');
                cleanup();
                resolve(false);
            };

            // Handle overlay click
            const handleOverlayClick = (e) => {
                if (e.target === confirmOverlay) {
                    handleCancel();
                }
            };

            // Cleanup function
            const cleanup = () => {
                confirmDeleteBtn.removeEventListener('click', handleConfirm);
                cancelDeleteBtn.removeEventListener('click', handleCancel);
                confirmOverlay.removeEventListener('click', handleOverlayClick);
            };

            // Add event listeners
            confirmDeleteBtn.addEventListener('click', handleConfirm);
            cancelDeleteBtn.addEventListener('click', handleCancel);
            confirmOverlay.addEventListener('click', handleOverlayClick);
        });
    },

    /**
     * Sanitize input value
     * @param {string} value - Input value
     * @returns {string} Sanitized value
     */
    sanitizeInput(value) {
        if (typeof value !== 'string') return '';
        
        return value
            .trim()
            .replace(/[<>]/g, '') // Remove potential HTML tags
            .replace(/&/g, '&amp;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#x27;')
            .replace(/\//g, '&#x2F;');
    },

    /**
     * Format validation error for display
     * @param {Array} errors - Array of error messages
     * @returns {string} Formatted error message
     */
    formatErrors(errors) {
        if (!Array.isArray(errors)) return '';
        return errors.join('. ');
    }
};

// Export for use in other modules
window.Validation = Validation; 