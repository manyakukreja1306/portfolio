import * as THREE from 'three'
import { Environment } from './Environment.js'
import { SurfShop } from './SurfShop.js'
import { Signpost } from './Signpost.js'
import { PalmTrees } from './PalmTrees.js'

export class World {
  constructor(experience) {
    this.experience = experience
    this.scene = experience.scene

    this.environment = new Environment(experience)
    this.surfShop = new SurfShop(experience)
    this.signpost = new Signpost(experience)
    this.palmTrees = new PalmTrees(experience)

    // Distant mountain silhouettes
    this.createMountains()

    // Small decorative rocks
    this.createRocks()
  }

  createMountains() {
    const mat = new THREE.MeshStandardMaterial({ color: '#7B6B5A', roughness: 1, flatShading: true })
    const positions = [
      { x: -40, z: -55, s: 12, h: 8 },
      { x: -20, z: -60, s: 15, h: 10 },
      { x: 10, z: -58, s: 18, h: 7 },
      { x: 35, z: -52, s: 14, h: 9 }
    ]
    positions.forEach(p => {
      const geo = new THREE.ConeGeometry(p.s, p.h, 6)
      const mesh = new THREE.Mesh(geo, mat)
      mesh.position.set(p.x, p.h / 2 - 2, p.z)
      this.scene.add(mesh)
    })
  }

  createRocks() {
    const mat = new THREE.MeshStandardMaterial({ color: '#A09080', roughness: 0.95, flatShading: true })
    const spots = [
      { x: -6, z: 5, s: 0.3 }, { x: 4, z: 7, s: 0.2 }, { x: -4, z: -5, s: 0.4 },
      { x: 7, z: -3, s: 0.25 }, { x: -8, z: 3, s: 0.35 }
    ]
    spots.forEach(r => {
      const geo = new THREE.DodecahedronGeometry(r.s, 0)
      const rock = new THREE.Mesh(geo, mat)
      rock.position.set(r.x, r.s * 0.3, r.z)
      rock.rotation.set(Math.random(), Math.random(), Math.random())
      rock.castShadow = true
      this.scene.add(rock)
    })
  }

  update(elapsedTime) {
    this.environment.update(elapsedTime)
    this.palmTrees.update(elapsedTime)
  }
}
