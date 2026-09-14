// ==========================================
// DATA WILAYAH INDONESIA & KODE POS
// ==========================================
const dataWilayah = {
    "DKI Jakarta": {
        "Jakarta Selatan": { "Kebayoran Baru": "12110", "Cilandak": "12430", "Tebet": "12810" },
        "Jakarta Pusat": { "Gambir": "10110", "Menteng": "10310", "Tanah Abang": "10210" }
    },
    "Jawa Barat": {
        "Kota Bandung": { "Coblong": "40132", "Sumur Bandung": "40111", "Cicendo": "40171" },
        "Kota Bogor": { "Bogor Tengah": "16121", "Bogor Utara": "16151" }
    },
    "Jawa Tengah": {
        "Kota Semarang": { "Semarang Tengah": "50131", "Banyumanik": "50261" },
        "Kota Surakarta": { "Banjarsari": "57131", "Jebres": "57126" }
    },
    "Jawa Timur": {
        "Kota Surabaya": { "Tegalsari": "60261", "Gubeng": "60281" },
        "Kota Malang": { "Klojen": "65111", "Lowokwaru": "65141" }
    },
    "Sumatera Utara": {
        "Kota Medan": { "Medan Kota": "20211", "Medan Petisah": "20111" }
    }
};

// Mengambil data keranjang dan item yang dipilih dari LocalStorage
let keranjang = JSON.parse(localStorage.getItem("cart")) || [];
let idTerpilih = JSON.parse(localStorage.getItem("checkout-now")) || [];
localStorage.removeItem("checkout-now"); 

let modeEditAlamat = false;

// ==========================================
// INISIALISASI DROPDOWN ALAMAT
// ==========================================
function inisialisasiDropdownAlamat() {
    const elemenProvinsi = document.getElementById("provinsi");
    const elemenKota = document.getElementById("kota");
    const elemenKecamatan = document.getElementById("kecamatan");
    const elemenKodePos = document.getElementById("kode-pos");

    if (!elemenProvinsi) return;

    // Memasukkan daftar provinsi ke dalam elemen select provinsi
    Object.keys(dataWilayah).forEach(function(namaProvinsi) {
        const opsi = document.createElement("option");
        opsi.value = namaProvinsi;
        opsi.textContent = namaProvinsi;
        elemenProvinsi.appendChild(opsi);
    });

    // Event listener saat provinsi dipilih untuk memperbarui daftar kota
    elemenProvinsi.addEventListener("change", function() {
        isiOpsiKota(elemenProvinsi.value);
    });

    // Event listener saat kota dipilih untuk memperbarui daftar kecamatan
    elemenKota.addEventListener("change", function() {
        isiOpsiKecamatan(elemenProvinsi.value, elemenKota.value);
    });

    // Event listener saat kecamatan dipilih untuk mengisi kode pos secara otomatis
    elemenKecamatan.addEventListener("change", function() {
        const provinsiPilihan = elemenProvinsi.value;
        const kotaPilihan = elemenKota.value;
        const kecamatanPilihan = elemenKecamatan.value;

        if (provinsiPilihan && kotaPilihan && kecamatanPilihan && dataWilayah[provinsiPilihan][kotaPilihan][kecamatanPilihan]) {
            elemenKodePos.value = dataWilayah[provinsiPilihan][kotaPilihan][kecamatanPilihan];
        } else {
            elemenKodePos.value = "";
        }
    });
}

// Mengisi opsi kota berdasarkan provinsi yang dipilih
function isiOpsiKota(provinsiPilihan, selectedKota = "") {
    const elemenKota = document.getElementById("kota");
    const elemenKecamatan = document.getElementById("kecamatan");
    const elemenKodePos = document.getElementById("kode-pos");

    while (elemenKota.firstChild) elemenKota.removeChild(elemenKota.firstChild);
    const opsiKotaDefault = document.createElement("option");
    opsiKotaDefault.value = "";
    opsiKotaDefault.textContent = "Pilih Kota / Kabupaten";
    elemenKota.appendChild(opsiKotaDefault);

    while (elemenKecamatan.firstChild) elemenKecamatan.removeChild(elemenKecamatan.firstChild);
    const opsiKecamatanDefault = document.createElement("option");
    opsiKecamatanDefault.value = "";
    opsiKecamatanDefault.textContent = "Pilih Kecamatan";
    elemenKecamatan.appendChild(opsiKecamatanDefault);

    if (elemenKodePos) elemenKodePos.value = "";

    if (provinsiPilihan && dataWilayah[provinsiPilihan]) {
        Object.keys(dataWilayah[provinsiPilihan]).forEach(function(namaKota) {
            const opsi = document.createElement("option");
            opsi.value = namaKota;
            opsi.textContent = namaKota;
            if (namaKota === selectedKota) opsi.selected = true;
            elemenKota.appendChild(opsi);
        });
    }
}

