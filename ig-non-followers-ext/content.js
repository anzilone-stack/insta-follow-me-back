(async function() {
  function getCookie(name) {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop().split(';').shift();
  }

  const userId = getCookie('ds_user_id');
  const csrfToken = getCookie('csrftoken');

  if (!userId || !csrfToken) {
    chrome.runtime.sendMessage({ type: "SCAN_ERROR", message: "Please log in to Instagram first." });
    return;
  }

  const headers = {
    'x-csrftoken': csrfToken,
    'x-ig-app-id': '936619743392459',
    'x-requested-with': 'XMLHttpRequest'
  };

  async function fetchAll(type) {
    let allUsers = [];
    let maxId = '';
    let hasNext = true;

    while (hasNext) {
      try {
        const url = `https://www.instagram.com/api/v1/friendships/${userId}/${type}/?count=50&search_surface=follow_list_page${maxId ? '&max_id=' + maxId : ''}`;
        const response = await fetch(url, { headers });
        
        if (!response.ok) {
           if (response.status === 429) {
             throw new Error("Instagram Rate limit reached. Try again later.");
           }
           throw new Error("Failed to fetch " + type);
        }
        
        const data = await response.json();
        
        if (data.users && data.users.length > 0) {
          allUsers = allUsers.concat(data.users.map(u => ({
             id: u.pk ? u.pk.toString() : u.id.toString(), 
             username: u.username, 
             fullName: u.full_name, 
             pic: u.profile_pic_url 
          })));
        }

        hasNext = data.next_max_id ? true : false;
        maxId = data.next_max_id || '';

        chrome.runtime.sendMessage({ type: "SCAN_PROGRESS", message: `Fetched ${allUsers.length} ${type}...` });
        
        // Add a random delay to mimic human behavior and avoid rate limiting
        const delay = Math.floor(Math.random() * 1000) + 1000; 
        await new Promise(r => setTimeout(r, delay));
      } catch (err) {
        throw err;
      }
    }
    return allUsers;
  }

  try {
    chrome.runtime.sendMessage({ type: "SCAN_PROGRESS", message: "Fetching following..." });
    const following = await fetchAll("following");
    
    chrome.runtime.sendMessage({ type: "SCAN_PROGRESS", message: "Fetching followers..." });
    const followers = await fetchAll("followers");

    // Compare
    const followerIds = new Set(followers.map(f => f.id));
    const notFollowingBack = following.filter(f => !followerIds.has(f.id));

    // Save to storage
    chrome.storage.local.set({ notFollowingBack: notFollowingBack }, () => {
       chrome.runtime.sendMessage({ type: "SCAN_COMPLETE" });
    });

  } catch (error) {
    chrome.runtime.sendMessage({ type: "SCAN_ERROR", message: error.message || "An error occurred." });
  }
})();
