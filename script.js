// Детская библиотека - iOS 26 интерфейс
document.addEventListener('DOMContentLoaded', function() {
    // Плавная прокрутка для навигационных ссылок
    const navLinks = document.querySelectorAll('nav a[href^="#"]');

    // Динамически вычисляем высоту навигации и записываем в CSS-переменную
    const navElement = document.querySelector('nav');
    function setNavHeight() {
        const h = navElement ? navElement.offsetHeight : 64;
        document.documentElement.style.setProperty('--nav-height', h + 'px');
    }
    setNavHeight();
    window.addEventListener('resize', setNavHeight);
    
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            
            const targetId = this.getAttribute('href');
            const targetSection = document.querySelector(targetId);
            
            if (targetSection) {
                targetSection.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });
    
    // Анимация появления элементов при скролле
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, observerOptions);
    
    // Наблюдаем за секциями
    const sections = document.querySelectorAll('section');
    sections.forEach(section => {
        section.style.opacity = '0';
        section.style.transform = 'translateY(20px)';
        section.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        observer.observe(section);
    });
    
    // Добавляем тактильную обратную связь для мобильных устройств
    const touchElements = document.querySelectorAll('li, nav a');
    
    touchElements.forEach(element => {
        element.addEventListener('touchstart', function() {
            this.style.transform = 'scale(0.98)';
        });
        
        element.addEventListener('touchend', function() {
            this.style.transform = '';
        });
    });
    
    // Счетчик прочитанных книг (localStorage)
    function initReadingTracker() {
        const readButtons = document.querySelectorAll('.read-btn');
        const readBooks = JSON.parse(localStorage.getItem('readBooks') || '[]');
        
        readButtons.forEach(button => {
            const bookTitle = button.getAttribute('data-book');
            
            // Отмечаем прочитанные книги
            if (readBooks.includes(bookTitle)) {
                markAsRead(button, true);
            }
            
            // Добавляем обработчик клика для кнопок
            button.addEventListener('click', function(e) {
                e.preventDefault();
                e.stopPropagation();
                
                const title = this.getAttribute('data-book');
                const isRead = readBooks.includes(title);
                
                if (isRead) {
                    // Убираем из прочитанных
                    const index = readBooks.indexOf(title);
                    readBooks.splice(index, 1);
                    markAsRead(this, false);
                } else {
                    // Добавляем в прочитанные
                    readBooks.push(title);
                    markAsRead(this, true);
                }
                
                localStorage.setItem('readBooks', JSON.stringify(readBooks));
                updateReadingStats();
            });
        });
        
        // Оставляем возможность перехода по ссылке при клике на название книги
        const bookLinks = document.querySelectorAll('.book-link');
        bookLinks.forEach(link => {
            link.addEventListener('click', function(e) {
                // Позволяем нормальное поведение ссылки
                // Можно добавить аналитику здесь, если нужно
            });
        });
        
        // Показываем статистику
        updateReadingStats();
    }
    
    function markAsRead(button, isRead) {
        const listItem = button.closest('li');
        
        if (isRead) {
            button.classList.add('read');
            button.textContent = '✓';
            button.title = 'Снять отметку "Прочитано"';
            listItem.classList.add('read');
        } else {
            button.classList.remove('read');
            button.textContent = '📖';
            button.title = 'Отметить как "Прочитано"';
            listItem.classList.remove('read');
        }
    }
    
    function updateReadingStats() {
        const readBooks = JSON.parse(localStorage.getItem('readBooks') || '[]');
        const totalBooks = document.querySelectorAll('.read-btn').length;
        
        // Создаем элемент статистики, если его нет
        if (!document.querySelector('.reading-stats')) {
            const statsElement = document.createElement('div');
            statsElement.className = 'reading-stats';
            statsElement.innerHTML = `
                <p style="color: white; font-size: 1rem; margin: 16px 0; opacity: 0.9;">
                    📚 Прочитано: <span class="read-count">${readBooks.length}</span> из ${totalBooks} книг
                    <span class="progress-bar" style="display: inline-block; margin-left: 10px; background: rgba(255,255,255,0.3); border-radius: 10px; width: 100px; height: 8px; overflow: hidden;">
                        <span class="progress-fill" style="display: block; background: white; height: 100%; width: ${(readBooks.length / totalBooks * 100)}%; transition: width 0.3s ease; border-radius: 10px;"></span>
                    </span>
                </p>
            `;
            
            const header = document.querySelector('header');
            header.appendChild(statsElement);
        } else {
            const progressPercentage = (readBooks.length / totalBooks * 100);
            document.querySelector('.read-count').textContent = readBooks.length;
            document.querySelector('.progress-fill').style.width = `${progressPercentage}%`;
        }
    }
    
    // Инициализируем трекер чтения
    initReadingTracker();
    
    // Поиск по книгам
    function createSearchBox() {
        // HTML: input + кнопка очистки
        const searchHTML = `
            <div class="search-container">
                <input type="text" id="bookSearch" placeholder="Поиск книг...">
                <button type="button" id="clearSearch" class="search-clear" title="Очистить поиск">✖</button>
            </div>
        `;

        const firstSection = document.querySelector('section');
        firstSection.insertAdjacentHTML('beforebegin', searchHTML);

        // Обработчик поиска
        const searchInput = document.getElementById('bookSearch');
        const clearBtn = document.getElementById('clearSearch');

        function filterBooks() {
            const searchTerm = searchInput.value.toLowerCase();
            const bookItems = document.querySelectorAll('li');

            bookItems.forEach(item => {
                const bookTitle = item.querySelector('.book-link')?.textContent.toLowerCase() || '';
                if (!searchTerm || bookTitle.includes(searchTerm)) {
                    item.style.display = 'block';
                } else {
                    item.style.display = 'none';
                }
            });
        }

        searchInput.addEventListener('input', filterBooks);

        // Очистка поля поиска по кнопке
        clearBtn.addEventListener('click', function(e) {
            e.preventDefault();
            searchInput.value = '';
            filterBooks();
            searchInput.focus();
        });

        // Визуальные состояния (фокус/blur) — управляем через CSS, но добавим небольшой accessibility-акцент
        searchInput.addEventListener('focus', function() {
            this.classList.add('focused');
        });

        searchInput.addEventListener('blur', function() {
            this.classList.remove('focused');
        });
    }
    
    // Создаем поиск
    createSearchBox();
    
    console.log('📚 Детская библиотека загружена!');
});