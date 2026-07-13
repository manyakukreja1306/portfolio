import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import gsap from 'gsap'

// Camera waypoints: { position, lookAt, constraints }
const WAYPOINTS = {
  home: {
    position: { x: 0, y: 4, z: 14 },
    lookAt: { x: 0, y: 1.5, z: 0 },
    constraints: {
      minPolarAngle: Math.PI * 0.2,
      maxPolarAngle: Math.PI * 0.48,
      minAzimuthAngle: -Math.PI * 0.35,
      maxAzimuthAngle: Math.PI * 0.35,
      minDistance: 10,
      maxDistance: 20
    }
  },
  display: {
    position: { x: 0, y: 2.5, z: 7.0 }, // Distance 1.0 for perfect 50% width on laptops
    lookAt: { x: 0, y: 2.5, z: 6 },
    constraints: {
      minPolarAngle: Math.PI * 0.1,
      maxPolarAngle: Math.PI * 0.9,
      minAzimuthAngle: -0.3,
      maxAzimuthAngle: 0.3,
      minDistance: 0.5,
      maxDistance: 2.0
    }
  }
}

export class Camera {
  constructor(experience) {
    this.experience = experience
    this.scene = experience.scene
    this.sizes = experience.sizes
    this.canvas = experience.canvas

    this.createCamera()
    this.createControls()
  }

  createCamera() {
    this.instance = new THREE.PerspectiveCamera(
      45,
      this.sizes.width / this.sizes.height,
      0.1,
      200
    )

    // Start from an intro position (will animate to home)
    this.instance.position.set(0, 8, 22)
    this.scene.add(this.instance)
  }

  createControls() {
    this.controls = new OrbitControls(this.instance, this.canvas)
    this.controls.enableDamping = true
    this.controls.dampingFactor = 0.06
    this.controls.enablePan = false

    // Set home constraints
    const home = WAYPOINTS.home.constraints
    Object.assign(this.controls, home)

    this.controls.target.set(0, 1.5, 0)
    this.controls.update()
  }

  /** Jesse Zhou's exact GSAP transition pattern */
  async toSection(sectionName, duration = 3.0) {
    const wpName = sectionName === 'home' ? 'home' : 'display'
    const wp = WAYPOINTS[wpName]
    if (!wp) return

    // Disable interaction during flight
    this.controls.enableRotate = false
    this.controls.enableZoom = false

    // Temporarily relax all constraints so GSAP can move the camera freely
    // This fixes the jitter/stuttering caused by OrbitControls fighting the tween!
    this.controls.minDistance = 0
    this.controls.maxDistance = Infinity
    this.controls.minPolarAngle = 0
    this.controls.maxPolarAngle = Math.PI
    this.controls.minAzimuthAngle = -Infinity
    this.controls.maxAzimuthAngle = Infinity

    // Animate camera position
    gsap.to(this.instance.position, {
      duration,
      ease: 'power2.inOut',
      x: wp.position.x,
      y: wp.position.y,
      z: wp.position.z
    })

    // Animate look-at target
    gsap.to(this.controls.target, {
      duration,
      ease: 'power2.inOut',
      x: wp.lookAt.x,
      y: wp.lookAt.y,
      z: wp.lookAt.z
    })

    // Wait for transition to complete
    await this.sleep(duration * 1000)

    // Apply section-specific orbit constraints
    if (wp.constraints) {
      Object.assign(this.controls, wp.constraints)
    }

    // Re-enable interaction
    this.controls.enableRotate = true
    this.controls.enableZoom = true
  }

  /** Animate in from intro position to home */
  async introAnimation() {
    const wp = WAYPOINTS.home

    this.controls.enableRotate = false
    this.controls.enableZoom = false

    this.controls.minDistance = 0
    this.controls.maxDistance = Infinity
    this.controls.minPolarAngle = 0
    this.controls.maxPolarAngle = Math.PI
    this.controls.minAzimuthAngle = -Infinity
    this.controls.maxAzimuthAngle = Infinity

    gsap.to(this.instance.position, {
      duration: 2.5,
      ease: 'power2.inOut',
      x: wp.position.x,
      y: wp.position.y,
      z: wp.position.z
    })

    gsap.to(this.controls.target, {
      duration: 2.5,
      ease: 'power2.inOut',
      x: wp.lookAt.x,
      y: wp.lookAt.y,
      z: wp.lookAt.z
    })

    await this.sleep(2600)

    Object.assign(this.controls, wp.constraints)
    this.controls.enableRotate = true
    this.controls.enableZoom = true
  }

  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms))
  }

  onResize() {
    this.instance.aspect = this.sizes.width / this.sizes.height
    this.instance.updateProjectionMatrix()
  }

  update() {
    this.controls.update()
  }
}