// Mengisi opsi kecamatan berdasarkan kota yang dipilih
function isiOpsiKecamatan(provinsiPilihan, kotaPilihan, selectedKecamatan = "") {
    const elemenKecamatan = document.getElementById("kecamatan");
    const elemenKodePos = document.getElementById("kode-pos");

    while (elemenKecamatan.firstChild) elemenKecamatan.removeChild(elemenKecamatan.firstChild);
    const opsiKecamatanDefault = document.createElement("option");
    opsiKecamatanDefault.value = "";
    opsiKecamatanDefault.textContent = "Pilih Kecamatan";
    elemenKecamatan.appendChild(opsiKecamatanDefault);

    if (elemenKodePos) elemenKodePos.value = "";

    if (provinsiPilihan && kotaPilihan && dataWilayah[provinsiPilihan][kotaPilihan]) {
        Object.keys(dataWilayah[provinsiPilihan][kotaPilihan]).forEach(function(namaKecamatan) {
            const opsi = document.createElement("option");
            opsi.value = namaKecamatan;
            opsi.textContent = namaKecamatan;
            if (namaKecamatan === selectedKecamatan) opsi.selected = true;
            elemenKecamatan.appendChild(opsi);
        });
    }
}

// ==========================================
// RENDER & MANAJEMEN KERANJANG BELANJA
// ==========================================
function tampilkanKeranjang() {
    const elemenDaftar = document.getElementById("daftar-keranjang");
    const elemenKotakPilihSemua = document.getElementById("kotak-pilih-semua");
    const elemenCentangPilihSemua = document.getElementById("centang-pilih-semua");
    
    while (elemenDaftar.firstChild) {
        elemenDaftar.removeChild(elemenDaftar.firstChild);
    }
    
    // Tampilan jika keranjang kosong
    if (keranjang.length === 0) {
        if (elemenKotakPilihSemua) elemenKotakPilihSemua.style.display = "none";
        
        const elemenKosong = document.createElement("div");
        elemenKosong.className = "keranjang-kosong";
        elemenKosong.textContent = "Keranjang kamu masih kosong ♡";
        elemenDaftar.appendChild(elemenKosong);
        
        perbaruiRingkasan();
        return;
    }
    
    if (elemenKotakPilihSemua) elemenKotakPilihSemua.style.display = "flex";

    // Loop untuk menampilkan setiap item di dalam keranjang
    keranjang.forEach(function(item) {
        const kotakItem = document.createElement("div");
        kotakItem.className = "item-keranjang";

        // Tombol hapus item dari keranjang
        const tombolHapus = document.createElement("button");
        tombolHapus.className = "tombol-hapus";
        tombolHapus.title = "Hapus produk";
        tombolHapus.addEventListener("click", function() {
            hapusItem(item.id);
        });

        // Pembuatan elemen ikon SVG untuk tombol hapus
        const nsSvg = "http://www.w3.org/2000/svg";
        const svg = document.createElementNS(nsSvg, "svg");
        svg.setAttribute("width", "18");
        svg.setAttribute("height", "18");
        svg.setAttribute("viewBox", "0 0 24 24");
        svg.setAttribute("fill", "none");
        svg.setAttribute("stroke", "currentColor");
        svg.setAttribute("stroke-width", "2");

        const garislurus = document.createElementNS(nsSvg, "polyline");
        garislurus.setAttribute("points", "3 6 5 6 21 6");

        const jalur = document.createElementNS(nsSvg, "path");
        jalur.setAttribute("d", "M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2");

        svg.appendChild(garislurus);
        svg.appendChild(jalur);
        tombolHapus.appendChild(svg);
        kotakItem.appendChild(tombolHapus);

        // Checkbox untuk memilih produk yang akan dicheckout
        const centang = document.createElement("input");
        centang.type = "checkbox";
        centang.className = "centang-keranjang";
        centang.checked = idTerpilih.includes(item.id);
        centang.addEventListener("change", function(e) {
            alihCentang(e.target, item.id);
        });
        kotakItem.appendChild(centang);

        // Gambar produk
        const kotakGambar = document.createElement("div");
        kotakGambar.className = "gambar-item-keranjang";
        const gambar = document.createElement("img");
        gambar.src = item.image;
        gambar.alt = item.name;
        kotakGambar.appendChild(gambar);
        kotakItem.appendChild(kotakGambar);

        // Detail nama, harga, dan tombol kuantitas produk
        const kotakDetail = document.createElement("div");
        kotakDetail.className = "detail-item-keranjang";

        const judulProduk = document.createElement("h3");
        judulProduk.className = "nama-item-keranjang";
        judulProduk.textContent = item.name;

        const hargaProduk = document.createElement("p");
        hargaProduk.className = "harga-item-keranjang";
        hargaProduk.textContent = formatRupiah(item.price);

        const kotakJumlah = document.createElement("div");
        kotakJumlah.className = "kotak-jumlah";

        const tombolKurang = document.createElement("button");
        tombolKurang.textContent = "-";
        tombolKurang.addEventListener("click", function() {
            kurangJumlah(item.id);
        });

        const teksJumlah = document.createElement("span");
        teksJumlah.textContent = item.quantity;

        const tombolTambah = document.createElement("button");
        tombolTambah.textContent = "+";
        tombolTambah.addEventListener("click", function() {
            tambahJumlah(item.id);
        });

        kotakJumlah.appendChild(tombolKurang);
        kotakJumlah.appendChild(teksJumlah);
        kotakJumlah.appendChild(tombolTambah);

        kotakDetail.appendChild(judulProduk);
        kotakDetail.appendChild(hargaProduk);
        kotakDetail.appendChild(kotakJumlah);
        kotakItem.appendChild(kotakDetail);

        elemenDaftar.appendChild(kotakItem);
    });

    if (elemenCentangPilihSemua) {
        elemenCentangPilihSemua.checked = keranjang.length > 0 && idTerpilih.length === keranjang.length;
    }

    perbaruiRingkasan();
}

