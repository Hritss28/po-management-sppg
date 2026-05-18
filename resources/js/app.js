const normalizeRupiah = (value) => value.replace(/[^\d]/g, '');

const formatRupiah = (value) => {
    const normalized = normalizeRupiah(value);

    if (normalized === '') {
        return '';
    }

    return new Intl.NumberFormat('id-ID').format(Number(normalized));
};

document.addEventListener('input', (event) => {
    if (!event.target.matches('[data-currency-input]')) {
        return;
    }

    event.target.value = formatRupiah(event.target.value);
});

document.addEventListener('submit', (event) => {
    event.target.querySelectorAll('[data-currency-input]').forEach((input) => {
        input.value = normalizeRupiah(input.value);
    });
});

document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('[data-currency-input]').forEach((input) => {
        input.value = formatRupiah(input.value);
    });
});
