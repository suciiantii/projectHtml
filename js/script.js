(function () {
    // Mengecek apakah preferensi dark mode aktif di LocalStorage saat halaman pertama dimuat
    if (localStorage.getItem("dark-mode") === "true") {
        document.documentElement.classList.add("dark-mode");
    }
})();

// Fungsi untuk mengecek apakah pengguna sudah melakukan login
function sudahLogin() {
    return localStorage.getItem("akun") && localStorage.getItem("sudah-login") === "true";
}

// Fungsi proteksi halaman yang memerlukan login terlebih dahulu
function cekLogin() {
    // Jika belum login, tampilkan peringatan dan arahkan ke halaman login
    if (!sudahLogin()) {
        alert("Silakan login terlebih dahulu untuk mengakses fitur ini ♡");
        if (window.location.pathname.includes("/html/")) {
            window.location.href = "login.html";
        } else {
            window.location.href = "html/login.html";
        }
        return false;
    }
    return true;
}

// Fungsi untuk memformat angka menjadi mata uang Rupiah
function formatRupiah(harga) {
    return new Intl.NumberFormat("id-ID", {
        style: "currency",
        currency: "IDR",
        maximumFractionDigits: 0
    }).format(harga);
}

// Fungsi untuk menampilkan simbol bintang dan rating produk
function buatBintang(rating) {
    return "★ " + rating;
}

// Fungsi untuk mengambil data stok produk dari override LocalStorage jika ada
function ambilStock(produk) {
    const stockData = JSON.parse(localStorage.getItem("stock-overrides")) || {};
    return stockData[produk.id] !== undefined ? stockData[produk.id] : produk.stock;
}

// Fungsi untuk memperbarui angka jumlah item pada ikon keranjang
function updateCartCount() {
    const cart = JSON.parse(localStorage.getItem("cart")) || [];
    let jumlah = 0;
    cart.forEach(function (item) {
        jumlah += item.quantity || 1;
    });
    const cartCount = document.getElementById("cart-count");
    if (cartCount) {
        cartCount.textContent = jumlah;
    }
}

// Variabel status untuk mode edit alamat di dalam profil
let isEditingAddressInProfile = false;

