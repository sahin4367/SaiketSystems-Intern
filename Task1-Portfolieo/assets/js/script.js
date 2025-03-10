document.getElementById("contactForm").addEventListener("submit", function(event) {
    event.preventDefault(); 

    let name = document.getElementById("name").value.trim();
    let email = document.getElementById("email").value.trim();
    let message = document.getElementById("message").value.trim();

    if (name === "" || email === "" || message === "") {
        alert("Bütün xanaləri doldurun!");
        return;
    }

    if (!email.includes("@")) {
        alert("Düzgün e-poçt daxil edin!");
        return;
    }

    alert("Mesajınız göndərildi!");
    this.reset();
});
