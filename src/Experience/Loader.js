import * as THREE from 'three'

export class Loader {
  constructor(experience) {
    this.experience = experience
    this.overlay = document.getElementById('loading-screen')
    this.bar = document.getElementById('loader-bar')
    this.percent = document.getElementById('loader-percent')
    this.message = document.getElementById('loader-message')

    this.messages = [
      "Waxing the board...",
      "Checking the surf report...",
      "Paddling out...",
      "Catching a wave..."
    ]
    this.messageIndex = 0

    // Set up THREE LoadingManager
    this.manager = THREE.DefaultLoadingManager
    
    this.manager.onStart = () => {
      this.messageInterval = setInterval(() => {
        this.messageIndex = (this.messageIndex + 1) % this.messages.length
        this.message.textContent = this.messages[this.messageIndex]
      }, 1000)
    }

    this.manager.onProgress = (url, itemsLoaded, itemsTotal) => {
      const p = Math.round((itemsLoaded / itemsTotal) * 100)
      this.bar.style.width = `${p}%`
      this.percent.textContent = `${p}%`
    }

    this.manager.onLoad = async () => {
      // Ensure fonts are fully loaded for canvas rendering
      await document.fonts.ready

      // Small artificial delay so user can see it hit 100%
      setTimeout(() => {
        clearInterval(this.messageInterval)
        this.hide()
      }, 800)
    }

    // Since we are procedural and might not have external textures initially,
    // we manually trigger load complete if nothing is loading.
    setTimeout(() => {
      if (this.overlay && !this.overlay.classList.contains('fade-out')) {
        this.bar.style.width = `100%`
        this.percent.textContent = `100%`
        setTimeout(() => this.hide(), 500)
      }
    }, 1500) // Fallback
  }

  hide() {
    this.overlay.classList.add('fade-out')
    // Trigger intro animation
    if (this.experience.camera) {
      this.experience.camera.introAnimation()
    }
  }
}