// Mengatur status centang item satuan
function alihCentang(elemenCentang, id) {
    if (elemenCentang.checked) {
        if (!idTerpilih.includes(id)) idTerpilih.push(id);
    } else {
        idTerpilih = idTerpilih.filter(function(idItem) { return idItem !== id; });
    }
    
    const elemenCentangPilihSemua = document.getElementById("centang-pilih-semua");
    if (elemenCentangPilihSemua) {
        elemenCentangPilihSemua.checked = idTerpilih.length === keranjang.length;
    }

    perbaruiRingkasan();
}

// Event listener untuk tombol "Pilih Semua"
document.getElementById("centang-pilih-semua")?.addEventListener("change", function(e) {
    if (e.target.checked) {
        idTerpilih = keranjang.map(function(item) { return item.id; });
    } else {
        idTerpilih = [];
    }

    const daftarCentang = document.querySelectorAll(".daftar-keranjang .centang-keranjang");
    daftarCentang.forEach(function(cb) { cb.checked = e.target.checked; });

    perbaruiRingkasan();
});

// Menambah jumlah kuantitas produk
function tambahJumlah(id) {
    let item = keranjang.find(function(i) { return i.id === id; });
    if (item) {
        const stokTerhitung = item.stock !== undefined ? item.stock : 99;
        if (item.quantity < stokTerhitung) {
            item.quantity++;
            simpanDanRender();
        } else {
            alert("Stok produk tidak mencukupi.");
        }
    }
}

// Mengurangi jumlah kuantitas produk
function kurangJumlah(id) {
    let item = keranjang.find(function(i) { return i.id === id; });
    if (item) {
        if (item.quantity > 1) {
            item.quantity--;
            simpanDanRender();
        } else {
            hapusItem(id);
        }
    }
}

// Menghapus item tertentu dari keranjang
function hapusItem(id) {
    keranjang = keranjang.filter(function(item) { return item.id !== id; });
    idTerpilih = idTerpilih.filter(function(idItem) { return idItem !== id; });
    simpanDanRender();
}

