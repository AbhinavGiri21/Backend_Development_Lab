document.addEventListener('DOMContentLoaded', function () {
    const form = document.getElementById('studentForm');
    if (form) {
        form.addEventListener('submit', function (event) {

            const name = document.getElementById('name').value;
            const dob = document.getElementById('dob').value;
            const address = document.getElementById('address').value;
            const subject = document.getElementById('subject').value;

            const specialCharPattern = /[^a-zA-Z\s]/;
            if (specialCharPattern.test(name)) {
                alert("Name should not contain special characters.");
                return;
            }

            const dobDate = new Date(dob);
            const today = new Date();
            let age = today.getFullYear() - dobDate.getFullYear();
            const monthDifference = today.getMonth() - dobDate.getMonth();
            if (monthDifference < 0 || (monthDifference === 0 && today.getDate() < dobDate.getDate())) {
                age--;
            }

            if (dobDate.getFullYear() > 2010) {
                alert("Date of Birth should not be after 2010.");
                return;
            }

            alert(`Student Details:\nName: ${name}\nDate of Birth: ${dob}\nAge: ${age}\nAddress: ${address}\nSubject: ${subject}`);
        });
    } else {
        console.error('Form element not found.');
    }
});
