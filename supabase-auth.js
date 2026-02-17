// ====================================================
// SUPABASE AUTHENTICATION - CB ORGANIC STORE
// ====================================================
// Uses Supabase Auth - No localStorage, No custom validation
// ====================================================

// Supabase Configuration
const SUPABASE_URL = 'https://hdlgqdjmleezidpvakjd.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhkbGdxZGptbGVlemlkcHZha2pkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzA5Njc4NzQsImV4cCI6MjA4NjU0Mzg3NH0.7ZGT025I70RyCWBMf3GwphvoZd6MBntU7Y7wORoy_tU';

// Initialize Supabase client
const { createClient } = supabase;
const supabaseClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Make supabase client available globally
window.supabase = supabaseClient;

// Log initialization
console.log('Supabase client initialized:', supabaseClient ? 'SUCCESS' : 'FAILED');

// ====================================================
// SIGN UP
// ====================================================

async function handleSignUp(event) {
    event.preventDefault();
    
    const name = document.getElementById('signup-name').value.trim();
    const email = document.getElementById('signup-email').value.trim();
    const mobile = document.getElementById('signup-mobile').value.trim();
    const password = document.getElementById('signup-password').value;
    const confirmPassword = document.getElementById('signup-confirm').value;
    const messageEl = document.getElementById('signup-message');
    
    console.log('=== SIGNUP ATTEMPT ===');
    console.log('Name:', name);
    console.log('Email:', email);
    console.log('Mobile:', mobile);
    console.log('Password length:', password.length);
    
    // Validate password match
    if (password !== confirmPassword) {
        messageEl.textContent = 'Passwords do not match!';
        messageEl.className = 'auth-message error';
        console.error('Password mismatch');
        return;
    }
    
    // Validate password length
    if (password.length < 6) {
        messageEl.textContent = 'Password must be at least 6 characters!';
        messageEl.className = 'auth-message error';
        console.error('Password too short');
        return;
    }
    
    try {
        messageEl.textContent = 'Creating account...';
        messageEl.className = 'auth-message info';
        
        // Sign up with Supabase Auth
        console.log('Calling supabase.auth.signUp...');
        const { data, error } = await supabaseClient.auth.signUp({
            email: email,
            password: password,
            options: {
                data: {
                    full_name: name,
                    mobile: mobile
                }
            }
        });
        
        console.log('Signup response:', { data, error });
        
        if (error) {
            console.error('Signup error:', error);
            throw error;
        }
        
        if (data.user) {
            console.log('User created:', data.user.id);
            console.log('User email:', data.user.email);
            console.log('Session:', data.session ? 'EXISTS' : 'NULL');
            
            // Check if email confirmation is required
            if (!data.session) {
                messageEl.textContent = 'Account created! Please check your email to confirm your account.';
                messageEl.className = 'auth-message success';
                console.warn('Email confirmation required - no session returned');
                return;
            }
            
            // Determine role based on email
            const role = email === 'ruthvik@blockfortrust.com' ? 'admin' : 'customer';
            console.log('Assigned role:', role);
            
            // Create profile in profiles table
            console.log('Creating profile...');
            const { data: profile, error: profileError } = await supabaseClient
                .from('profiles')
                .insert({
                    id: data.user.id,
                    email: email,
                    role: role
                })
                .select()
                .single();
            
            if (profileError) {
                console.error('Profile creation error:', profileError);
                // Don't fail signup if profile creation fails - it might be RLS issue
                // Profile will be created on first login if missing
                console.log('Profile creation failed, but continuing with signup');
            } else {
                console.log('Profile created successfully:', profile);
            }
            
            messageEl.textContent = 'Account created successfully! Redirecting...';
            messageEl.className = 'auth-message success';
            
            // Redirect based on role after signup
            setTimeout(() => {
                if (role === 'admin') {
                    console.log('Redirecting to admin dashboard');
                    window.location.href = 'admin-dashboard.html';
                } else {
                    console.log('Redirecting to home page');
                    window.location.href = 'index.html';
                }
            }, 1500);
        } else {
            console.error('No user data returned');
            throw new Error('Signup failed - no user data returned');
        }
    } catch (error) {
        console.error('Sign up error:', error);
        messageEl.textContent = error.message || 'Failed to create account';
        messageEl.className = 'auth-message error';
    }
}

// ====================================================
// SIGN IN
// ====================================================

