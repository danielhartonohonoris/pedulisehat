// Fungsi untuk menampilkan atau menyembunyikan formulir edit
function showEditForm(medicineId) {
    var editFormContainer = document.getElementById('editFormContainer_' + medicineId);
    if (editFormContainer.style.display === 'none') {
        var allEditFormContainers = document.querySelectorAll('[id^="editFormContainer_"]');
        allEditFormContainers.forEach(container => {
            container.style.display = 'none';
        });
        editFormContainer.style.display = 'block';
    } else {
        editFormContainer.style.display = 'none';
    }
}
// Fungsi untuk membatalkan edit formulir
function cancelEditForm(medicineId) {
    var editFormContainer = document.getElementById('editFormContainer_' + medicineId);
    editFormContainer.style.display = 'none';
}
// Fungsi untuk menambahkan obat ke server
function submitFormMedicine() {
    var form = document.getElementById("medicineForm");
    var formData = new FormData(form);

    var xhr = new XMLHttpRequest();
    xhr.open("POST", form.action, true);
    xhr.onload = function () {
        if (xhr.status === 200) {
            console.log("Obat berhasil ditambahkan!");
            window.location.reload();
        } else {
            console.error("Terjadi kesalahan saat menambahkan obat.");
        }
    };
    xhr.onerror = function () {
        console.error("Terjadi kesalahan koneksi.");
    };
    xhr.send(formData);
}
// Fungsi untuk mengupdate obat ke server menggunakan metode PUT.
function submitUpdateForm() {
    var form = document.getElementById("updateForm");
    var formData = new FormData(form);

    var xhr = new XMLHttpRequest();
    xhr.open("PUT", form.action, true);
    xhr.onload = function () {
        if (xhr.status === 200) {
            console.log("Perubahan berhasil disimpan crudMedicine!");
            window.location.reload();
        } else {
            console.error("Terjadi kesalahan saat menyimpan perubahan.");
        }
    };
    xhr.onerror = function () {
        console.error("Terjadi kesalahan koneksi.");
    };
    xhr.send(formData);
}
// Fungsi untuk menghapus data obat dari server
function deleteMedicine(medicineId) {
    if (confirm("Apakah Anda yakin ingin menghapus obat ini?")) {
        var xhr = new XMLHttpRequest();
        xhr.open("DELETE", "/medicine/" + medicineId, true);
        xhr.onload = function () {
            if (xhr.status === 200) {
                console.log("Obat berhasil dihapus!");
                window.location.reload();
            } else {
                console.error("Terjadi kesalahan saat menghapus obat.");
            }
        };
        xhr.send();
    }
}