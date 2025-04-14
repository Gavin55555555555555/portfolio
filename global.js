console.log('IT’S ALIVE!');

function $$(selector, context = document) {
  return Array.from(context.querySelectorAll(selector));
}

let pages = [
  { url: '', title: 'Home' },
  { url: 'projects/', title: 'Projects' },
  { url: 'projects/', title: 'Contact' }
  { url: 'projects/', title: 'Resume' }
];

let nav = document.createElement('nav');
document.body.prepend(nav);

