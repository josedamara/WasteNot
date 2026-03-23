
function showNotification(message, type = 'success', duration = 4000) {
    // Create notification container if it doesn't exist
    let container = document.getElementById('notification-container');
    if (!container) {
        container = document.createElement('div');
        container.id = 'notification-container';
        container.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            z-index: 9999;
            max-width: 400px;
        `;
        document.body.appendChild(container);
    }

    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    
    // Set colors based on type
    const colors = {
        success: { bg: '#4CAF50', icon: '✓' },
        error: { bg: '#f44336', icon: '✕' }
    };
    
    const color = colors[type] || colors.success;
    
    notification.style.cssText = `
        background-color: ${color.bg};
        color: white;
        padding: 16px 20px;
        margin-bottom: 10px;
        border-radius: 4px;
        box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        display: flex;
        align-items: center;
        animation: slideIn 0.3s ease-out;
        cursor: pointer;
        transition: opacity 0.3s ease;
    `;
    
    notification.innerHTML = `
        <span style="font-size: 20px; margin-right: 12px; font-weight: bold;">${color.icon}</span>
        <span style="flex: 1;">${message}</span>
        <span style="margin-left: 12px; font-size: 20px; opacity: 0.7;">×</span>
    `;
    
    // Add animation keyframes if not already added
    if (!document.getElementById('notification-styles')) {
        const style = document.createElement('style');
        style.id = 'notification-styles';
        style.textContent = `
            @keyframes slideIn {
                from {
                    transform: translateX(400px);
                    opacity: 0;
                }
                to {
                    transform: translateX(0);
                    opacity: 1;
                }
            }
            @keyframes slideOut {
                from {
                    transform: translateX(0);
                    opacity: 1;
                }
                to {
                    transform: translateX(400px);
                    opacity: 0;
                }
            }
        `;
        document.head.appendChild(style);
    }
    
    // Click to dismiss
    notification.addEventListener('click', () => {
        removeNotification(notification);
    });
    
    // Add to container
    container.appendChild(notification);
    
    // Auto-remove after duration
    if (duration > 0) {
        setTimeout(() => {
            removeNotification(notification);
        }, duration);
    }
}

function removeNotification(notification) {
    notification.style.animation = 'slideOut 0.3s ease-in';
    setTimeout(() => {
        if (notification.parentNode) {
            notification.parentNode.removeChild(notification);
        }
    }, 300);
}

function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

function isPositiveNumber(value) {
    const num = parseFloat(value);
    return !isNaN(num) && num > 0;
}

function isNonNegativeNumber(value) {
    const num = parseFloat(value);
    return !isNaN(num) && num >= 0;
}

function isNotEmpty(value) {
    return value && value.trim().length > 0;
}

function meetsMinLength(value, minLength) {
    return value && value.trim().length >= minLength;
}

function isValidDateFormat(dateStr) {
    const dateRegex = /^\d{2}-[A-Z]{3}-\d{4}$/;
    if (!dateRegex.test(dateStr)) return false;
    
    const months = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 
                    'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];
    const parts = dateStr.split('-');
    const month = parts[1];
    
    return months.includes(month);
}

function isYesOrNo(value) {
    const normalized = value.trim().toLowerCase();
    return normalized === 'yes' || normalized === 'no';
}

function validateForm(validations) {
    let isValid = true;
    const errors = [];
    
    for (const [field, validation] of Object.entries(validations)) {
        if (!validation.isValid) {
            isValid = false;
            errors.push(`${field}: ${validation.message}`);
        }
    }
    
    if (!isValid) {
        showNotification(errors.join('<br>'), 'error', 6000);
    }
    
    return isValid;
}