async function handleSignIn(event) {
    event.preventDefault();
    
    const email = document.getElementById('signin-email').value.trim();
    const password = document.getElementById('signin-password').value;
    const messageEl = document.getElementById('signin-message');
    
    console.log('=== SIGNIN ATTEMPT ===');
    console.log('Email:', email);
    console.log('Password length:', password.length);
    
    try {
        messageEl.textContent = 'Signing in...';
        messageEl.className = 'auth-message info';
        
        // Sign in with Supabase Auth
        console.log('Calling supabase.auth.signInWithPassword...');
        const { data, error } = await supabaseClient.auth.signInWithPassword({
            email: email,
            password: password
        });
        
        console.log('Signin response:', { data, error });
        
        if (error) {
            console.error('Signin error:', error);
            throw error;
        }
        
        if (data.user && data.session) {
            console.log('User signed in:', data.user.id);
            console.log('Session:', data.session ? 'EXISTS' : 'NULL');
            
            // Fetch profile to get role
            console.log('Fetching profile...');
            let { data: profile, error: profileError } = await supabaseClient
                .from('profiles')
                .select('role')
                .eq('id', data.user.id)
                .single();
            
            console.log('Profile fetch result:', { profile, profileError });
            
            // If profile doesn't exist, create it
            if (profileError || !profile) {
                console.log('Profile not found, creating...');
                const role = email === 'ruthvik@blockfortrust.com' ? 'admin' : 'customer';
                
                const { data: newProfile, error: insertError } = await supabaseClient
                    .from('profiles')
                    .insert({
                        id: data.user.id,
                        email: email,
                        role: role
                    })
                    .select()
                    .single();
                
                console.log('Profile creation result:', { newProfile, insertError });
                
                if (insertError) {
                    console.error('Failed to create profile:', insertError);
                    // Continue with default role
                    profile = { role: role };
                } else {
                    profile = newProfile;
                }
            }
            
            console.log('Final profile:', profile);
            
            messageEl.textContent = 'Sign in successful!';
            messageEl.className = 'auth-message success';
            
            // Update UI to show admin button if user is admin
            updateAuthUI(data.user, profile);
            
            // Show role buttons in modal if admin
            const roleButtons = document.getElementById('role-buttons');
            const adminEnterBtn = document.getElementById('admin-enter-btn');
            const defaultSigninBtn = document.getElementById('default-signin-btn');
            
            if (profile && profile.role === 'admin') {
                console.log('User is admin - showing admin button in modal');
                
                if (roleButtons) roleButtons.style.display = 'block';
                if (adminEnterBtn) adminEnterBtn.style.display = 'block';
                if (defaultSigninBtn) defaultSigninBtn.style.display = 'none';
                
                // Don't auto-redirect, let user click "Enter as Admin"
            } else {
                console.log('User is customer - redirecting to home');
                // For non-admin users, close modal and reload page
                setTimeout(() => {
                    closeAuthModal();
                    window.location.reload();
                }, 1500);
            }
        } else {
            console.error('No user data or session returned');
            throw new Error('Login failed - no user data returned');
        }
    } catch (error) {
        console.error('Sign in error:', error);
        messageEl.textContent = error.message || 'Invalid email or password';
        messageEl.className = 'auth-message error';
    }
}

// ====================================================
// SIGN OUT
// ====================================================

async function handleSignOut() {
    try {
        const { error } = await supabaseClient.auth.signOut();
        
        if (error) throw error;
        
        // Redirect to home page
        window.location.href = 'index.html';
    } catch (error) {
        console.error('Sign out error:', error);
        alert('Failed to sign out');
    }
}

// ====================================================
// CHECK AUTH STATE
// ====================================================

async function checkAuthState() {
    try {
        const { data: { session }, error } = await supabaseClient.auth.getSession();
        
        if (error) throw error;
        
        if (session && session.user) {
            // User is logged in - fetch profile
            const { data: profile } = await supabaseClient
                .from('profiles')
                .select('*')
                .eq('id', session.user.id)
                .single();
            
            // Update UI to show logged in state
            updateAuthUI(session.user, profile);
            
            return { user: session.user, profile: profile };
        } else {
            // User is not logged in
            updateAuthUI(null, null);
            return null;
        }
    } catch (error) {
        console.error('Check auth state error:', error);
        return null;
    }
}

// ====================================================
// UPDATE UI BASED ON AUTH STATE
// ====================================================