// Menyimpan data keranjang terbaru ke LocalStorage dan merender ulang tampilan
function simpanDanRender() {
    localStorage.setItem("cart", JSON.stringify(keranjang));
    if (typeof updateCartCount === "function") updateCartCount();
    tampilkanKeranjang();
}

// Menghitung total harga produk yang dicentang
function hitungTotal() {
    let total = 0;
    keranjang.forEach(function(item) {
        if (idTerpilih.includes(item.id)) total += item.price * item.quantity;
    });
    return total;
}

// Memperbarui ringkasan total harga dan jumlah item terpilih
function perbaruiRingkasan() {
    let total = 0;
    let jumlahTerpilih = 0;
    
    keranjang.forEach(function(item) {
        if (idTerpilih.includes(item.id)) {
            total += item.price * item.quantity;
            jumlahTerpilih += item.quantity; 
        }
    });
    
    const elemenJumlah = document.getElementById("jumlah-terpilih");
    const elemenTotal = document.getElementById("total-keranjang");

    if (elemenJumlah) elemenJumlah.textContent = jumlahTerpilih;
    if (elemenTotal) elemenTotal.textContent = formatRupiah(total);
}

// ==========================================
// SINKRONISASI & MANAJEMEN ALAMAT
// ==========================================

// Memuat data alamat tersimpan dari LocalStorage (SINKRONISASI UTAMA PROFIL & KERANJANG)
function muatAlamatTersimpan() {
    const akun = JSON.parse(localStorage.getItem("akun"));
    const namaInput = document.getElementById("nama-penerima");
    const telpInput = document.getElementById("telepon-penerima");
    const alamatInput = document.getElementById("alamat-lengkap");
    const elemenProvinsi = document.getElementById("provinsi");
    const elemenKodePos = document.getElementById("kode-pos");

    // Mengambil alamat dari kunci userAddress (sinkronisasi profil) atau objek akun
    const alamatSynced = localStorage.getItem("userAddress");

    if (akun) {
        const detail = akun.detailAlamat || {};
        
        if (namaInput) namaInput.value = detail.namaPenerima || akun.nama || "";
        if (telpInput) telpInput.value = detail.telepon || akun.telepon || "";
        
        // Memprioritaskan pembacaan dari userAddress yang terhubung langsung ke profil
        if (alamatInput) alamatInput.value = alamatSynced || detail.alamatLengkap || akun.alamat || "";

        if (detail.provinsi && elemenProvinsi) {
            elemenProvinsi.value = detail.provinsi;
            isiOpsiKota(detail.provinsi, detail.kota);
            if (detail.kota) {
                isiOpsiKecamatan(detail.provinsi, detail.kota, detail.kecamatan);
            }
        }
        
        if (elemenKodePos && detail.kodePos) {
            elemenKodePos.value = detail.kodePos;
        }

        // Mengunci formulir jika data nama dan alamat sudah lengkap tersedia
        if ((detail.namaPenerima || akun.nama) && (detail.alamatLengkap || akun.alamat || alamatSynced)) {
            kunciFormulirAlamat(true);
        } else {
            kunciFormulirAlamat(false);
        }
    }
}

// Mengatur status kunci atau edit pada formulir alamat pengiriman
function kunciFormulirAlamat(kunci) {
    const namaInput = document.getElementById("nama-penerima");
    const telpInput = document.getElementById("telepon-penerima");
    const alamatInput = document.getElementById("alamat-lengkap");
    const barisDrop1 = document.getElementById("baris-dropdown-1");
    const barisDrop2 = document.getElementById("baris-dropdown-2");
    const teksTombolEdit = document.getElementById("teks-tombol-edit");

    modeEditAlamat = !kunci;

    if (kunci) {
        if (namaInput) namaInput.readOnly = true;
        if (telpInput) telpInput.readOnly = true;
        if (alamatInput) alamatInput.readOnly = true;
        if (barisDrop1) barisDrop1.style.display = "none";
        if (barisDrop2) barisDrop2.style.display = "none";
        if (teksTombolEdit) teksTombolEdit.textContent = "Edit";
    } else {
        if (namaInput) namaInput.readOnly = false;
        if (telpInput) telpInput.readOnly = false;
        if (alamatInput) alamatInput.readOnly = false;
        if (barisDrop1) barisDrop1.style.display = "grid";
        if (barisDrop2) barisDrop2.style.display = "grid";
        if (teksTombolEdit) teksTombolEdit.textContent = "Kunci";
    }
}

