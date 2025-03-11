document.addEventListener('DOMContentLoaded', function() {
    const scorecardSections = document.querySelectorAll('.scorecard-section');

    scorecardSections.forEach(section => {
        const rows = section.querySelectorAll('tbody tr');

        rows.forEach(row => {
            const inputs = row.querySelectorAll('input[type="number"]');
            const totalCell = row.querySelector('.total');

            inputs.forEach(input => {
                input.addEventListener('input', () => {
                    let total = 0;
                    inputs.forEach(input => {
                        total += parseInt(input.value) || 0;
                    });
                    totalCell.textContent = total;
                });
            });
        });
    });
}); 