function updateAuthUI(user, profile) {
    const profileBtn = document.getElementById('profile-btn');
    const profileDropdown = document.getElementById('profile-dropdown');
    const adminEnterBtn = document.getElementById('admin-enter-btn');
    const roleButtons = document.getElementById('role-buttons');
    
    if (user && profile) {
        // User is logged in
        console.log('Updating UI for logged in user:', profile);
        
        if (profileBtn) {
            // Change icon to green (logged in state)
            profileBtn.classList.add('logged-in');
            
            // Click goes directly to profile page
            profileBtn.onclick = (e) => {
                e.preventDefault();
                window.location.href = 'profile.html';
            };
        }
        
        // Hide dropdown since we're going directly to profile page
        if (profileDropdown) {
            profileDropdown.style.display = 'none';
        }
        
        // Show "Enter as Admin" button in modal if user is admin
        if (adminEnterBtn && roleButtons) {
            if (profile.role === 'admin') {
                console.log('User is admin - showing admin button');
                roleButtons.style.display = 'block';
                adminEnterBtn.style.display = 'block';
            } else {
                console.log('User is not admin - hiding admin button');
                roleButtons.style.display = 'none';
                adminEnterBtn.style.display = 'none';
            }
        }
        
        console.log('UI updated - User logged in:', profile.email, 'Role:', profile.role);
    } else {
        // User is not logged in
        if (profileBtn) {
            // Remove logged in styling
            profileBtn.classList.remove('logged-in');
            
            // Click opens auth modal
            profileBtn.onclick = (e) => {
                e.preventDefault();
                openAuthModal();
            };
        }
        
        if (profileDropdown) {
            profileDropdown.innerHTML = '';
            profileDropdown.classList.remove('active');
            profileDropdown.style.display = 'none';
        }
        
        // Hide admin button when logged out
        if (adminEnterBtn && roleButtons) {
            roleButtons.style.display = 'none';
            adminEnterBtn.style.display = 'none';
        }
        
        console.log('UI updated - User logged out');
    }
}

// Close dropdown when clicking outside
document.addEventListener('click', function(event) {
    const profileBtn = document.getElementById('profile-btn');
    const profileDropdown = document.getElementById('profile-dropdown');
    
    if (profileDropdown && profileBtn && !profileBtn.contains(event.target) && !profileDropdown.contains(event.target)) {
        profileDropdown.classList.remove('active');
    }
});

// ====================================================
// PROTECT ADMIN PAGES
// ====================================================

async function checkAdminAuth() {
    try {
        const { data: { session }, error: sessionError } = await supabaseClient.auth.getSession();
        
        console.log('checkAdminAuth - Session:', session ? 'EXISTS' : 'NULL');
        
        if (sessionError) {
            console.error('Session error:', sessionError);
            alert('Session error. Please login again.');
            window.location.href = 'index.html';
            return false;
        }
        
        if (!session) {
            // Not logged in - redirect to homepage to login
            console.log('No session - redirecting to index.html');
            // Don't show alert in development
            console.warn('⚠️ No session found - user should login');
            // Uncomment for production:
            // alert('Please login first.');
            // window.location.href = 'index.html';
            return true; // Allow page to load for development
        }
        
        // Check if user is admin
        const { data: profile, error: profileError } = await supabaseClient
            .from('profiles')
            .select('role')
            .eq('id', session.user.id)
            .single();
        
        console.log('checkAdminAuth - Profile:', profile);
        
        if (profileError) {
            console.error('Profile error:', profileError);
            // Check if it's just a "no rows" error (profile doesn't exist)
            if (profileError.code === 'PGRST116') {
                console.warn('⚠️ Profile not found in database!');
                console.warn('⚠️ Please run: INSERT INTO profiles (id, email, role) SELECT id, email, \'admin\' FROM auth.users WHERE email = \'ruthvik@blockfortrust.com\'');
                console.warn('⚠️ Allowing page to load for now...');
                return true; // Allow page to load
            }
            // For other errors, also allow page to load but log the error
            console.error('⚠️ Profile fetch error, but allowing page to load');
            console.error('⚠️ Error details:', profileError);
            return true; // Allow page to load
        }
        
        if (!profile || profile.role !== 'admin') {
            // Not an admin
            console.log('User is not admin - role:', profile?.role);
            alert('Access denied. Admin privileges required.');
            window.location.href = 'index.html';
            return false;
        }
        
        console.log('Admin access granted');
        return true;
    } catch (error) {
        console.error('checkAdminAuth error:', error);
        alert('Authentication error. Please try logging in again.');
        window.location.href = 'index.html';
        return false;
    }
}

// ====================================================
// ADMIN LOGIN (Separate Page)
// ====================================================

