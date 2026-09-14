const API_URL = "https://lesi-api-new.vercel.app/product.json";
let semuaProduk = [];
let kategoriAktif = "all";
let keywordAktif = "";
let produkTerpilih = null;
let sizeTerpilih = null;

const PRODUK_PER_HALAMAN = 15;
let halamanAktif = 1;

function ambilProduk() {
    fetch(API_URL)
        .then(function(response) {
            return response.json();
        })
        .then(function(data) {
            semuaProduk = data;
            
            const kategori = localStorage.getItem("selected-category");
            const keyword = localStorage.getItem("search-keyword");
            
            if (kategori) {
                kategoriAktif = kategori.toLowerCase();
                localStorage.removeItem("selected-category");
                
                document.querySelectorAll(".category-filter").forEach(function(b) {
                    b.classList.remove("active");
                    if (b.getAttribute("data-category") === kategoriAktif) {
                        b.classList.add("active");
                    }
                });
            }
            
            if (keyword) {
                keywordAktif = keyword;
                const searchInput = document.getElementById("product-search");
                if (searchInput) {
                    searchInput.value = keyword;
                }
                localStorage.removeItem("search-keyword");
            }
            
            halamanAktif = 1;
            tampilkanProduk();
        })
        .catch(function(error) {
            const grid = document.getElementById("product-grid");
            if (grid) {
                while (grid.firstChild) {
                    grid.removeChild(grid.firstChild);
                }
                const errorP = document.createElement("p");
                errorP.className = "empty-text";
                errorP.textContent = "Produk gagal dimuat.";
                grid.appendChild(errorP);
            }
        });
}

// Menggabungkan filter kategori DAN kata kunci pencarian sekaligus,
// jadi kalau kategori "kebaya" aktif dan user mengetik "a", yang muncul
// hanya produk kebaya yang namanya mengandung huruf "a".
function ambilProdukTersaring() {
    let hasil = semuaProduk;
    
    if (kategoriAktif !== "all") {
        hasil = hasil.filter(function(p) {
            return p.category.toLowerCase() === kategoriAktif;
        });
    }
    
    const kata = keywordAktif.toLowerCase().trim();
    if (kata !== "") {
        hasil = hasil.filter(function(p) {
            return p.name.toLowerCase().includes(kata) || p.category.toLowerCase().includes(kata);
        });
    }
    
    return hasil;
}

function tampilkanProduk() {
    const grid = document.getElementById("product-grid");
    if (!grid) return;
    
    while (grid.firstChild) {
        grid.removeChild(grid.firstChild);
    }
    
    const produkTersaring = ambilProdukTersaring();
    
    if (produkTersaring.length === 0) {
        const emptyP = document.createElement("p");
        emptyP.className = "empty-text";
        emptyP.textContent = "Produk tidak ditemukan.";
        grid.appendChild(emptyP);
        tampilkanPagination(0);
        return;
    }
    
    const totalHalaman = Math.max(1, Math.ceil(produkTersaring.length / PRODUK_PER_HALAMAN));
    if (halamanAktif > totalHalaman) halamanAktif = totalHalaman;
    if (halamanAktif < 1) halamanAktif = 1;
    
    const mulai = (halamanAktif - 1) * PRODUK_PER_HALAMAN;
    const produkHalamanIni = produkTersaring.slice(mulai, mulai + PRODUK_PER_HALAMAN);
    
    produkHalamanIni.forEach(function(produk) {
        const card = document.createElement("article");
        card.className = "product-card";
        
        card.addEventListener("click", function() {
            bukaPopup(produk.id);
        });

        const imgDiv = document.createElement("div");
        imgDiv.className = "product-image";
        
        const img = document.createElement("img");
        img.src = produk.image;
        img.alt = produk.name;
        imgDiv.appendChild(img);

        const infoDiv = document.createElement("div");
        infoDiv.className = "product-info";

        const categoryP = document.createElement("p");
        categoryP.className = "product-category";
        categoryP.textContent = produk.category;

        const nameH3 = document.createElement("h3");
        nameH3.className = "product-name";
        nameH3.textContent = produk.name;

        const ratingP = document.createElement("p");
        ratingP.className = "product-rating";
        ratingP.textContent = buatBintang(produk.rating);

        const priceP = document.createElement("p");
        priceP.className = "product-price";
        priceP.textContent = formatRupiah(produk.price);

        infoDiv.appendChild(categoryP);
        infoDiv.appendChild(nameH3);
        infoDiv.appendChild(ratingP);
        infoDiv.appendChild(priceP);

        card.appendChild(imgDiv);
        card.appendChild(infoDiv);

        grid.appendChild(card);
    });
    
    tampilkanPagination(totalHalaman);
}

function tampilkanPagination(totalHalaman) {
    const container = document.getElementById("pagination-container");
    if (!container) return;
    
    while (container.firstChild) {
        container.removeChild(container.firstChild);
    }
    
    if (totalHalaman <= 1) return;
    
    const btnPrev = document.createElement("button");
    btnPrev.type = "button";
    btnPrev.className = "pagination-btn";
    btnPrev.textContent = "← SEBELUMNYA";
    btnPrev.disabled = halamanAktif === 1;
    btnPrev.addEventListener("click", function() {
        if (halamanAktif > 1) {
            halamanAktif--;
            tampilkanProduk();
            scrollKeAtasGrid();
        }
    });
    
    const infoHalaman = document.createElement("span");
    infoHalaman.className = "pagination-info";
    infoHalaman.textContent = "Halaman " + halamanAktif + " dari " + totalHalaman;
    
    const btnNext = document.createElement("button");
    btnNext.type = "button";
    btnNext.className = "pagination-btn";
    btnNext.textContent = "SELANJUTNYA →";
    btnNext.disabled = halamanAktif === totalHalaman;
    btnNext.addEventListener("click", function() {
        if (halamanAktif < totalHalaman) {
            halamanAktif++;
            tampilkanProduk();
            scrollKeAtasGrid();
        }
    });
    
    container.appendChild(btnPrev);
    container.appendChild(infoHalaman);
    container.appendChild(btnNext);
}

