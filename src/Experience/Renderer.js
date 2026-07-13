import * as THREE from 'three'
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js'
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js'
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js'
import { OutputPass } from 'three/examples/jsm/postprocessing/OutputPass.js'

export class Renderer {
  constructor(experience) {
    this.experience = experience
    this.scene = experience.scene
    this.sizes = experience.sizes
    this.canvas = experience.canvas
    this.camera = experience.camera

    this.createRenderer()
    this.createPostProcessing()
  }

  createRenderer() {
    this.instance = new THREE.WebGLRenderer({
      canvas: this.canvas,
      antialias: this.experience.performanceTier !== 'LOW',
      alpha: false,
      powerPreference: 'high-performance'
    })

    this.instance.setSize(this.sizes.width, this.sizes.height)
    this.instance.setPixelRatio(this.experience.performanceTier === 'LOW' ? 1 : this.sizes.pixelRatio)

    // Tone mapping for warm cinematic look
    this.instance.toneMapping = THREE.ACESFilmicToneMapping
    this.instance.toneMappingExposure = 1.1
    this.instance.outputColorSpace = THREE.SRGBColorSpace

    // Shadows — light baked look, but we add one soft shadow for grounding
    this.instance.shadowMap.enabled = this.experience.performanceTier !== 'LOW'
    this.instance.shadowMap.type = THREE.PCFSoftShadowMap
  }

  createPostProcessing() {
    this.useBloom = this.experience.performanceTier === 'HIGH'

    if (!this.useBloom) {
      this.composer = null
      return
    }

    this.composer = new EffectComposer(this.instance)

    // Base render pass
    const renderPass = new RenderPass(this.scene, this.camera.instance)
    this.composer.addPass(renderPass)

    // Bloom — high threshold so only emissive objects glow
    this.bloomPass = new UnrealBloomPass(
      new THREE.Vector2(this.sizes.width, this.sizes.height),
      0.4,    // strength (subtle)
      0.6,    // radius
      0.85    // threshold — only bright emissive objects bloom
    )
    this.composer.addPass(this.bloomPass)

    // Output pass for correct color space
    const outputPass = new OutputPass()
    this.composer.addPass(outputPass)
  }

  onResize() {
    this.instance.setSize(this.sizes.width, this.sizes.height)
    this.instance.setPixelRatio(this.experience.performanceTier === 'LOW' ? 1 : this.sizes.pixelRatio)

    if (this.composer) {
      this.composer.setSize(this.sizes.width, this.sizes.height)
      this.composer.setPixelRatio(this.experience.performanceTier === 'LOW' ? 1 : this.sizes.pixelRatio)
    }
  }

  render() {
    if (this.composer) {
      this.composer.render()
    } else {
      this.instance.render(this.scene, this.camera.instance)
    }
  }
}
