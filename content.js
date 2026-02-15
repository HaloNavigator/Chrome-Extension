
// Halo Navigator - Content Script for shortcuts
window.addEventListener('keydown', (e) => {
  const isHash = e.key === '#' || (e.shiftKey && (e.key === '3' || e.code === 'Digit3'));
  const target = e.target;
  const isTyping = ['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName) || target.isContentEditable;

  if (isHash && !isTyping) {
    e.preventDefault();
    e.stopPropagation();
    // In a real extension, this would trigger a UI injection or open the palette
    console.log("Halo Navigator: Palette shortcut detected.");
  }
}, true);
