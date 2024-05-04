// Menambahkan event listener untuk saat formulir login disubmit.
document.getElementById('loginForm').addEventListener('submit', function (event) {
    const emailInput = document.getElementById('email');
    const passwordInput = document.getElementById('password');

    if (!emailInput.checkValidity() || !passwordInput.checkValidity()) {
        event.preventDefault();
        event.stopPropagation();
    }

    emailInput.classList.add('was-validated');
    passwordInput.classList.add('was-validated');
});