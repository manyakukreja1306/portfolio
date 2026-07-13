import * as THREE from 'three'

export class PalmTrees {
  constructor(experience) {
    this.scene = experience.scene
    this.trees = []
    const positions = [
      { x: -8, y: -0.5, z: -3, scale: 1.0, rot: 0.1 },
      { x: 8, y: 0.3, z: 2, scale: 0.85, rot: -0.15 },
      { x: -5, y: 0, z: 8, scale: 0.7, rot: 0.2 },
      { x: 10, y: -0.2, z: -6, scale: 0.9, rot: -0.1 }
    ]
    positions.forEach(p => {
      const tree = this.createTree(p.scale)
      tree.position.set(p.x, p.y, p.z)
      tree.rotation.z = p.rot
      this.scene.add(tree)
      this.trees.push(tree)
    })
  }

  createTree(s = 1) {
    const group = new THREE.Group()
    const trunkMat = new THREE.MeshStandardMaterial({ color: '#8B6B3D', roughness: 0.9, flatShading: true })

    // Trunk segments (slight curve)
    const segments = 5
    for (let i = 0; i < segments; i++) {
      const r = 0.12 - i * 0.015
      const seg = new THREE.Mesh(new THREE.CylinderGeometry(r, r + 0.02, 1.2 * s, 6), trunkMat)
      seg.position.y = i * 1.1 * s + 0.6 * s
      seg.position.x = Math.sin(i * 0.3) * 0.15 * s
      seg.castShadow = true
      group.add(seg)
    }

    // Palm fronds
    const leafMat = new THREE.MeshStandardMaterial({ color: '#4A8B3C', roughness: 0.8, flatShading: true, side: THREE.DoubleSide })
    const topY = segments * 1.1 * s + 0.3 * s
    for (let i = 0; i < 7; i++) {
      const angle = (i / 7) * Math.PI * 2
      const leaf = new THREE.Mesh(new THREE.PlaneGeometry(0.6 * s, 2.5 * s, 1, 4), leafMat)
      leaf.position.set(Math.cos(angle) * 0.5 * s, topY, Math.sin(angle) * 0.5 * s)
      leaf.rotation.y = angle
      leaf.rotation.x = -0.7
      leaf.rotation.z = (Math.random() - 0.5) * 0.3

      // Bend leaf vertices down
      const pos = leaf.geometry.getAttribute('position')
      for (let j = 0; j < pos.count; j++) {
        const y = pos.getY(j)
        if (y < 0) pos.setZ(j, pos.getZ(j) - Math.abs(y) * 0.3)
      }
      leaf.geometry.computeVertexNormals()
      leaf.castShadow = true
      group.add(leaf)
    }

    // Coconuts
    const cocoMat = new THREE.MeshStandardMaterial({ color: '#5C3D1E', roughness: 0.9, flatShading: true })
    for (let i = 0; i < 3; i++) {
      const coco = new THREE.Mesh(new THREE.SphereGeometry(0.1 * s, 6, 6), cocoMat)
      const a = (i / 3) * Math.PI * 2
      coco.position.set(Math.cos(a) * 0.2 * s, topY - 0.2 * s, Math.sin(a) * 0.2 * s)
      group.add(coco)
    }

    return group
  }

  update(t) {
    // Gentle sway
    this.trees.forEach((tree, i) => {
      tree.rotation.z = Math.sin(t * 0.3 + i * 1.5) * 0.02 + (i % 2 ? -0.1 : 0.1)
    })
  }
}
