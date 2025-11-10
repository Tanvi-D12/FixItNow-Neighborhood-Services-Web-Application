// Clear expired JWT tokens from localStorage
// Run this in browser console to fix authentication issues

console.log('Clearing expired JWT tokens...');

// Clear all authentication-related items
localStorage.removeItem('accessToken');
localStorage.removeItem('refreshToken'); 
localStorage.removeItem('token');
localStorage.removeItem('user');

// Clear any other auth-related data
Object.keys(localStorage).forEach(key => {
    if (key.includes('auth') || key.includes('jwt') || key.includes('token')) {
        localStorage.removeItem(key);
        console.log('Removed:', key);
    }
});

console.log('Authentication data cleared! Please refresh the page.');

// Optionally reload the page
// window.location.reload();