export class AudioManager {
  constructor(experience) {
    this.experience = experience
    this.btn = document.getElementById('audio-toggle')
    this.iconOff = document.getElementById('audio-icon-off')
    this.iconOn = document.getElementById('audio-icon-on')
    
    this.isMuted = true
    this.audioCtx = null
    this.wavesGain = null
    this.gullsGain = null

    this.btn.addEventListener('click', () => this.toggle())
  }

  initAudio() {
    if (this.audioCtx) return

    // Create web audio api context
    const AudioContext = window.AudioContext || window.webkitAudioContext
    this.audioCtx = new AudioContext()

    // 1. Ambient Waves (Pink noise with LFO)
    const bufferSize = this.audioCtx.sampleRate * 2 // 2 seconds
    const noiseBuffer = this.audioCtx.createBuffer(1, bufferSize, this.audioCtx.sampleRate)
    const output = noiseBuffer.getChannelData(0)
    
    // Generate pink noise
    let b0, b1, b2, b3, b4, b5, b6;
    b0 = b1 = b2 = b3 = b4 = b5 = b6 = 0.0;
    for (let i = 0; i < bufferSize; i++) {
        const white = Math.random() * 2 - 1
        b0 = 0.99886 * b0 + white * 0.0555179
        b1 = 0.99332 * b1 + white * 0.0750759
        b2 = 0.96900 * b2 + white * 0.1538520
        b3 = 0.86650 * b3 + white * 0.3104856
        b4 = 0.55000 * b4 + white * 0.5329522
        b5 = -0.7616 * b5 - white * 0.0168980
        output[i] = b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362
        output[i] *= 0.11 // scale
        b6 = white * 0.115926
    }

    const noiseSource = this.audioCtx.createBufferSource()
    noiseSource.buffer = noiseBuffer
    noiseSource.loop = true

    // Lowpass filter for ocean roar
    const filter = this.audioCtx.createBiquadFilter()
    filter.type = 'lowpass'
    filter.frequency.value = 400

    // LFO for wave crashing swell
    const lfo = this.audioCtx.createOscillator()
    lfo.type = 'sine'
    lfo.frequency.value = 0.15 // wave every ~6 seconds

    const lfoGain = this.audioCtx.createGain()
    lfoGain.gain.value = 250 // modulation depth

    lfo.connect(lfoGain)
    lfoGain.connect(filter.frequency)

    this.wavesGain = this.audioCtx.createGain()
    this.wavesGain.gain.value = 0

    noiseSource.connect(filter)
    filter.connect(this.wavesGain)
    this.wavesGain.connect(this.audioCtx.destination)

    noiseSource.start()
    lfo.start()
  }

  toggle() {
    this.isMuted = !this.isMuted
    
    if (this.isMuted) {
      this.iconOff.classList.remove('hidden')
      this.iconOn.classList.add('hidden')
      if (this.wavesGain) this.wavesGain.gain.setTargetAtTime(0, this.audioCtx.currentTime, 0.5)
    } else {
      this.iconOff.classList.add('hidden')
      this.iconOn.classList.remove('hidden')
      
      this.initAudio()
      
      // Resume if suspended (browser policy)
      if (this.audioCtx.state === 'suspended') {
        this.audioCtx.resume()
      }
      
      if (this.wavesGain) this.wavesGain.gain.setTargetAtTime(0.15, this.audioCtx.currentTime, 1.0)
    }
  }
}
