// Photography gallery, loaded from the existing Firestore collection.
import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.0.0/firebase-app.js';
import { getFirestore, collection, getDocs, orderBy, query, where } from 'https://www.gstatic.com/firebasejs/10.0.0/firebase-firestore.js';

const firebaseConfig = {
  apiKey: 'AIzaSyCYHAWGm3xWiBVQM5aKQ2K4xlGQO9S1nXg',
  authDomain: 'dream-events-82cfc.firebaseapp.com',
  projectId: 'dream-events-82cfc',
  storageBucket: 'dream-events-82cfc.appspot.com',
  messagingSenderId: '371704635186',
  appId: '1:371704635186:android:7fe47ba3b7207e972bc12b',
};

const statusEl = document.getElementById('photo-status');
const grid = document.getElementById('photos');

async function loadPhotos() {
  try {
    const db = getFirestore(initializeApp(firebaseConfig));
    const q = query(collection(db, 'FlashAds'), where('hidden', '==', 'false'), orderBy('createdAt', 'desc'));
    const snap = await getDocs(q);
    const photos = [];
    snap.forEach((doc) => {
      const d = doc.data();
      const url = d.imageUrl || d.adPic;
      if (url) photos.push({ url, title: d.title || 'Untitled' });
    });
    if (!photos.length) {
      statusEl.textContent = 'No photos published yet.';
      return;
    }
    statusEl.remove();
    photos.forEach((p) => {
      const b = document.createElement('button');
      b.type = 'button';
      b.setAttribute('aria-label', 'Open photo: ' + p.title);
      const img = document.createElement('img');
      img.src = p.url;
      img.alt = p.title;
      img.loading = 'lazy';
      b.appendChild(img);
      b.addEventListener('click', () => window.openLightbox(p.url, p.title));
      grid.appendChild(b);
    });
  } catch (err) {
    statusEl.textContent = 'Photos couldn’t load right now. Refresh the page to try again.';
  }
}

loadPhotos();
