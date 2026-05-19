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

const shouldSkipSweetAlert = (form, submitter) => {
    if (!window.Swal || form.dataset.noSwal === 'true') {
        return true;
    }

    const submitterText = submitter?.textContent?.trim().toLowerCase() || '';
    const action = submitter?.getAttribute('formaction') || form.getAttribute('action') || '';
    const method = (submitter?.getAttribute('formmethod') || form.getAttribute('method') || 'GET').toUpperCase();

    return method === 'GET'
        || action.includes('/preview')
        || submitterText.includes('cetak')
        || submitterText.includes('preview')
        || submitterText.includes('keluar');
};

const confirmationCopy = (form) => {
    const spoofedMethod = form.querySelector('input[name="_method"]')?.value?.toUpperCase();
    const method = spoofedMethod || (form.getAttribute('method') || 'GET').toUpperCase();

    if (method === 'DELETE') {
        return {
            title: 'Hapus data?',
            text: 'Data yang sudah dihapus tidak bisa dikembalikan.',
            icon: 'warning',
            confirmButtonText: 'Ya, hapus',
            confirmButtonColor: '#e11d48',
        };
    }

    if (method === 'PATCH' || method === 'PUT') {
        return {
            title: 'Simpan perubahan?',
            text: 'Pastikan data yang diubah sudah benar.',
            icon: 'question',
            confirmButtonText: 'Ya, simpan',
            confirmButtonColor: '#2563eb',
        };
    }

    return {
        title: 'Simpan data baru?',
        text: 'Pastikan data yang dibuat sudah benar.',
        icon: 'question',
        confirmButtonText: 'Ya, simpan',
        confirmButtonColor: '#2563eb',
    };
};

document.addEventListener('submit', (event) => {
    event.target.querySelectorAll('[data-currency-input]').forEach((input) => {
        input.value = normalizeRupiah(input.value);
    });
});

document.addEventListener('submit', (event) => {
    const form = event.target;
    const submitter = event.submitter;

    if (!(form instanceof HTMLFormElement) || form.dataset.swalConfirmed === 'true' || shouldSkipSweetAlert(form, submitter)) {
        return;
    }

    event.preventDefault();

    Swal.fire({
        ...confirmationCopy(form),
        showCancelButton: true,
        cancelButtonText: 'Batal',
        reverseButtons: true,
        customClass: {
            popup: 'rounded-2xl',
            confirmButton: 'rounded-lg',
            cancelButton: 'rounded-lg',
        },
    }).then((result) => {
        if (!result.isConfirmed) {
            return;
        }

        form.dataset.swalConfirmed = 'true';

        if (submitter) {
            submitter.click();

            return;
        }

        form.submit();
    });
});

document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('[data-currency-input]').forEach((input) => {
        input.value = formatRupiah(input.value);
    });

    if (window.Swal && window.AppAlerts?.success) {
        Swal.fire({
            icon: 'success',
            title: 'Berhasil',
            text: window.AppAlerts.success,
            confirmButtonText: 'OK',
            confirmButtonColor: '#2563eb',
        });
    }

    if (window.Swal && window.AppAlerts?.error) {
        Swal.fire({
            icon: 'error',
            title: 'Gagal',
            text: window.AppAlerts.error,
            confirmButtonText: 'OK',
            confirmButtonColor: '#e11d48',
        });
    }
});
