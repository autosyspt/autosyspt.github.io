// Atualização do código JavaScript para incluir um menu lateral responsivo em dispositivos móveis

document.addEventListener('DOMContentLoaded', () => {
  // Inicializar o carrossel e ajustar a responsividade
  initCarousel();
  checkResponsiveness();

  // Inicializar o menu lateral mobile
  initMobileMenu();

  // Adicionar listener para redimensionamento de janela
  window.addEventListener('resize', checkResponsiveness);
});

// Função para inicializar o menu lateral mobile
function initMobileMenu() {
  const navbarToggler = document.querySelector('.navbar-toggler');
  const navbarCollapse = document.getElementById('navbarCollapse');
  const body = document.body;

  if (navbarToggler && navbarCollapse) {
    // Adicionar classe 'open' ao body quando o menu está aberto
    function toggleMenu() {
      body.classList.toggle('menu-open');
      navbarCollapse.classList.toggle('show');
    }

    // Abrir/fechar o menu ao clicar no botão hamburguer
    navbarToggler.addEventListener('click', function (e) {
      e.stopPropagation(); // Evitar propagação do evento
      toggleMenu();
    });

    // Fechar o menu quando um item de navegação é clicado
    const navLinks = document.querySelectorAll('#navbarCollapse .nav-link');
    navLinks.forEach(function (link) {
      link.addEventListener('click', function () {
        if (body.classList.contains('menu-open')) {
          toggleMenu();
        }
      });
    });

    // Fechar o menu quando clicar fora dele
    document.addEventListener('click', function (event) {
      if (
        !navbarCollapse.contains(event.target) &&
        !navbarToggler.contains(event.target) &&
        body.classList.contains('menu-open')
      ) {
        toggleMenu();
      }
    });

    // Fechar o menu automaticamente quando a tela for ampliada além do breakpoint mobile
    window.addEventListener('resize', function () {
      if (window.innerWidth >= 992 && body.classList.contains('menu-open')) {
        toggleMenu();
      }
    });
  }
}


const feedbacks = [
  {
    id: 1,
    name: "Ana Silva",
    avatar: "/api/placeholder/100/100",
    role: "Cliente desde 2021",
    content: "Serviço excepcional! A Car Spot foi muito atenciosa e resolveu o meu problema rapidamente. Recomendo fortemente para todos os que precisam de um trabalho de qualidade.",
    rating: 5,
    date: "12 de Março, 2025",
    tags: ["Suporte", "Atendimento"],
  },
  {
    id: 2,
    name: "Carlos Mendes",
    avatar: "/api/placeholder/100/100",
    role: "Cliente desde 2020",
    content: "Utilizei os serviços várias vezes e sempre fiquei satisfeito com os resultados. A Car Spot é muito profissional e eficiente.",
    rating: 5,
    date: "5 de Março, 2025",
    tags: ["Pontualidade", "Qualidade"],
  },
  {
    id: 3,
    name: "Mariana Costa",
    avatar: "/api/placeholder/100/100",
    role: "Cliente desde 2022",
    content: "Trabalho impecável!",
    rating: 4,
    date: "28 de Fevereiro, 2025",
    tags: ["Pesquisa", "Qualidade"],
  },
  {
    id: 4,
    name: "Pedro Almeida",
    avatar: "/api/placeholder/100/100",
    role: "Cliente desde 2023",
    content: "Com certeza voltarei a contratar os serviços.",
    rating: 5,
    date: "15 de Fevereiro, 2025",
    tags: ["Preço", "Atendimento"],
  },
  {
    id: 5,
    name: "Juliana Santos",
    avatar: "/api/placeholder/100/100",
    role: "Cliente desde 2022",
    content: "Atendimento personalizado e de alta qualidade. Senti que realmente se importavam com o meu projeto e se esforçaram para entregar o melhor resultado possível.",
    rating: 5,
    date: "7 de Fevereiro, 2025",
    tags: ["Personalização", "Atendimento"],
  },
];

// Função para criar estrelas baseadas na avaliação
function createStars(rating) {
  let stars = '';
  for (let i = 0; i < 5; i++) {
    stars += `<span class="star">${i < rating ? '★' : '☆'}</span>`;
  }
  return stars;
}

// Função para criar item de feedback
function createFeedbackItem(feedback) {
  const item = document.createElement('div');
  item.className = 'carousel-item-container hidden-item';
  item.setAttribute('data-id', feedback.id);

  const tags = feedback.tags.map(tag => `<span class="feedback-tag">${tag}</span>`).join('');

  item.innerHTML = `
    <div class="feedback-item">
      <div class="feedback-header">
        <div class="feedback-author">
          <h3>${feedback.name}</h3>
          <p>${feedback.role}</p>
        </div>
      </div>
      <div class="feedback-content">
        "${feedback.content}"
      </div>
      <div class="feedback-rating">
        ${createStars(feedback.rating)}
      </div>
      <div class="feedback-metadata">
        <div class="feedback-tags">
          ${tags}
        </div>
        <div class="feedback-date">${feedback.date}</div>
      </div>
    </div>
  `;

  return item;
}

