// Fungsi untuk menghapus email user
function deleteUser(email) {
  if (confirm(`Apakah Anda yakin ingin menghapus akun ${email}?`)) {
    fetch(`/delete-user/${email}`, {
      method: 'DELETE'
    })
      .then(response => {
        if (response.ok) {
          alert('Akun pengguna berhasil dihapus.');
          location.reload();
        } else {
          alert('Terjadi kesalahan saat menghapus akun pengguna.');
        }
      })
      .catch(error => {
        console.error('Error:', error);
        alert('Terjadi kesalahan koneksi.');
      });
  }
}