import {
  Clock,
  Object3D,
  Vector3,
  Quaternion,
  Euler,
  AnimationUtils,
  AnimationMixer,
  BoxGeometry,
  MeshBasicMaterial,
  Mesh,
  Box3,
  Box3Helper,
  LoopOnce,
} from 'three'
import { Capsule } from 'three/examples/jsm/math/Capsule'

import Mouse from '@tools/Mouse'

export default class Perso {
  constructor(options) {
    // Set options
    this.time = options.time
    this.assets = options.assets
    this.camera = options.camera
    this.debug = options.debug
    this.worldOctree = options.worldOctree
    this.body = options.body

    // Set up
    this.container = new Object3D()

    this.playerCollider = new Capsule(
      new Vector3(0, 2, 0),
      new Vector3(0, 3.5, 0),
      0.35
    )
    this.playerVelocity = new Vector3()
    this.playerDirection = new Vector3()
    this.GRAVITY = 25
    this.speedP = 0.005
    this.clock = new Clock()

    this.crossFadeControls = []
    this.currentBaseAction = 'IDLE'
    this.allActions = []
    this.baseActions = {
      IDLE: { weight: 1 },
      WALKING: { weight: 0 },
      RUNNING: { weight: 0 },
      JUMP: { weight: 0 },
      VICTORY: { weight: 0 },
    }
    this.additiveActions = {
      // sneak_pose: { weight: 0 },
      // sad_pose: { weight: 0 },
      // agree: { weight: 0 },
      // headShake: { weight: 0 }
    }

    this.mouse = new Mouse()
    this.moveForward = false
    this.moveBackward = false
    this.moveLeft = false
    this.moveRight = false
    this.run = false
    this.rotation = 0
    this.speed = 0
    this.params = {
      deceleration: 0.12,
      cameraSpeedX: 0.1,
      cameraSpeedY: 0.01,
      cameraMaxY: 8,
      cameraMinY: 4,
      lerpSpeed: 0.005,
    }

    this.setPerso()
    this.setCollider()
    this.setListeners()
    this.setMovements()
    this.setDebug()
    this.setAnimations()
  }
  setPerso() {
    this.perso = this.assets.models.EDDIE.scene
    this.perso.children[0].rotation.set(-Math.PI / 2, Math.PI, 0)
    this.perso.traverse((child) => {
      if (child.isMesh) {
        child.castShadow = true
        child.receiveShadow = true
      }
    })
    this.perso.castShadow = true
    this.container.add(this.perso)
    this.perso.position.set(0, 0, 3)
  }
  setCollider() {
    this.geometry = new BoxGeometry(1, 1, 1)
    this.material = new MeshBasicMaterial({ color: 0x00ff00, wireframe: true, opacity: 0, transparent: true })
    this.cube = new Mesh(this.geometry, this.material)
    this.cube.position.set(0, 0.5, 0)
    this.playerBB = new Box3().setFromObject(this.cube)
    const helper = new Box3Helper(this.playerBB, 0xffff00)
    // this.container.add(this.cube)
  }
  setListeners() {
    document.addEventListener(
      'keydown',
      (event) => {
        switch (event.code) {
          case 'ArrowUp': // up
          case 'KeyW': // w
            this.moveForward = true
            break
          case 'ArrowLeft': // left
          case 'KeyA': // a
            this.moveLeft = true
            break
          case 'ArrowDown': // down
          case 'KeyS': // s
            this.moveBackward = true
            break
          case 'ArrowRight': // right
          case 'KeyD': // d
            this.moveRight = true
            break
          case 'ShiftLeft':
            this.run = true
            if (
              this.currentBaseAction != 'IDLE' &&
              this.currentBaseAction != 'RUNNING' &&
              (this.moveForward == true ||
                this.moveBackward == true)
            ) {
              this.prepareCrossFade(
                this.baseActions[this.currentBaseAction].action,
                this.baseActions['RUNNING'].action,
                0.2
              )
              this.speedP = 0.01
            }
            break
          case 'Space': // space
            if (this.playerOnFloor) {
              // this.baseActions['JUMP'].action.loop = LoopOnce
              this.temp = this.currentBaseAction
              this.prepareCrossFade(
                this.baseActions[this.currentBaseAction].action,
                this.baseActions['JUMP'].action,
                0
              )
              // setTimeout(() => {
                this.prepareCrossFade(
                  this.baseActions['JUMP'].action,
                  this.baseActions[this.temp].action,
                  1.3
                )
              // }, 1.9)
              this.playerVelocity.y = 8
              this.oldSpeedP = this.speedP
              this.speedP = 0.0005
              setTimeout(() => {
                this.speedP = this.oldSpeedP
              }, 500)
            }
            this.playerOnFloor = false
            break
        }
      },
      false
    )
    document.addEventListener(
      'keyup',
      (event) => {
        switch (event.code) {
          case 'ArrowUp': // up
          case 'KeyW': // w
            this.moveForward = false
            break
          case 'ArrowLeft': // left
          case 'KeyA': // a
            this.moveLeft = false
            break
          case 'ArrowDown': // down
          case 'KeyS': // s
            this.moveBackward = false
            break
          case 'ArrowRight': // right
          case 'KeyD': // d
            this.moveRight = false
            break
          case 'ShiftLeft':
            this.run = false
            break
        }
        if (this.moveForward == false && this.moveBackward == false && this.moveLeft == false && this.moveRight == false) {
          this.prepareCrossFade(
            this.baseActions[this.currentBaseAction].action,
            this.baseActions['IDLE'].action,
            1.2
          )
          this.speedP = 0.005
        } else if (
          this.currentBaseAction != 'WALKING' &&
          this.currentBaseAction != 'IDLE' &&
          this.run == false &&
          (this.moveForward == true || this.moveBackward == true)
        ) {
          this.prepareCrossFade(
            this.baseActions[this.currentBaseAction].action,
            this.baseActions['WALKING'].action,
            0.3
          )
          this.speedP = 0.005
        }
      },
      false
    )
  }
  setMovements() {
    this.time.on('tick', () => {
      if(!this.body.classList.contains('open_options')) {
        if (this.moveForward) {
          this.playerVelocity.add(
            this.getForwardVector().multiplyScalar(-this.speedP * this.time.delta)
          )
          this.cube.position.copy(this.perso.position)
          this.playerBB.setFromObject(this.cube)
          if (
            this.currentBaseAction != 'WALKING' &&
            this.currentBaseAction != 'RUNNING'
          ) {
            if (this.run) {
              this.prepareCrossFade(
                this.baseActions[this.currentBaseAction].action,
                this.baseActions['RUNNING'].action,
                0.6
              )
              this.speedP = 0.01
            } else {
              this.prepareCrossFade(
                this.baseActions[this.currentBaseAction].action,
                this.baseActions['WALKING'].action,
                0.6
              )
            }
          }
          this.lerpOrientation()
        }
        if (this.moveBackward) {
          const step = this.params.lerpSpeed * this.time.delta
          this.quat = new Quaternion()
          this.camera.container.quaternion.clone(this.quat)
          this.quat.multiplyQuaternions(
            this.camera.container.quaternion,
            this.quat
          )
          this.perso.quaternion.rotateTowards(
            this.quat.multiply(
              new Quaternion().setFromAxisAngle(new Vector3(0, 1, 0), Math.PI)
            ),
            step
          )
          this.playerVelocity.add(
            this.getForwardVector().multiplyScalar(-this.speedP * this.time.delta)
          )
          this.cube.position.copy(this.perso.position)
          this.playerBB.setFromObject(this.cube)
          if (
            this.currentBaseAction != 'WALKING' &&
            this.currentBaseAction != 'RUNNING'
          ) {
            if (this.run) {
              this.prepareCrossFade(
                this.baseActions[this.currentBaseAction].action,
                this.baseActions['RUNNING'].action,
                0.6
              )
              this.speedP = 0.01
            } else {
              this.prepareCrossFade(
                this.baseActions[this.currentBaseAction].action,
                this.baseActions['WALKING'].action,
                0.6
              )
            }
          }
          // this.lerpOrientation()
        }
        if (this.moveLeft) {
          if (this.moveBackward) {
            this.perso.quaternion.multiply(
              new Quaternion().setFromAxisAngle(
                new Vector3(0, 1, 0),
                4.0 * Math.PI * 0.2 * this.speedP
              )
            )
            const step = this.params.lerpSpeed * this.time.delta
            this.camera.container.quaternion.rotateTowards(
              this.perso.quaternion,
              step / 10
            )
          } else {
            this.perso.quaternion.multiply(
              new Quaternion().setFromAxisAngle(
                new Vector3(0, 1, 0),
                4.0 * Math.PI * 0.2 * this.speedP
              )
            )
            const step = this.params.lerpSpeed * this.time.delta
            this.camera.container.quaternion.rotateTowards(
              this.perso.quaternion,
              step
            )
          }
        }
        if (this.moveRight) {
          if (this.moveBackward) {
            this.perso.quaternion.multiply(
              new Quaternion().setFromAxisAngle(
                new Vector3(0, 1, 0),
                4.0 * -Math.PI * 0.2 * this.speedP
              )
            )
            const step = this.params.lerpSpeed * this.time.delta
            this.camera.container.quaternion.rotateTowards(
              this.perso.quaternion,
              step / 10
            )
          } else {
            this.perso.quaternion.multiply(
              new Quaternion().setFromAxisAngle(
                new Vector3(0, 1, 0),
                4.0 * -Math.PI * 0.2 * this.speedP
              )
            )
            const step = this.params.lerpSpeed * this.time.delta
            this.camera.container.quaternion.rotateTowards(
              this.perso.quaternion,
              step
            )
          }
        }
      }
      if (this.mouse.grab === true) {
        this.speed = 0
        this.speedY = 0
        this.speed = -this.mouse.delta.x * this.params.cameraSpeedX
        this.speedY = this.mouse.delta.y * this.params.cameraSpeedY
      } else if (
        this.mouse.grab === false &&
        (Math.abs(this.speed) > 0 || Math.abs(this.speedY) > 0)
      ) {
        Math.sign(this.speed) * this.speed - this.params.deceleration > 0
          ? (this.speed -= Math.sign(this.speed) * this.params.deceleration)
          : (this.speed = 0)
        Math.sign(this.speedY) * this.speedY - this.params.deceleration > 0
          ? (this.speedY -= Math.sign(this.speedY) * this.params.deceleration)
          : (this.speedY = 0)
      }
      if (this.speedY) {
        if (
          this.camera.camera.position.y + this.speedY >
          this.params.cameraMaxY
        ) {
          this.camera.camera.position.y = this.params.cameraMaxY
          this.speedY = 0
        } else if (
          this.camera.camera.position.y + this.speedY <
          this.params.cameraMinY
        ) {
          this.camera.camera.position.y = this.params.cameraMinY
          this.speedY = 0
        } else {
          this.camera.camera.position.y += this.speedY
        }
      }
      this.camera.camera.lookAt(this.camera.container.position)
      this.deltaRotationQuaternion = new Quaternion().setFromEuler(
        new Euler(0, this.toRadians(this.speed), 0, 'XYZ')
      )
      this.camera.container.quaternion.multiplyQuaternions(
        this.deltaRotationQuaternion,
        this.camera.container.quaternion
      )

      const delta = Math.min(0.1, this.clock.getDelta())
      this.updatePlayer(delta)
    })
  }
  lerpOrientation() {
    const baseQuat = new Quaternion().copy(this.camera.container.quaternion)
    if (!baseQuat.equals(this.perso.quaternion)) {
      const step = this.params.lerpSpeed * this.time.delta
      this.perso.quaternion.rotateTowards(
        this.camera.container.quaternion,
        step
      )
    }
  }
  toRadians(angle) {
    return angle * (Math.PI / 180)
  }
  playerCollitions() {
    const result = this.worldOctree.capsuleIntersect(this.playerCollider)
    this.playerOnFloor = false
    if (result) {
      this.playerOnFloor = result.normal.y > 0
      if (!this.playerOnFloor) {
        this.playerVelocity.addScaledVector(
          result.normal,
          -result.normal.dot(this.playerVelocity)
        )
      }
      this.playerCollider.translate(result.normal.multiplyScalar(result.depth))
    }
  }
  updatePlayer(delta) {
    if (this.playerOnFloor) {
      const damping = Math.exp(-3 * delta) - 1
      this.playerVelocity.addScaledVector(this.playerVelocity, damping)
    } else {
      this.playerVelocity.y -= this.GRAVITY * delta
    }
    const deltaPosition = this.playerVelocity.clone().multiplyScalar(delta)
    this.playerCollider.translate(deltaPosition)
    this.playerCollitions()
    this.camera.container.position.copy(this.playerCollider.start)
    this.perso.position.set(
      this.camera.container.position.x,
      this.camera.container.position.y - 0.35,
      this.camera.container.position.z
    )
  }
  getForwardVector() {
    this.perso.getWorldDirection(this.playerDirection)
    this.playerDirection.y = 0
    this.playerDirection.normalize()
    return this.playerDirection
  }
  getSideVector() {
    this.perso.getWorldDirection(this.playerDirection)
    this.playerDirection.y = 0
    this.playerDirection.normalize()
    this.playerDirection.cross(this.perso.up)
    return this.playerDirection
  }
  setAnimations() {
    const animations = this.assets.models.EDDIE.animations
    this.mixer = new AnimationMixer(this.assets.models.EDDIE.scene)
    this.numAnimations = animations.length
    for (let i = 0; i !== this.numAnimations; ++i) {
      let clip = animations[i]
      const name = clip.name
      if (this.baseActions[name]) {
        const action = this.mixer.clipAction(clip)
        this.activateAction(action)
        action.setEffectiveTimeScale(0.2)
        this.baseActions[name].action = action
        this.allActions.push(action)
      } else if (this.additiveActions[name]) {
        // Make the clip additive and remove the reference frame
        AnimationUtils.makeClipAdditive(clip)
        if (clip.name.endsWith('_pose')) {
          clip = AnimationUtils.subclip(clip, clip.name, 2, 3, 30)
        }
        const action = this.mixer.clipAction(clip)
        this.activateAction(action)
        this.additiveActions[name].action = action
        this.allActions.push(action)
      }
    }
    this.animate()
  }
  activateAction(action) {
    const clip = action.getClip()
    const settings =
      this.baseActions[clip.name] || this.additiveActions[clip.name]
    this.setWeight(action, settings.weight)
    action.play()
  }
  prepareCrossFade(startAction, endAction, duration) {
    // If the current action is 'idle', execute the crossfade immediately;
    // else wait until the current action has finished its current loop
    // if (this.currentBaseAction === 'JUMP') {
    //   this.synchronizeCrossFade(startAction, endAction, duration)
    // } else {
      this.executeCrossFade(startAction, endAction, duration)
    // }
    // Update control colors
    if (endAction) {
      const clip = endAction.getClip()
      this.currentBaseAction = clip.name
    } else {
      this.currentBaseAction = 'None'
    }
    this.crossFadeControls.forEach(function (control) {
      const name = control.property
      if (name === this.currentBaseAction) {
        control.setActive()
      } else {
        control.setInactive()
      }
    })
  }
  synchronizeCrossFade(startAction, endAction, duration) {
    this.mixer.addEventListener('loop', onLoopFinished)
    const that = this
    function onLoopFinished(event) {
      if (event.action === startAction) {
        that.mixer.removeEventListener('loop', onLoopFinished)
        that.executeCrossFade(startAction, endAction, duration)
      }
    }
  }
  executeCrossFade(startAction, endAction, duration) {
    // Not only the start action, but also the end action must get a weight of 1 before fading
    // (concerning the start action this is already guaranteed in this place)
    if (endAction) {
      this.setWeight(endAction, 1)
      endAction.time = 0
      if (startAction) {
        // Crossfade with warping
        startAction.crossFadeTo(endAction, duration, true)
      } else {
        // Fade in
        endAction.fadeIn(duration)
      }
    } else {
      // Fade out
      startAction.fadeOut(duration)
    }
    if (endAction._clip.name == 'IDLE') {
      endAction.setEffectiveTimeScale(0.2)
    }
  }
  // This function is needed, since animationAction.crossFadeTo() disables its start action and sets
  // the start action's timeScale to ((start animation's duration) / (end animation's duration))
  setWeight(action, weight) {
    action.enabled = true
    action.setEffectiveTimeScale(1)
    action.setEffectiveWeight(weight)
  }
  animate() {
    // Render loop
    this.time.on('tick', () => {
      // requestAnimationFrame(this.animate())
      for (let i = 0; i !== this.numAnimations; ++i) {
        const action = this.allActions[i]
        const clip = action.getClip()
        const settings =
          this.baseActions[clip.name] || this.additiveActions[clip.name]
        settings.weight = action.getEffectiveWeight()
      }
      // Get the time elapsed since the last frame, used for this.mixer update
      const mixerUpdateDelta = this.time.delta / 1500
      // Update the animation this.mixer, the stats panel, and render this frame
      this.mixer.update(mixerUpdateDelta)
    })
  }
  setDebug() {
    if (this.debug) {
      this.debugFolder = this.debug.addFolder('Perso')
      this.debugFolder
        .add(this.params, 'deceleration')
        .name('Camera Deceleration')
        .min(0)
        .max(0.5)
        .step(0.02)
      this.debugFolder
        .add(this.params, 'cameraSpeedX')
        .name('Camera Speed X')
        .min(0)
        .max(0.5)
        .step(0.05)
      this.debugFolder
        .add(this.params, 'cameraSpeedY')
        .name('Camera Speed Y')
        .min(0)
        .max(0.5)
        .step(0.01)
      this.debugFolder
        .add(this.params, 'cameraMinY')
        .name('Camera Min Y')
        .min(0)
        .max(10)
        .step(0.1)
      this.debugFolder
        .add(this.params, 'cameraMaxY')
        .name('Camera Max Y')
        .min(0)
        .max(10)
        .step(0.1)
      this.debugFolder
        .add(this.params, 'lerpSpeed')
        .name('Rotation Lerp Duration')
        .min(0)
        .max(1)
        .step(0.001)
    }
  }
}
