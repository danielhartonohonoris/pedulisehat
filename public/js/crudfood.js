// Fungsi untuk menampilkan atau menyembunyikan formulir edit
function showEditForm(foodId) {
    var editFormContainer = document.getElementById('editFormContainer_' + foodId);
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
function cancelEditForm(foodId) {
    var editFormContainer = document.getElementById('editFormContainer_' + foodId);
    editFormContainer.style.display = 'none';
}
// Fungsi untuk menambahkan makanan ke server
function submitFormFood() {
    var form = document.getElementById("foodForm");
    var formData = new FormData(form);

    var xhr = new XMLHttpRequest();
    xhr.open("POST", form.action, true);
    xhr.onload = function () {
        if (xhr.status === 200) {
            console.log("Makanan berhasil ditambahkan!");
            window.location.reload();
        } else {
            console.error("Terjadi kesalahan saat menambahkan makanan.");
        }
    };
    xhr.onerror = function () {
        console.error("Terjadi kesalahan koneksi.");
    };
    xhr.send(formData);
}
// Fungsi untuk mengupdate makanan ke server menggunakan metode PUT.
function submitUpdateForm() {
    var form = document.getElementById("updateForm");
    var formData = new FormData(form);

    var xhr = new XMLHttpRequest();
    xhr.open("PUT", form.action, true);
    xhr.onload = function () {
        if (xhr.status === 200) {
            console.log("Perubahan berhasil disimpan crudFood!");
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
// Fungsi untuk menghapus data makanan dari server
function deleteFood(foodId) {
    if (confirm("Apakah Anda yakin ingin menghapus makanan ini?")) {
        var xhr = new XMLHttpRequest();
        xhr.open("DELETE", "/food/" + foodId, true);
        xhr.onload = function () {
            if (xhr.status === 200) {
                console.log("Makanan berhasil dihapus!");
                window.location.reload();
            } else {
                console.error("Terjadi kesalahan saat menghapus makanan.");
            }
        };
        xhr.send();
    }
}
