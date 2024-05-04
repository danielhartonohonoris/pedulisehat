document.getElementById('searchInput').addEventListener('input', function () {
    filterBoxes();
});
document.getElementById('roleFilter').addEventListener('change', filterBoxes);
document.addEventListener('DOMContentLoaded', () => {
    filterBoxes();
});
//fungsi untuk mencari penyakit berdasarkan title dan memfilter penyakit berdasarkan jenis / kategori
function filterBoxes() {
    const selectedRole = document.getElementById('roleFilter').value;
    const searchQuery = document.getElementById('searchInput').value.toLowerCase();
    const boxes = document.querySelectorAll('.box');

    boxes.forEach(box => {
        const role = selectedRole === '' || box.dataset.jenis === selectedRole;
        const title = box.querySelector('h3').textContent.toLowerCase();
        const matchSearch = title.includes(searchQuery);
        const display = role && matchSearch ? 'block' : 'none';
        box.style.display = display;
    });
}
