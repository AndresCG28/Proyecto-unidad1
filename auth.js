// Supabase Configuration
// IMPORTANT: Please replace these with your actual Supabase URL and Anon Key
const SUPABASE_URL = 'https://pecnbctcfvdhfrfazhdu.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBlY25iY3RjZnZkaGZyZmF6aGR1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzIwNzAxMDMsImV4cCI6MjA4NzY0NjEwM30.gykIgWPBsxoFwmE8Ce9MnzoMSjWLYRw7QslBDrnIM-0';

// Initialize Supabase client
let supabaseClient;
try {
    supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    console.log("Supabase client initialized successfully");
} catch (e) {
    console.error("Error initializing Supabase:", e);
    alert("Error crítico: No se pudo conectar con Supabase. Verifica tu conexión o las llaves en auth.js.");
}

// Auth UI Logic
function toggleAuthForms() {
    const loginForm = document.getElementById('login-form');
    const signupForm = document.getElementById('signup-form');
    if (loginForm.style.display === 'none') {
        loginForm.style.display = 'block';
        signupForm.style.display = 'none';
    } else {
        loginForm.style.display = 'none';
        signupForm.style.display = 'block';
    }
}

// Signup Handler
const signupForm = document.getElementById('signup-form-inner');
if (signupForm) {
    signupForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        console.log("Formulario de registro enviado");

        const email = document.getElementById('signup-email').value;
        const password = document.getElementById('signup-password').value;

        if (!email || !password) {
            alert("Por favor, completa todos los campos.");
            return;
        }

        try {
            console.log("Intentando registrar en Supabase...");
            const { data, error } = await supabaseClient.auth.signUp({
                email,
                password,
            });

            if (error) {
                console.error("Error de Supabase Auth:", error);
                alert('Error en el registro: ' + error.message);
            } else {
                console.log("Registro exitoso:", data);
                alert('¡Registro exitoso! Revisa tu email para confirmar o intenta iniciar sesión si la confirmación está desactivada.');
                toggleAuthForms();
            }
        } catch (err) {
            console.error("Excepción en el registro:", err);
            alert("Ocurrió un error inesperado al intentar registrarse.");
        }
    });
} else {
    console.error("No se encontró el formulario signup-form-inner");
}

// Login Handler
document.getElementById('login-form-inner').addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = document.getElementById('login-email').value;
    const password = document.getElementById('login-password').value;

    const { data, error } = await supabaseClient.auth.signInWithPassword({
        email,
        password,
    });

    if (error) {
        alert('Error al iniciar sesión: ' + error.message);
    } else {
        showApp(data.user);
    }
});

// Logout Handler
async function handleLogout() {
    const { error } = await supabaseClient.auth.signOut();
    if (error) {
        alert('Error al cerrar sesión: ' + error.message);
    } else {
        showAuth();
    }
}

// Session Management
async function checkSession() {
    const { data: { session } } = await supabaseClient.auth.getSession();
    if (session) {
        showApp(session.user);
    } else {
        showAuth();
    }
}

function showApp(user) {
    document.getElementById('auth-container').style.display = 'none';
    document.getElementById('app-container').style.display = 'block';
    document.getElementById('user-email-display').textContent = user.email;
    initApp(user);
}

function showAuth() {
    document.getElementById('auth-container').style.display = 'flex';
    document.getElementById('app-container').style.display = 'none';
}

window.onload = checkSession;