// Event listener untuk tombol edit alamat
document.getElementById("tombol-edit-alamat")?.addEventListener("click", function() {
    kunciFormulirAlamat(modeEditAlamat);
});

// ==========================================
// INTEGRASI QRIS & PROSES CHECKOUT
// ==========================================

// Mengambil data QRIS dari API pembayaran secara asynchronous
async function muatQrisDariApi(totalBayar, idTrans) {
    const elemenGambarQris = document.getElementById("gambar-qris-api");
    if (!elemenGambarQris) return;

    elemenGambarQris.alt = "Memuat QRIS LÉSCIA...";
    elemenGambarQris.src = ""; 

    try {
        const respons = await fetch("https://nexora-api-one.vercel.app/api/generate-qris", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                ref: idTrans,
                total: totalBayar
            })
        });

        if (!respons.ok) {
            throw new Error("Gagal mengambil data QRIS dari server");
        }

        const data = await respons.json();

        if (data && data.qrImage) {
            elemenGambarQris.src = data.qrImage;
            elemenGambarQris.alt = "QRIS Pembayaran " + idTrans;
        } else {
            throw new Error("Format data QRIS tidak valid");
        }
    } catch (error) {
        console.error(error);
        elemenGambarQris.alt = "Gagal memuat QRIS. Silakan coba metode lain.";
    }
}

// Eksekusi akhir ketika checkout berhasil dilakukan
function eksekusiCheckoutSukses() {
    const namaPenerima = document.getElementById("nama-penerima").value.trim();
    const telepon = document.getElementById("telepon-penerima").value.trim();
    const provinsi = document.getElementById("provinsi").value;
    const kota = document.getElementById("kota").value;
    const kecamatan = document.getElementById("kecamatan").value;
    const kodePos = document.getElementById("kode-pos").value.trim();
    const alamatLengkap = document.getElementById("alamat-lengkap").value.trim();

    const akun = JSON.parse(localStorage.getItem("akun")) || {};
    akun.detailAlamat = { namaPenerima, telepon, provinsi, kota, kecamatan, kodePos, alamatLengkap };
    akun.alamat = alamatLengkap;
    
    // Menyimpan pembaruan alamat ke objek akun DAN menyinkronkan langsung ke key userAddress (Modal Profil)
    localStorage.setItem("akun", JSON.stringify(akun));
    localStorage.setItem("userAddress", alamatLengkap);

    // Mengurangi stok produk yang berhasil dibeli
    let dataStok = JSON.parse(localStorage.getItem("stock-overrides")) || {};
    for (let i = 0; i < keranjang.length; i++) {
        let item = keranjang[i];
        if (idTerpilih.includes(item.id)) {
            const stokSekarang = dataStok[item.id] !== undefined ? dataStok[item.id] : item.stock;
            dataStok[item.id] = stokSekarang - item.quantity;
        }
    }
    localStorage.setItem("stock-overrides", JSON.stringify(dataStok));

    // Membersihkan item yang sudah dibeli dari keranjang
    keranjang = keranjang.filter(function(item) { return !idTerpilih.includes(item.id); });
    idTerpilih = [];
    simpanDanRender();

    kunciFormulirAlamat(true);
    alert("Terima kasih sudah berbelanja di LÉSCIA! Pesanan kamu sedang diproses ♡");
}

// Event listener utama untuk tombol checkout
document.getElementById("tombol-checkout")?.addEventListener("click", function() {
    if (idTerpilih.length === 0) return alert("Pilih barang yang ingin kamu checkout.");
    
    const namaPenerima = document.getElementById("nama-penerima").value.trim();
    const telepon = document.getElementById("telepon-penerima").value.trim();
    const alamatLengkap = document.getElementById("alamat-lengkap").value.trim();
    
    if (!/^\d+$/.test(telepon)) return alert("Nomor telepon harus diisi dengan angka!");
    if (!namaPenerima || !telepon || !alamatLengkap) return alert("Harap lengkapi semua bidang alamat pengiriman!");
    
    const metodePembayaran = document.getElementById("metode-pembayaran").value;
    if (metodePembayaran === "") return alert("Silakan pilih metode pembayaran.");

    // Jika metode pembayaran menggunakan QRIS, buka modal QRIS
    if (metodePembayaran === "QRIS") {
        const totalBayar = hitungTotal();
        const idTrans = "LES-" + Date.now().toString().slice(-6);

        document.getElementById("total-nominal-qris").textContent = formatRupiah(totalBayar);
        document.getElementById("id-transaksi-qris").textContent = "ID-TRX: " + idTrans;
        
        muatQrisDariApi(totalBayar, idTrans);
        document.getElementById("modal-qris").classList.add("tampil");
        return;
    }

    eksekusiCheckoutSukses();
});

