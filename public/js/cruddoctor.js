// Fungsi untuk menampilkan atau menyembunyikan formulir edit
function showEditForm(doctorId) {
    var editFormContainer = document.getElementById('editFormContainer_' + doctorId);
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
function cancelEditForm(doctorId) {
    var editFormContainer = document.getElementById('editFormContainer_' + doctorId);
    editFormContainer.style.display = 'none';
}
// Fungsi untuk menambahkan dokter ke server
function submitFormDoctor() {
    var form = document.getElementById("doctorForm");
    var formData = new FormData(form);

    var xhr = new XMLHttpRequest();
    xhr.open("POST", form.action, true);
    xhr.onload = function () {
        if (xhr.status === 200) {
            console.log("Dokter berhasil ditambahkan!");
            window.location.reload();
        } else {
            console.error("Terjadi kesalahan saat menambahkan dokter.");
        }
    };
    xhr.onerror = function () {
        console.error("Terjadi kesalahan koneksi.");
    };
    xhr.send(formData);
}
// Fungsi untuk mengupdate dokter ke server menggunakan metode PUT.
function submitUpdateForm() {
    var form = document.getElementById("updateForm");
    var formData = new FormData(form);

    var xhr = new XMLHttpRequest();
    xhr.open("PUT", form.action, true);
    xhr.onload = function () {
        if (xhr.status === 200) {
            console.log("Perubahan berhasil disimpan crudDoctor!");
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
// Fungsi untuk menghapus data dokter dari server
function deletedoctors(doctorid) {
    if (confirm("Apakah Anda yakin ingin menghapus dokter ini?")) {
        var xhr = new XMLHttpRequest();
        xhr.open("DELETE", "/doctors/" + doctorid, true);
        xhr.onload = function () {
            if (xhr.status === 200) {
                console.log("Dokter berhasil dihapus!");
                window.location.reload();
            } else {
                console.error("Terjadi kesalahan saat menghapus dokter.");
            }
        };
        xhr.send();
    }
}
