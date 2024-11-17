// Constants
const STORAGE_KEY = 'BOOKSHELF_APPS';
const RENDER_EVENT = 'render-books';
const SAVED_EVENT = 'saved-books';
const SEARCH_EVENT = 'search-books';
const DARK_MODE_KEY = 'BOOKSHELF_DARK_MODE';

// DOM Elements
const bookForm = document.getElementById('bookForm');
const searchForm = document.getElementById('searchBook');
const editForm = document.getElementById('editForm');
const editModal = document.getElementById('editModal');

// Book Data
let books = [];
let editingBookId = null;

// Initialize
document.addEventListener('DOMContentLoaded', () => {
  loadDataFromStorage();
  renderBooks();

  bookForm.addEventListener('submit', addBook);
  searchForm.addEventListener('submit', searchBooks);
  editForm.addEventListener('submit', saveEditedBook);

  document.addEventListener(RENDER_EVENT, renderBooks);
  document.addEventListener(SAVED_EVENT, saveDataToStorage);
  document.addEventListener(SEARCH_EVENT, handleSearchEvent);

  // Tambahkan kode dark mode ini
  const darkModeToggle = document.getElementById('darkModeToggle');

  // Load dark mode preference
  const isDarkMode = localStorage.getItem(DARK_MODE_KEY) === 'true';
  if (isDarkMode) {
    document.body.classList.add('dark-mode');
    darkModeToggle.textContent = '☀️';
  }

  // Dark mode toggle functionality
  darkModeToggle.addEventListener('click', () => {
    document.body.classList.toggle('dark-mode');
    const isDark = document.body.classList.contains('dark-mode');
    localStorage.setItem(DARK_MODE_KEY, isDark);
    darkModeToggle.textContent = isDark ? '☀️' : '🌙';

    // Add button press animation
    darkModeToggle.style.transform = 'scale(0.8)';
    setTimeout(() => {
      darkModeToggle.style.transform = 'scale(1)';
    }, 200);
  });

  // Add animation for search input
  document.getElementById('searchBookTitle').addEventListener('input', function(e) {
    this.style.animation = 'none';
    this.offsetHeight; // Trigger reflow
    this.style.animation = 'typing 0.5s steps(30, end)';
  });
});

// Book Management Functions
function addBook(event) {
  event.preventDefault();

  const title = document.getElementById('bookFormTitle').value;
  const author = document.getElementById('bookFormAuthor').value;
  const year = parseInt(document.getElementById('bookFormYear').value);
  const isComplete = document.getElementById('bookFormIsComplete').checked;

  const id = Date.now();
  const bookObject = { id, title, author, year, isComplete };

  books.push(bookObject);
  document.dispatchEvent(new Event(RENDER_EVENT));
  document.dispatchEvent(new Event(SAVED_EVENT));

  // Add animation for new book
  const newBook = document.querySelector(`[data-bookid="${id}"]`);
  if (newBook) {
    newBook.style.animation = 'none';
    newBook.offsetHeight; // Trigger reflow
    newBook.style.animation = 'slideIn 0.5s ease-out';
  }

  bookForm.reset();
}

function deleteBook(bookId) {
  const bookIndex = books.findIndex(book => book.id === bookId);
  
  if (bookIndex !== -1) {
    if (confirm('Apakah Anda yakin ingin menghapus buku ini?')) {
      const bookElement = document.querySelector(`[data-bookid="${bookId}"]`);
      if (bookElement) {
        bookElement.classList.add('removing');
        setTimeout(() => {
          books.splice(bookIndex, 1);
          document.dispatchEvent(new Event(RENDER_EVENT));
          document.dispatchEvent(new Event(SAVED_EVENT));
        }, 500); // Match animation duration
      }
    }
  }
}

function toggleBookStatus(bookId) {
  const bookIndex = books.findIndex(book => book.id === bookId);
  
  if (bookIndex !== -1) {
    books[bookIndex].isComplete = !books[bookIndex].isComplete;
    document.dispatchEvent(new Event(RENDER_EVENT));
    document.dispatchEvent(new Event(SAVED_EVENT));
  }
}

// Edit Functions
function openEditModal(bookId) {
  const book = books.find(b => b.id === bookId);
  if (!book) return;

  editingBookId = bookId;
  document.getElementById('editTitle').value = book.title;
  document.getElementById('editAuthor').value = book.author;
  document.getElementById('editYear').value = book.year;
  document.getElementById('editIsComplete').checked = book.isComplete;

  editModal.style.display = 'block';
  setTimeout(() => {
    editModal.classList.add('active');
  }, 10);
}

