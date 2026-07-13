import * as THREE from 'three'
import gsap from 'gsap'

const SIGNS = [
  { name: 'about', label: 'about me', color: '#F2C94C', dir: -1, y: 4.6 },
  { name: 'projects', label: 'projects', color: '#F2994A', dir: 1, y: 3.9 },
  { name: 'experience', label: 'experience', color: '#5BBFBF', dir: -1, y: 3.2 },
  { name: 'skills', label: 'skills', color: '#EB5757', dir: 1, y: 2.5 },
  { name: 'contact', label: 'contact', color: '#2D9CDB', dir: -1, y: 1.8 }
]

export class Signpost {
  constructor(experience) {
    this.experience = experience
    this.scene = experience.scene
    this.group = new THREE.Group()
    this.arrows = []
    this.hitboxes = []

    this.buildPost()
    this.buildArrowsAsync()

    // Move closer to shack and angle towards camera slightly, lowered to sit on the ground
    this.group.position.set(-3.5, -0.4, 4)
    this.group.rotation.y = Math.PI * 0.15
    this.scene.add(this.group)
  }

  buildPost() {
    // Main wooden post
    const post = new THREE.Mesh(
      new THREE.CylinderGeometry(0.12, 0.15, 5.5, 8),
      new THREE.MeshStandardMaterial({ color: '#6B4A2E', roughness: 0.9, flatShading: true })
    )
    post.position.y = 2.75
    post.castShadow = true
    this.group.add(post)

    // Base crate
    const crate = new THREE.Mesh(
      new THREE.BoxGeometry(0.8, 0.4, 0.8),
      new THREE.MeshStandardMaterial({ color: '#8B6914', roughness: 0.9, flatShading: true })
    )
    crate.position.y = 0.2
    crate.castShadow = true
    this.group.add(crate)
  }

  async buildArrowsAsync() {
    try {
      await document.fonts.load('64px "Chewy"')
    } catch(e) {
      console.warn('Font loading error', e)
    }
    await document.fonts.ready

    SIGNS.forEach((sign) => {
      const arrow = this.createArrow(sign)
      this.group.add(arrow.mesh)
      this.arrows.push(arrow)

      // Invisible hitbox (slightly larger)
      const hitbox = new THREE.Mesh(
        new THREE.BoxGeometry(2.0, 0.55, 0.4),
        new THREE.MeshBasicMaterial({ visible: false })
      )
      hitbox.position.set(sign.dir * 0.8, sign.y, 0)
      this.group.add(hitbox)

      // Register with raycaster
      this.experience.raycaster.register(hitbox, sign.name, {
        onHover: () => this.onHover(arrow),
        onUnhover: () => this.onUnhover(arrow),
        onClick: () => this.experience.navigateToSection(sign.name)
      })

      this.hitboxes.push(hitbox)
    })
  }

  createArrow(sign) {
    // Arrow-shaped sign
    const shape = new THREE.Shape()
    const dir = sign.dir
    const w = 1.5, h = 0.4, tip = 0.3

    if (dir > 0) {
      // Points right
      shape.moveTo(-w/2, -h/2)
      shape.lineTo(w/2 - tip, -h/2)
      shape.lineTo(w/2, 0)
      shape.lineTo(w/2 - tip, h/2)
      shape.lineTo(-w/2, h/2)
      shape.lineTo(-w/2, -h/2)
    } else {
      // Points left
      shape.moveTo(w/2, -h/2)
      shape.lineTo(w/2, h/2)
      shape.lineTo(-w/2 + tip, h/2)
      shape.lineTo(-w/2, 0)
      shape.lineTo(-w/2 + tip, -h/2)
      shape.lineTo(w/2, -h/2)
    }

    const geo = new THREE.ExtrudeGeometry(shape, {
      depth: 0.08, bevelEnabled: true, bevelThickness: 0.01, bevelSize: 0.01, bevelSegments: 1
    })

    const mat = new THREE.MeshStandardMaterial({
      color: sign.color,
      roughness: 0.75,
      flatShading: true,
      emissive: sign.color,
      emissiveIntensity: 0
    })

    const mesh = new THREE.Mesh(geo, mat)
    mesh.position.set(dir * 0.8, sign.y, 0)
    mesh.castShadow = true

    // Add text label via canvas
    this.addArrowText(sign, mesh)

    return { mesh, mat, sign, originalScale: 1.0 }
  }

  addArrowText(sign, parentMesh) {
    const canvas = document.createElement('canvas')
    canvas.width = 512; canvas.height = 128
    const ctx = canvas.getContext('2d')
    ctx.fillStyle = '#FDF6E3' // Warm off-white
    ctx.font = '64px "Chewy", cursive'
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    // Add slight opacity to look painted
    ctx.globalAlpha = 0.95
    ctx.fillText(sign.label, 256, 64)

    const tex = new THREE.CanvasTexture(canvas)
    tex.colorSpace = THREE.SRGBColorSpace
    const labelMat = new THREE.MeshBasicMaterial({ map: tex, transparent: true, side: THREE.DoubleSide })
    const label = new THREE.Mesh(new THREE.PlaneGeometry(1.3, 0.32), labelMat)
    // Place slightly in front of the extruded depth (0.08 + bevel 0.01) so it doesn't clip
    label.position.set(0, 0, 0.095)
    parentMesh.add(label)
  }

  onHover(arrow) {
    gsap.to(arrow.mesh.scale, { x: 1.08, y: 1.08, z: 1.08, duration: 0.3, ease: 'back.out(2)' })
    gsap.to(arrow.mat, { emissiveIntensity: 0.4, duration: 0.3 })
  }

  onUnhover(arrow) {
    gsap.to(arrow.mesh.scale, { x: 1, y: 1, z: 1, duration: 0.3, ease: 'power2.out' })
    gsap.to(arrow.mat, { emissiveIntensity: 0, duration: 0.3 })
  }
}
