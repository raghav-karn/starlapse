class GalacticController {
  constructor() {
    this.isActive = false;
    this.activateBtn = document.getElementById('activate-btn');
    this.deactivateBtn = document.getElementById('deactivate-btn');
    this.status = document.getElementById('status');
    this.blackHole = document.querySelector('.black-hole');
    
    this.init();
  }
  
  init() {
    this.activateBtn.addEventListener('click', () => this.activateGalacticMode());
    this.deactivateBtn.addEventListener('click', () => this.deactivateGalacticMode());
    
    this.checkCurrentState();
  }
  
  async checkCurrentState() {
    try {
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      const result = await chrome.tabs.sendMessage(tab.id, { action: 'checkState' });
      
      if (result && result.isActive) {
        this.showActiveState();
      }
    } catch (error) {
      console.log('Could not check state:', error);
    }
  }
  
  async activateGalacticMode() {
    this.status.textContent = 'Initializing Interstellar mode...';
    this.blackHole.classList.add('active');
    this.activateBtn.classList.add('active');
    
    await this.sleep(800);
    
    this.status.textContent = 'Calibrating cosmic frequencies...';
    await this.sleep(1000);
    
    this.status.textContent = 'Entering cinematic galaxy...';
    
    try {
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      await chrome.tabs.sendMessage(tab.id, { action: 'activateGalacticMode' });
      
      await this.sleep(1500);
      
      this.showActiveState();
      this.status.textContent = 'Welcome to the Interstellar reader! 🌌';
      
    } catch (error) {
      this.status.textContent = 'Error: Please reload the page and try again... 💥';
      this.blackHole.classList.remove('active');
      this.activateBtn.classList.remove('active');
    }
  }
  
  async deactivateGalacticMode() {
    this.status.textContent = 'Exiting the cosmic realm...';
    
    try {
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      await chrome.tabs.sendMessage(tab.id, { action: 'deactivateGalacticMode' });
      
      await this.sleep(1000);
      
      this.showInactiveState();
      this.status.textContent = 'Back to normal spacetime! ✨';
      
    } catch (error) {
      this.status.textContent = 'Error: Please refresh the page! 🌪️';
    }
  }
  
  showActiveState() {
    this.isActive = true;
    this.activateBtn.style.display = 'none';
    this.deactivateBtn.style.display = 'inline-block';
    this.blackHole.classList.add('active');
  }
  
  showInactiveState() {
    this.isActive = false;
    this.activateBtn.style.display = 'inline-block';
    this.deactivateBtn.style.display = 'none';
    this.blackHole.classList.remove('active');
    this.activateBtn.classList.remove('active');
  }
  
  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

document.addEventListener('DOMContentLoaded', () => {
  new GalacticController();
});