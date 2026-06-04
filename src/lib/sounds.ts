const SOUND_URLS = {
  click: 'https://www.myinstants.com/media/sounds/minecraft-click-menu-58476.mp3',
  xp: 'https://www.myinstants.com/media/sounds/minecraft-xp-sound.mp3',
};

class SoundManager {
  private static instance: SoundManager;
  private audioCache: Map<string, HTMLAudioElement> = new Map();

  private constructor() {}

  static getInstance() {
    if (!SoundManager.instance) {
      SoundManager.instance = new SoundManager();
    }
    return SoundManager.instance;
  }

  play(key: keyof typeof SOUND_URLS) {
    if (typeof window === 'undefined') return;

    let audio = this.audioCache.get(key);
    if (!audio) {
      audio = new Audio(SOUND_URLS[key]);
      audio.volume = 0.4;
      this.audioCache.set(key, audio);
    }

    // Reset and play
    audio.currentTime = 0;
    audio.play().catch(() => {
      // Browsers often block autoplay or un-interacted audio
      console.log('Audio playback blocked - needs user interaction');
    });
  }
}

export const soundManager = SoundManager.getInstance();