// Event listener untuk menutup modal QRIS
document.getElementById("tutup-qris")?.addEventListener("click", function() {
    document.getElementById("modal-qris").classList.remove("tampil");
});

// Event listener untuk konfirmasi pembayaran QRIS selesai
document.getElementById("tombol-konfirmasi-qris")?.addEventListener("click", function() {
    document.getElementById("modal-qris").classList.remove("tampil");
    eksekusiCheckoutSukses();
});

// ==========================================
// EVENT LISTENER UTAMA SAAT HALAMAN DIMUAT
// ==========================================
document.addEventListener("DOMContentLoaded", function() {
    const tombolKembali = document.getElementById("tombol-kembali");
    if (tombolKembali) {
        tombolKembali.addEventListener("click", function() {
            window.location.href = "../index.html";
        });
    }

    inisialisasiDropdownAlamat();
    tampilkanKeranjang();
    muatAlamatTersimpan();
    

    // SINKRONISASI REAL-TIME: Memperbarui key userAddress otomatis saat alamat diketik di halaman keranjang[cite: 1]
    const alamatLengkapInput = document.getElementById("alamat-lengkap");
    if (alamatLengkapInput) {
        const sinkronkanAlamatKeranjang = function(e) {
            const alamatBaru = e.target.value.trim();
            if (alamatBaru === "") return;

            // 1. Simpan ke key userAddress
            localStorage.setItem("userAddress", alamatBaru);

            // 2. Perbarui objek akun utama agar langsung sinkron dengan profil
            let akun = JSON.parse(localStorage.getItem("akun")) || {};
            akun.alamat = alamatBaru;
            if (!akun.detailAlamat) akun.detailAlamat = {};
            akun.detailAlamat.alamatLengkap = alamatBaru;
            localStorage.setItem("akun", JSON.stringify(akun));
        };

        // Menjalankan fungsi sinkronisasi saat diketik maupun saat kursor pindah (blur)
        alamatLengkapInput.addEventListener("input", sinkronkanAlamatKeranjang);
        alamatLengkapInput.addEventListener("blur", sinkronkanAlamatKeranjang);
    }

    // SINKRONISASI REAL-TIME: Nama penerima & nomor telepon di form checkout
    // langsung memperbarui data akun (profil) begitu diketik/diubah.
    const namaPenerimaInput = document.getElementById("nama-penerima");
    if (namaPenerimaInput) {
        const sinkronkanNamaKeranjang = function(e) {
            const namaBaru = e.target.value.trim();
            if (namaBaru === "") return;

            let akun = JSON.parse(localStorage.getItem("akun")) || {};
            akun.nama = namaBaru;
            if (!akun.detailAlamat) akun.detailAlamat = {};
            akun.detailAlamat.namaPenerima = namaBaru;
            localStorage.setItem("akun", JSON.stringify(akun));
        };

        namaPenerimaInput.addEventListener("input", sinkronkanNamaKeranjang);
        namaPenerimaInput.addEventListener("blur", sinkronkanNamaKeranjang);
    }

    const teleponPenerimaInput = document.getElementById("telepon-penerima");
    if (teleponPenerimaInput) {
        const sinkronkanTeleponKeranjang = function(e) {
            const teleponBaru = e.target.value.trim();
            if (teleponBaru === "") return;

            let akun = JSON.parse(localStorage.getItem("akun")) || {};
            akun.telepon = teleponBaru;
            if (!akun.detailAlamat) akun.detailAlamat = {};
            akun.detailAlamat.telepon = teleponBaru;
            localStorage.setItem("akun", JSON.stringify(akun));
        };

        teleponPenerimaInput.addEventListener("input", sinkronkanTeleponKeranjang);
        teleponPenerimaInput.addEventListener("blur", sinkronkanTeleponKeranjang);
    }
});