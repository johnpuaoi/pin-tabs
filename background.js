chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'openAndPin') {
    openAndPinBookmarks(request.folderId);
  } else if (request.action === 'getPTFolders') {
    getPTFolders(sendResponse);
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

function getPTFolders(callback) {
  chrome.bookmarks.getTree((bookmarkTreeNodes) => {
    const pTFolders = [];
    function findPTFolders(nodes) {
      for (const node of nodes) {
        if (node.children) {
          if (node.title.startsWith('📌')) {
            pTFolders.push({ id: node.id, title: node.title });
          }
          findPTFolders(node.children);
        }
      }
    }
    findPTFolders(bookmarkTreeNodes);
    callback(pTFolders);
  });
}
