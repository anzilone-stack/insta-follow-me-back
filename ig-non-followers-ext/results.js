document.addEventListener('DOMContentLoaded', () => {
  chrome.storage.local.get(['notFollowingBack'], (result) => {
    const users = result.notFollowingBack || [];
    const statsEl = document.getElementById('stats');
    const gridEl = document.getElementById('usersGrid');

    // Update the on-page text
    statsEl.innerHTML = `Found <strong>${users.length}</strong> users who don't follow you back`;
    
    // Update the actual browser tab title
    document.title = `(${users.length}) Not Following Back`;

    if (users.length === 0) {
      gridEl.innerHTML = `<p style="grid-column: 1 / -1; text-align: center; color: #888;">You're all good! Everyone you follow follows you back.</p>`;
      return;
    }

    users.forEach(user => {
      const card = document.createElement('div');
      card.className = 'user-card';

      const fallbackImg = 'https://via.placeholder.com/80?text=' + user.username.charAt(0).toUpperCase();
      const imgUrl = user.pic || fallbackImg;

      card.innerHTML = `
        <img src="${imgUrl}" alt="${user.username}" class="avatar">
        <a href="https://instagram.com/${user.username}" target="_blank" class="username">@${user.username}</a>
        <div class="fullname">${user.fullName || ''}</div>
        <a href="https://instagram.com/${user.username}" target="_blank" class="action-btn">View Profile</a>
      `;
      
      const imgEl = card.querySelector('.avatar');
      imgEl.addEventListener('error', () => {
        imgEl.src = fallbackImg;
      });

      gridEl.appendChild(card);
    });
  });
});
