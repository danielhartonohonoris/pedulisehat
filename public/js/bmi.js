// Fungsi untuk menghitung BMI berdasarkan tinggi, berat, dan jenis kelamin yang diberikan.
function calculateBMI() {
    const height = parseFloat(document.getElementById('height').value);
    const weight = parseFloat(document.getElementById('weight').value);
    const gender = document.getElementById('gender').value;

    if (!height || !weight || height <= 0 || weight <= 0) {
        document.getElementById('result').innerHTML = "Silahkan masukkan tinggi dan berat badan";
        return;
    }

    const bmi = weight / ((height / 100) ** 2);
    const bmiCategory = getBMICategory(bmi);

    document.getElementById('result').innerHTML = `BMI Kamu: ${bmi.toFixed(2)} (${bmiCategory})`;
}
// Fungsi untuk mendapatkan kategori BMI berdasarkan nilai BMI yang diberikan.
function getBMICategory(bmi) {
    if (bmi < 18.5) {
        return "Berat Rendah, perbanyak makan daging dan tidur yang cukup";
    } else if (bmi >= 18.5 && bmi < 25) {
        return "Ideal, Selalu jaga kesehatanmu";
    } else if (bmi >= 25 && bmi < 30) {
        return "Berat Berlebih, perbanyak olahraga";
    } else {
        return "Obesitas, perbanyak olahraga dan jaga kesehatan";
    }
}
// Fungsi untuk mengatur ulang nilai tinggi, berat, dan hasil BMI dalam formulir.
function resetForm() {
    document.getElementById('height').value = '';
    document.getElementById('weight').value = '';
    document.getElementById('result').innerHTML = '';
}
