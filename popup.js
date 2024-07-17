document.addEventListener('DOMContentLoaded', () => {
  chrome.runtime.sendMessage({ action: 'getPTFolders' }, (pmFolders) => {
    const foldersDiv = document.getElementById('folders');
    if (pmFolders.length === 0) {
      const noFoldersMsg = document.createElement('p');
      noFoldersMsg.textContent =
        'No folders found. Prepend bookmark folders with 📌 to display them here.';
      foldersDiv.appendChild(noFoldersMsg);
    } else {
      pmFolders.forEach((folder) => {
        const button = document.createElement('button');
        const pTag = document.createElement('p');
        pTag.textContent = folder.title.replace('📌', '');
        button.appendChild(pTag);
        button.addEventListener('click', () => {
          chrome.runtime.sendMessage({
            action: 'openAndPin',
            folderId: folder.id,
          });
        });
        foldersDiv.appendChild(button);
      });
    }
  });
});
