document.getElementById('searchInput').addEventListener('input', function () {
    filterBoxes();
});
// fungsi untuk mencari obat berdasarkan title
function filterBoxes() {

    const searchQuery = document.getElementById('searchInput').value.toLowerCase();
    const boxes = document.querySelectorAll('.box');

    boxes.forEach(box => {

        const title = box.querySelector('h3').textContent.toLowerCase();
        const matchSearch = title.includes(searchQuery);

        if (matchSearch) {
            box.style.display = 'block';
        } else {
            box.style.display = 'none';
        }
    });
}
