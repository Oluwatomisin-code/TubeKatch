document.getElementById("starthr").addEventListener('input', () => {

    if (starthr.value.length > 2) starthr.value = starthr.value.slice(0, 2)
});
document.getElementById("startmin").addEventListener('input', () => {
    if (startmin.value.length > 2) startmin.value = startmin.value.slice(0, 2);
    if (startmin.value > 59) startmin.value = 59;
});
document.getElementById("startsec").addEventListener('input', () => {
    if (startsec.value.length > 2) startsec.value = startsec.value.slice(0, 2);
    if (startsec.value > 59) startsec.value = 59
})

document.getElementById("endhr").addEventListener('input', () => {
    if (endhr.value.length > 2) endhr.value = endhr.value.slice(0, 2)
});
document.getElementById("endmin").addEventListener('input', () => {
    if (endmin.value.length > 2) endmin.value = endmin.value.slice(0, 2);
    if (endmin.value > 59) endmin.value = 59;
});
document.getElementById("endsec").addEventListener('input', () => {
    if (endsec.value.length > 2) endsec.value = endsec.value.slice(0, 2);
    if (endsec.value > 59) endsec.value = 59
})