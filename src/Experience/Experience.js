import * as THREE from 'three'
import { Camera } from './Camera.js'
import { Renderer } from './Renderer.js'
import { World } from './World/World.js'
import { Raycaster } from './Raycaster.js'
import { Loader } from './Loader.js'
import { AudioManager } from './AudioManager.js'

let instance = null

export class Experience {
  constructor(canvas) {
    if (instance) return instance
    instance = this

    this.canvas = canvas
    this.scene = new THREE.Scene()

    // Sizes
    this.sizes = {
      width: window.innerWidth,
      height: window.innerHeight,
      pixelRatio: Math.min(window.devicePixelRatio, 2)
    }

    // Performance tier detection
    this.performanceTier = this.detectPerformance()

    // Core systems
    this.camera = new Camera(this)
    this.renderer = new Renderer(this)
    this.raycaster = new Raycaster(this) // MUST be before World
    this.world = new World(this)
    this.audioManager = new AudioManager(this)
    this.loader = new Loader(this)

    // Current section tracking
    this.currentSection = 'home'
    this.isTransitioning = false

    // Clock
    this.clock = new THREE.Clock()

    // Events
    window.addEventListener('resize', () => this.onResize())

    // Keyboard
    window.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') this.closeSection()
    })

    // Start render loop
    this.tick()
  }

  detectPerformance() {
    const canvas = document.createElement('canvas')
    const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl')
    if (!gl) return 'LOW'

    const debugInfo = gl.getExtension('WEBGL_debug_renderer_info')
    const gpuRenderer = debugInfo ? gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL) : ''
    const isMobile = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent)

    if (isMobile) return 'LOW'
    if (/Intel|SwiftShader|llvmpipe/i.test(gpuRenderer)) return 'MEDIUM'
    return 'HIGH'
  }

  async navigateToSection(sectionName) {
    if (this.isTransitioning || this.currentSection === sectionName) return
    this.isTransitioning = true

    // Launch board out of rack
    if (this.world && this.world.surfShop) {
      this.world.surfShop.launchBoard(sectionName)
    }

    // Camera transition
    await this.camera.toSection(sectionName)

    this.currentSection = sectionName
    this.isTransitioning = false
  }

  async navigateToHome() {
    if (this.isTransitioning) return
    this.isTransitioning = true

    // Return the active board to the rack
    if (this.currentSection !== 'home' && this.world && this.world.surfShop) {
      this.world.surfShop.returnBoard(this.currentSection)
    }

    // Camera transition home
    await this.camera.toSection('home')

    this.currentSection = 'home'
    
    this.isTransitioning = false
  }

  closeSection() {
    if (this.currentSection !== 'home') {
      this.navigateToHome()
    }
  }



  onResize() {
    this.sizes.width = window.innerWidth
    this.sizes.height = window.innerHeight
    this.sizes.pixelRatio = Math.min(window.devicePixelRatio, 2)

    this.camera.onResize()
    this.renderer.onResize()
  }

  tick() {
    const elapsedTime = this.clock.getElapsedTime()
    const deltaTime = this.clock.getDelta()

    // Update systems
    this.camera.update()
    this.world.update(elapsedTime)
    this.raycaster.update()

    // Render
    this.renderer.render()

    // Next frame
    requestAnimationFrame(() => this.tick())
  }
}