// Verificar responsividade
function checkResponsiveness() {
  const isMobile = window.innerWidth <= 576;
  const isTablet = window.innerWidth <= 768 && window.innerWidth > 576;

  // Ajustar altura do carrossel com base no tamanho da tela
  const carouselContent = document.querySelector('.carousel-content');
  const dataFeedbacks = document.querySelectorAll('.feedback-date');
  if (carouselContent) {
    if (isMobile) {
      carouselContent.style.minHeight = '350px';
      dataFeedbacks.forEach(item => {
        item.style.display = 'none';
      });
    } else if (isTablet) {
      carouselContent.style.minHeight = '320px';
      dataFeedbacks.forEach(item => {
        item.style.display = 'none';
      });
    } else {
      carouselContent.style.minHeight = '300px';
      dataFeedbacks.forEach(item => {
        item.style.display = 'block';
      });
    }
  }
}

// Inicializar o carrossel
function initCarousel() {
  const carouselItems = document.getElementById('carouselItems');
  const indicator = document.getElementById('indicator');
  const prevButton = document.getElementById('prevButton');
  const nextButton = document.getElementById('nextButton');

  // Criar indicadores
  feedbacks.forEach((_, index) => {
    const dot = document.createElement('div');
    dot.className = index === 0 ? 'indicator-dot active' : 'indicator-dot';
    dot.setAttribute('data-index', index);
    dot.addEventListener('click', () => goToSlide(index));
    indicator.appendChild(dot);
  });

  // Criar e adicionar itens do carrossel
  feedbacks.forEach(feedback => {
    const feedbackItem = createFeedbackItem(feedback);
    carouselItems.appendChild(feedbackItem);
  });

  // Configurar o estado inicial
  updateCarouselState(0);

  // Adicionar event listeners para navegação
  prevButton.addEventListener('click', goToPrevSlide);
  nextButton.addEventListener('click', goToNextSlide);
}

// Variável para controlar o índice atual
let currentIndex = 0;

// Atualizar o estado do carrossel
function updateCarouselState(newIndex) {
  const items = document.querySelectorAll('.carousel-item-container');
  const dots = document.querySelectorAll('.indicator-dot');
  const totalItems = items.length;

  // Normalizar o índice para carrossel infinito
  currentIndex = (newIndex + totalItems) % totalItems;

  // Atualizar indicadores
  dots.forEach((dot, index) => {
    dot.classList.toggle('active', index === currentIndex);
  });

  // Atualizar classes dos itens
  items.forEach((item, index) => {
    item.className = 'carousel-item-container';

    // Calcular a posição relativa no carrossel
    let position = (index - currentIndex + totalItems) % totalItems;

    // Ajustar para o efeito de carrossel infinito
    if (position > totalItems / 2) position -= totalItems;
    if (position < -totalItems / 2) position += totalItems;

    if (position === 0) {
      item.classList.add('center-item');
    } else if (position === 1 || position === -totalItems + 1) {
      item.classList.add('right-item');
    } else if (position === -1 || position === totalItems - 1) {
      item.classList.add('left-item');
    } else if (position === 2 || position === -totalItems + 2) {
      item.classList.add('far-right-item');
    } else if (position === -2 || position === totalItems - 2) {
      item.classList.add('far-left-item');
    } else {
      item.classList.add('hidden-item');
    }
  });
}

// Navegar para o slide anterior
function goToPrevSlide() {
  updateCarouselState(currentIndex - 1);
}

// Navegar para o próximo slide
function goToNextSlide() {
  updateCarouselState(currentIndex + 1);
}

// Navegar para um slide específico
function goToSlide(index) {
  updateCarouselState(index);
}

document.addEventListener('DOMContentLoaded', function() {
  const menuToggle = document.getElementById('menu-toggle');
  const menuMobile = document.getElementById('menu-mobile');
  
  menuToggle.addEventListener('click', function() {
      if (menuMobile.style.display === 'flex') {
          menuMobile.style.display = 'none';
          menuToggle.style.color =  '#ff5d00';
      } else {
          menuMobile.style.display = 'flex';
          menuToggle.style.color =  'black';
      }
  });

  // Optionally close the menu when clicking a link
  const links = menuMobile.querySelectorAll('a');
  links.forEach(link => {
      link.addEventListener('click', () => {
          menuMobile.style.display = 'none';
      });
  });
});

document.addEventListener('DOMContentLoaded', function () {
  const dropdownToggle = document.querySelector('.dropdown-toggle');
  const dropdownMenu = document.querySelector('.dropdown-menu');

  // Abrir/fechar o dropdown ao clicar no botão
  dropdownToggle.addEventListener('click', function () {
    dropdownMenu.classList.toggle('active');
  });

  // Fechar o dropdown ao clicar fora dele
  document.addEventListener('click', function (event) {
    if (!dropdownToggle.contains(event.target) && !dropdownMenu.contains(event.target)) {
      dropdownMenu.classList.remove('active');
    }
  });
});


