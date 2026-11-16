export function fieldValue({ target }: Event) {
    return target instanceof HTMLInputElement || target instanceof HTMLTextAreaElement || target instanceof HTMLSelectElement ? target.value : '';
}

export function fieldChecked({ target }: Event) {
    return target instanceof HTMLInputElement && target.checked;
}
