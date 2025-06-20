class GalacticReader {
  constructor() {
    this.isActive = false;
    this.readerModeId = 'galactic-reader-mode';
    this.readingStartTime = null;
    this.currentGalaxy = 'andromeda';
    this.readingProgress = 0;
    this.animationFrameId = null;
    this.audioContext = null;
    this.audioEnabled = false;
    this.oscillator = null;
    this.gainNode = null;
    
    chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
      if (request.action === 'activateGalacticMode') {
        this.activateGalacticReader();
        sendResponse({ success: true });
      } else if (request.action === 'deactivateGalacticMode') {
        this.deactivateGalacticReader();
        sendResponse({ success: true });
      } else if (request.action === 'checkState') {
        sendResponse({ isActive: this.isActive });
      } else if (request.action === 'changeGalaxy') {
        this.changeGalaxy(request.galaxy);
        sendResponse({ success: true });
      } else if (request.action === 'triggerCosmicEvent') {
        this.triggerCosmicEvent(request.event);
        sendResponse({ success: true });
      }
    });
    
    this.checkPersistentMode();
  }
  
  async checkPersistentMode() {
    try {
      const hostname = window.location.hostname;
      const data = await chrome.storage.local.get([`galactic_${hostname}`]);
      if (data[`galactic_${hostname}`]) {
        setTimeout(() => this.activateGalacticReader(), 1000);
      }
    } catch (error) {
      console.log('Could not check persistent mode:', error);
    }
  }
  
  async activateGalacticReader() {
    if (this.isActive) return;
    
    this.isActive = true;
    this.readingStartTime = Date.now();
    
    const hostname = window.location.hostname;
    try {
      await chrome.storage.local.set({ [`galactic_${hostname}`]: true });
    } catch (error) {
      console.log('Could not save persistent state:', error);
    }
    
    this.createInterstellarGalacticReader();
    this.initializeInterstellarBackground();
    this.startAnimationLoop();
    this.setupReadingProgress();
  }
  
  async deactivateGalacticReader() {
    if (!this.isActive) return;
    
    this.isActive = false;
    
    const hostname = window.location.hostname;
    try {
      await chrome.storage.local.remove(`galactic_${hostname}`);
    } catch (error) {
      console.log('Could not remove persistent state:', error);
    }
    
    this.removeGalacticReader();
    this.stopAnimationLoop();
    this.stopAudio();
  }
  
  createInterstellarGalacticReader() {
    const existing = document.getElementById(this.readerModeId);
    if (existing) existing.remove();
    
    const content = this.extractMainContent();
    
    const readerOverlay = document.createElement('div');
    readerOverlay.id = this.readerModeId;
    readerOverlay.innerHTML = `
      <div class="galactic-universe-interstellar galaxy-${this.currentGalaxy}">
        <!-- Interstellar Background System -->
        <div class="interstellar-backdrop">
          <div class="deep-space-void"></div>
          <div class="accretion-disk-bg"></div>
          <div class="stellar-nursery"></div>
          <div class="cosmic-radiation"></div>
          <div class="gravitational-waves"></div>
        </div>
        
        <!-- Cinematic Black Hole System -->
        <div class="interstellar-black-hole">
          <div class="event-horizon-ring"></div>
          <div class="accretion-disk-main"></div>
          <div class="photon-sphere"></div>
          <div class="ergosphere"></div>
        </div>
        
        <!-- Floating Celestial Bodies -->
        <div class="celestial-system">
          <div class="stellar-object star-1"></div>
          <div class="stellar-object star-2"></div>
          <div class="stellar-object nebula-1"></div>
          <div class="stellar-object planet-1"></div>
          <div class="stellar-object planet-2"></div>
        </div>
        
        <!-- Professional Reading Interface -->
        <div class="reading-interface-interstellar">
          <!-- Elegant Header -->
          <div class="reader-header-pro">
            <div class="galaxy-selector-pro">
              <span class="galaxy-name-pro">${this.getGalaxyName()}</span>
              <div class="galaxy-dots-pro">
                <div class="dot-pro active" data-galaxy="andromeda" title="Andromeda"></div>
                <div class="dot-pro" data-galaxy="milkyway" title="Milky Way"></div>
                <div class="dot-pro" data-galaxy="whirlpool" title="Whirlpool"></div>
                <div class="dot-pro" data-galaxy="sombrero" title="Sombrero"></div>
                <div class="dot-pro" data-galaxy="pinwheel" title="Pinwheel"></div>
              </div>
            </div>
            
            <div class="progress-system">
              <div class="progress-track-pro">
                <div class="progress-fill-pro"></div>
                <div class="progress-glow"></div>
              </div>
              <span class="progress-text-pro">0%</span>
            </div>
            
            <div class="reader-controls-pro">
              <button class="control-btn-pro audio-btn" id="cosmicAudio" title="Toggle Cosmic Audio">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02z"/>
                </svg>
              </button>
              <button class="control-btn-pro exit-btn" id="exitReader" title="Exit Reader Mode">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
                </svg>
              </button>
            </div>
          </div>
          
          <!-- Immersive Reading Content -->
          <div class="reader-scroll-interstellar">
            <article class="reader-content-interstellar">
              ${content}
            </article>
          </div>
        </div>
        
        <!-- Subtle Cosmic Events -->
        <div class="cosmic-events-interstellar"></div>
      </div>
    `;
    
    const style = document.createElement('style');
    style.textContent = `
      #${this.readerModeId} {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        z-index: 999999;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif;
        animation: interstellar-entrance 2.5s cubic-bezier(0.25, 0.46, 0.45, 0.94);
        overflow: hidden;
      }
      
      @keyframes interstellar-entrance {
        0% { 
          opacity: 0; 
          transform: scale(0.8) perspective(1000px) rotateX(10deg);
          filter: blur(20px);
        }
        50% {
          opacity: 0.7;
          transform: scale(0.95) perspective(1000px) rotateX(5deg);
          filter: blur(10px);
        }
        100% { 
          opacity: 1; 
          transform: scale(1) perspective(1000px) rotateX(0deg);
          filter: blur(0);
        }
      }
      
      .galactic-universe-interstellar {
        position: relative;
        width: 100%;
        height: 100%;
        overflow: hidden;
        transition: all 0.8s cubic-bezier(0.25, 0.46, 0.45, 0.94);
      }
      
      /* Interstellar Background System */
      .interstellar-backdrop {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        overflow: hidden;
      }
      
      .deep-space-void {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: 
          radial-gradient(ellipse at 30% 20%, rgba(0, 0, 0, 1) 0%, rgba(5, 5, 15, 0.9) 40%, rgba(10, 10, 20, 0.8) 100%),
          radial-gradient(ellipse at 70% 80%, rgba(0, 0, 0, 1) 0%, rgba(8, 5, 20, 0.9) 50%, rgba(15, 10, 25, 0.7) 100%);
        animation: void-pulse 25s ease-in-out infinite alternate;
      }
      
      @keyframes void-pulse {
        0% { transform: scale(1) rotate(0deg); opacity: 0.9; }
        100% { transform: scale(1.03) rotate(1deg); opacity: 1; }
      }
      
      .accretion-disk-bg {
        position: absolute;
        top: 50%;
        left: 80%;
        width: 400px;
        height: 400px;
        transform: translate(-50%, -50%);
        background: 
          conic-gradient(from 0deg, 
            transparent 0deg, 
            rgba(255, 140, 0, 0.1) 60deg, 
            rgba(255, 100, 0, 0.15) 120deg, 
            rgba(200, 80, 20, 0.08) 180deg, 
            rgba(150, 60, 0, 0.05) 240deg, 
            rgba(100, 40, 0, 0.02) 300deg, 
            transparent 360deg);
        border-radius: 50%;
        animation: accretion-rotation 40s linear infinite;
        filter: blur(2px);
        opacity: 0.6;
      }
      
      @keyframes accretion-rotation {
        0% { transform: translate(-50%, -50%) rotate(0deg); }
        100% { transform: translate(-50%, -50%) rotate(360deg); }
      }
      
      .stellar-nursery {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: 
          radial-gradient(ellipse 800px 300px at 10% 30%, rgba(100, 50, 200, 0.08) 0%, transparent 70%),
          radial-gradient(ellipse 600px 400px at 90% 70%, rgba(50, 150, 200, 0.06) 0%, transparent 60%),
          radial-gradient(ellipse 400px 600px at 50% 90%, rgba(200, 100, 50, 0.04) 0%, transparent 50%);
        animation: stellar-flow 35s ease-in-out infinite alternate;
      }
      
      @keyframes stellar-flow {
        0% { 
          transform: translateX(-30px) translateY(-20px) rotate(-1deg);
          opacity: 0.7;
        }
        100% { 
          transform: translateX(30px) translateY(20px) rotate(1deg);
          opacity: 1;
        }
      }
      
      .cosmic-radiation {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background-image:
          radial-gradient(1px 1px at 25px 35px, rgba(255,255,255,0.8) 100%, transparent 0),
          radial-gradient(1px 1px at 85px 75px, rgba(255,255,255,0.6) 100%, transparent 0),
          radial-gradient(1px 1px at 145px 45px, rgba(255,255,255,0.7) 100%, transparent 0),
          radial-gradient(1px 1px at 195px 85px, rgba(255,255,255,0.5) 100%, transparent 0);
        background-repeat: repeat;
        background-size: 220px 140px;
        animation: radiation-drift 60s linear infinite;
        opacity: 0.4;
      }
      
      @keyframes radiation-drift {
        0% { transform: translateX(0) translateY(0); }
        100% { transform: translateX(-220px) translateY(-140px); }
      }
      
      .gravitational-waves {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: 
          radial-gradient(circle at 20% 30%, rgba(255, 255, 255, 0.02) 0%, transparent 40%),
          radial-gradient(circle at 80% 70%, rgba(255, 255, 255, 0.015) 0%, transparent 50%);
        animation: gravitational-ripple 20s ease-in-out infinite;
      }
      
      @keyframes gravitational-ripple {
        0%, 100% { 
          transform: scale(1);
          opacity: 0.3;
        }
        50% { 
          transform: scale(1.05);
          opacity: 0.6;
        }
      }
      
      /* Cinematic Black Hole System */
      .interstellar-black-hole {
        position: absolute;
        top: 15%;
        right: 8%;
        width: 200px;
        height: 200px;
        opacity: 0.3;
        animation: black-hole-system-rotation 120s linear infinite;
      }
      
      @keyframes black-hole-system-rotation {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
      }
      
      .event-horizon-ring {
        position: absolute;
        top: 50%;
        left: 50%;
        width: 60px;
        height: 60px;
        transform: translate(-50%, -50%);
        background: radial-gradient(circle, transparent 30%, rgba(0, 0, 0, 1) 35%, rgba(0, 0, 0, 0.8) 50%, transparent 55%);
        border-radius: 50%;
        box-shadow: 
          inset 0 0 30px rgba(0, 0, 0, 1),
          0 0 50px rgba(255, 140, 0, 0.2);
      }
      
      .accretion-disk-main {
        position: absolute;
        top: 50%;
        left: 50%;
        width: 160px;
        height: 160px;
        transform: translate(-50%, -50%);
        background: 
          conic-gradient(from 0deg, 
            transparent 0deg, 
            rgba(255, 140, 0, 0.3) 45deg, 
            rgba(255, 100, 0, 0.4) 90deg, 
            rgba(200, 80, 20, 0.2) 135deg, 
            rgba(150, 60, 0, 0.1) 180deg, 
            rgba(100, 40, 0, 0.05) 225deg, 
            rgba(80, 30, 0, 0.02) 270deg, 
            transparent 315deg);
        border-radius: 50%;
        animation: accretion-main-spin 15s linear infinite;
        mask: radial-gradient(circle, transparent 35%, white 40%, white 80%, transparent 85%);
        -webkit-mask: radial-gradient(circle, transparent 35%, white 40%, white 80%, transparent 85%);
      }
      
      @keyframes accretion-main-spin {
        0% { transform: translate(-50%, -50%) rotate(0deg); }
        100% { transform: translate(-50%, -50%) rotate(360deg); }
      }
      
      .photon-sphere {
        position: absolute;
        top: 50%;
        left: 50%;
        width: 120px;
        height: 120px;
        transform: translate(-50%, -50%);
        border: 1px solid rgba(255, 255, 255, 0.1);
        border-radius: 50%;
        animation: photon-orbit 8s linear infinite;
      }
      
      @keyframes photon-orbit {
        0% { transform: translate(-50%, -50%) rotate(0deg) scale(1); }
        50% { transform: translate(-50%, -50%) rotate(180deg) scale(1.05); }
        100% { transform: translate(-50%, -50%) rotate(360deg) scale(1); }
      }
      
      /* Floating Celestial Bodies */
      .celestial-system {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        pointer-events: none;
      }
      
      .stellar-object {
        position: absolute;
        border-radius: 50%;
        opacity: 0.6;
      }
      
      .star-1 {
        top: 20%;
        left: 15%;
        width: 8px;
        height: 8px;
        background: radial-gradient(circle, #ffffff 0%, rgba(255, 255, 255, 0.8) 40%, transparent 100%);
        animation: stellar-twinkle 4s ease-in-out infinite, stellar-drift-1 30s ease-in-out infinite alternate;
        box-shadow: 0 0 20px rgba(255, 255, 255, 0.4);
      }
      
      .star-2 {
        top: 70%;
        left: 85%;
        width: 6px;
        height: 6px;
        background: radial-gradient(circle, #ffeb3b 0%, rgba(255, 235, 59, 0.8) 40%, transparent 100%);
        animation: stellar-twinkle 6s ease-in-out infinite, stellar-drift-2 25s ease-in-out infinite alternate;
        box-shadow: 0 0 15px rgba(255, 235, 59, 0.4);
      }
      
      .nebula-1 {
        top: 40%;
        left: 5%;
        width: 40px;
        height: 40px;
        background: radial-gradient(ellipse, rgba(138, 43, 226, 0.3) 0%, rgba(138, 43, 226, 0.1) 60%, transparent 100%);
        animation: nebula-pulse 12s ease-in-out infinite, nebula-drift 40s ease-in-out infinite alternate;
        filter: blur(2px);
      }
      
      .planet-1 {
        top: 60%;
        left: 20%;
        width: 12px;
        height: 12px;
        background: linear-gradient(45deg, #4fc3f7, #29b6f6);
        animation: planetary-orbit 45s linear infinite;
        box-shadow: 0 0 10px rgba(79, 195, 247, 0.3);
      }
      
      .planet-2 {
        top: 80%;
        left: 70%;
        width: 10px;
        height: 10px;
        background: linear-gradient(45deg, #ff8a65, #ff7043);
        animation: planetary-orbit 60s linear infinite reverse;
        box-shadow: 0 0 8px rgba(255, 138, 101, 0.3);
      }
      
      @keyframes stellar-twinkle {
        0%, 100% { opacity: 0.6; transform: scale(1); }
        50% { opacity: 1; transform: scale(1.3); }
      }
      
      @keyframes stellar-drift-1 {
        0% { transform: translateX(0) translateY(0); }
        100% { transform: translateX(20px) translateY(-10px); }
      }
      
      @keyframes stellar-drift-2 {
        0% { transform: translateX(0) translateY(0); }
        100% { transform: translateX(-15px) translateY(15px); }
      }
      
      @keyframes nebula-pulse {
        0%, 100% { opacity: 0.6; transform: scale(1); }
        50% { opacity: 0.9; transform: scale(1.2); }
      }
      
      @keyframes nebula-drift {
        0% { transform: translateX(0) translateY(0) rotate(0deg); }
        100% { transform: translateX(30px) translateY(-20px) rotate(10deg); }
      }
      
      @keyframes planetary-orbit {
        0% { transform: translateX(0) translateY(0) rotate(0deg); }
        25% { transform: translateX(30px) translateY(-15px) rotate(90deg); }
        50% { transform: translateX(0) translateY(-30px) rotate(180deg); }
        75% { transform: translateX(-30px) translateY(-15px) rotate(270deg); }
        100% { transform: translateX(0) translateY(0) rotate(360deg); }
      }
      
      /* Professional Reading Interface */
      .reading-interface-interstellar {
        position: relative;
        width: 100%;
        height: 100%;
        z-index: 10;
      }
      
      .reader-header-pro {
        position: sticky;
        top: 0;
        left: 0;
        right: 0;
        height: 65px;
        background: rgba(0, 0, 0, 0.85);
        backdrop-filter: blur(25px);
        border-bottom: 1px solid rgba(255, 255, 255, 0.08);
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 0 35px;
        z-index: 20;
        animation: header-slide-in 1s ease-out 0.5s both;
      }
      
      @keyframes header-slide-in {
        0% { transform: translateY(-100%); opacity: 0; }
        100% { transform: translateY(0); opacity: 1; }
      }
      
      .galaxy-selector-pro {
        display: flex;
        align-items: center;
        gap: 18px;
      }
      
      .galaxy-name-pro {
        font-size: 15px;
        font-weight: 600;
        color: rgba(255, 255, 255, 0.95);
        letter-spacing: 0.8px;
        text-transform: uppercase;
      }
      
      .galaxy-dots-pro {
        display: flex;
        gap: 10px;
      }
      
      .dot-pro {
        width: 10px;
        height: 10px;
        border-radius: 50%;
        background: rgba(255, 255, 255, 0.25);
        cursor: pointer;
        transition: all 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94);
        position: relative;
      }
      
      .dot-pro:hover {
        background: rgba(255, 255, 255, 0.6);
        transform: scale(1.3);
      }
      
      .dot-pro.active {
        transform: scale(1.2);
        box-shadow: 0 0 15px rgba(255, 255, 255, 0.6);
      }
      
      .progress-system {
        display: flex;
        align-items: center;
        gap: 15px;
        flex: 1;
        max-width: 350px;
        margin: 0 50px;
      }
      
      .progress-track-pro {
        flex: 1;
        height: 8px;
        background: rgba(255, 255, 255, 0.08);
        border-radius: 4px;
        overflow: hidden;
        position: relative;
        box-shadow: inset 0 2px 4px rgba(0, 0, 0, 0.3);
      }
      
      .progress-fill-pro {
        height: 100%;
        width: 0%;
        border-radius: 4px;
        transition: width 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94);
        position: relative;
        overflow: hidden;
      }
      
      .progress-glow {
        position: absolute;
        top: 0;
        right: 0;
        width: 20px;
        height: 100%;
        background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.4));
        animation: progress-shimmer 2s ease-in-out infinite;
      }
      
      @keyframes progress-shimmer {
        0%, 100% { opacity: 0; }
        50% { opacity: 1; }
      }
      
      .progress-text-pro {
        font-size: 13px;
        font-weight: 600;
        color: rgba(255, 255, 255, 0.9);
        min-width: 40px;
        text-align: right;
      }
      
      .reader-controls-pro {
        display: flex;
        gap: 15px;
      }
      
      .control-btn-pro {
        width: 40px;
        height: 40px;
        border: 1px solid rgba(255, 255, 255, 0.15);
        background: rgba(255, 255, 255, 0.05);
        border-radius: 10px;
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        transition: all 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94);
        color: rgba(255, 255, 255, 0.7);
        position: relative;
        overflow: hidden;
      }
      
      .control-btn-pro::before {
        content: '';
        position: absolute;
        top: 0;
        left: -100%;
        width: 100%;
        height: 100%;
        background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.1), transparent);
        transition: left 0.5s;
      }
      
      .control-btn-pro:hover::before {
        left: 100%;
      }
      
      .control-btn-pro:hover {
        background: rgba(255, 255, 255, 0.12);
        border-color: rgba(255, 255, 255, 0.3);
        color: rgba(255, 255, 255, 0.95);
        transform: translateY(-2px);
        box-shadow: 0 8px 25px rgba(0, 0, 0, 0.3);
      }
      
      .control-btn-pro.active {
        background: rgba(138, 43, 226, 0.3);
        border-color: rgba(138, 43, 226, 0.6);
        color: #ffffff;
        box-shadow: 0 0 20px rgba(138, 43, 226, 0.4);
      }
      
      .exit-btn:hover {
        background: rgba(255, 59, 48, 0.3) !important;
        border-color: rgba(255, 59, 48, 0.6) !important;
        box-shadow: 0 0 20px rgba(255, 59, 48, 0.4) !important;
      }
      
      /* Immersive Reading Content */
      .reader-scroll-interstellar {
        height: calc(100vh - 65px);
        overflow-y: auto;
        scroll-behavior: smooth;
        animation: content-fade-in 1.5s ease-out 1s both;
      }
      
      @keyframes content-fade-in {
        0% { opacity: 0; transform: translateY(30px); }
        100% { opacity: 1; transform: translateY(0); }
      }
      
      .reader-scroll-interstellar::-webkit-scrollbar {
        width: 10px;
      }
      
      .reader-scroll-interstellar::-webkit-scrollbar-track {
        background: rgba(255, 255, 255, 0.03);
        border-radius: 5px;
      }
      
      .reader-scroll-interstellar::-webkit-scrollbar-thumb {
        border-radius: 5px;
        transition: background 0.3s ease;
      }
      
      .reader-scroll-interstellar::-webkit-scrollbar-thumb:hover {
        background: rgba(255, 255, 255, 0.3);
      }
      
      .reader-content-interstellar {
        max-width: 850px;
        margin: 0 auto;
        padding: 80px 60px 150px;
        color: #e8f4fd;
        font-family: 'Georgia', 'Times New Roman', serif;
        font-size: 19px;
        line-height: 1.8;
        font-weight: 400;
        position: relative;
      }
      
      .reader-content-interstellar::selection {
        background: rgba(138, 43, 226, 0.4);
        color: #ffffff;
      }
      
      .reader-content-interstellar h1 {
        font-size: 2.8em;
        font-weight: 700;
        line-height: 1.2;
        margin: 0 0 2em 0;
        color: #ffffff;
        text-align: center;
        position: relative;
      }
      
      .reader-content-interstellar h1::after {
        content: '';
        position: absolute;
        bottom: -20px;
        left: 50%;
        transform: translateX(-50%);
        width: 120px;
        height: 3px;
        border-radius: 2px;
      }
      
      .reader-content-interstellar h2 {
        font-size: 2em;
        font-weight: 600;
        line-height: 1.3;
        margin: 3em 0 1.2em 0;
        color: #b8d4f0;
        position: relative;
        padding-left: 25px;
      }
      
      .reader-content-interstellar h2::before {
        content: '';
        position: absolute;
        left: 0;
        top: 0.2em;
        width: 5px;
        height: 1.4em;
        border-radius: 3px;
      }
      
      .reader-content-interstellar h3 {
        font-size: 1.6em;
        font-weight: 600;
        line-height: 1.4;
        margin: 2.5em 0 1em 0;
        color: #94a3b8;
      }
      
      .reader-content-interstellar p {
        margin: 1.8em 0;
        color: #cbd5e1;
        text-align: justify;
        hyphens: auto;
      }
      
      .reader-content-interstellar p:first-of-type {
        font-size: 1.15em;
        color: #e2e8f0;
        font-weight: 500;
        line-height: 1.7;
      }
      
      .reader-content-interstellar a {
        color: #60a5fa;
        text-decoration: none;
        border-bottom: 2px solid rgba(96, 165, 250, 0.3);
        transition: all 0.3s ease;
      }
      
      .reader-content-interstellar a:hover {
        color: #93c5fd;
        border-bottom-color: #93c5fd;
      }
      
      .reader-content-interstellar img {
        max-width: 100%;
        height: auto;
        border-radius: 15px;
        margin: 3em 0;
        box-shadow: 0 25px 50px rgba(0, 0, 0, 0.4);
        border: 2px solid rgba(255, 255, 255, 0.08);
      }
      
      .reader-content-interstellar blockquote {
        margin: 3em 0;
        padding: 2em 2.5em;
        background: rgba(30, 41, 59, 0.4);
        border-left: 5px solid;
        border-radius: 0 12px 12px 0;
        font-style: italic;
        color: #94a3b8;
        position: relative;
        backdrop-filter: blur(10px);
      }
      
      .reader-content-interstellar blockquote::before {
        content: '"';
        position: absolute;
        top: -15px;
        left: 20px;
        font-size: 4em;
        font-family: Georgia, serif;
        opacity: 0.3;
      }
      
      .reader-content-interstellar code {
        background: rgba(15, 23, 42, 0.8);
        color: #a78bfa;
        padding: 0.3em 0.5em;
        border-radius: 6px;
        font-family: 'SF Mono', Monaco, 'Cascadia Code', 'Roboto Mono', Consolas, monospace;
        font-size: 0.9em;
        border: 1px solid rgba(167, 139, 250, 0.2);
      }
      
      .reader-content-interstellar pre {
        background: rgba(15, 23, 42, 0.9);
        padding: 2em;
        border-radius: 12px;
        overflow-x: auto;
        margin: 3em 0;
        border: 1px solid rgba(255, 255, 255, 0.1);
        backdrop-filter: blur(10px);
      }
      
      .reader-content-interstellar pre code {
        background: none;
        border: none;
        color: #e2e8f0;
        padding: 0;
      }
      
      /* Galaxy Themes - Full Page Theming */
      .galaxy-andromeda {
        background: 
          radial-gradient(ellipse at 30% 20%, rgba(138, 43, 226, 0.15) 0%, transparent 50%),
          radial-gradient(ellipse at 70% 80%, rgba(255, 20, 147, 0.12) 0%, transparent 60%),
          linear-gradient(135deg, #0a0a0f 0%, #1a0f2e 50%, #0a0a0f 100%);
      }
      
      .galaxy-andromeda .progress-fill-pro {
        background: linear-gradient(90deg, #8a2be2, #ff1493, #da70d6);
      }
      
      .galaxy-andromeda .reader-content-interstellar h1::after {
        background: linear-gradient(90deg, #8a2be2, #ff1493);
      }
      
      .galaxy-andromeda .reader-content-interstellar h2::before {
        background: linear-gradient(180deg, #8a2be2, #ff1493);
      }
      
      .galaxy-andromeda .reader-content-interstellar blockquote {
        border-left-color: #8a2be2;
      }
      
      .galaxy-andromeda .reader-content-interstellar blockquote::before {
        color: rgba(138, 43, 226, 0.3);
      }
      
      .galaxy-andromeda .reader-scroll-interstellar::-webkit-scrollbar-thumb {
        background: linear-gradient(180deg, #8a2be2, #ff1493);
      }
      
      .galaxy-andromeda .dot-pro.active {
        background: linear-gradient(45deg, #8a2be2, #ff1493);
      }
      
      .galaxy-milkyway {
        background: 
          radial-gradient(ellipse at 25% 30%, rgba(255, 215, 0, 0.12) 0%, transparent 60%),
          radial-gradient(ellipse at 75% 70%, rgba(255, 140, 0, 0.08) 0%, transparent 50%),
          linear-gradient(135deg, #0a0a0f 0%, #2a1f0f 50%, #0a0a0f 100%);
      }
      
      .galaxy-milkyway .progress-fill-pro {
        background: linear-gradient(90deg, #ffd700, #ffb347, #ff8c00);
      }
      
      .galaxy-milkyway .reader-content-interstellar h1::after {
        background: linear-gradient(90deg, #ffd700, #ff8c00);
      }
      
      .galaxy-milkyway .reader-content-interstellar h2::before {
        background: linear-gradient(180deg, #ffd700, #ff8c00);
      }
      
      .galaxy-milkyway .reader-content-interstellar blockquote {
        border-left-color: #ffd700;
      }
      
      .galaxy-milkyway .reader-content-interstellar blockquote::before {
        color: rgba(255, 215, 0, 0.3);
      }
      
      .galaxy-milkyway .reader-scroll-interstellar::-webkit-scrollbar-thumb {
        background: linear-gradient(180deg, #ffd700, #ff8c00);
      }
      
      .galaxy-milkyway .dot-pro.active {
        background: linear-gradient(45deg, #ffd700, #ff8c00);
      }
      
      .galaxy-whirlpool {
        background: 
          radial-gradient(ellipse at 20% 70%, rgba(0, 191, 255, 0.12) 0%, transparent 60%),
          radial-gradient(ellipse at 80% 30%, rgba(64, 224, 208, 0.1) 0%, transparent 50%),
          linear-gradient(135deg, #0a0a0f 0%, #0f1f2a 50%, #0a0a0f 100%);
      }
      
      .galaxy-whirlpool .progress-fill-pro {
        background: linear-gradient(90deg, #00bfff, #40e0d0, #00ced1);
      }
      
      .galaxy-whirlpool .reader-content-interstellar h1::after {
        background: linear-gradient(90deg, #00bfff, #40e0d0);
      }
      
      .galaxy-whirlpool .reader-content-interstellar h2::before {
        background: linear-gradient(180deg, #00bfff, #40e0d0);
      }
      
      .galaxy-whirlpool .reader-content-interstellar blockquote {
        border-left-color: #00bfff;
      }
      
      .galaxy-whirlpool .reader-content-interstellar blockquote::before {
        color: rgba(0, 191, 255, 0.3);
      }
      
      .galaxy-whirlpool .reader-scroll-interstellar::-webkit-scrollbar-thumb {
        background: linear-gradient(180deg, #00bfff, #40e0d0);
      }
      
      .galaxy-whirlpool .dot-pro.active {
        background: linear-gradient(45deg, #00bfff, #40e0d0);
      }
      
      .galaxy-sombrero {
        background: 
          radial-gradient(ellipse at 30% 40%, rgba(255, 107, 71, 0.12) 0%, transparent 60%),
          radial-gradient(ellipse at 70% 60%, rgba(255, 142, 60, 0.1) 0%, transparent 50%),
          linear-gradient(135deg, #0a0a0f 0%, #2a1510 50%, #0a0a0f 100%);
      }
      
      .galaxy-sombrero .progress-fill-pro {
        background: linear-gradient(90deg, #ff6b47, #ff8e3c, #ffa500);
      }
      
      .galaxy-sombrero .reader-content-interstellar h1::after {
        background: linear-gradient(90deg, #ff6b47, #ffa500);
      }
      
      .galaxy-sombrero .reader-content-interstellar h2::before {
        background: linear-gradient(180deg, #ff6b47, #ffa500);
      }
      
      .galaxy-sombrero .reader-content-interstellar blockquote {
        border-left-color: #ff6b47;
      }
      
      .galaxy-sombrero .reader-content-interstellar blockquote::before {
        color: rgba(255, 107, 71, 0.3);
      }
      
      .galaxy-sombrero .reader-scroll-interstellar::-webkit-scrollbar-thumb {
        background: linear-gradient(180deg, #ff6b47, #ffa500);
      }
      
      .galaxy-sombrero .dot-pro.active {
        background: linear-gradient(45deg, #ff6b47, #ffa500);
      }
      
      .galaxy-pinwheel {
        background: 
          radial-gradient(ellipse at 25% 25%, rgba(50, 205, 50, 0.12) 0%, transparent 60%),
          radial-gradient(ellipse at 75% 75%, rgba(0, 255, 127, 0.1) 0%, transparent 50%),
          linear-gradient(135deg, #0a0a0f 0%, #0f2a15 50%, #0a0a0f 100%);
      }
      
      .galaxy-pinwheel .progress-fill-pro {
        background: linear-gradient(90deg, #32cd32, #00ff7f, #98fb98);
      }
      
      .galaxy-pinwheel .reader-content-interstellar h1::after {
        background: linear-gradient(90deg, #32cd32, #00ff7f);
      }
      
      .galaxy-pinwheel .reader-content-interstellar h2::before {
        background: linear-gradient(180deg, #32cd32, #00ff7f);
      }
      
      .galaxy-pinwheel .reader-content-interstellar blockquote {
        border-left-color: #32cd32;
      }
      
      .galaxy-pinwheel .reader-content-interstellar blockquote::before {
        color: rgba(50, 205, 50, 0.3);
      }
      
      .galaxy-pinwheel .reader-scroll-interstellar::-webkit-scrollbar-thumb {
        background: linear-gradient(180deg, #32cd32, #00ff7f);
      }
      
      .galaxy-pinwheel .dot-pro.active {
        background: linear-gradient(45deg, #32cd32, #00ff7f);
      }
      
      /* Responsive Design */
      @media (max-width: 768px) {
        .reader-header-pro {
          padding: 0 25px;
          height: 60px;
        }
        
        .galaxy-name-pro {
          font-size: 13px;
        }
        
        .progress-system {
          max-width: 250px;
          margin: 0 25px;
        }
        
        .reader-content-interstellar {
          padding: 60px 35px 120px;
          font-size: 17px;
        }
        
        .reader-content-interstellar h1 {
          font-size: 2.2em;
        }
        
        .reader-content-interstellar h2 {
          font-size: 1.7em;
        }
        
        .interstellar-black-hole {
          width: 150px;
          height: 150px;
          opacity: 0.2;
        }
      }
    `;
    
    document.head.appendChild(style);
    document.body.appendChild(readerOverlay);
    document.body.style.overflow = 'hidden';
    
    this.setupInteractiveElements();
  }
  
  setupInteractiveElements() {
    document.querySelectorAll('.dot-pro').forEach(dot => {
      dot.addEventListener('click', (e) => {
        document.querySelectorAll('.dot-pro').forEach(d => d.classList.remove('active'));
        dot.classList.add('active');
        this.changeGalaxy(dot.dataset.galaxy);
      });
    });
    
    const audioBtn = document.getElementById('cosmicAudio');
    if (audioBtn) {
      audioBtn.addEventListener('click', () => {
        audioBtn.classList.toggle('active');
        this.toggleAudio();
      });
    }
    
    const exitBtn = document.getElementById('exitReader');
    if (exitBtn) {
      exitBtn.addEventListener('click', () => {
        this.deactivateGalacticReader();
      });
    }
  }
  
  setupReadingProgress() {
    const scrollContainer = document.querySelector('.reader-scroll-interstellar');
    const progressFill = document.querySelector('.progress-fill-pro');
    const progressText = document.querySelector('.progress-text-pro');
    
    if (!scrollContainer || !progressFill || !progressText) return;
    
    const updateProgress = () => {
      const scrollTop = scrollContainer.scrollTop;
      const scrollHeight = scrollContainer.scrollHeight - scrollContainer.clientHeight;
      const progress = Math.min((scrollTop / scrollHeight) * 100, 100);
      
      progressFill.style.width = `${progress}%`;
      progressText.textContent = `${Math.round(progress)}%`;
      
      this.readingProgress = progress;
    };
    
    scrollContainer.addEventListener('scroll', updateProgress);
    
    setTimeout(updateProgress, 100);
  }
  
  changeGalaxy(galaxy) {
    this.currentGalaxy = galaxy;
    const universe = document.querySelector('.galactic-universe-interstellar');
    const galaxyName = document.querySelector('.galaxy-name-pro');
    
    if (universe) {
      universe.className = `galactic-universe-interstellar galaxy-${galaxy}`;
    }
    
    if (galaxyName) {
      galaxyName.textContent = this.getGalaxyName(galaxy);
    }
  }
  
  getGalaxyName(galaxy = this.currentGalaxy) {
    const names = {
      andromeda: 'Andromeda',
      milkyway: 'Milky Way',
      whirlpool: 'Whirlpool',
      sombrero: 'Sombrero',
      pinwheel: 'Pinwheel'
    };
    return names[galaxy] || 'Andromeda';
  }
  
  toggleAudio() {
    if (!this.audioEnabled) {
      this.startAudio();
      this.audioEnabled = true;
    } else {
      this.stopAudio();
      this.audioEnabled = false;
    }
  }

  startAudio() {
    try {
      if (!this.audioContext) {
        this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
      }
      if (this.audioContext.state === 'suspended') {
        this.audioContext.resume();
      }
      if (!this.oscillator) {
        this.gainNode = this.audioContext.createGain();
        this.gainNode.gain.value = 0.02;

        this.oscillator = this.audioContext.createOscillator();
        this.oscillator.type = 'sine';
        this.oscillator.frequency.setValueAtTime(55, this.audioContext.currentTime);

        this.oscillator.connect(this.gainNode);
        this.gainNode.connect(this.audioContext.destination);

        this.oscillator.start();
      }
    } catch (error) {
      console.log('Audio not supported:', error);
    }
  }

  stopAudio() {
    try {
      if (this.oscillator) {
        this.oscillator.stop();
        this.oscillator.disconnect();
        this.oscillator = null;
      }
      if (this.gainNode) {
        this.gainNode.disconnect();
        this.gainNode = null;
      }
    } catch (error) {
    }
  }

  triggerCosmicEvent(eventType) {
    const container = document.querySelector('.cosmic-events-interstellar');
    if (!container) return;
    
    switch(eventType) {
      case 'supernova':
        this.createCinematicSupernova(container);
        break;
      case 'meteor':
        this.createCinematicMeteor(container);
        break;
      case 'aurora':
        this.createCinematicAurora(container);
        break;
    }
  }
  
  createCinematicSupernova(container) {
    const supernova = document.createElement('div');
    supernova.style.cssText = `
      position: absolute;
      top: 25%;
      right: 25%;
      width: 4px;
      height: 4px;
      background: #ffffff;
      border-radius: 50%;
      animation: cinematic-supernova 3s ease-out forwards;
      pointer-events: none;
    `;
    
    const style = document.createElement('style');
    style.textContent = `
      @keyframes cinematic-supernova {
        0% { 
          transform: scale(1); 
          opacity: 1; 
          box-shadow: 0 0 10px #ffffff; 
        }
        30% { 
          transform: scale(15); 
          opacity: 0.9; 
          box-shadow: 0 0 100px #ffffff, 0 0 200px rgba(255,255,255,0.5); 
        }
        100% { 
          transform: scale(40); 
          opacity: 0; 
          box-shadow: 0 0 300px rgba(255,255,255,0.2); 
        }
      }
    `;
    document.head.appendChild(style);
    
    container.appendChild(supernova);
    
    setTimeout(() => {
      supernova.remove();
      style.remove();
    }, 3000);
  }
  
  createCinematicMeteor(container) {
    for (let i = 0; i < 5; i++) {
      setTimeout(() => {
        const meteor = document.createElement('div');
        meteor.style.cssText = `
          position: absolute;
          top: ${Math.random() * 30}%;
          left: ${85 + Math.random() * 15}%;
          width: 2px;
          height: 25px;
          background: linear-gradient(180deg, transparent 0%, #ffffff 50%, #ffeb3b 100%);
          animation: cinematic-meteor 4s linear forwards;
          pointer-events: none;
        `;
        
        const style = document.createElement('style');
        style.textContent = `
          @keyframes cinematic-meteor {
            0% { 
              transform: translateX(0) translateY(0) rotate(45deg); 
              opacity: 0; 
            }
            10% { opacity: 1; }
            85% { opacity: 0.8; }
            100% { 
              transform: translateX(-400px) translateY(400px) rotate(45deg); 
              opacity: 0; 
            }
          }
        `;
        document.head.appendChild(style);
        
        container.appendChild(meteor);
        
        setTimeout(() => {
          meteor.remove();
          style.remove();
        }, 4000);
      }, i * 300);
    }
  }
  
  createCinematicAurora(container) {
    const aurora = document.createElement('div');
    aurora.style.cssText = `
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 40%;
      background: linear-gradient(180deg, 
        rgba(0, 255, 127, 0.15) 0%, 
        rgba(138, 43, 226, 0.08) 30%,
        rgba(255, 20, 147, 0.05) 60%, 
        transparent 100%);
      animation: cinematic-aurora 12s ease-in-out forwards;
      pointer-events: none;
    `;
    
    const style = document.createElement('style');
    style.textContent = `
      @keyframes cinematic-aurora {
        0%, 100% { 
          opacity: 0; 
          transform: translateY(-30px) skewX(-3deg); 
        }
        25% { 
          opacity: 0.8; 
          transform: translateY(-10px) skewX(2deg); 
        }
        50% { 
          opacity: 1; 
          transform: translateY(0) skewX(-1deg); 
        }
        75% { 
          opacity: 0.9; 
          transform: translateY(-5px) skewX(1deg); 
        }
      }
    `;
    document.head.appendChild(style);
    
    container.appendChild(aurora);
    
    setTimeout(() => {
      aurora.remove();
      style.remove();
    }, 12000);
  }
  
  initializeInterstellarBackground() {
    this.createInterstellarStars();
  }
  
  createInterstellarStars() {
    setInterval(() => {
      if (!this.isActive) return;
      
      if (Math.random() < 0.2) {
        const star = document.createElement('div');
        star.style.cssText = `
          position: fixed;
          top: ${Math.random() * 40}%;
          left: ${75 + Math.random() * 25}%;
          width: 1px;
          height: 20px;
          background: linear-gradient(180deg, transparent 0%, rgba(255,255,255,0.9) 100%);
          animation: interstellar-shooting-star 5s linear forwards;
          pointer-events: none;
          z-index: 5;
        `;
        
        document.body.appendChild(star);
        
        setTimeout(() => star.remove(), 5000);
      }
    }, 8000);
    
    const style = document.createElement('style');
    style.textContent = `
      @keyframes interstellar-shooting-star {
        0% { 
          transform: translateX(0) translateY(0) rotate(45deg); 
          opacity: 0; 
        }
        10% { opacity: 1; }
        85% { opacity: 0.9; }
        100% { 
          transform: translateX(-400px) translateY(400px) rotate(45deg); 
          opacity: 0; 
        }
      }
    `;
    document.head.appendChild(style);
  }
  
  startAnimationLoop() {
    const animate = () => {
      if (!this.isActive) return;      
      this.animationFrameId = requestAnimationFrame(animate);
    };
    
    animate();
  }
  
  stopAnimationLoop() {
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }
  }
  
  extractMainContent() {
    const selectors = [
      'article',
      'main',
      '[role="main"]',
      '.post-content',
      '.entry-content',
      '.article-content',
      '.content-area',
      '.main-content',
      '.post-body',
      '.story-body',
      '.article-body',
      '.entry-text',
      '.content',
      '.text'
    ];
    
    let contentElement = null;
    
    for (const selector of selectors) {
      contentElement = document.querySelector(selector);
      if (contentElement && contentElement.innerText.length > 300) {
        break;
      }
    }
    
    if (!contentElement) {
      const candidates = document.querySelectorAll('div, section, p');
      let maxText = 0;
      
      candidates.forEach(candidate => {
        const textLength = candidate.innerText?.length || 0;
        if (textLength > maxText && textLength > 500) {
          maxText = textLength;
          contentElement = candidate;
        }
      });
    }
    
    if (!contentElement || contentElement.innerText.length < 200) {
      return `
        <h1>Galactic Reading Mode</h1>
        <p>Welcome to Starlapse's Interstellar reading experience. This cinematic reader mode transforms any webpage into a distraction-free cosmic environment inspired by the movie Interstellar.</p>
        
        <h2>Enhanced Features</h2>
        <p>• Five immersive galaxy themes with full-page visual theming</p>
        <p>• Real-time reading progress tracking with stellar effects</p>
        <p>• Cinematic black hole system with accretion disk and event horizon</p>
        <p>• Professional typography optimized for extended reading</p>
        <p>• Optional ambient space audio for deeper immersion</p>
        <p>• Floating celestial bodies with realistic orbital mechanics</p>
        <p>• Subtle cosmic events and shooting stars</p>
        
        <h2>Galaxy Themes</h2>
        <p><strong>Andromeda:</strong> Purple and magenta cosmic hues</p>
        <p><strong>Milky Way:</strong> Golden stellar colors</p>
        <p><strong>Whirlpool:</strong> Cool blue and teal tones</p>
        <p><strong>Sombrero:</strong> Warm orange and red palette</p>
        <p><strong>Pinwheel:</strong> Fresh green cosmic energy</p>
        
        <h2>Navigation</h2>
        <p>Use the colored dots in the header to switch between galaxy themes. The progress bar shows your reading journey through the article with smooth stellar animations.</p>
        
        <p>The current page content could not be automatically extracted for reader mode, but you can enjoy the full cinematic interface while browsing normally.</p>
      `;
    }
    
    const clonedContent = contentElement.cloneNode(true);
    
    const unwantedSelectors = [
      'script', 'style', 'nav', 'aside', 'header', 'footer',
      '.ad', '.ads', '.advertisement', '.banner', '.popup',
      '.sidebar', '.navigation', '.menu', '.social', '.share',
      '.comments', '.related', '.recommended', '.widget',
      '[class*="ad-"]', '[id*="ad-"]', '[class*="sidebar"]',
      '.comment', '.reply', '.author-bio', '.tags', '.categories'
    ];
    
    unwantedSelectors.forEach(selector => {
      const elements = clonedContent.querySelectorAll(selector);
      elements.forEach(el => el.remove());
    });
    
    const allElements = clonedContent.querySelectorAll('*');
    allElements.forEach(el => {
      el.removeAttribute('onclick');
      el.removeAttribute('onload');
      el.removeAttribute('onerror');
      el.removeAttribute('style');
      
      if (el.className && typeof el.className === 'string') {
        el.className = '';
      }
    });
    
    return clonedContent.innerHTML;
  }
  
  removeGalacticReader() {
    const readerMode = document.getElementById(this.readerModeId);
    if (readerMode) {
      readerMode.style.animation = 'interstellar-exit 1.5s ease-in forwards';
      
      const exitStyle = document.createElement('style');
      exitStyle.textContent = `
        @keyframes interstellar-exit {
          0% { 
            opacity: 1; 
            transform: scale(1) perspective(1000px) rotateX(0deg);
            filter: blur(0);
          }
          50% {
            opacity: 0.5;
            transform: scale(1.05) perspective(1000px) rotateX(-5deg);
            filter: blur(5px);
          }
          100% { 
            opacity: 0; 
            transform: scale(1.2) perspective(1000px) rotateX(-15deg);
            filter: blur(20px);
          }
        }
      `;
      document.head.appendChild(exitStyle);
      
      setTimeout(() => {
        readerMode.remove();
        exitStyle.remove();
      }, 1500);
    }
    
    document.body.style.overflow = '';
    
    this.stopAudio();
  }
}

new GalacticReader();