function scrollKeAtasGrid() {
    const grid = document.getElementById("product-grid");
    if (grid) {
        grid.scrollIntoView({ behavior: "smooth", block: "start" });
    }
}

function cariProduk(keyword) {
    keywordAktif = keyword || "";
    halamanAktif = 1;
    tampilkanProduk();
}

const searchInput = document.getElementById("product-search");
if (searchInput) {
    searchInput.addEventListener("input", function(e) {
        cariProduk(e.target.value);
    });
}

document.getElementById("product-search-button")?.addEventListener("click", function() {
    if (searchInput) {
        cariProduk(searchInput.value);
    }
});

const filterButtons = document.querySelectorAll(".category-filter");
filterButtons.forEach(function(btn) {
    btn.addEventListener("click", function() {
        filterButtons.forEach(function(b) {
            b.classList.remove("active");
        });
        btn.classList.add("active");
        kategoriAktif = btn.getAttribute("data-category");
        halamanAktif = 1;
        tampilkanProduk();
    });
});

function bukaPopup(id) {
    produkTerpilih = semuaProduk.find(function(p) {
        return p.id == id;
    });

    if (!produkTerpilih) return;

    sizeTerpilih = null;

    document.getElementById("popup-image").src = produkTerpilih.image;
    document.getElementById("popup-category").textContent = produkTerpilih.category;
    document.getElementById("popup-name").textContent = produkTerpilih.name;
    document.getElementById("popup-rating").textContent = buatBintang(produkTerpilih.rating);
    document.getElementById("popup-price").textContent = formatRupiah(produkTerpilih.price);
    
    const deskripsi = produkTerpilih.description ? produkTerpilih.description : "A carefully selected piece from LÉSCIA.";
    document.getElementById("popup-description").textContent = deskripsi;
    document.getElementById("popup-stock").textContent = "Stock: " + ambilStock(produkTerpilih);

    const sizesContainer = document.getElementById("popup-sizes");
    if (sizesContainer) {
        while (sizesContainer.firstChild) {
            sizesContainer.removeChild(sizesContainer.firstChild);
        }

        const daftarSize = (produkTerpilih.size && Array.isArray(produkTerpilih.size) && produkTerpilih.size.length > 0) 
            ? produkTerpilih.size 
            : ["S", "M", "L", "XL"];

        daftarSize.forEach(function(sz) {
            const btnSize = document.createElement("button");
            btnSize.type = "button";
            btnSize.className = "size-btn";
            btnSize.textContent = sz;

            btnSize.addEventListener("click", function() {
                if (sizeTerpilih === sz) {
                    sizeTerpilih = null;
                    btnSize.classList.remove("active");
                } else {
                    sizeTerpilih = sz;
                    const allSizeBtns = sizesContainer.querySelectorAll(".size-btn");
                    allSizeBtns.forEach(function(b) {
                        b.classList.remove("active");
                    });
                    btnSize.classList.add("active");
                }
            });

            sizesContainer.appendChild(btnSize);
        });
    }
    
    document.getElementById("product-popup")?.classList.add("show");
}

document.getElementById("close-product")?.addEventListener("click", function() {
    document.getElementById("product-popup")?.classList.remove("show");
});

document.getElementById("product-popup")?.addEventListener("click", function(e) {
    if (e.target.id === "product-popup") {
        e.target.classList.remove("show");
    }
});

function tambahKeCart(produk, size) {
    let cart = JSON.parse(localStorage.getItem("cart")) || [];
    let item = cart.find(function(i) {
        return i.id === produk.id && i.size === size;
    });
    
    if (item) {
        if (item.quantity < ambilStock(produk)) {
            item.quantity++;
        }
    } else {
        cart.push({
            id: produk.id,
            name: produk.name + " (" + size + ")",
            price: produk.price,
            image: produk.image,
            size: size,
            stock: ambilStock(produk),
            quantity: 1
        });
    }
    
    localStorage.setItem("cart", JSON.stringify(cart));
    if (typeof updateCartCount === "function") {
        updateCartCount();
    }
}

document.getElementById("add-cart-button")?.addEventListener("click", function() {
    if (!cekLogin()) return;
    
    if (!sizeTerpilih) {
        return alert("Silakan pilih ukuran (size) terlebih dahulu ♡");
    }

    if (produkTerpilih) {
        tambahKeCart(produkTerpilih, sizeTerpilih);
        document.getElementById("product-popup")?.classList.remove("show");
    }
});

document.getElementById("checkout-button")?.addEventListener("click", function() {
    if (!cekLogin()) return;

    if (!sizeTerpilih) {
        return alert("Silakan pilih ukuran (size) terlebih dahulu ♡");
    }

    if (produkTerpilih) {
        tambahKeCart(produkTerpilih, sizeTerpilih);
        localStorage.setItem("checkout-now", JSON.stringify([produkTerpilih.id]));
        window.location.href = "cart.html";
    }
});

ambilProduk();
