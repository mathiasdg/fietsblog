document.addEventListener('DOMContentLoaded', function() {
    const shorts = document.querySelectorAll('.short');
    shorts.forEach(short => {
        const afkappen = short.textContent.substring(0, 87) + '...';
        short.textContent = afkappen;
    })

    AOS.init()
})
