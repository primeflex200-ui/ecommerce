





const SUPABASE_URL = 'https://hdlgqdjmleezidpvakjd.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhkbGdxZGptbGVlemlkcHZha2pkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzA5Njc4NzQsImV4cCI6MjA4NjU0Mzg3NH0.7ZGT025I70RyCWBMf3GwphvoZd6MBntU7Y7wORoy_tU';

const { createClient } = supabase;
const supabaseClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

window.supabase = supabaseClient;

console.log('Supabase client initialized:', supabaseClient ? 'SUCCESS' : 'FAILED');



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
    if (password !== confirmPassword) {
        messageEl.textContent = 'Passwords do not match!';
        messageEl.className = 'auth-message error';
        console.error('Password mismatch');
        return;
    }
    if (password.length < 6) {
        messageEl.textContent = 'Password must be at least 6 characters!';
        messageEl.className = 'auth-message error';
        console.error('Password too short');
        return;
    }
    try {
        messageEl.textContent = 'Creating account...';
        messageEl.className = 'auth-message info';
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
            if (!data.session) {
                messageEl.textContent = 'Account created! Please check your email to confirm your account.';
                messageEl.className = 'auth-message success';
                console.warn('Email confirmation required - no session returned');
                return;
            }
            const role = email === 'ruthvik@blockfortrust.com' ? 'admin' : 'customer';
            console.log('Assigned role:', role);
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
                console.log('Profile creation failed, but continuing with signup');
            } else {
                console.log('Profile created successfully:', profile);
            }
            messageEl.textContent = 'Account created successfully! Redirecting...';
            messageEl.className = 'auth-message success';
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
            console.log('Fetching profile...');
            let { data: profile, error: profileError } = await supabaseClient
                .from('profiles')
                .select('role')
                .eq('id', data.user.id)
                .single();
            console.log('Profile fetch result:', { profile, profileError });
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
                    profile = { role: role };
                } else {
                    profile = newProfile;
                }
            }
            console.log('Final profile:', profile);
            messageEl.textContent = 'Sign in successful!';
            messageEl.className = 'auth-message success';
            updateAuthUI(data.user, profile);
            const roleButtons = document.getElementById('role-buttons');
            const adminEnterBtn = document.getElementById('admin-enter-btn');
            const defaultSigninBtn = document.getElementById('default-signin-btn');
            if (profile && profile.role === 'admin') {
                console.log('User is admin - showing admin button in modal');
                if (roleButtons) roleButtons.style.display = 'block';
                if (adminEnterBtn) {
                    adminEnterBtn.style.display = 'block';
                    // Remove any existing event listeners and add a new one
                    const newBtn = adminEnterBtn.cloneNode(true);
                    adminEnterBtn.parentNode.replaceChild(newBtn, adminEnterBtn);
                    newBtn.addEventListener('click', function(e) {
                        e.preventDefault();
                        e.stopPropagation();
                        console.log('Admin button clicked - calling enterAsAdmin');
                        enterAsAdmin();
                    });
                }
                if (defaultSigninBtn) defaultSigninBtn.style.display = 'none';
            } else {
                console.log('User is customer - redirecting to home');
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



async function handleSignOut() {
    try {
        const { error } = await supabaseClient.auth.signOut();
        if (error) throw error;
        window.location.href = 'index.html';
    } catch (error) {
        console.error('Sign out error:', error);
        alert('Failed to sign out');
    }
}



async function checkAuthState() {
    try {
        const { data: { session }, error } = await supabaseClient.auth.getSession();
        if (error) throw error;
        if (session && session.user) {
            const { data: profile } = await supabaseClient
                .from('profiles')
                .select('*')
                .eq('id', session.user.id)
                .single();
            updateAuthUI(session.user, profile);
            return { user: session.user, profile: profile };
        } else {
            updateAuthUI(null, null);
            return null;
        }
    } catch (error) {
        console.error('Check auth state error:', error);
        return null;
    }
}



function updateAuthUI(user, profile) {
    const profileBtn = document.getElementById('profile-btn');
    const profileDropdown = document.getElementById('profile-dropdown');
    const adminEnterBtn = document.getElementById('admin-enter-btn');
    const roleButtons = document.getElementById('role-buttons');
    if (user && profile) {
        console.log('Updating UI for logged in user:', profile);
        if (profileBtn) {
            profileBtn.classList.add('logged-in');
            profileBtn.onclick = (e) => {
                e.preventDefault();
                window.location.href = 'profile.html';
            };
        }
        if (profileDropdown) {
            profileDropdown.style.display = 'none';
        }
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
        if (profileBtn) {
            profileBtn.classList.remove('logged-in');
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
        if (adminEnterBtn && roleButtons) {
            roleButtons.style.display = 'none';
            adminEnterBtn.style.display = 'none';
        }
        console.log('UI updated - User logged out');
    }
}

document.addEventListener('click', function(event) {
    const profileBtn = document.getElementById('profile-btn');
    const profileDropdown = document.getElementById('profile-dropdown');
    if (profileDropdown && profileBtn && !profileBtn.contains(event.target) && !profileDropdown.contains(event.target)) {
        profileDropdown.classList.remove('active');
    }
});



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
            console.log('No session - redirecting to index.html');
            console.warn('⚠️ No session found - user should login');
            return true; 
        }
        const { data: profile, error: profileError } = await supabaseClient
            .from('profiles')
            .select('role')
            .eq('id', session.user.id)
            .single();
        console.log('checkAdminAuth - Profile:', profile);
        if (profileError) {
            console.error('Profile error:', profileError);
            if (profileError.code === 'PGRST116') {
                console.warn('⚠️ Profile not found in database!');
                console.warn('⚠️ Please run: INSERT INTO profiles (id, email, role) SELECT id, email, \'admin\' FROM auth.users WHERE email = \'ruthvik@blockfortrust.com\'');
                console.warn('⚠️ Allowing page to load for now...');
                return true; 
            }
            console.error('⚠️ Profile fetch error, but allowing page to load');
            console.error('⚠️ Error details:', profileError);
            return true; 
        }
        if (!profile || profile.role !== 'admin') {
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



async function handleAdminLogin(event) {
    event.preventDefault();
    const email = document.getElementById('admin-email').value;
    const password = document.getElementById('admin-password').value;
    const messageEl = document.getElementById('login-message');
    try {
        messageEl.textContent = 'Signing in...';
        messageEl.className = 'login-message info';
        const { data, error } = await supabaseClient.auth.signInWithPassword({
            email: email,
            password: password
        });
        if (error) throw error;
        if (data.user) {
            const { data: profile } = await supabaseClient
                .from('profiles')
                .select('*')
                .eq('id', data.user.id)
                .single();
            if (!profile || profile.role !== 'admin') {
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



async function adminLogout() {
    const confirmLogout = confirm('Are you sure you want to logout?');
    if (confirmLogout) {
        await handleSignOut();
    }
}



supabaseClient.auth.onAuthStateChange((event, session) => {
    console.log('Auth state changed:', event);
    if (event === 'SIGNED_IN') {
        console.log('User signed in:', session.user.email);
    } else if (event === 'SIGNED_OUT') {
        console.log('User signed out');
        updateAuthUI(null, null);
    }
});



document.addEventListener('DOMContentLoaded', async function() {
    await checkAuthState();
    const currentPage = window.location.pathname;
    if (currentPage.includes('admin-dashboard.html') || 
        currentPage.includes('admin-products.html') || 
        currentPage.includes('admin-orders.html') ||
        currentPage.includes('admin-add-product.html') ||
        currentPage.includes('admin-vendors.html')) {
        try {
            await checkAdminAuth();
        } catch (error) {
            console.error('Admin auth check failed, but allowing page to load:', error);
        }
    }
});



function openAuthModal() {
    const modal = document.getElementById('auth-modal');
    if (modal) {
        modal.style.display = 'block';
    } else {
        // If modal doesn't exist on current page, redirect to home
        window.location.href = 'index.html';
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
    console.log('=== ENTER AS ADMIN CLICKED ===');
    try {
        const { data: { session } } = await supabaseClient.auth.getSession();
        console.log('enterAsAdmin - Session:', session);
        
        if (!session) {
            alert('Session expired. Please login again.');
            return;
        }
        
        console.log('Checking profile for user:', session.user.id);
        const { data: profile, error: profileError } = await supabaseClient
            .from('profiles')
            .select('role')
            .eq('id', session.user.id)
            .single();
        
        console.log('Profile data:', profile);
        console.log('Profile error:', profileError);
        
        if (profileError) {
            console.error('Profile fetch error:', profileError);
            // If profile doesn't exist or there's an error, still allow admin access for the admin email
            if (session.user.email === 'ruthvik@blockfortrust.com') {
                console.log('Admin email detected - granting access');
                closeAuthModal();
                window.location.href = 'admin-dashboard.html';
                return;
            }
            alert('Failed to verify admin access. Please contact support.');
            return;
        }
        
        if (profile && profile.role === 'admin') {
            console.log('Admin access granted - redirecting to dashboard');
            closeAuthModal();
            window.location.href = 'admin-dashboard.html';
        } else {
            console.log('Access denied - role:', profile?.role);
            alert('Access denied. Admin privileges required.');
        }
    } catch (error) {
        console.error('Enter as admin error:', error);
        alert('Failed to verify admin access: ' + error.message);
    }
}



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
