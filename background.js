chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'openAndPin') {
    openAndPinBookmarks(request.folderId);
  } else if (request.action === 'getPMFolders') {
    getPMFolders(sendResponse);
    return true; // keep the messaging channel open for sendResponse
  }
});

function openAndPinBookmarks(bookmarkId) {
  chrome.bookmarks.getSubTree(bookmarkId, (bookmarkTreeNodes) => {
    const bookmarkUrls = bookmarkTreeNodes[0].children
      .map((b) => b.url)
      .filter(Boolean);

    if (bookmarkUrls.length > 0) {
      chrome.windows.create({}, (newWindow) => {
        bookmarkUrls.forEach((url, index) => {
          if (index === 0) {
            chrome.tabs.update(newWindow.tabs[0].id, {
              url: url,
              pinned: true,
            });
          } else {
            chrome.tabs.create({
              windowId: newWindow.id,
              url: url,
              pinned: true,
            });
          }
        });
      });
    }
  });
}

function getPMFolders(callback) {
  chrome.bookmarks.getTree((bookmarkTreeNodes) => {
    const pmFolders = [];
    function findPMFolders(nodes) {
      for (const node of nodes) {
        if (node.children) {
          if (node.title.startsWith('📌')) {
            pmFolders.push({ id: node.id, title: node.title });
          }
          findPMFolders(node.children);
        }
      }
    }
    findPMFolders(bookmarkTreeNodes);
    callback(pmFolders);
  });
}
