import * as THREE from 'three'

export class Raycaster {
  constructor(experience) {
    this.experience = experience
    this.camera = experience.camera
    this.canvas = experience.canvas

    this.instance = new THREE.Raycaster()
    this.mouse = new THREE.Vector2()
    this.hitboxes = [] // { mesh, name, onHover, onClick }
    this.currentHovered = null

    // Events
    this.canvas.addEventListener('mousemove', (e) => this.onMouseMove(e))
    this.canvas.addEventListener('click', (e) => this.onClick(e))
    this.canvas.addEventListener('touchstart', (e) => this.onTouch(e), { passive: true })
  }

  /** Register a clickable hitbox */
  register(mesh, name, callbacks = {}) {
    this.hitboxes.push({
      mesh,
      name,
      onHover: callbacks.onHover || null,
      onUnhover: callbacks.onUnhover || null,
      onClick: callbacks.onClick || null
    })
  }

  onMouseMove(event) {
    this.mouse.x = (event.clientX / this.experience.sizes.width) * 2 - 1
    this.mouse.y = -(event.clientY / this.experience.sizes.height) * 2 + 1
  }

  onClick(event) {
    // Update mouse position from click
    this.mouse.x = (event.clientX / this.experience.sizes.width) * 2 - 1
    this.mouse.y = -(event.clientY / this.experience.sizes.height) * 2 + 1

    this.instance.setFromCamera(this.mouse, this.camera.instance)

    const meshes = this.hitboxes.map(h => h.mesh)
    const intersects = this.instance.intersectObjects(meshes, false)

    if (intersects.length > 0) {
      const hit = this.hitboxes.find(h => h.mesh === intersects[0].object)
      if (hit && hit.onClick) {
        hit.onClick(hit.name)
      }
    }
  }

  onTouch(event) {
    if (event.touches.length === 1) {
      const touch = event.touches[0]
      this.mouse.x = (touch.clientX / this.experience.sizes.width) * 2 - 1
      this.mouse.y = -(touch.clientY / this.experience.sizes.height) * 2 + 1

      // Trigger a "click" on touch
      this.instance.setFromCamera(this.mouse, this.camera.instance)
      const meshes = this.hitboxes.map(h => h.mesh)
      const intersects = this.instance.intersectObjects(meshes, false)

      if (intersects.length > 0) {
        const hit = this.hitboxes.find(h => h.mesh === intersects[0].object)
        if (hit && hit.onClick) {
          hit.onClick(hit.name)
        }
      }
    }
  }

  update() {
    if (this.experience.isTransitioning) return

    this.instance.setFromCamera(this.mouse, this.camera.instance)

    const meshes = this.hitboxes.map(h => h.mesh)
    const intersects = this.instance.intersectObjects(meshes, false)

    if (intersects.length > 0) {
      const hit = this.hitboxes.find(h => h.mesh === intersects[0].object)

      if (hit !== this.currentHovered) {
        // Unhover previous
        if (this.currentHovered && this.currentHovered.onUnhover) {
          this.currentHovered.onUnhover(this.currentHovered.name)
        }
        // Hover new
        if (hit && hit.onHover) {
          hit.onHover(hit.name)
        }
        this.currentHovered = hit
        this.canvas.style.cursor = 'pointer'
      }
    } else {
      if (this.currentHovered) {
        if (this.currentHovered.onUnhover) {
          this.currentHovered.onUnhover(this.currentHovered.name)
        }
        this.currentHovered = null
        this.canvas.style.cursor = 'default'
      }
    }
  }
}
