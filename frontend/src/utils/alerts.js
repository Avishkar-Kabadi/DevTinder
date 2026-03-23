export const confirmAlert = (title, message, confirmText = "Confirm", cancelText = "Cancel") => {
    return new Promise((resolve) => {
        window.dispatchEvent(new CustomEvent('showConfirmAlert', {
            detail: { title, message, confirmText, cancelText, resolve }
        }));
    });
};

export const toastAlert = (message, type = 'success') => {
    window.dispatchEvent(new CustomEvent('showToastAlert', {
        detail: { message, type }
    }));
};
