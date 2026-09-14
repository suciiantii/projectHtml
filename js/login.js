// Toggle dari Tampilan Login ke Register
document.getElementById("bukaDaftar")?.addEventListener("click", function() {
    document.getElementById("login").classList.add("sembunyi");
    document.getElementById("register").classList.remove("sembunyi");
});

// Toggle dari Tampilan Register Kembali ke Login
document.getElementById("kembali")?.addEventListener("click", function() {
    document.getElementById("register").classList.add("sembunyi");
    document.getElementById("login").classList.remove("sembunyi");
});

// Proses Register (Pendaftaran Akun Baru)
document.getElementById("registerForm")?.addEventListener("submit", function(event) {
    event.preventDefault();
    
    const nama = document.getElementById("nama").value.trim();
    const email = document.getElementById("emailDaftar").value.trim();
    const password = document.getElementById("passwordDaftar").value;
    const konfirmasi = document.getElementById("konfirmasi").value;
    
    // Validasi kecocokan password
    if (password !== konfirmasi) {
        document.getElementById("pesanDaftar").textContent = "Password dan konfirmasi tidak sama.";
        return;
    }
    
    // Simpan data akun ke Local Storage
    localStorage.setItem("akun", JSON.stringify({ nama: nama, email: email, password: password }));
    alert("Akun berhasil dibuat. Silakan login.");
    
    // Mengembalikan ke tampilan login dan mengisi email secara otomatis
    document.getElementById("register").classList.add("sembunyi");
    document.getElementById("login").classList.remove("sembunyi");
    document.getElementById("email").value = email;
    document.getElementById("password").value = "";
    document.getElementById("registerForm").reset();
});

// Proses Autentikasi Login Pengguna
document.getElementById("loginForm")?.addEventListener("submit", function(event) {
    event.preventDefault();
    
    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value;
    const pesan = document.getElementById("pesan");
    
    const dataAkun = localStorage.getItem("akun");
    if (!dataAkun) {
        pesan.textContent = "Kamu belum memiliki akun. Silakan daftar.";
        return;
    }
    
    const akun = JSON.parse(dataAkun);
    
    // Memeriksa kebenaran email dan password
    if (email === akun.email && password === akun.password) {
        localStorage.setItem("sudah-login", "true");
        alert("Login berhasil!");
        
        // Mengarahkan kembali ke halaman utama index.html
        window.location.href = "../index.html"; 
    } else {
        pesan.textContent = "Email atau password salah.";
    }
});