document.getElementById('roleFilter').addEventListener('change', function () {
    filterBoxes();
});

document.getElementById('searchInput').addEventListener('input', function () {
    filterBoxes();
});

function filterBoxes() {
    const selectedRole = document.getElementById('roleFilter').value;
    const searchQuery = document.getElementById('searchInput').value.toLowerCase();
    const boxes = document.querySelectorAll('.box');

    boxes.forEach(box => {
        const role = box.classList.contains(selectedRole) || selectedRole === '';
        const title = box.querySelector('h3').textContent.toLowerCase();
        const matchSearch = title.includes(searchQuery);

        if (role && matchSearch) {
            box.style.display = 'block';
        } else {
            box.style.display = 'none';
        }
    });
}