// Event listener utama ketika dokumen HTML selesai dimuat
document.addEventListener("DOMContentLoaded", function () {
    // Memperbarui jumlah keranjang saat halaman siap
    updateCartCount();

    // ==========================================================================
    // TOMBOL TOGGLE DARK MODE (matahari / bulan)
    // ==========================================================================
    const darkModeToggle = document.getElementById("dark-mode-toggle");

    // Fungsi untuk memperbarui ikon tombol dark mode sesuai kondisi aktif
    function perbaruiIkonDarkMode() {
        if (!darkModeToggle) return;
        const iconEl = darkModeToggle.querySelector(".material-symbols-outlined");
        const aktif = document.documentElement.classList.contains("dark-mode");
        if (iconEl) {
            iconEl.textContent = aktif ? "light_mode" : "dark_mode";
        }
        darkModeToggle.title = aktif ? "Mode Terang" : "Mode Gelap";
    }

    // Menjalankan fungsi pembaruan ikon saat awal muat
    perbaruiIkonDarkMode();

    // Event listener saat tombol dark mode diklik
    if (darkModeToggle) {
        darkModeToggle.addEventListener("click", function () {
            document.documentElement.classList.toggle("dark-mode");
            const aktif = document.documentElement.classList.contains("dark-mode");
            localStorage.setItem("dark-mode", aktif ? "true" : "false");
            perbaruiIkonDarkMode();
        });
    }

    // Mengatur visibilitas tombol login/register di header
    const loginRegisterBtn = document.getElementById("login-register-btn");
    if (loginRegisterBtn) {
        if (sudahLogin()) {
            loginRegisterBtn.style.display = "none";
        } else {
            loginRegisterBtn.style.display = "inline-flex";
        }
    }

    // Tombol kembali halaman sebelumnya
    const backBtn = document.getElementById("back-button");
    if (backBtn) {
        backBtn.addEventListener("click", function () {
            history.back();
        });
    }

    // Tombol navigasi menuju halaman keranjang
    const cartBtn = document.getElementById("cart-button");
    if (cartBtn) {
        cartBtn.addEventListener("click", function () {
            if (!cekLogin()) return;
            if (window.location.pathname.includes("/html/")) {
                window.location.href = "cart.html";
            } else {
                window.location.href = "html/cart.html";
            }
        });
    }

    // ==========================================================================
    // EVENT HANDLER PROFIL PENGGUNA LENGKAP (EDITABLE DATA)
    // ==========================================
    const profileBtn = document.getElementById("profile-button");
    let modeEditProfil = false; // Status apakah sedang dalam mode edit profil

    // Event listener saat tombol profil diklik untuk membuka modal profil
    if (profileBtn) {
        profileBtn.addEventListener("click", function () {
            if (!cekLogin()) return;

            const dataAkun = JSON.parse(localStorage.getItem("akun"));
            if (dataAkun) {
                // Mengisi teks statis nama dan username pada profil
                document.getElementById("profile-name").textContent = dataAkun.nama || dataAkun.username || "User";
                document.getElementById("profile-username").textContent = "@" + (dataAkun.username || "user");

                // Memasukkan data akun ke dalam elemen input formulir profil
                document.getElementById("profile-fullname").value = dataAkun.nama || "";
                document.getElementById("profile-email").value = dataAkun.email || "-";
                document.getElementById("profile-phone").value = dataAkun.telepon || dataAkun.hp || "";
                document.getElementById("profile-birthdate").value = dataAkun.tanggalLahir || "";
                document.getElementById("profile-gender").value = dataAkun.jenisKelamin || "";
                document.getElementById("profile-bio").value = dataAkun.bio || "";

                // Mengambil data alamat lengkap dengan memprioritaskan userAddress terbaru dari cart
                let alamatLengkap = "";
                const alamatSynced = localStorage.getItem("userAddress");

                if (alamatSynced) {
                    alamatLengkap = alamatSynced;
                } else if (dataAkun.detailAlamat && dataAkun.detailAlamat.alamatLengkap) {
                    alamatLengkap = dataAkun.detailAlamat.alamatLengkap;
                } else if (dataAkun.alamat) {
                    alamatLengkap = dataAkun.alamat;
                }
                document.getElementById("profile-address").value = alamatLengkap;
                // Memastikan pop-up selalu terbuka dalam mode terkunci (Read-Only) awal
                kunciSemuaForm(true);
            }

            // Menampilkan elemen pop-up profil
            const profilePopup = document.getElementById("profile-popup");
            if (profilePopup) profilePopup.classList.add("show");
        });
    }

    // Eksekusi Tombol Edit Utama Profil
    const btnEditProfileMain = document.getElementById("btn-edit-profile-main");
    if (btnEditProfileMain) {
        btnEditProfileMain.addEventListener("click", function () {
            if (!modeEditProfil) {
                // Membuka kunci form jika belum dalam mode edit
                kunciSemuaForm(false);
            } else {
                // Menyimpan data profil dan mengunci kembali form
                simpanDataProfilKeLocal();
                kunciSemuaForm(true);
            }
        });
    }

    // Fungsi Mengatur Lock/Unlock Input Form Profil tanpa innerHTML
    function kunciSemuaForm(isLocked) {
        modeEditProfil = !isLocked;

        // Daftar ID input teks yang akan diatur status readOnly-nya
        const inputsText = ["profile-fullname", "profile-phone", "profile-birthdate", "profile-bio", "profile-address"];
        inputsText.forEach(function (id) {
            const el = document.getElementById(id);
            if (el) el.readOnly = isLocked;
        });

        // Dropdown jenis kelamin menggunakan properti 'disabled'
        const elGender = document.getElementById("profile-gender");
        if (elGender) elGender.disabled = isLocked;

        // Mengubah teks dan ikon tombol utama menggunakan DOM API secara aman
        if (btnEditProfileMain) {
            while (btnEditProfileMain.firstChild) {
                btnEditProfileMain.removeChild(btnEditProfileMain.firstChild);
            }

            const spanTeks = document.createElement("span");
            spanTeks.id = "teks-edit-profile-main";

            if (isLocked) {
                btnEditProfileMain.appendChild(document.createTextNode("✏️ "));
                spanTeks.textContent = "Edit Profil";
            } else {
                btnEditProfileMain.appendChild(document.createTextNode("💾 "));
                spanTeks.textContent = "Simpan Profil";
            }
            btnEditProfileMain.appendChild(spanTeks);
        }

        // Fokus otomatis ke input nama saat tombol Edit ditekan
        if (!isLocked) {
            const inputNama = document.getElementById("profile-fullname");
            if (inputNama) inputNama.focus();
        }
    }

    // Fungsi Menyimpan Data Input Profil ke LocalStorage
    function simpanDataProfilKeLocal() {
        let akun = JSON.parse(localStorage.getItem("akun")) || {};

        // Mengambil nilai terbaru dari elemen input profil
        akun.nama = document.getElementById("profile-fullname").value.trim();
        akun.telepon = document.getElementById("profile-phone").value.trim();
        akun.tanggalLahir = document.getElementById("profile-birthdate").value;
        akun.jenisKelamin = document.getElementById("profile-gender").value;
        akun.bio = document.getElementById("profile-bio").value.trim();

        const alamatBaru = document.getElementById("profile-address").value.trim();
        akun.alamat = alamatBaru;
        if (!akun.detailAlamat) akun.detailAlamat = {};
        akun.detailAlamat.alamatLengkap = alamatBaru;

        // Menyimpan data ke objek akun dan key userAddress agar sinkron dengan cart.js
        localStorage.setItem("akun", JSON.stringify(akun));
        localStorage.setItem("userAddress", alamatBaru);
    }

    // ==========================================================================
    // TOGGLE EDIT ALAMAT PROFIL
    // ==========================================================================
    const btnEditAddress = document.getElementById("btn-edit-profile-address");
    if (btnEditAddress) {
        btnEditAddress.addEventListener("click", function () {
            const addressInput = document.getElementById("profile-address");
            const teksEdit = document.getElementById("teks-edit-profile-address");

            if (!isEditingAddressInProfile) {
                isEditingAddressInProfile = true;
                if (addressInput) {
                    addressInput.readOnly = false;
                    addressInput.focus();
                }
                if (teksEdit) teksEdit.textContent = "Simpan Alamat";
            } else {
                const newAddress = addressInput ? addressInput.value.trim() : "";

                if (newAddress === "") {
                    alert("Alamat pengiriman tidak boleh kosong.");
                    return;
                }

                const akun = JSON.parse(localStorage.getItem("akun")) || {};
                akun.alamat = newAddress;
                if (!akun.detailAlamat) akun.detailAlamat = {};
                akun.detailAlamat.alamatLengkap = newAddress;

                localStorage.setItem("akun", JSON.stringify(akun));
                localStorage.setItem("userAddress", newAddress);
                isEditingAddressInProfile = false;
                if (addressInput) addressInput.readOnly = true;
                if (teksEdit) teksEdit.textContent = "Edit Alamat";
            }
        });
    }

    // ==========================================================================
    // TOMBOL TUTUP, LOGOUT, & NAVIGASI (Ditempatkan di luar fungsi simpan agar responsif)
    // ==========================================================================

    // Tombol untuk menutup pop-up profil
    const closeProfileBtn = document.getElementById("close-profile");
    if (closeProfileBtn) {
        closeProfileBtn.addEventListener("click", function () {
            const profilePopup = document.getElementById("profile-popup");
            if (profilePopup) profilePopup.classList.remove("show");
        });
    }

    // Menutup pop-up ketika area luar modal diklik
    const profilePopupEl = document.getElementById("profile-popup");
    if (profilePopupEl) {
        profilePopupEl.addEventListener("click", function (e) {
            if (e.target.id === "profile-popup") {
                e.target.classList.remove("show");
            }
        });
    }

    // Tombol untuk keluar akun (logout)
    const logoutBtn = document.getElementById("logout-button");
    if (logoutBtn) {
        logoutBtn.addEventListener("click", function () {
            localStorage.removeItem("sudah-login");
            if (window.location.pathname.includes("/html/")) {
                window.location.href = "../index.html";
            } else {
                window.location.reload();
            }
        });
    }

    // Navigasi kartu kategori produk menuju halaman produk
    const categoryCards = document.querySelectorAll(".preview-card");
    categoryCards.forEach(function (card) {
        card.addEventListener("click", function () {
            const category = card.getAttribute("data-category");
            if (category) {
                localStorage.setItem("selected-category", category);
                if (window.location.pathname.includes("/html/")) {
                    window.location.href = "all-product.html";
                } else {
                    window.location.href = "html/all-product.html";
                }
            }
        });
    });
});