function closeEditModal() {
  editModal.classList.remove('active');
  setTimeout(() => {
    editModal.style.display = 'none';
    editingBookId = null;
    editForm.reset();
  }, 300);
}

function saveEditedBook(event) {
  event.preventDefault();

  if (!editingBookId) return;

  const bookIndex = books.findIndex(book => book.id === editingBookId);
  if (bookIndex === -1) return;

  books[bookIndex] = {
    ...books[bookIndex],
    title: document.getElementById('editTitle').value,
    author: document.getElementById('editAuthor').value,
    year: parseInt(document.getElementById('editYear').value),
    isComplete: document.getElementById('editIsComplete').checked
  };

  closeEditModal();
  document.dispatchEvent(new Event(RENDER_EVENT));
  document.dispatchEvent(new Event(SAVED_EVENT));
}

// Search Function
function searchBooks(event) {
  event.preventDefault();
  
  const searchTerm = document.getElementById('searchBookTitle').value.toLowerCase();
  document.dispatchEvent(new CustomEvent(SEARCH_EVENT, { 
    detail: { searchTerm } 
  }));
}

function handleSearchEvent(event) {
  const searchTerm = event.detail.searchTerm;
  
  if (searchTerm.trim() === '') {
    renderBooks();
    return;
  }

  const filteredBooks = books.filter(book => 
    book.title.toLowerCase().includes(searchTerm)
  );

  renderFilteredBooks(filteredBooks);
}

// Storage Functions
function loadDataFromStorage() {
  const serializedData = localStorage.getItem(STORAGE_KEY);
  
  if (serializedData !== null) {
    books = JSON.parse(serializedData);
  }
}

function saveDataToStorage() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(books));
}

// Rendering Functions
function createBookElement(bookObject) {
  const { id, title, author, year, isComplete } = bookObject;

  const bookItem = document.createElement('div');
  bookItem.setAttribute('data-bookid', id);
  bookItem.setAttribute('data-testid', 'bookItem');
  bookItem.classList.add('book-item');

  const titleElement = document.createElement('h3');
  titleElement.setAttribute('data-testid', 'bookItemTitle');
  titleElement.textContent = title;

  const authorElement = document.createElement('p');
  authorElement.setAttribute('data-testid', 'bookItemAuthor');
  authorElement.textContent = `Penulis: ${author}`;

  const yearElement = document.createElement('p');
  yearElement.setAttribute('data-testid', 'bookItemYear');
  yearElement.textContent = `Tahun: ${year}`;

  const actionContainer = document.createElement('div');
  actionContainer.classList.add('book-actions');

  const toggleButton = document.createElement('button');
  toggleButton.setAttribute('data-testid', 'bookItemIsCompleteButton');
  toggleButton.classList.add('complete-btn');
  toggleButton.textContent = isComplete ? 'Belum selesai dibaca' : 'Selesai dibaca';
  toggleButton.onclick = () => toggleBookStatus(id);

  const deleteButton = document.createElement('button');
  deleteButton.setAttribute('data-testid', 'bookItemDeleteButton');
  deleteButton.classList.add('delete-btn');
  deleteButton.textContent = 'Hapus buku';
  deleteButton.onclick = () => deleteBook(id);

  const editButton = document.createElement('button');
  editButton.setAttribute('data-testid', 'bookItemEditButton');
  editButton.classList.add('edit-btn');
  editButton.textContent = 'Edit buku';
  editButton.onclick = () => openEditModal(id);

  actionContainer.append(toggleButton, deleteButton, editButton);
  bookItem.append(titleElement, authorElement, yearElement, actionContainer);

  return bookItem;
}

function renderBooks() {
  const incompleteBookList = document.getElementById('incompleteBookList');
  const completeBookList = document.getElementById('completeBookList');

  incompleteBookList.innerHTML = '';
  completeBookList.innerHTML = '';

  for (const book of books) {
    const bookElement = createBookElement(book);
    if (book.isComplete) {
      completeBookList.append(bookElement);
    } else {
      incompleteBookList.append(bookElement);
    }
  }
}

function renderFilteredBooks(filteredBooks) {
  const incompleteBookList = document.getElementById('incompleteBookList');
  const completeBookList = document.getElementById('completeBookList');

  incompleteBookList.innerHTML = '';
  completeBookList.innerHTML = '';

  for (const book of filteredBooks) {
    const bookElement = createBookElement(book);
    if (book.isComplete) {
      completeBookList.append(bookElement);
    } else {
      incompleteBookList.append(bookElement);
    }
  }
}
