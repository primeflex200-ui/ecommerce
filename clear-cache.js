// Clear all localStorage data and reinitialize with new admin credentials
console.log('Clearing localStorage...');
localStorage.clear();
console.log('localStorage cleared!');

// Reinitialize with new admin credentials
const defaultUsers = [
    { 
        id: 'admin-001', 
        email: 'ruthvik@blockfortrust.com', 
        password: 'Saireddy880227', 
        role: 'admin',
        firstName: 'Ruthvik',
        lastName: 'Admin'
    },
    { 
        id: 'customer-001', 
        email: 'customer@cb.com', 
        password: 'customer123', 
        role: 'customer',
        firstName: 'John',
        lastName: 'Doe'
    }
];

localStorage.setItem('users', JSON.stringify(defaultUsers));
console.log('New admin credentials set!');
console.log('Admin Email: ruthvik@blockfortrust.com');
console.log('Admin Password: Saireddy880227');
console.log('Please refresh the page and try logging in again.');

alert('Cache cleared! New admin credentials are now active.\n\nEmail: ruthvik@blockfortrust.com\nPassword: Saireddy880227\n\nPlease refresh the page.');
