//Fungsi untuk menamilkan box sesuai filter spesialisasi dokter
function filterBoxes() {
    const selectedRole = document.getElementById('roleFilter').value;
    const boxes = document.querySelectorAll('.box');

    boxes.forEach(box => {
        const role = selectedRole === '' || box.dataset.specialization === selectedRole;
        const display = role ? 'block' : 'none';

        box.style.display = display;
    });
}
//fungsi untuk mensortir box berdasarkan rating dokter
function sortBoxes() {
    const sortDirection = document.getElementById('sort').value;
    const boxes = document.querySelectorAll('.box');

    const sortedBoxes = Array.from(boxes).sort((a, b) => {
        const ratingA = parseInt(a.dataset.rating);
        const ratingB = parseInt(b.dataset.rating);
        return sortDirection === 'asc' ? ratingA - ratingB : ratingB - ratingA;
    });

    const boxContainer = document.getElementById('boxContainer');
    boxContainer.innerHTML = '';

    sortedBoxes.forEach(box => {
        boxContainer.appendChild(box);
    });
}

document.getElementById('roleFilter').addEventListener('change', filterBoxes);
document.getElementById('sort').addEventListener('change', sortBoxes);

document.addEventListener('DOMContentLoaded', () => {
    filterBoxes();
    sortBoxes();
});
