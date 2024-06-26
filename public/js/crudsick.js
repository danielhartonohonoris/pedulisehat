// Fungsi untuk menampilkan atau menyembunyikan formulir edit
function showEditForm(sickness) {
    var editFormContainer = document.getElementById('editFormContainer_' + sickness);
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
function cancelEditForm(sickness) {
    var editFormContainer = document.getElementById('editFormContainer_' + sickness);
    editFormContainer.style.display = 'none';
}
// Fungsi untuk menambahkan penyakit ke server
function submitFormSickness() {
    var form = document.getElementById("sicknessForm");
    var formData = new FormData(form);

    var xhr = new XMLHttpRequest();
    xhr.open("POST", form.action, true);
    xhr.onload = function () {
        if (xhr.status === 200) {
            console.log("Penyakit berhasil ditambahkan!");
            window.location.reload();
        } else {
            console.error("Terjadi kesalahan saat menambahkan penyakit.");
        }
    };
    xhr.onerror = function () {
        console.error("Terjadi kesalahan koneksi.");
    };
    xhr.send(formData);
}
// Fungsi untuk mengupdate penyakit ke server menggunakan metode PUT.
function submitUpdateForm() {
    var form = document.getElementById("updateForm");
    var formData = new FormData(form);

    var xhr = new XMLHttpRequest();
    xhr.open("PUT", form.action, true);
    xhr.onload = function () {
        if (xhr.status === 200) {
            console.log("Perubahan berhasil disimpan crudSickness!");
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
// Fungsi untuk menghapus data penyakit dari server
function deleteSickness(sickness) {
    if (confirm("Apakah Anda yakin ingin menghapus penyakit ini?")) {
        var xhr = new XMLHttpRequest();
        xhr.open("DELETE", "/information/" + sickness, true);
        xhr.onload = function () {
            if (xhr.status === 200) {
                console.log("Daftar penyakit berhasil dihapus!");
                window.location.reload();
            } else {
                console.error("Terjadi kesalahan saat menghapus penyakit.");
            }
        };
        xhr.send();
    }
}
