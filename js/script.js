// Mobile Menu
    function toggleMobileMenu() {
      const menu = document.getElementById('mobileMenu');
      const overlay = document.getElementById('mobileOverlay');
      menu.classList.toggle('active');
      overlay.classList.toggle('active');
      document.body.style.overflow = menu.classList.contains('active') ? 'hidden' : '';
    }

    // Mobile Accordion
    function toggleAccordion(btn) {
      btn.classList.toggle('active');
      const content = btn.nextElementSibling;
      content.classList.toggle('active');
    }

    // Search Panel
    function toggleSearch() {
      const panel = document.getElementById('searchPanel');
      panel.classList.toggle('active');
    }
    // Close search on Escape key
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        document.getElementById('searchPanel').classList.remove('active');
      }
    });

//Slider js kodları
const slides = document.querySelectorAll('.carousel-item');
const videos = document.querySelectorAll('.slide-video');
const bars = document.querySelectorAll('.bar');
const carouselEl = document.querySelector('#mainCarousel');
const carousel = new bootstrap.Carousel(carouselEl, {
  interval: false,
  pause: false
});

const fills = document.querySelectorAll('.fill');
const duration = 5000;
let timer;
let current = 0;

function resetBars() {
  fills.forEach(fill => {
    fill.style.transition = 'none';
    fill.style.width = '0%';
  });
}

function animateBar(index) {
  resetBars();

  bars.forEach(bar => bar.classList.remove('active'));
  bars[index].classList.add('active');

  const video = slides[index].querySelector('video');
  let slideTime = duration;

  // önce tüm videoları durdur
  videos.forEach(v => {
    v.pause();
    v.currentTime = 0;
  });

  if (video) {
    video.currentTime = 0;

    video.play().catch(() => {
      // autoplay engellenirse sessizce geç
    });

    // metadata geldikten sonra süreyi al
    if (video.readyState >= 1) {
      slideTime = video.duration * 1000;
    } else {
      video.onloadedmetadata = () => {
        slideTime = video.duration * 1000;
        restartTimer(slideTime, index);
      };
      return;
    }
  }

  startFill(index, slideTime);
}
function startFill(index, time) {
  requestAnimationFrame(() => {
    fills[index].style.transition = `width ${time}ms linear`;
    fills[index].style.width = '100%';
  });

  clearTimeout(timer);
  timer = setTimeout(() => {
    carousel.next();
  }, time);
}

function restartTimer(time, index) {
  resetBars();
  startFill(index, time);
}



carouselEl.addEventListener('slide.bs.carousel', e => {
  current = e.to;
  animateBar(current);
});

/* manuel tıklama */
document.querySelectorAll('.bar').forEach((bar, i) => {
  bar.addEventListener('click', () => {
    carousel.to(i);
    animateBar(i);
  });
});

/* ilk yükleme */
animateBar(0);



/* mobil navbar -*/
document.querySelectorAll('.mobile-section-title').forEach(btn => {
  btn.addEventListener('click', () => {
    btn.parentElement.classList.toggle('active');
  });
});
