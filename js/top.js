const API_URL = "https://lesi-api-new.vercel.app/product.json";
let produkTop = [];
let produkTerpilih = null;
let sizeTerpilih = null;

function ambilProduk() {
    fetch(API_URL)
        .then(function (response) {
            return response.json();
        })
        .then(function (data) {
            produkTop = data;
            produkTop.sort(function (a, b) {
                return b.rating - a.rating;
            });
            produkTop = produkTop.slice(0, 12);
            tampilkanTop();
        })
        .catch(function (error) {
            const grid = document.getElementById("top-product-grid");
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

function tampilkanTop() {
    const grid = document.getElementById("top-product-grid");
    if (!grid) return;
    
    while (grid.firstChild) {
        grid.removeChild(grid.firstChild);
    }
    
    produkTop.forEach(function (produk) {
        const card = document.createElement("article");
        card.className = "product-card";
        
        card.addEventListener("click", function () {
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
}

function bukaPopup(id) {
    produkTerpilih = produkTop.find(function (p) {
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

    const sizesContainer = document.getElementById("size-options") || document.getElementById("popup-size-container");
    if (sizesContainer) {
        while (sizesContainer.firstChild) {
            sizesContainer.removeChild(sizesContainer.firstChild);
        }

        const daftarSize = (produkTerpilih.size && Array.isArray(produkTerpilih.size) && produkTerpilih.size.length > 0) 
            ? produkTerpilih.size 
            : ["S", "M", "L", "XL"];

        daftarSize.forEach(function (sz) {
            const btnSize = document.createElement("button");
            btnSize.type = "button";
            btnSize.className = "size-btn";
            btnSize.textContent = sz;

            btnSize.addEventListener("click", function () {
                if (sizeTerpilih === sz) {
                    sizeTerpilih = null;
                    btnSize.classList.remove("active");
                } else {
                    sizeTerpilih = sz;
                    const allSizeBtns = sizesContainer.querySelectorAll(".size-btn");
                    allSizeBtns.forEach(function (b) {
                        b.classList.remove("active");
                    });
                    btnSize.classList.add("active");
                }
            });

            sizesContainer.appendChild(btnSize);
        });
    }
    
    const popupEl = document.getElementById("product-popup");
    if (popupEl) popupEl.classList.add("show");
}

const closeProductBtn = document.getElementById("close-product");
if (closeProductBtn) {
    closeProductBtn.addEventListener("click", function () {
        const popupEl = document.getElementById("product-popup");
        if (popupEl) popupEl.classList.remove("show");
    });
}

const productPopupEl = document.getElementById("product-popup");
if (productPopupEl) {
    productPopupEl.addEventListener("click", function (e) {
        if (e.target.id === "product-popup") {
            e.target.classList.remove("show");
        }
    });
}

function tambahKeCart(produk, size) {
    let cart = JSON.parse(localStorage.getItem("cart")) || [];
    let item = cart.find(function (i) {
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

const addCartBtn = document.getElementById("add-cart-button");
if (addCartBtn) {
    addCartBtn.addEventListener("click", function () {
        if (!cekLogin()) return;
        
        if (!sizeTerpilih) {
            alert("Silakan pilih ukuran (size) terlebih dahulu ♡");
            return;
        }

        if (produkTerpilih) {
            tambahKeCart(produkTerpilih, sizeTerpilih);
            const popupEl = document.getElementById("product-popup");
            if (popupEl) popupEl.classList.remove("show");
        }
    });
}

const checkoutBtn = document.getElementById("checkout-button");
if (checkoutBtn) {
    checkoutBtn.addEventListener("click", function () {
        if (!cekLogin()) return;

        if (!sizeTerpilih) {
            alert("Silakan pilih ukuran (size) terlebih dahulu ♡");
            return;
        }

        if (produkTerpilih) {
            tambahKeCart(produkTerpilih, sizeTerpilih);
            localStorage.setItem("checkout-now", JSON.stringify([produkTerpilih.id]));
            window.location.href = "cart.html";
        }
    });
}

ambilProduk();