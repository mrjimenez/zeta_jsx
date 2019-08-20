/*
 * Copyright (C) 2019 - Zeta Tecnologia Ltda <zetatecinf@gmail.com>
 */

// -------------------------------------------------------------------------------

/*
https://www.intmath.com/cg3/jsxgraph-coding-summary.php
*/

// -------------------------------------------------------------------------------

// eslint-disable-next-line no-unused-vars
class TranslatablePolygon {
  constructor(board, vertices, verticesProps, polygonProps) {
    const debugVertices = false
    const localVerticesProps = {
      visible: debugVertices,
      snapToGrid: true,
      snapSizeX: 1,
      snapSizeY: 1,
    }
    const mergedVerticesProps = {
      ...localVerticesProps, ...verticesProps,
    }
    let pointsArray = []
    for (let i = 0; i < vertices.length; ++i) {
      let p = board.create('point', vertices[i], mergedVerticesProps)
      pointsArray.push(p)
    }
    const localPolygonProps = {
      fillColor: '#00FF00',
      highlightFillColor: '#00FF00',
      fillOpacity: 1.0,
      highlightFillOpacity: 1.0,
      // As propriedades abaixo garantem que a gente consegue
      // transladar o polígono sem destruí-lo.
      hasInnerPoints: true,
      vertices: {
        visible: false,
      },
      withLines: false,
    }
    const mergedPolygonProps = {
      ...localPolygonProps, ...polygonProps,
    }
    this.vertices = pointsArray
    this.polygon = board.create('polygon', pointsArray, mergedPolygonProps)
  }
}

// -------------------------------------------------------------------------------

// eslint-disable-next-line no-unused-vars
class RotatablePolygon {
  constructor(board, vertices, verticesProps, polygonProps) {
    const debugVertices = false
    this.board = board
    const localVerticesProps = {
      visible: debugVertices,
      snapToGrid: true,
      snapSizeX: 1,
      snapSizeY: 1,
    }
    const mergedVerticesProps = {
      ...localVerticesProps, ...verticesProps,
    }
    // Center
    const centerProps = {
      ...mergedVerticesProps,
      visible: true,
      name: '',
      fillColor: 'blue',
    }
    this.center = board.create('point', vertices[0], centerProps)
    // Glider
    const dx = vertices[1][0] - vertices[0][0]
    const dy = vertices[1][1] - vertices[0][1]
    const radius = Math.sqrt(dx * dx + dy * dy)
    const circle = board.create('circle', [this.center, radius, ],
      { visible: debugVertices, })
    const gliderProps = {
      ...mergedVerticesProps,
      visible: true,
      face: 'circle',
      name: '',
    }
    this.glider = board.create('glider',
      [vertices[1][0], vertices[1][1], circle, ], gliderProps)
    this.angleCg = Math.atan2(
      this.glider.Y() - this.center.Y(),
      this.glider.X() - this.center.X())
    // All the other points
    this.origCenter = vertices[0]
    const translation = board.create('transform', [
      () => {
        var me = this
        return me.center.X() - me.origCenter[0]
      },
      () => {
        var me = this
        return me.center.Y() - me.origCenter[1]
      }, ],
      { type: 'translate', })
    const rotation = board.create('transform',
      [() => {
        var me = this
        const angle = Math.atan2(
          me.glider.Y() - me.center.Y(),
          me.glider.X() - me.center.X())
        return angle - me.angleCg
      }, this.center, ],
      { type: 'rotate', })
    let pointsArray = [this.center, this.glider, ]
    for (let i = 2; i < vertices.length; ++i) {
      let q = board.create('point', vertices[i], { visible: false, })
      let p = board.create('point', [q, [translation, rotation, ], ], mergedVerticesProps)
      pointsArray.push(p)
    }
    const localPolygonProps = {
      fillColor: '#00FF00',
      highlightFillColor: '#00FF00',
      fillOpacity: 1.0,
      highlightFillOpacity: 1.0,
      // As propriedades abaixo garantem que a gente consegue
      // transladar o polígono sem destruí-lo.
      hasInnerPoints: true,
      vertices: {
        visible: false,
      },
      withLines: false,
    }
    const mergedPolygonProps = {
      ...localPolygonProps, ...polygonProps,
    }
    this.vertices = pointsArray
    this.polygon = board.create('polygon', pointsArray, mergedPolygonProps)
  }
  /* moveTo(): Método para mover um polígono rodável
   *
   * Precisa apenas mover o centro e o glider.
   *
   * Parâmetros:
   * - position: Nova posição do centro de rotação.
   */
  moveTo(position) {
    const deltaX = position[0] - this.center.X()
    const deltaY = position[1] - this.center.Y()
    for (let i = 0; i < 2; ++i) {
      const q = this.vertices[i]
      const delta = [q.X() + deltaX, q.Y() + deltaY, ]
      q.moveTo(delta)
    }
  }
}

// -------------------------------------------------------------------------------

// eslint-disable-next-line no-unused-vars
class Figura {
  constructor(board, local, xFig, yFig, lFig, aFig) {
    this.fig = board.create('image', [local, [xFig, yFig, ], [lFig, aFig, ], ],
      {
        fixed: true,
        highlightFillOpacity: 1.0,
        keepaspectratio: true,
      })
  }
}

// -------------------------------------------------------------------------------

// eslint-disable-next-line no-unused-vars
class Drawing {
  constructor(board, vertices, verticesProps, segmentProps) {
    const debugVertices = false
    const localVerticesProps = {
      visible: debugVertices,
      fixed: true,
    }
    const mergedVerticesProps = {
      ...localVerticesProps, ...verticesProps,
    }
    let pointsArray = []
    for (let i = 0; i < vertices.length; ++i) {
      let p = board.create('point', vertices[i], mergedVerticesProps)
      pointsArray.push(p)
    }
    const localSegmentProps = {
      fixed: true,
      vertices: {
        visible: false,
      },
      withLines: true,
      dash: 1,
      strokeColor: '#ed143d',
    }

    const mergedSegmentProps = {
      ...localSegmentProps, ...segmentProps,
    }

    let segmentsArray = []
    let l = board.create('segment', [vertices[vertices.length - 1], vertices[0], ], mergedSegmentProps)
    segmentsArray.push(l)
    for (let i = 1; i < vertices.length; ++i) {
      let l = board.create('segment', [vertices[i], vertices[i - 1], ], mergedSegmentProps)
      segmentsArray.push(l)
    }

    this.vertices = pointsArray
    this.segments = segmentsArray

    const corfundoDesenhos = '#dfe0e0'
    this.polygon = board.create('polygon', pointsArray, {
      withLines: false,
      fillColor: corfundoDesenhos,
      fillOpacity: 1.0,
    })
  }
}

// -------------------------------------------------------------------------------
