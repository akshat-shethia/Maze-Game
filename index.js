const { Engine, Render, Runner, World, Bodies, Body, Events } = Matter
const cellsHorizontal = 14
const cellsVertical = 10
const width = window.innerWidth
const height = window.innerHeight
const unitLengthX = width / cellsHorizontal
const unitLengthY = height / cellsVertical

const engine = Engine.create() //Gives a world param
engine.world.gravity.y = 0
const { world } = engine
const render = Render.create({   //Render Object
    element: document.body, //Where you want to show the drawing in the DOM
    engine: engine,
    options: {
        wireframes: false, //to show filled in shapes with randomised colors
        width: width, //Height & Width of the canvas
        height: height
    }
})
Render.run(render) //Rendering the render object
Runner.run(Runner.create(), engine)


const walls = [
    Bodies.rectangle(width / 2, 0, width, 4, { isStatic: true }),
    Bodies.rectangle(width / 2, height, width, 4, { isStatic: true }),
    Bodies.rectangle(0, height / 2, 4, height, { isStatic: true }),
    Bodies.rectangle(width, height / 2, 4, height, { isStatic: true })
]
World.add(world, walls)


// Maze generation

const shuffle = (arr) => {
    let counter = arr.length

    while (counter > 0) {
        const index = Math.floor(Math.random() * counter)
        counter--

        const temp = arr[counter]
        arr[counter] = arr[index]
        arr[index] = temp
    }
    return arr;
}

const grid = Array(cellsVertical).fill(null).map(() => Array(cellsHorizontal).fill(false))

const verticals = Array(cellsVertical).fill(null).map(() => Array(cellsHorizontal - 1).fill(false))

const horizontals = Array(cellsVertical - 1).fill(null).map(() => Array(cellsHorizontal).fill(false))

const startRow = Math.floor(Math.random() * cellsVertical)
const startCol = Math.floor(Math.random() * cellsHorizontal)

const stepThroughCell = (row, column) => {
    // if i have visited the cell at [row,column], then return
    if (grid[row][column]) {
        return;
    }
    //Mark this cell as being visited
    grid[row][column] = true

    //assemble randomly ordered list of neighbours
    const neighbours = shuffle([
        [row - 1, column, "up"],
        [row, column + 1, "right"],
        [row + 1, column, "down"],
        [row, column - 1, "left"],
    ])

    //For each neighbour...
    for (let neighbour of neighbours) {
        const [nextRow, nextColumn, direction] = neighbour

        //See if that neighbour is out of bounds
        if (nextRow < 0 || nextRow >= cellsVertical || nextColumn < 0 || nextColumn >= cellsHorizontal) {
            continue
        }

        //If we have visited that neighbour continue to next neighbour
        if (grid[nextRow][nextColumn] === true) {
            continue
        }


        //Remove wall from either horizontals or verticals
        if (direction === "left") { //Verticals
            verticals[row][column - 1] = true
        } else if (direction === "right") {
            verticals[row][column] = true
        } else if (direction === "up") {
            horizontals[row - 1][column] = true
        } else if (direction === "down") {
            horizontals[row][column] = true
        }

        stepThroughCell(nextRow, nextColumn)
        //Visit the next cell
    }
}
stepThroughCell(startRow, startCol)



horizontals.forEach((row, rowIndex) => {
    row.forEach((open, columnIndex) => {
        if (open) {
            return
        }
        const wall = Bodies.rectangle(
            columnIndex * unitLengthX + unitLengthX / 2,
            rowIndex * unitLengthY + unitLengthY,
            unitLengthX,
            10,
            {
                isStatic: true,
                label: "wall",
                render: {
                    fillStyle: "red"
                }
            }
        )
        World.add(world, wall)
    })
})


verticals.forEach((row, rowIndex) => {
    row.forEach((open, columnIndex) => {
        if (open) {
            return
        }
        const wall = Bodies.rectangle(
            columnIndex * unitLengthX + unitLengthX,
            rowIndex * unitLengthY + unitLengthY / 2,
            10,
            unitLengthY,
            {
                isStatic: true,
                label: "wall",
                render: {
                    fillStyle: "red"
                }
            }
        )
        World.add(world, wall)
    })
})

//goal
const goal = Bodies.rectangle(
    width - unitLengthX / 2,
    height - unitLengthY / 2,
    unitLengthX * .7,
    unitLengthY * .7,
    {
        isStatic: true,
        label: "goal",
        render: {
            fillStyle: "green"
        }
    }
)
World.add(world, goal)

//ball
const ballRadius = Math.min(unitLengthX, unitLengthY) / 4
const ball = Bodies.circle(
    unitLengthX / 2,
    unitLengthY / 2,
    ballRadius,
    {
        label: "ball",
        render: {
            fillStyle: "blue"
        }
    }
)
World.add(world, ball)


document.addEventListener("keydown", event => {
    const { x, y } = ball.velocity

    if (event.keyCode === 87) {
        Body.setVelocity(ball, { x, y: y - 5 })
    }
    if (event.keyCode === 68) {
        Body.setVelocity(ball, { x: x + 5, y })
    }
    if (event.keyCode === 83) {
        Body.setVelocity(ball, { x, y: y + 5 })
    }
    if (event.keyCode === 65) {
        Body.setVelocity(ball, { x: x - 5, y })
    }
})

//Win Condition
Events.on(engine, "collisionStart", event => {
    event.pairs.forEach(collision => {
        const labels = ["ball", "goal"]

        if (labels.includes(collision.bodyA.label) && labels.includes(collision.bodyB.label)) {
            document.querySelector(".winner").classList.remove("hidden")
            world.gravity.y = 1
            world.bodies.forEach((body) => {
                if (body.label === "wall") {
                    Body.setStatic(body, false)
                }
            })
        }
    })
}

)