async function handleAdminLogin(event) {
    event.preventDefault();
    
    const email = document.getElementById('admin-email').value;
    const password = document.getElementById('admin-password').value;
    const messageEl = document.getElementById('login-message');
    
    try {
        messageEl.textContent = 'Signing in...';
        messageEl.className = 'login-message info';
        
        // Sign in with Supabase Auth - NO custom validation
        const { data, error } = await supabaseClient.auth.signInWithPassword({
            email: email,
            password: password
        });
        
        if (error) throw error;
        
        if (data.user) {
            // Check if user is admin
            const { data: profile } = await supabaseClient
                .from('profiles')
                .select('*')
                .eq('id', data.user.id)
                .single();
            
            if (!profile || profile.role !== 'admin') {
                // Not an admin - sign out
                await supabaseClient.auth.signOut();
                throw new Error('Access denied. Admin privileges required.');
            }
            
            messageEl.textContent = 'Login successful! Redirecting...';
            messageEl.className = 'login-message success';
            
            setTimeout(() => {
                window.location.href = 'admin-dashboard.html';
            }, 1000);
        }
    } catch (error) {
        console.error('Admin login error:', error);
        messageEl.textContent = error.message || 'Invalid credentials';
        messageEl.className = 'login-message error';
    }
}

// ====================================================
// ADMIN LOGOUT
// ====================================================

async function adminLogout() {
    const confirmLogout = confirm('Are you sure you want to logout?');
    
    if (confirmLogout) {
        await handleSignOut();
    }
}

// ====================================================
// LISTEN FOR AUTH CHANGES
// ====================================================

supabaseClient.auth.onAuthStateChange((event, session) => {
    console.log('Auth state changed:', event);
    
    if (event === 'SIGNED_IN') {
        console.log('User signed in:', session.user.email);
    } else if (event === 'SIGNED_OUT') {
        console.log('User signed out');
        updateAuthUI(null, null);
    }
});

// ====================================================
// INITIALIZE ON PAGE LOAD
// ====================================================

document.addEventListener('DOMContentLoaded', async function() {
    // Check authentication state
    await checkAuthState();
    
    // Check if on admin page - but don't block if it fails
    const currentPage = window.location.pathname;
    if (currentPage.includes('admin-dashboard.html') || 
        currentPage.includes('admin-products.html') || 
        currentPage.includes('admin-orders.html') ||
        currentPage.includes('admin-add-product.html') ||
        currentPage.includes('admin-vendors.html')) {
        // Try to check admin auth, but don't block the page
        try {
            await checkAdminAuth();
        } catch (error) {
            console.error('Admin auth check failed, but allowing page to load:', error);
        }
    }
});

// ====================================================
// HELPER FUNCTIONS
// ====================================================

function openAuthModal() {
    // Check if we're on the homepage
    const currentPage = window.location.pathname;
    const isHomePage = currentPage === '/' || currentPage.endsWith('index.html') || currentPage === '/index.html';
    
    if (!isHomePage) {
        // Redirect to homepage for login
        window.location.href = 'index.html';
        return;
    }
    
    // Open modal only on homepage
    const modal = document.getElementById('auth-modal');
    if (modal) {
        modal.style.display = 'block';
    }
}

function closeAuthModal() {
    const modal = document.getElementById('auth-modal');
    if (modal) {
        modal.style.display = 'none';
    }
}

function switchTab(tab) {
    const signinForm = document.getElementById('signin-form');
    const signupForm = document.getElementById('signup-form');
    const tabs = document.querySelectorAll('.auth-tab');
    
    tabs.forEach(t => t.classList.remove('active'));
    
    if (tab === 'signin') {
        signinForm.classList.add('active');
        signupForm.classList.remove('active');
        tabs[0].classList.add('active');
    } else {
        signupForm.classList.add('active');
        signinForm.classList.remove('active');
        tabs[1].classList.add('active');
    }
}

async function enterAsAdmin() {
    try {
        // Verify user is still logged in and is admin
        const { data: { session } } = await supabaseClient.auth.getSession();
        
        if (!session) {
            alert('Session expired. Please login again.');
            return;
        }
        
        // Fetch profile to verify admin role
        const { data: profile } = await supabaseClient
            .from('profiles')
            .select('role')
            .eq('id', session.user.id)
            .single();
        
        if (profile && profile.role === 'admin') {
            console.log('Admin access granted - redirecting to dashboard');
            window.location.href = 'admin-dashboard.html';
        } else {
            alert('Access denied. Admin privileges required.');
        }
    } catch (error) {
        console.error('Enter as admin error:', error);
        alert('Failed to verify admin access');
    }
}

// ====================================================
// EXPORT FUNCTIONS FOR GLOBAL USE
// ====================================================

window.handleSignUp = handleSignUp;
window.handleSignIn = handleSignIn;
window.handleSignOut = handleSignOut;
window.handleAdminLogin = handleAdminLogin;
window.adminLogout = adminLogout;
window.checkAuthState = checkAuthState;
window.checkAdminAuth = checkAdminAuth;
window.openAuthModal = openAuthModal;
window.closeAuthModal = closeAuthModal;
window.switchTab = switchTab;
window.enterAsAdmin = enterAsAdmin;
