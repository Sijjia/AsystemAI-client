import './style.css'
import { createIcons } from 'lucide'
import * as icons from 'lucide'

// Initialize Lucide Icons
createIcons({ icons })

// Simple form handling
document.getElementById('contactForm')?.addEventListener('submit', function(e) {
    e.preventDefault();
    const btn = this.querySelector('button');
    const originalText = btn.innerHTML;
    btn.innerHTML = 'Отправлено!';
    btn.classList.remove('bg-white', 'text-black');
    btn.classList.add('bg-green-500', 'text-white');
    setTimeout(() => {
        btn.innerHTML = originalText;
        btn.classList.add('bg-white', 'text-black');
        btn.classList.remove('bg-green-500', 'text-white');
        this.reset();
        // Re-initialize icons after form reset
        createIcons({ icons });
    }, 3000);
});
