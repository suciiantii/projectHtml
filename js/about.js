const backButton =
    document.getElementById(
        "back-button"
    );


if (backButton) {

    backButton.addEventListener(
        "click",
        function () {

            history.back();

        }
    );

}
const ownerImg = document.getElementById("owner-photo-img");
if (ownerImg) {
    ownerImg.addEventListener("error", function () {
        this.style.display = "none";
        if (this.nextElementSibling) {
            this.nextElementSibling.style.display = "flex";
        }
    });
}